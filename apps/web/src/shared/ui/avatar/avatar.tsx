import styles from './avatar.module.css';

/**
 * Avatar — 유저/카테고리 프로필 (측정: xs=18 인사이트·xl=82 취향관 카테고리).
 * size = xs(18)/sm(24)/md(32)/lg(48)/xl(82). 이미지 없으면 이니셜 폴백.
 * selected = 취향관 카테고리 선택 링(2px 네온 50%, 측정).
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  /** 폴백 이니셜(1–2자). */
  initials?: string;
  size?: AvatarSize;
  /** 카테고리 선택 링(측정: 2px rgba(102,255,75,0.5)). */
  selected?: boolean;
}

export function Avatar({ src, alt = '', initials, size = 'md', selected = false }: AvatarProps) {
  const classes = [styles.avatar, styles[size], selected ? styles.selected : '']
    .filter(Boolean)
    .join(' ');
  return (
    <span className={classes}>
      {src ? (
        <img className={styles.img} src={src} alt={alt} />
      ) : (
        <span className={styles.initials}>{initials ?? '?'}</span>
      )}
    </span>
  );
}
