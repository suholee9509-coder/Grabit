import { useRef, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { RecentDropdown } from './recent-dropdown';
import styles from './search-bar.module.css';

/**
 * SearchBar — 검색바(520×48 · radius80 · surface-100 · border-default). 측정: 2087:40407(디폴트) / 38859(결과).
 *
 * mode='default'(디폴트 발견): [검색아이콘18] [입력 placeholder] [검색하기 버튼34] · pad 8/7/8/20 ·
 *   포커스 시 최근검색어 드롭다운([디자인공백]).
 * mode='query'(결과/빈): [검색아이콘18] [쿼리 텍스트15/400/160%] [Dismiss X16 #999] · pad 8/20.
 * 디바운스(0.5s)는 features/use-content-search 소유 — 여기선 input/onInputChange 위임.
 */
export interface SearchBarProps {
  mode: 'default' | 'query';
  /** default: 입력 raw 값. */
  input: string;
  onInputChange: (v: string) => void;
  /** "검색하기" 또는 Enter → 쿼리 확정. */
  onSubmit: (q: string) => void;
  /** query 모드: 표시할 확정 쿼리. */
  query?: string;
  /** query 모드: Dismiss(X) → discovery 복귀. */
  onDismiss?: () => void;
  /** 최근 검색어(default 모드 포커스 드롭다운). */
  recent?: string[];
  onRecentSelect?: (q: string) => void;
  onRecentRemove?: (q: string) => void;
  placeholder?: string;
}

export function SearchBar({
  mode,
  input,
  onInputChange,
  onSubmit,
  query = '',
  onDismiss,
  recent = [],
  onRecentSelect,
  onRecentRemove,
  placeholder = '제목, 메모, 태그로 검색하기',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      onSubmit(input.trim());
      setFocused(false);
    }
  };

  // 드롭다운 항목 클릭 전 blur로 닫히는 것 방지 — 짧은 지연 후 close.
  const handleBlur = () => {
    blurTimer.current = window.setTimeout(() => setFocused(false), 120);
  };
  const cancelBlur = () => {
    if (blurTimer.current != null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  if (mode === 'query') {
    return (
      <div className={[styles.bar, styles.queryBar].join(' ')}>
        <span className={styles.icon} aria-hidden="true">
          <Search size={18} strokeWidth={1.8} />
        </span>
        <span className={styles.queryText}>{query}</span>
        <button
          type="button"
          className={styles.dismiss}
          aria-label="검색어 지우기"
          onClick={onDismiss}
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  const showRecent = focused && recent.length > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span className={styles.icon} aria-hidden="true">
          <Search size={18} strokeWidth={1.8} />
        </span>
        <input
          className={styles.input}
          type="text"
          value={input}
          placeholder={placeholder}
          aria-label="검색"
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        />
        <Button
          variant="primary"
          size="md"
          neonLabel
          className={styles.submit}
          onClick={() => input.trim() !== '' && onSubmit(input.trim())}
        >
          검색하기
        </Button>
      </div>

      {showRecent ? (
        <RecentDropdown
          items={recent}
          onSelect={(q) => {
            cancelBlur();
            setFocused(false);
            onRecentSelect?.(q);
          }}
          onRemove={(q) => {
            cancelBlur();
            onRecentRemove?.(q);
          }}
          onPointerDownCapture={cancelBlur}
        />
      ) : null}
    </div>
  );
}
