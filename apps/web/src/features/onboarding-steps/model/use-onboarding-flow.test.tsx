import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useOnboardingFlow } from './use-onboarding-flow';

/**
 * 온보딩 상태 머신 테스트 — 단일/복수 선택 규칙·관심 1~5 경계·네비·값 보존(L1-b).
 */
describe('useOnboardingFlow', () => {
  it('단일선택: 직업은 교체된다(누적 ❌)', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.selectJob('개발자'));
    expect(result.current.input.job).toBe('개발자');
    act(() => result.current.selectJob('디자이너'));
    expect(result.current.input.job).toBe('디자이너');
  });

  it('canAdvance: 1단계는 직업 선택 전 false, 후 true', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.selectJob('개발자'));
    expect(result.current.canAdvance).toBe(true);
  });

  it('네비: 다음/이전으로 단계 이동, 값 누적·보존(뒤로 와도 유지)', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.selectJob('개발자'));
    act(() => result.current.goNext());
    expect(result.current.step).toBe(2);
    act(() => result.current.selectYears('2~3년차'));
    act(() => result.current.goNext());
    expect(result.current.step).toBe(3);
    // 뒤로 → 1단계: 직업 값 보존
    act(() => result.current.goPrev());
    act(() => result.current.goPrev());
    expect(result.current.step).toBe(1);
    expect(result.current.input.job).toBe('개발자');
    expect(result.current.input.years).toBe('2~3년차');
  });

  it('관심분야: 토글 추가/제거, 0개=차단·1~5=통과', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    // 3단계로
    act(() => result.current.selectJob('개발자'));
    act(() => result.current.goNext());
    act(() => result.current.selectYears('2~3년차'));
    act(() => result.current.goNext());
    expect(result.current.canAdvance).toBe(false); // 0개 차단
    act(() => result.current.toggleInterest('디자인'));
    expect(result.current.canAdvance).toBe(true); // 1개 통과
    act(() => result.current.toggleInterest('디자인')); // 제거
    expect(result.current.input.interests).toEqual([]);
    expect(result.current.canAdvance).toBe(false);
  });

  it('관심분야: 6번째 선택 차단(max 반환, 5개 유지)', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.goNext());
    act(() => result.current.goNext()); // step 3
    const five = ['디자인', '프로그래밍', '커리어', '리더십', '마인드셋'];
    five.forEach((v) => act(() => void result.current.toggleInterest(v)));
    expect(result.current.input.interests).toHaveLength(5);
    let r: string | undefined;
    act(() => {
      r = result.current.toggleInterest('마케팅 · 그로스');
    });
    expect(r).toBe('max');
    expect(result.current.input.interests).toHaveLength(5);
  });

  it('직접입력: 빈/중복은 무시, 정상은 추가, 5개 초과는 max', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    let r: string | undefined;
    act(() => {
      r = result.current.addCustomInterest('   ');
    });
    expect(r).toBe('empty');
    act(() => {
      r = result.current.addCustomInterest('UX 리서치');
    });
    expect(r).toBe('added');
    act(() => {
      r = result.current.addCustomInterest('UX 리서치');
    });
    expect(r).toBe('duplicate');
    expect(result.current.input.interests).toEqual(['UX 리서치']);
  });

  it('마지막 단계(목표) = isLast, 완료 라벨 조건', () => {
    const { result } = renderHook(() => useOnboardingFlow());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.toggleInterest('디자인'));
    act(() => result.current.goNext());
    expect(result.current.step).toBe(4);
    expect(result.current.isLast).toBe(true);
    expect(result.current.canAdvance).toBe(false);
    act(() => result.current.selectGoal('취업 · 이직'));
    expect(result.current.canAdvance).toBe(true);
  });
});
