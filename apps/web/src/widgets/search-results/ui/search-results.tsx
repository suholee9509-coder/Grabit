import type { SearchContentItem, SourceCount, SearchSort } from '@/entities/content';
import { SearchBar, type SearchMode } from '@/features/content-search';
import { ResultHeader } from './result-header';
import { SourceFilter } from './source-filter';
import { CategoryStrip } from './category-strip';
import { ResultsGrid } from './results-grid';
import { EmptyResults } from './empty-results';
import { GridSkeleton } from './grid-skeleton';
import styles from './search-results.module.css';

/**
 * SearchResults — 결과/빈/로딩/에러 상태. 측정: 2087:38847(결과) / 2087:40125(빈).
 *   히어로 + 쿼리칩 검색바(중앙) + row[카테고리 스트립 + 메인컬럼].
 *   메인컬럼(gap32 width1092): 결과헤더(타이틀+카운트+정렬) → [results: 출처필터 + 그리드] /
 *   [empty: 출처필터·그리드 비노출 + 빈문구] / [loading: 스켈레톤] / [error: 토스트는 페이지가 처리 + 재시도].
 * 빈에서도 유지: 쿼리칩·카테고리 스트립(13)·정렬. 비노출: 출처필터·그리드.
 */
export interface SearchResultsProps {
  query: string;
  mode: SearchMode;
  category: string;
  onCategorySelect: (c: string) => void;
  source: string | null;
  onSourceSelect: (s: string | null) => void;
  sort: SearchSort;
  onSortChange: (s: SearchSort) => void;
  results: SearchContentItem[];
  sources: SourceCount[];
  onDismiss: () => void;
  onCardSelect: (id: string) => void;
  onRetry: () => void;
}

export function SearchResults({
  query,
  mode,
  category,
  onCategorySelect,
  source,
  onSourceSelect,
  sort,
  onSortChange,
  results,
  sources,
  onDismiss,
  onCardSelect,
  onRetry,
}: SearchResultsProps) {
  const isEmpty = mode === 'empty';
  const isLoading = mode === 'loading';
  const isError = mode === 'error';
  // 카운트: 빈=0 · 로딩=직전 결과수(0 안전) · 결과=results.length.
  const count = isEmpty || isError ? 0 : results.length;

  return (
    <div className={styles.results}>
      <div className={styles.heroBlock}>
        <h1 className={styles.hero}>어디서든 발견한 인사이트를 한 곳에서 관리하고 성장하세요</h1>
        <div className={styles.searchBarWrap}>
          <SearchBar
            mode="query"
            input=""
            onInputChange={() => {}}
            onSubmit={() => {}}
            query={query}
            onDismiss={onDismiss}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.strip}>
          <CategoryStrip selected={category} onSelect={onCategorySelect} />
        </div>

        <div className={[styles.main, isEmpty ? styles.mainEmpty : ''].filter(Boolean).join(' ')}>
          <div className={styles.headerArea}>
            <ResultHeader
              query={query}
              count={count}
              sort={sort}
              onSortChange={onSortChange}
            />

            {/* 출처 필터 — results 상태에만 노출(빈/로딩/에러 비노출) */}
            {mode === 'results' ? (
              <SourceFilter sources={sources} selected={source} onSelect={onSourceSelect} />
            ) : null}
          </div>

          {/* 본문 분기 */}
          {isLoading ? <GridSkeleton /> : null}
          {isError ? (
            <div className={styles.error} role="alert">
              <p className={styles.errorText}>검색 결과를 불러오지 못했어요.</p>
              <button type="button" className={styles.retry} onClick={onRetry}>
                다시 시도
              </button>
            </div>
          ) : null}
          {isEmpty ? <EmptyResults query={query} /> : null}
          {mode === 'results' ? (
            <ResultsGrid items={results} onSelect={onCardSelect} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
