import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRecentQueries } from '@/features/content-search';

/**
 * 최근 검색어 계약 — 최대 10캡 · 중복 제거(최신 우선) · 11번째 밀려남 · localStorage 영속.
 */
const KEY = 'grabit:search:recent';

beforeEach(() => {
  localStorage.clear();
});

describe('useRecentQueries contract', () => {
  it('push → 최신 우선 누적, localStorage 영속', () => {
    const { result } = renderHook(() => useRecentQueries());
    act(() => result.current.push('AI'));
    act(() => result.current.push('커리어'));
    expect(result.current.recent).toEqual(['커리어', 'AI']);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['커리어', 'AI']);
  });

  it('중복 push → 기존 제거 후 최신으로 이동(중복 1건)', () => {
    const { result } = renderHook(() => useRecentQueries());
    act(() => result.current.push('AI'));
    act(() => result.current.push('커리어'));
    act(() => result.current.push('AI'));
    expect(result.current.recent).toEqual(['AI', '커리어']);
  });

  it('11개 push → 최신 10개만 유지(11번째=가장 오래된 것 밀려남)', () => {
    const { result } = renderHook(() => useRecentQueries());
    act(() => {
      for (let i = 1; i <= 11; i += 1) result.current.push(`q${i}`);
    });
    expect(result.current.recent).toHaveLength(10);
    // 최신(q11) 맨 앞 · 가장 오래된 q1 소거 · q2가 마지막
    expect(result.current.recent[0]).toBe('q11');
    expect(result.current.recent).not.toContain('q1');
    expect(result.current.recent[9]).toBe('q2');
  });

  it('remove → 해당 항목만 제거, 영속 갱신', () => {
    const { result } = renderHook(() => useRecentQueries());
    act(() => result.current.push('AI'));
    act(() => result.current.push('커리어'));
    act(() => result.current.remove('AI'));
    expect(result.current.recent).toEqual(['커리어']);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(['커리어']);
  });

  it('빈/공백 push → 무시', () => {
    const { result } = renderHook(() => useRecentQueries());
    act(() => result.current.push('   '));
    act(() => result.current.push(''));
    expect(result.current.recent).toEqual([]);
  });
});
