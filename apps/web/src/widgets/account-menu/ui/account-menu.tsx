import { useEffect, useRef } from 'react';
import styles from './account-menu.module.css';

/**
 * AccountMenu — GNB 프로필 카드(chevron) 진입점에서 열리는 계정 팝오버.
 *   항목 4개: [프로필 설정] [설정] [로그아웃] [회원 탈퇴].
 * ★ 전용 Figma 프레임 없음 = 디자인 공백 → u0c 팝오버 패턴(library-page cardMenu / dropdown 면)과
 *   파운데이션 토큰으로만 조립(발명 ❌·하드코딩 HEX ❌). 면 = surface-100·radius10·border-subtle.
 * 앵커 = 프로필 카드 DOM(상위 settings/inbox 페이지가 좌하단 고정 배치). 외부클릭/Esc 닫힘은
 *   페이지-local overlay + 키 핸들러(library-page folderDropdown overlay 패턴 동일).
 * FSD widgets — shared/ui·shared만 의존(여기선 순수 토큰 면, 외부 import 없음).
 */
export interface AccountMenuItem {
  id: 'profile' | 'settings' | 'logout' | 'withdraw';
  label: string;
  /** 위험 항목(회원 탈퇴) — 색 발명 ❌, 카피·확인으로 위험 전달. 시각은 중립 유지. */
  danger?: boolean;
}

const ITEMS: AccountMenuItem[] = [
  { id: 'profile', label: '프로필 설정' },
  { id: 'settings', label: '설정' },
  { id: 'logout', label: '로그아웃' },
  { id: 'withdraw', label: '회원 탈퇴', danger: true },
];

export interface AccountMenuProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: AccountMenuItem['id']) => void;
}

export function AccountMenu({ open, onClose, onSelect }: AccountMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Esc 닫힘(외부클릭은 overlay가 처리 — 페이지-local).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={ref}
        className={styles.menu}
        role="menu"
        aria-label="계정 메뉴"
        onClick={(e) => e.stopPropagation()}
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            className={[styles.item, item.danger ? styles.danger : ''].filter(Boolean).join(' ')}
            onClick={() => {
              onSelect(item.id);
              onClose();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
