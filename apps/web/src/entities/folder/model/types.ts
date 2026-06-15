/**
 * Folder 엔티티 — 사용자 폴더(클립 부착 대상, ADR-0002 #8).
 * u0b `folders`(0003) 소비. 본인 RLS. 최대 20개. 이 단위는 선택만(생성=u7).
 */
export interface Folder {
  id: string;
  name: string;
}
