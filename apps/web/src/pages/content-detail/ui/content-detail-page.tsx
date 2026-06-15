import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, type TabItem } from '@/shared/ui';
import { useSession } from '@/entities/session';
import type { ContentDetail } from '@/entities/content';
import { formatGrabCount } from '@/entities/content';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { SocialSidebar } from '@/widgets/social-sidebar';
import { VideoPlayer, type VideoPlayerHandle } from '@/widgets/video-player';
import { ClipHeatmap } from '@/widgets/clip-heatmap';
import {
  useContentDetail,
  useContentHeatmap,
  useContentInsights,
  useSimilarContent,
} from '@/features/view-insights';
import { LikeButton } from '@/features/toggle-clip-like';
import { AddClipButton } from '@/features/add-clip';
import { WatchInfoTab } from './watch-info-tab';
import { SourceTab } from './source-tab';
import styles from './content-detail-page.module.css';

/**
 * ContentDetailPage — 콘텐츠 상세(측정 2087:12538/13354/13772).
 *   앱 셸 + 좌 본문(underline 탭: 시청정보/원본소스) + 우 SocialSidebar(펼침450/접힘60 리플로우).
 *   라이브러리 컨텍스트(u7)에서도 열릴 수 있게 셸 독립(라우트가 페이지를 직접 마운트).
 * ★게이트ⓐ 제외: AI 패널·AI 노트 탭·Sparkle FAB 미렌더(우측 탭=인사이트 단일).
 * ★DM1 옵션1: 인사이트=content_clips_public BE 배선 · 댓글/작성/좋아요=목킹/비활성(미인증→로그인 유도).
 */

type ContentTab = 'watch' | 'source';

const CONTENT_TABS: TabItem[] = [
  { id: 'watch', label: '시청 정보' },
  { id: 'source', label: '원본 소스' },
];

/** 시청정보/원본소스 세그먼트 토글(측정 2087:12540 — 플레이어 좌상단 오버레이 pill). */
function ContentSegment({
  value,
  onChange,
}: {
  value: ContentTab;
  onChange: (v: ContentTab) => void;
}) {
  return (
    <div className={styles.segmentOverlay}>
      <Tabs
        items={CONTENT_TABS}
        value={value}
        variant="segment"
        size="sm"
        onValueChange={(v) => onChange(v as ContentTab)}
      />
    </div>
  );
}

/** arrow-up-right 아이콘(원본 링크 18×18). */
function ArrowUpRight() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M5.5 12.5l7-7M6.5 5.5h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CastInline() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2.25 3.75h13.5v10.5h-4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 11.25a3 3 0 0 1 3 3M2.25 8.25a6 6 0 0 1 6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="2.75" cy="14.75" r="0.9" fill="currentColor" />
    </svg>
  );
}

