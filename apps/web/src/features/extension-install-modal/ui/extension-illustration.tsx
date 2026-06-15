import styles from './extension-illustration.module.css';

/**
 * 확장 설치 모달 좌측 일러스트 — 측정 G7: 복잡 브라우저/확장 SVG 그룹(정적 자산, 콘텐츠 영역 외).
 * 실제 비트맵/SVG 자산은 디자인 export 대상(별도 자산 파이프라인) → 여기선 토큰 기반
 * 브라우저 창 목업 플레이스홀더로 채움(픽셀 충실도 책임은 콘텐츠 영역 한정, 일러스트는 정적).
 */
export function ExtensionIllustration() {
  return (
    <div className={styles.scene}>
      <div className={styles.window}>
        <div className={styles.toolbar}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.urlbar} />
          <span className={styles.puzzle} aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 3a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v1a2 2 0 1 1-4 0v-1H6a1 1 0 0 1-1-1v-3H4a2 2 0 1 1 0-4h1V5a1 1 0 0 1 1-1h4V3z"
                fill="var(--color-brand-primary)"
              />
            </svg>
          </span>
        </div>
        <div className={styles.viewport}>
          <span className={styles.clipBadge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5v14l11-7L8 5z"
                fill="var(--color-text-on-primary)"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
