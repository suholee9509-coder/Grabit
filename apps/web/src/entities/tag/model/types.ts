/**
 * Tag 엔티티 — 사용자별 태그(ADR-0002 #8, 유저별 get-or-create).
 * u0b `tags`(0003) 소비. 자동완성 = 본인 태그 prefix 매칭. 라벨 정규화는 RPC 위임.
 */
export interface Tag {
  id: string;
  name: string;
}

/** 태그 라벨 정규화(클라 입력 정리 — btrim·내부 공백 단일화). 빈 문자열은 무시 대상. */
export function normalizeTagLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}
