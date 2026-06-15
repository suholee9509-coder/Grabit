import { useCallback, useState } from 'react';

/**
 * 최근 검색어(최대 10) — localStorage 영속. 중복 제거(최신 우선) · 11번째는 밀려남.
 * [디자인공백] 서버 저장 ❌ → 로컬(기획 §5.2.1). XSS: 표시는 React가 escape(텍스트 노드).
 */
const STORAGE_KEY = 'grabit:search:recent';
const MAX = 10;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* 스토리지 불가(시크릿 등) — 무시 */
  }
}

export interface UseRecentQueries {
  recent: string[];
  push: (query: string) => void;
  remove: (query: string) => void;
  clear: () => void;
}

export function useRecentQueries(): UseRecentQueries {
  // 초기값은 lazy initializer로 localStorage에서 직접 읽음(effect 불요 — CSR 전용 앱).
  const [recent, setRecent] = useState<string[]>(() => read());

  const push = useCallback((query: string) => {
    const q = query.trim();
    if (q === '') return;
    setRecent((prev) => {
      // 중복 제거(대소문자/공백 무시 매칭) → 맨 앞에 추가 → 10캡.
      const filtered = prev.filter((v) => v.trim().toLowerCase() !== q.toLowerCase());
      const next = [q, ...filtered].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setRecent((prev) => {
      const next = prev.filter((v) => v !== query);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, push, remove, clear };
}
