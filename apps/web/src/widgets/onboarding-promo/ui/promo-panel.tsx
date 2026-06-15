import styles from './promo-panel.module.css';

/**
 * 온보딩/로그인 우측 프로모 패널 (widget) — 측정 Component 31 (2557:26229 외):
 *   x=966 y=8 · 946×1064 · bg rgba(255,255,255,0.04) · radius 8.
 *   콘텐츠 블록(x=303 y=213, column align center, gap 6, w339):
 *     제목 "업계 사람들이 주목한 인사이트를 확인하세요" 24/600/130% #FAFAFA ·
 *     부제 "나와 비슷한 사람들은 어떤 콘텐츠에서 어떤 것을\n중요하게 보고 있는지 한눈에 볼 수 있어요." 14/400/160% #CECECE.
 *   하단 일러스트 카드(스코프 외 정적 자산 G7) — 토큰 기반 플레이스홀더.
 */
export function PromoPanel() {
  return (
    <aside className={styles.panel} aria-hidden="true">
      <div className={styles.copy}>
        <h2 className={styles.title}>업계 사람들이 주목한 인사이트를 확인하세요</h2>
        <p className={styles.subtitle}>
          나와 비슷한 사람들은 어떤 콘텐츠에서 어떤 것을
          <br />
          중요하게 보고 있는지 한눈에 볼 수 있어요.
        </p>
      </div>
      <div className={styles.illustration} />
    </aside>
  );
}
