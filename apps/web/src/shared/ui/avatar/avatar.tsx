import styles from './avatar.module.css';

/**
 * Avatar — 유저 프로필 이미지/이니셜 (톱바·계정·애노테이션 코호트).
 * size = sm(24)/md(32)/lg(48). 이미지 없으면 이니셜 폴백.
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string;
  alt?: string;
  /** 폴백 이니셜(1–2자). */
  initials?: string;
  size?: AvatarSize;
}

export function Avatar({ src, alt = '', initials, size = 'md' }: AvatarProps) {
  const classes = [styles.avatar, styles[size]].filter(Boolean).join(' ');
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
