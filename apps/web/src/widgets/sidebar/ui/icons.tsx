import {
  ChevronRight,
  Folder,
  House,
  Inbox,
  Library,
  Plus,
  Search,
  Zap,
} from 'lucide-react';
import type { SVGProps } from 'react';

/**
 * GNB 아이콘 — lucide-react 아이콘셋 (사용자 결정 2026-06-16: 아이콘셋=lucide).
 * Figma icon/* 컴포넌트 대응: icon/home(1306:5229)·icon/search(1613:10244)·icon/library(1613:10349)·
 *   icon/inbox(1613:11091)·icon/folder(1613:11196)·icon/add(1613:11139)·아이콘_화살표(675:718)·mdi:thunder.
 * 사이즈/색 실측 준수: nav 20×20·currentColor(nav-item 색 상속) · add 16 · thunder 12(fill) · arrow 16.
 * ⚠ Figma active(홈)은 solid 변형이나 lucide outline + 색(#FAFAFA)으로 구분(미세차 — gap).
 */
type IconProps = SVGProps<SVGSVGElement>;

const NAV = { size: 20, strokeWidth: 1.8, 'aria-hidden': true } as const;

export function HomeIcon(props: IconProps) {
  return <House {...NAV} {...props} />;
}

export function SearchIcon(props: IconProps) {
  return <Search {...NAV} {...props} />;
}

export function LibraryIcon(props: IconProps) {
  return <Library {...NAV} {...props} />;
}

export function InboxIcon(props: IconProps) {
  return <Inbox {...NAV} {...props} />;
}

export function FolderIcon(props: IconProps) {
  return <Folder {...NAV} {...props} />;
}

/** add(+) — 측정: 16×16 */
export function AddIcon(props: IconProps) {
  return <Plus size={16} strokeWidth={2} aria-hidden {...props} />;
}

/** mdi:thunder(Premium) — 측정: 12×12, fill currentColor(#199E41 상속) */
export function ThunderIcon(props: IconProps) {
  return <Zap size={12} fill="currentColor" stroke="none" aria-hidden {...props} />;
}

/** 아이콘_화살표(프로필 펼침) — 측정: 16×16 (675:718) */
export function ChevronIcon(props: IconProps) {
  return <ChevronRight size={16} strokeWidth={1.8} aria-hidden {...props} />;
}
