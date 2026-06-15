import type { ReactNode } from 'react';
import { Avatar, Button } from '@/shared/ui';
import { NavItem } from './nav-item';
import {
  AddIcon,
  ChevronIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  LibraryIcon,
  SearchIcon,
  ThunderIcon,
} from './icons';
import styles from './sidebar.module.css';

/**
 * Sidebar (GNB) — 앱 셸 좌측 글로벌 내비. 측정 정준: 홈 GNB 2087:70381 auto-layout.
 * 구성: 로고 → '컨텐츠 추가' CTA → 메뉴(★FD1 4탭) → divider → 내 폴더 → divider → 최근 본 컨텐츠 → 프로필 카드.
 * ★FD1: 메뉴 = 홈·검색·라이브러리·수신함(대시보드 제외). ★FD3: 흰색 = #FAFAFA(토큰 처리).
 * FSD widgets — shared/ui(Button·Avatar)·shared만 임포트.
 */

/** ★FD1: GNB 메뉴 키(대시보드 제외 4탭). */
export type SidebarMenuKey = 'home' | 'search' | 'library' | 'inbox';

export interface SidebarFolder {
  id: string;
  label: string;
}

export interface SidebarRecentItem {
  id: string;
  label: string;
  /** 썸네일 이미지 URL(측정: 20×20 radius4). 없으면 빈 면. */
  thumbnailSrc?: string;
}

export interface SidebarProfile {
  name: string;
  avatarSrc?: string;
  /** Premium 인라인 배지 표시 여부(측정: #199E41). */
  premium?: boolean;
}

export interface SidebarProps {
  /** 현재 활성 메뉴(★FD1 4탭 중). */
  activeMenu?: SidebarMenuKey;
  onMenuSelect?: (key: SidebarMenuKey) => void;
  /** '컨텐츠 추가' CTA 클릭. */
  onAddContent?: () => void;
  folders?: SidebarFolder[];
  onFolderSelect?: (id: string) => void;
  recent?: SidebarRecentItem[];
  onRecentSelect?: (id: string) => void;
  profile?: SidebarProfile;
  onProfileClick?: () => void;
  /** 로고 슬롯(미지정 시 텍스트 폴백 'Grabit'). */
  logo?: ReactNode;
}

const MENU: { key: SidebarMenuKey; label: string; icon: ReactNode }[] = [
  { key: 'home', label: '홈', icon: <HomeIcon /> },
  { key: 'search', label: '검색', icon: <SearchIcon /> },
  { key: 'library', label: '라이브러리', icon: <LibraryIcon /> },
  { key: 'inbox', label: '수신함', icon: <InboxIcon /> },
];

export function Sidebar({
  activeMenu = 'home',
  onMenuSelect,
  onAddContent,
  folders = [],
  onFolderSelect,
  recent = [],
  onRecentSelect,
  profile,
  onProfileClick,
  logo,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="글로벌 내비게이션">
      <div className={styles.panel}>
        {/* 로고 + CTA (측정: 로고 프레임 pad14·gap10) */}
        <div className={styles.logoFrame}>
          <div className={styles.logo}>{logo ?? 'Grabit'}</div>
          <Button
            variant="primary"
            size="md"
            neonLabel
            fullWidth
            className={styles.cta}
            leadingIcon={<AddIcon />}
            onClick={onAddContent}
          >
            컨텐츠 추가
          </Button>
        </div>

        {/* nav 묶음 Container (측정: 226 gap16 → 내부 sections gap18) */}
        <nav className={styles.content}>
          <div className={styles.sections}>
            {/* 메뉴 — ★FD1 4탭 */}
            <div className={styles.menu}>
              {MENU.map((m) => (
                <NavItem
                  key={m.key}
                  label={m.label}
                  icon={m.icon}
                  active={activeMenu === m.key}
                  onClick={() => onMenuSelect?.(m.key)}
                />
              ))}
            </div>

            <hr className={styles.divider} />

            {/* 내 폴더 */}
            <section className={styles.section} aria-label="내 폴더">
              <h2 className={styles.sectionLabel}>내 폴더</h2>
              <div className={styles.menu}>
                {folders.map((f) => (
                  <NavItem
                    key={f.id}
                    label={f.label}
                    icon={<FolderIcon />}
                    onClick={() => onFolderSelect?.(f.id)}
                  />
                ))}
              </div>
            </section>

            <hr className={styles.divider} />

            {/* 최근 본 컨텐츠 */}
            <section className={styles.section} aria-label="최근 본 컨텐츠">
              <h2 className={styles.sectionLabel}>최근 본 컨텐츠</h2>
              <div className={styles.menu}>
                {recent.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={styles.recentItem}
                    onClick={() => onRecentSelect?.(r.id)}
                  >
                    {r.thumbnailSrc ? (
                      <img className={styles.recentThumb} src={r.thumbnailSrc} alt="" />
                    ) : (
                      <span className={styles.recentThumb} aria-hidden="true" />
                    )}
                    <span className={styles.recentText}>{r.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </nav>
      </div>

      {/* 프로필 카드 — 측정: 226×50 하단 고정 inset14 */}
      {profile ? (
        <div className={styles.profileWrap}>
          <button type="button" className={styles.profileCard} onClick={onProfileClick}>
            <span className={styles.profileMain}>
              <Avatar src={profile.avatarSrc} initials={profile.name.slice(0, 1)} size="profile" />
              <span className={styles.profileText}>
                <span className={styles.profileName}>{profile.name}</span>
                {profile.premium ? (
                  <span className={styles.profilePremium}>
                    <span className={styles.premiumIcon}>
                      <ThunderIcon />
                    </span>
                    Premium
                  </span>
                ) : null}
              </span>
            </span>
            <span className={styles.profileArrow}>
              <ChevronIcon />
            </span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}
