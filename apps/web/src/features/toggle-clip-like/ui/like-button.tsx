import { useState } from 'react';
import styles from './like-button.module.css';

/**
 * 좋아요 토글 버튼 — 측정 2087:12538 §5(액션 row, h34 보더형).
 * ★ DM1 옵션1: UI + 목킹(BE 미호출). 미인증 → onRequireLogin(로그인 유도).
 *   인증 상태에서도 본 단위는 데이터패스 차단(낙관적 토글만, 영속 ❌).
 */
export interface LikeButtonProps {
  /** 인증 여부(미인증 시 토글 대신 로그인 유도). */
  authenticated?: boolean;
  /** 미인증 클릭 시 로그인 유도. */
  onRequireLogin?: () => void;
  /** 초기 좋아요 상태(목). */
  initialLiked?: boolean;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 13.5S2.5 10 2.5 6.2A2.7 2.7 0 0 1 8 5a2.7 2.7 0 0 1 5.5 1.2C13.5 10 8 13.5 8 13.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

export function LikeButton({
  authenticated = false,
  onRequireLogin,
  initialLiked = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);

  function handleClick() {
    if (!authenticated) {
      onRequireLogin?.();
      return;
    }
    // DM1 옵션1: 낙관적 토글만(영속 미배선 — 데이터패스 차단).
    setLiked((v) => !v);
  }

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={liked}
      onClick={handleClick}
    >
      <span className={[styles.icon, liked ? styles.liked : ''].filter(Boolean).join(' ')}>
        <HeartIcon filled={liked} />
      </span>
      좋아요
    </button>
  );
}
