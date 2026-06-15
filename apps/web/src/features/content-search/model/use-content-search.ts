import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SearchContentItem, SourceCount, SearchSort } from '@/entities/content';
import { useSearchResults, useSearchSources } from '../api/search-queries';
import { useRecentQueries, type UseRecentQueries } from './use-recent-queries';
import { CATEGORY_ALL } from './constants';

/**
 * 검색 상태 오케스트레이터 — 입력 디바운스 0.5s · 카테고리/출처/정렬 상태 · 모드 파생.
 *
 * 모드: debouncedQuery==='' → 'discovery' · pending → 'loading' · error → 'error' ·
 *       rows>0 → 'results' · rows===0 → 'empty'.
 * 디바운스: raw input → 0.5s → debouncedQuery → 훅 인자 → 0.5s 내 연타는 1 호출.
 * 칩/카테고리 클릭 = 즉시 query 세팅(디바운스 경로 동일) · 검색 확정 시 recent.push.
 * 쿼리칩 dismiss → query='' → discovery 복귀.
 */

export type SearchMode = 'discovery' | 'loading' | 'results' | 'empty' | 'error';

const DEBOUNCE_MS = 500;

/** 값 디바운스(0.5s) — feature 로컬 훅. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export interface UseContentSearch {
  /** 검색바 raw 입력(디폴트 상태 입력형). */
  input: string;
  setInput: (v: string) => void;
  /** 디바운스 확정 쿼리(쿼리칩/결과 헤더/빈문구 보간 값). */
  query: string;
  mode: SearchMode;
  /** 선택 카테고리(전체='전체'). */
  category: string;
  setCategory: (c: string) => void;
  /** 선택 출처(전체=null). */
  source: string | null;
  setSource: (s: string | null) => void;
  sort: SearchSort;
  setSort: (s: SearchSort) => void;
  /** 결과 그리드 행. */
  results: SearchContentItem[];
  /** 출처 카운트 배지. */
  sources: SourceCount[];
  /** 추천 칩/입력 검색 실행(디바운스 우회 즉시 + recent push). */
  submit: (q: string) => void;
  /** 쿼리칩 dismiss → discovery 복귀. */
  dismiss: () => void;
  /** 에러 재시도(결과 쿼리 refetch). */
  retry: () => void;
  recent: UseRecentQueries;
}

export function useContentSearch(): UseContentSearch {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<string>(CATEGORY_ALL);
  const [source, setSource] = useState<string | null>(null);
  const [sort, setSort] = useState<SearchSort>('recent');
  const recent = useRecentQueries();

  const debouncedQuery = useDebouncedValue(input, DEBOUNCE_MS);
  const query = debouncedQuery.trim();

  // 카테고리 필터는 '전체'면 미적용(null 전달).
  const categoryArg = category === CATEGORY_ALL ? null : category;

  const resultsQ = useSearchResults(query, { category: categoryArg, source, sort });
  const sourcesQ = useSearchSources(query, categoryArg);

  // 검색 확정 시 recent push(중복 1회). debouncedQuery 변할 때 1회만.
  const lastPushed = useRef<string>('');
  useEffect(() => {
    if (query !== '' && query !== lastPushed.current) {
      lastPushed.current = query;
      recent.push(query);
    }
  }, [query, recent]);

  const submit = useCallback((q: string) => {
    setInput(q);
    // recent push는 debounce 확정 후 effect가 처리(중복 방지).
  }, []);

  const dismiss = useCallback(() => {
    setInput('');
    setSource(null);
    setCategory(CATEGORY_ALL);
    lastPushed.current = '';
  }, []);

  const retry = useCallback(() => {
    void resultsQ.refetch();
    void sourcesQ.refetch();
  }, [resultsQ, sourcesQ]);

  const results = useMemo(() => resultsQ.data ?? [], [resultsQ.data]);
  const sources = useMemo(() => sourcesQ.data ?? [], [sourcesQ.data]);

  const mode: SearchMode = useMemo(() => {
    if (query === '') return 'discovery';
    if (resultsQ.isError) return 'error';
    if (resultsQ.isPending || resultsQ.isLoading) return 'loading';
    return results.length > 0 ? 'results' : 'empty';
  }, [query, resultsQ.isError, resultsQ.isPending, resultsQ.isLoading, results.length]);

  return {
    input,
    setInput,
    query,
    mode,
    category,
    setCategory,
    source,
    setSource,
    sort,
    setSort,
    results,
    sources,
    submit,
    dismiss,
    retry,
    recent,
  };
}
