import {
  GOAL_OPTIONS,
  INTEREST_OPTIONS,
  JOB_OPTIONS,
  YEARS_OPTIONS,
} from '@/entities/profile';
import type { StepIndex } from './use-onboarding-flow';

/** 단계별 헤딩·옵션·그리드 폭(측정) — Figma 프레임 1:1. */
export interface StepConfig {
  title: string;
  /** 부제(②연차는 부재 G4). */
  subtitle?: string;
  options: readonly string[];
  /** 칩 그리드 폭(px) — 측정: 직업 609 / 그 외 642. */
  gridWidth: number;
  /** 다음 버튼 라벨(마지막=완료). */
  nextLabel: string;
}

export const STEP_CONFIG: Record<StepIndex, StepConfig> = {
  // ① 직업 2087:8476 — gridWidth 609
  1: {
    title: '어떤 일을 하고 계신가요?',
    subtitle: '비슷한 동료들과 연결해 드려요.',
    options: JOB_OPTIONS,
    gridWidth: 609,
    nextLabel: '다음',
  },
  // ② 연차 2087:8726 — 부제 부재(G4) · gridWidth 642
  2: {
    title: '경력이 어떻게 되시나요?',
    options: YEARS_OPTIONS,
    gridWidth: 642,
    nextLabel: '다음',
  },
  // ③ 관심분야 2087:8968 — 복수 + 직접입력 · gridWidth 642
  3: {
    title: '관심 분야가 어떻게 되시나요?',
    subtitle: '선택하신 관심 분야를 바탕으로 맞춤 컨텐츠를 추천해 드려요.',
    options: INTEREST_OPTIONS,
    gridWidth: 642,
    nextLabel: '다음',
  },
  // ④ 목표 2087:9228 — 마지막(완료) · gridWidth 642
  4: {
    title: '지금 어떤 목표를 향해 가고 있나요?',
    subtitle: '같은 방향의 동료들과 함께 성장할 수 있게 해 드려요.',
    options: GOAL_OPTIONS,
    gridWidth: 642,
    nextLabel: '완료',
  },
};
