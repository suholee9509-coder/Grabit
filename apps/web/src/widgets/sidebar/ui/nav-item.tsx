import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './nav-item.module.css';

/**
 * NavItem — GNB 메뉴/폴더 항목(셸 전용, shared/ui 비편입).
 * 측정 정준: 홈 GNB 2087:70381 layout_L4P6XT(h32·pad8/10·gap8·radius8·아이콘20).
 * 2상태: active(#242424 bg·#FAFAFA·Medium·solid 아이콘) / inactive(투명·#B4B4B4·Regular·outline 아이콘).
 * 아이콘은 호출부에서 active 변형(solid/outline)을 선택해 leadingIcon으로 주입.
 */
export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  /** 측정: 아이콘 슬롯 20×20 (layout_YM9W7Q). active 시 solid·inactive 시 outline 변형 주입. */
  icon?: ReactNode;
  active?: boolean;
}

export function NavItem({ label, icon, active = false, className, ...rest }: NavItemProps) {
  const classes = [styles.navItem, active ? styles.active : styles.inactive, className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} aria-current={active ? 'page' : undefined} {...rest}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
