import styles from './site-footer.module.css';

/**
 * SiteFooter — 홈 피드 본문 맨 하단 푸터 Nav. 측정 정본: 2087:71659(풀스크롤 70384 하단).
 * 구조: separator(1px .08) → Nav(pad40) [ 로고+©2025 | 4 링크 컬럼 | 소셜 3아이콘 ].
 *   컬럼: Company / Communities / Useful links / Spotify Plans (Figma 카피 그대로).
 *   로고/소셜 아이콘 = imageRef SVG 자산(G7 파이프라인 미확정) → 인라인 SVG 플레이스홀더로 형태 유지.
 * 모든 라우팅 = 정적(스코프 외 — 미연결 시 no-op). 데이터 없음(정적 카피).
 */

/** 컬럼 정의 — 측정 카피(2087:71680~71731). */
const COLUMNS: { heading: string; links: string[] }[] = [
  { heading: 'Company', links: ['About', 'Jobs', 'For the Record'] },
  {
    heading: 'Communities',
    links: ['For Artists', 'Developers', 'Advertising', 'Investors', 'Vendors'],
  },
  {
    heading: 'Useful links',
    links: ['Support', 'Free Mobile App', 'Popular by Country', 'Import your music'],
  },
  {
    heading: 'Spotify Plans',
    links: [
      'Premium Individual',
      'Premium Duo',
      'Premium Family',
      'Premium Student',
      'Spotify Free',
      'Audiobooks Access',
    ],
  },
];

/** Grabit 로고(아이콘 + 워드마크) — 측정 83×22.58(2087:71664). 아이콘 fill #66FF4B. */
function GrabitLogo() {
  return (
    <span className={styles.logo} aria-label="Grabit">
      <svg width="20" height="23" viewBox="0 0 20 23" fill="none" aria-hidden="true">
        <path
          d="M10 1.5 18.5 6v11L10 21.5 1.5 17V6L10 1.5Z"
          fill="#66FF4B"
          fillOpacity="0.92"
        />
        <path d="M10 7.5 13.5 9.5v4L10 15.5 6.5 13.5v-4L10 7.5Z" fill="#0A0A0A" />
      </svg>
      <span className={styles.logoWord}>Grabit</span>
    </span>
  );
}

/** 소셜 아이콘 셋 — 측정 16×16(2087:71735/71739/71742). */
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.7" cy="4.3" r="0.9" fill="currentColor" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 4.1c-.45.2-.93.33-1.43.4.51-.31.9-.8 1.1-1.38-.48.29-1.02.5-1.59.61a2.5 2.5 0 0 0-4.26 2.28A7.1 7.1 0 0 1 2.7 3.4a2.5 2.5 0 0 0 .77 3.34c-.4-.01-.78-.12-1.11-.3v.03a2.5 2.5 0 0 0 2 2.45c-.36.1-.74.11-1.1.04a2.5 2.5 0 0 0 2.33 1.74A5.02 5.02 0 0 1 2 11.74 7.08 7.08 0 0 0 5.83 12.9c4.6 0 7.11-3.81 7.11-7.11v-.33c.49-.35.91-.79 1.25-1.29l-.19-.07Z"
        fill="currentColor"
      />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.2 14V8.6h1.8l.27-2.1H9.2V5.16c0-.6.17-1.02 1.04-1.02h1.1V2.26c-.19-.03-.85-.08-1.62-.08-1.6 0-2.7.98-2.7 2.78V6.5H5.2v2.1h1.82V14H9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer} aria-label="사이트 푸터">
      <span className={styles.separator} aria-hidden="true" />
      <div className={styles.nav}>
        {/* 로고 + ©2025 */}
        <div className={styles.brandCol}>
          <GrabitLogo />
          <span className={styles.copyright}>© 2025 Grabit</span>
        </div>

        {/* 4 링크 컬럼 */}
        <div className={styles.columns}>
          {COLUMNS.map((col) => (
            <div key={col.heading} className={styles.column}>
              <span className={styles.heading}>{col.heading}</span>
              <ul className={styles.links}>
                {col.links.map((label) => (
                  <li key={label}>
                    <button type="button" className={styles.link}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 소셜 3아이콘 — 우측 정렬 */}
        <div className={styles.social}>
          <button type="button" className={styles.socialBtn} aria-label="Instagram">
            <InstagramIcon />
          </button>
          <button type="button" className={styles.socialBtn} aria-label="Twitter">
            <TwitterIcon />
          </button>
          <button type="button" className={styles.socialBtn} aria-label="Facebook">
            <FacebookIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}
