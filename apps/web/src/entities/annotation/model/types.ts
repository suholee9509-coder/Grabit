/**
 * Annotation 엔티티 — ★표현 전용 목(mock) 타입. DB `annotations` 테이블/계약과 **무관**.
 *
 * DM1 옵션1(PM/사용자 결정 2026-06-15): 우측 사이드바 댓글/답글·`작성`은 픽셀퍼펙트 UI +
 *   데이터 목킹/비활성. 실 `annotations`(+replies+likes) 엔티티·실명 노출 정책은 ADR-0003 후보로
 *   다음 스프린트 신규 단위 분리. → 본 타입은 프레임 카피 상수(DEMO_COMMENTS) 전용,
 *   BE(get_content_annotations) 미호출. 실명/아바타는 목 상수에 한정(실 BE에서 익명 위반 0).
 *
 * ⚠ 다음 스프린트의 실 annotations 엔티티와 충돌 방지를 위해 명칭은 MockComment/MockReply.
 */

/** 목 답글(스레드 1행) — 표현 전용. */
export interface MockReply {
  id: string;
  /** 작성자 표시명(목 상수 한정 — 실명, BE 미연결). */
  authorName: string;
  /** 작성자 이니셜(아바타 폴백). */
  authorInitials: string;
  /** 직군 N년차 라벨(예: "3년차 프로덕트 디자이너"). */
  cohortLabel: string;
  /** 답글 본문. */
  body: string;
  /** 상대 시각 라벨("1시간 전"). */
  timeLabel: string;
  /** 좋아요 수(목). */
  likeCount: number;
}

/** 목 댓글(시점앵커 노트) — 표현 전용. */
export interface MockComment {
  id: string;
  authorName: string;
  authorInitials: string;
  /** 직군 N년차 라벨. */
  cohortLabel: string;
  /** 인용 메모 본문. */
  body: string;
  /** 앵커 구간 라벨("10:11~12:42"). */
  intervalLabel: string;
  /** 상대 시각 라벨("1시간 전"). */
  timeLabel: string;
  /** 좋아요 수(목). */
  likeCount: number;
  /** 답글(목, 없으면 빈 배열). */
  replies: MockReply[];
  /** "답글 N개 모두 보기" 노출 여부(replies가 있을 때). */
  totalReplies: number;
}
