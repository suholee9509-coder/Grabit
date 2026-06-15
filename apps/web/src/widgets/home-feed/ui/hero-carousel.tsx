import { useHeroFeature } from '@/entities/recommendation';
import styles from './hero-carousel.module.css';

/**
 * HeroCarousel — 상단 히어로(취향관·피드 공용). 측정: 2087:70387 / 2087:71885.
 * 데이터 = useHeroFeature(variant). null(콜드스타트/에러) → 영역 collapse(레이아웃 안전, 무음 폴백).
 */
export interface HeroCarouselProps {
  variant: 'default' | 'stream';
}

export function HeroCarousel({ variant }: HeroCarouselProps) {
  const { data } = useHeroFeature(variant);
  if (!data) return null; // 히어로는 에러/콜드스타트 시 숨김(레이아웃 안전)

  return (
    <section className={styles.hero} aria-label="추천 영상">
      {data.imageUrl ? <img className={styles.image} src={data.imageUrl} alt="" /> : null}
      <span className={styles.fade} aria-hidden="true" />
      <div className={styles.text}>
        <div className={styles.meta}>
          <span>{data.channel}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>{data.viewsLabel}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span>{data.clipsLabel}</span>
        </div>
        <h2 className={styles.title}>{data.title}</h2>
        <div className={styles.strip}>
          {data.thumbnails.map((src, i) => (
            <span
              key={i}
              className={[styles.thumb, i === 0 ? styles.thumbSelected : '']
                .filter(Boolean)
                .join(' ')}
            >
              {src ? <img className={styles.thumbImg} src={src} alt="" /> : null}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.dots} aria-hidden="true">
        <span className={[styles.pageDot, styles.pageDotActive].join(' ')} />
        <span className={styles.pageDot} />
        <span className={styles.pageDot} />
      </div>
    </section>
  );
}