/** 메타 타이틀 + 액션 row + 날짜/그랩/태그 row — 측정 2087:12538 §5·§6 (두 탭 공유). */
function MetaRow({
  detail,
  authenticated,
  onAddClip,
  onRequireLogin,
}: {
  detail: ContentDetail;
  authenticated: boolean;
  onAddClip: () => void;
  onRequireLogin: () => void;
}) {
  return (
    <>
      <div className={styles.metaRow}>
        <h1 className={styles.contentTitle}>{detail.title ?? '제목 없음'}</h1>
        <div className={styles.actions}>
          <a
            className={styles.originLink}
            href={detail.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.actionIcon}>
              <ArrowUpRight />
            </span>
            원본 링크
          </a>
          <LikeButton authenticated={authenticated} onRequireLogin={onRequireLogin} />
          <AddClipButton
            authenticated={authenticated}
            onAddClip={onAddClip}
            onRequireLogin={onRequireLogin}
          />
        </div>
      </div>

      <div className={styles.subMetaRow}>
        {detail.uploadedAt ? <span className={styles.date}>{detail.uploadedAt}</span> : null}
        {detail.uploadedAt ? <span className={styles.metaDot} aria-hidden="true" /> : null}
        <span className={styles.grab}>
          <span className={styles.grabIcon}>
            <CastInline />
          </span>
          {formatGrabCount(detail.grabCount)}
        </span>
        <span className={styles.tags}>
          {detail.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </span>
      </div>
    </>
  );
}

export function ContentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const session = useSession();
  const authenticated = Boolean(session.data?.authenticated);

  const [tab, setTab] = useState<ContentTab>('watch');
  const [collapsed, setCollapsed] = useState(false);
  const playerRef = useRef<VideoPlayerHandle | null>(null);

  const insightsQuery = useContentInsights(id);
  const heatmapQuery = useContentHeatmap(id);
  const detailQuery = useContentDetail(id, insightsQuery.data);
  const similarQuery = useSimilarContent(id);

  const insights = insightsQuery.data ?? [];
  const detail = detailQuery.data ?? null;

  function handleSeek(startSec: number) {
    playerRef.current?.seekTo(startSec);
  }
  function handleRequireLogin() {
    navigate('/login');
  }
  function handleAddClip() {
    // 웹 클립 추가 모달 = u3 소관. u4는 진입 트리거만(현재는 no-op 트리거).
  }
  function handleSelectSimilar(otherId: string) {
    navigate(`/content/${otherId}`);
  }

  const loadingMeta = detailQuery.isLoading || insightsQuery.isLoading;

  return (
    <AppShell
      sidebar={<Sidebar activeMenu="home" profile={{ name: 'Grabit 사용자' }} />}
      topbar={
        <Topbar
          breadcrumb={[
            { id: 'home', label: '홈', onClick: () => navigate('/') },
            { id: 'current', label: detail?.title ?? '콘텐츠 상세' },
          ]}
          onLogin={handleRequireLogin}
        />
      }
    >
      <div className={styles.page}>
        <div className={[styles.main, collapsed ? styles.mainWide : ''].filter(Boolean).join(' ')}>
          {loadingMeta ? (
            <LoadingBody />
          ) : detail == null ? (
            <ErrorBody onHome={() => navigate('/')} />
          ) : (
            <div className={styles.watchBody}>
              {/* 공통 헤더(플레이어·히트맵·메타·디바이더) — 두 탭 공유. 세그먼트 토글이 플레이어 좌상단 오버레이. */}
              <div className={styles.playerSlot}>
                <ContentSegment value={tab} onChange={setTab} />
                <VideoPlayer
                  ref={playerRef}
                  videoId={detail.providerContentId || null}
                  title={detail.title ?? '영상'}
                  unavailable={detail.isUnavailable}
                  fallbackUrl={detail.canonicalUrl}
                />
              </div>

              <div className={styles.heatmapSlot}>
                <ClipHeatmap
                  buckets={heatmapQuery.data ?? []}
                  durationSec={detail.durationSec}
                  onSeek={handleSeek}
                  loading={heatmapQuery.isLoading}
                />
              </div>

              <MetaRow
                detail={detail}
                authenticated={authenticated}
                onAddClip={handleAddClip}
                onRequireLogin={handleRequireLogin}
              />

              <div className={styles.divider} aria-hidden="true" />

              {/* 본문 스왑: 시청 정보(분석 그룹) ↔ 원본 소스(원본 컨텐츠 정보 카드) */}
              {tab === 'watch' ? (
                <WatchInfoTab
                  detail={detail}
                  insights={insights}
                  similar={similarQuery.data ?? []}
                  loadingSimilar={similarQuery.isLoading}
                  onSeek={handleSeek}
                  onSelectSimilar={handleSelectSimilar}
                />
              ) : (
                <SourceTab detail={detail} />
              )}
            </div>
          )}
        </div>

        <SocialSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          insightCount={insights.length}
          authenticated={authenticated}
          onRequireLogin={handleRequireLogin}
        />
      </div>
    </AppShell>
  );
}

/** 로딩 — 플레이어/히트맵/인사이트 스켈레톤. */
function LoadingBody() {
  return (
    <div className={styles.watchBody} aria-busy="true">
      <div className={[styles.playerSlot, styles.skeletonPlayer].join(' ')} />
      <div className={styles.heatmapSlot}>
        <div className={styles.skeletonHeatmap} />
      </div>
      <div className={styles.skeletonMeta} />
      <div className={styles.analyticsGroup}>
        <div className={styles.skeletonCardRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** 에러 — 콘텐츠 없음(404) + 홈 복귀. */
function ErrorBody({ onHome }: { onHome: () => void }) {
  return (
    <div className={styles.errorBody} role="alert">
      <p className={styles.errorTitle}>콘텐츠를 찾을 수 없어요.</p>
      <p className={styles.errorSub}>삭제되었거나 잘못된 링크일 수 있어요.</p>
      <button type="button" className={styles.errorHome} onClick={onHome}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
