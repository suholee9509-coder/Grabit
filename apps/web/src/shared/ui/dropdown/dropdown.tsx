import { useId, useState, type ReactNode } from 'react';
import styles from './dropdown.module.css';

/**
 * Dropdown — Figma 2562:7927 (Expanded=True/False). 폴더 드롭다운·모델 선택·태그 자동완성에 쓰임.
 * phase ① 스켈레톤: 트리거 + 패널(shadow-overlay) + 아이템 구조. 외부클릭 닫힘 등 인터랙션은 phase ②.
 */
export interface DropdownItem {
  id: string;
  label: ReactNode;
  /** Pro 배지 등 우측 보조 슬롯 (모델 드롭다운 Pro 게이팅). */
  trailing?: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  value?: string;
  onSelect?: (id: string) => void;
  /** 비제어 기본 열림 상태 (미리보기/스토리용). */
  defaultOpen?: boolean;
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  value,
  onSelect,
  defaultOpen = false,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(defaultOpen);
  const menuId = useId();

  return (
    <div className={[styles.root, className ?? ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
        <span className={[styles.caret, open ? styles.caretOpen : ''].filter(Boolean).join(' ')} aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul id={menuId} className={styles.menu} role="listbox">
          {items.map((item) => {
            const selected = item.id === value;
            return (
              <li key={item.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={[styles.item, selected ? styles.selected : ''].filter(Boolean).join(' ')}
                  disabled={item.disabled}
                  onClick={() => {
                    onSelect?.(item.id);
                    setOpen(false);
                  }}
                >
                  <span className={styles.itemLabel}>{item.label}</span>
                  {item.trailing ? <span className={styles.itemTrailing}>{item.trailing}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
