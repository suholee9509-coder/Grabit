import styles from './empty-results.module.css';

/**
 * EmptyResults — 0건 빈 문구. 측정: 2087:40185.
 *   "'<쿼리>'의 검색 결과가 없습니다." — 따옴표 ‘ ’(U+2018/U+2019 곡선) · 쿼리 그대로 · 마침표.
 *   18/400/130%/-2% #B4B4B4 LEFT. 출처필터·그리드 비노출(상위 조건부 unmount).
 */
export interface EmptyResultsProps {
  query: string;
}

export function EmptyResults({ query }: EmptyResultsProps) {
  return <p className={styles.empty}>{`‘${query}’의 검색 결과가 없습니다.`}</p>;
}
