import { useState, type KeyboardEvent } from 'react';
import { Textarea } from '@/shared/ui';
import styles from './interest-custom-input.module.css';

/**
 * 관심분야 직접입력 섹션 — 측정 2087:9222 (Row 7, column gap 10, w 642):
 *   divider(Vector 452, x=162 y=643, stroke rgba(255,255,255,0.08)) 위.
 *   헬퍼 "또는 관심 분야를 직접 입력하여…" 14/400/130% #CECECE.
 *   입력박스(마크다운_콜아웃 2087:9224) = u0c Textarea mode=lg(h64·pad10/12·#363636 보더·radius6·
 *     placeholder "예) UX 리서치, 사이드 프로젝트, 스타트업 취업, 디자인 시스템 등" 14/160% #999999).
 * Enter = 추가(빈/중복/길이는 상위 flow가 무시·중복 방지). onAdd 반환으로 토스트(빈/중복/5개 초과).
 */
export interface InterestCustomInputProps {
  /** 직접입력 추가. 반환값으로 토스트(빈/중복/max). */
  onAdd: (raw: string) => 'added' | 'max' | 'duplicate' | 'empty';
  /** 추가 시도 결과 → 토스트 트리거(상위 InterestStep). */
  onResult?: (result: 'added' | 'max' | 'duplicate' | 'empty') => void;
}

const PLACEHOLDER = '예) UX 리서치, 사이드 프로젝트, 스타트업 취업, 디자인 시스템 등';

export function InterestCustomInput({ onAdd, onResult }: InterestCustomInputProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const result = onAdd(value);
    onResult?.(result);
    if (result === 'added') setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter(Shift 없음) = 추가(줄바꿈 대신). 직접입력은 단일 라인 항목.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.divider} />
      <div className={styles.inner}>
        <p className={styles.helper}>
          또는 관심 분야를 직접 입력하여 더 정확한 추천을 받을 수 있어요.
        </p>
        <Textarea
          mode="lg"
          value={value}
          placeholder={PLACEHOLDER}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => value.trim() && submit()}
          maxLength={40}
          data-testid="interest-custom-input"
        />
      </div>
    </div>
  );
}
