/**
 * Recommendation 엔티티 — 홈 취향관/피드의 추천·트렌드 읽기 모델(표현 셰이프).
 *
 * ★ no-leak(ADR-0002 #3 sanitized read): 어떤 모델도 user_id·실명·display_name 필드를 갖지 않는다.
 *   작성자 표시는 가공된 "직군 라벨"(예: "프로덕트 디자이너 5년차")이며 cross-user 식별자가 아니다.
 *   실 supabase 경로 도입 시에도 contents(public-read 메타)만 조회, clips 직접쿼리 ❌.
 *
 * ★ 데이터 표면 결정(E1): u0b에 인기/트렌드 집계 RPC가 없으므로 MVP 주 경로 = demo-seed(콜드스타트 폴백).
 *   신규 BE RPC ❌(ADR-0002 #7). isSupabaseReady 분기로 화면은 항상 뜬다.
 */

/** 작성자 직군 라벨 색 키 — 카드별 가변색(측정: mint/violet/magenta). 식별자 아님. */
export type AuthorTone = 'mint' | 'violet' | 'magenta';

/** 카드 공통 작성자 표시(가공). user_id/실명 없음. */
export interface AuthorBadge {
  /** 직군 N년차 라벨(예: "프로덕트 디자이너 5년차"·"CMO 8년차"). 색 = tone. */
  role: string;
  /** 소속/회사명(예: "무신사 마케팅본부"). 흰색. */
  affiliation: string;
  /** 직군 라벨 색 키(측정 가변). */
  tone: AuthorTone;
}

/** 추천 캐러셀 카드(334×334 — 풀스크롤 정본). */
export interface RecCardModel {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  /** 본문 한 줄 설명. */
  summary: string;
  author: AuthorBadge;
  tags: string[];
  /** 클립 수(예: 18). */
  clipCount: number;
}

/** 그리드/트렌드 대형 카드(356×461). */
export interface GridCardModel {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  tags: string[];
  clipCount: number;
  author: AuthorBadge;
  /** 게시 날짜 라벨(예: "2025. 11. 22") 또는 설명. */
  meta: string;
}

/** 크로스/인사이트 가로형 카드(252폭). */
export interface CrossCardModel {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  author: AuthorBadge;
  summary: string;
}

/** 실시간 그랩 카드(우레일 — 버블 + 임베드). */
export interface GrabModel {
  id: string;
  /** 작성자 이니셜(아바타 표시용 — 가공 닉, 식별자 아님). */
  authorInitial: string;
  /** 작성자 표시명(가공 닉, 시드 카피). */
  authorName: string;
  /** 직군 N년차 라벨. */
  role: string;
  roleTone: AuthorTone;
  /** 버블 본문(그랩 메모). */
  body: string;
  /** 임베드 영상 제목. */
  embedTitle: string;
  /** 임베드 채널명. */
  embedChannel: string;
  embedThumbnailUrl: string | null;
  /** 상대 시간(예: "1시간 전"). */
  timeLabel: string;
}

/** underline 탭 항목(크로스/인사이트 분야 전환). */
export interface FieldTab {
  id: string;
  /** 라벨 prefix(예: "프로덕트 디자이너가 보는 "). */
  prefix: string;
  /** 강조어(그린 — 측정 #20C974). */
  emphasis: string;
  /** 라벨 suffix(예: " 아티클"). */
  suffix: string;
}

/** 히어로 피처(취향관·피드 공용 — 카피만 분기). */
export interface HeroFeature {
  channel: string;
  viewsLabel: string;
  clipsLabel: string;
  title: string;
  /** 우측 대형 이미지 URL. */
  imageUrl: string | null;
  /** 썸네일 스트립(72×40 ×5). */
  thumbnails: string[];
}

/** 추천 캐러셀 피드. */
export interface RecommendationFeed {
  /** 섹션 제목(내 직군 라벨 주입). */
  title: string;
  items: RecCardModel[];
}

/** 크로스 트렌드/인사이트 피드(탭 + 카드). */
export interface CrossTrendFeed {
  tabs: FieldTab[];
  items: CrossCardModel[];
}

/** 실시간 인기 그랩(피드 캐러셀) — 가로형 카드. */
export interface StreamGrabModel {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  tags: string[];
  clipCount: number;
  author: AuthorBadge;
  summary: string;
  /** 타임코드 라벨(예: "10:11~12:42"). */
  timecode: string;
}

/** 분야별 트렌드 그리드. */
export interface TrendGridFeed {
  items: GridCardModel[];
}

/** 실시간 인기 그랩 피드. */
export interface StreamFeed {
  items: StreamGrabModel[];
}

/** 우레일 실시간 그랩 피드. */
export interface GrabFeed {
  items: GrabModel[];
}
