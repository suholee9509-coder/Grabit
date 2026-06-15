import styles from './oauth-callback-page.module.css';

/** 콜백 로딩 스피너 — 파운데이션 채움(전용 프레임 부재, E6). 토큰만 사용. */
export function Spinner() {
  return <span className={styles.spinner} role="status" aria-label="처리 중" />;
}
