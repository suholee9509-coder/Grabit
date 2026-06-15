/**
 * Folder 엔티티 — 사용자 폴더(클립 부착 대상, ADR-0002 #8).
 * u0b `folders`(0003) 소비. 본인 RLS. 최대 20개. 이 단위는 선택만(생성=u7).
 */
export interface Folder {
  id: string;
  name: string;
}

/**
 * 폴더 + 컨텐츠 카운트(u7) — 라이브러리 폴더 카드·좌 트리·드롭다운의 "N개의 컨텐츠".
 * library_folder_counts 소비(distinct content per folder). Folder는 그대로(소비자 비파괴).
 */
export interface FolderWithCount extends Folder {
  /** 폴더별 distinct content 수(DM2-A). */
  contentCount: number;
}
