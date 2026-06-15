import { useId } from 'react';
import { Toggle } from '@/shared/ui';
import styles from './clip-public.module.css';

export interface ClipPublicProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * ClipPublic — "공개 범위 설정"(측정 2087:35024). is_public 토글(FD2 파랑).
 * u0c Toggle 재사용(track44×22 ON #2563EB knob18).
 */
export function ClipPublic({ checked, onChange }: ClipPublicProps) {
  const id = useId();
  return (
    <div className={styles.root}>
      <div className={styles.text}>
        <label className={styles.label} htmlFor={id}>
          공개 범위 설정
        </label>
        <span className={styles.desc}>해당 컨텐츠의 공개 여부를 설정합니다.</span>
      </div>
      <Toggle id={id} checked={checked} onCheckedChange={onChange} aria-label="공개 범위 설정" />
    </div>
  );
}
