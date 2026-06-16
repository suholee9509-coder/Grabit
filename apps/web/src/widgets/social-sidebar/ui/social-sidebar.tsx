import { Avatar, Button, Tabs, type TabItem } from '@/shared/ui';
import { DEMO_COMMENTS } from '@/entities/annotation';
import { CommentCard } from './comment-card';
import styles from './social-sidebar.module.css';

/**
 * SocialSidebar — 우측 소셜 사이드바(측정 2557:23064 펼침 450 / 2087:14297 접힘 60).
 *   펼침: 작성 버튼 + `인사이트(N)` 단일 탭(underline) + collapse 토글 + 댓글/답글 카드 스택 + 하단 페이드 + composer.
 *   접힘: expand 토글만(작성 세로 텍스트 = Figma 미존재 → 제거).
 * ★게이트ⓐ 제외: `AI 노트` 탭 미렌더(인사이트 단일), Sparkle mini FAB 미렌더.
 * ★DM1 옵션1: 댓글/답글·작성·composer = 픽셀퍼펙트 UI + 목킹/비활성(BE 미호출). 미인증→로그인 유도.
 *   [A4] 하단 composer = 입력 셸(아바타 + textarea + 작성). 전송 데이터패스 차단(목킹/disabled).
 */
export interface SocialSidebarProps {
  /** 펼침/접힘 상태(부모가 본문 리플로우와 함께 제어). */
  collapsed: boolean;
  /** collapse/expand 토글. */
  onToggle: () => void;
  /** 인사이트 카운트(공개 클립 수 — 탭 배지). */
  insightCount: number;
  /** 인증 여부(미인증 작성 → 로그인 유도). */
  authenticated?: boolean;
  /** 작성 클릭(인증) — DM1: 데이터패스 차단, 트리거만. */
  onWrite?: () => void;
  /** 미인증 작성 → 로그인 유도. */
  onRequireLogin?: () => void;
}

/** 우측 collapse(layout-right) 아이콘 — 측정 20×20. */
function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      style={{ transform: collapsed ? 'scaleX(-1)' : undefined }}
    >
      <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.5 4v12" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function SocialSidebar({
  collapsed,
  onToggle,
  insightCount,
  authenticated = false,
  onWrite,
  onRequireLogin,
}: SocialSidebarProps) {
  function handleWrite() {
    if (!authenticated) {
      onRequireLogin?.();
      return;
    }
    onWrite?.();
  }

  const tabs: TabItem[] = [
    {
      id: 'insight',
      label: '인사이트',
      trailing: <span className={styles.tabCount}>{insightCount}</span>,
    },
  ];

  if (collapsed) {
    return (
      <aside
        className={[styles.sidebar, styles.collapsed].join(' ')}
        aria-label="소셜 사이드바(접힘)"
      >
        <button
          type="button"
          className={styles.collapseToggle}
          aria-label="사이드바 펼치기"
          onClick={onToggle}
        >
          <CollapseIcon collapsed />
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar} aria-label="소셜 사이드바">
      <div className={styles.writeRow}>
        <Button variant="solidGray" size="small" onClick={handleWrite}>
          작성
        </Button>
      </div>

      <div className={styles.tabBar}>
        <Tabs items={tabs} value="insight" variant="underline" className={styles.tabs} />
        <button
          type="button"
          className={styles.collapseToggle}
          aria-label="사이드바 접기"
          onClick={onToggle}
        >
          <CollapseIcon collapsed={false} />
        </button>
      </div>

      <div className={styles.listWrap}>
        <div className={styles.list}>
          {DEMO_COMMENTS.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </div>
        <div className={styles.bottomFade} aria-hidden="true" />
      </div>

      {/* [A4] composer — 입력 셸(아바타 + textarea + 작성). DM1: 전송 데이터패스 차단(disabled). */}
      <form
        className={styles.composer}
        aria-label="댓글 작성"
        onSubmit={(e) => {
          // DM1: 전송 비활성(목킹 — BE 미호출). 핸들러는 셸 차단만.
          e.preventDefault();
        }}
      >
        <Avatar size="xs" initials="나" />
        <textarea
          className={styles.composerInput}
          placeholder="이 영상에 대한 생각을 남겨보세요"
          rows={1}
          aria-label="댓글 입력"
          disabled
        />
        <Button type="submit" variant="solidGray" size="small" disabled>
          작성
        </Button>
      </form>
    </aside>
  );
}
