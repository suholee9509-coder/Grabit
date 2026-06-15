import styles from './spinner.module.css';

/**
 * 인라인 스피너 — 펜딩 상태(OAuth 진행 중 버튼 leadingIcon 자리).
 * 전용 디자인 프레임 부재(E6) → 토큰 기반 파운데이션 채움. 18px(소셜 아이콘 슬롯 근사).
 */
export function Spinner() {
  return <span className={styles.spinner} role="status" aria-label="처리 중" />;
}
