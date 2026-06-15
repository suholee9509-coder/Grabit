import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import styles from './video-player.module.css';

/**
 * VideoPlayer — YouTube iframe 임베드 + seekTo 명령(측정 2087:12538 §3, 1156×650 radius10).
 * ★ ref 명령형 핸들(VideoPlayerHandle.seekTo)로 히트맵 마커/인기구간 카드가 seek 후 재생.
 *   IFrame Player API(YT.Player)가 로드돼 있으면 player.seekTo 사용, 아니면 iframe src에
 *   start 파라미터를 재설정(폴백). 테스트는 ref 스파이로 seekTo 호출만 단언(실 iframe 미로드).
 * 브라우저측 외부 API 키 호출 없음(공개 임베드 iframe만).
 */

export interface VideoPlayerHandle {
  /** 지정 초로 이동 후 재생. */
  seekTo: (startSec: number) => void;
}

export interface VideoPlayerProps {
  /** YouTube 영상 id(11자). null이면 placeholder. */
  videoId: string | null;
  /** 영상 제목(접근성). */
  title?: string;
  /** 삭제/비공개 영상(임베드 불가) → 안내 + 원본 링크 폴백 슬롯. */
  unavailable?: boolean;
  /** unavailable 시 원본 링크(canonical_url). */
  fallbackUrl?: string | null;
}

interface YTPlayer {
  seekTo: (sec: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
}
interface YTPlayerCtor {
  new (
    el: HTMLElement,
    opts: {
      videoId: string;
      events?: { onReady?: () => void };
      playerVars?: Record<string, number | string>;
    },
  ): YTPlayer;
}
interface YTNamespace {
  Player: YTPlayerCtor;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function ensureApiLoaded() {
  if (typeof document === 'undefined') return;
  if (window.YT?.Player) return;
  if (document.getElementById('youtube-iframe-api')) return;
  const tag = document.createElement('script');
  tag.id = 'youtube-iframe-api';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoId, title = '영상 플레이어', unavailable, fallbackUrl }, ref) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        seekTo(startSec: number) {
          const sec = Math.max(0, Math.floor(startSec));
          if (playerRef.current) {
            playerRef.current.seekTo(sec, true);
            playerRef.current.playVideo();
            return;
          }
          // 폴백: iframe src에 start + autoplay 재설정.
          if (iframeRef.current && videoId) {
            iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?start=${sec}&autoplay=1&rel=0`;
          }
        },
      }),
      [videoId],
    );

    // YT IFrame Player API 부착(가능 시). 미로드 시 정적 iframe 폴백(아래 렌더).
    useEffect(() => {
      if (!videoId || unavailable) return;
      ensureApiLoaded();
      let cancelled = false;
      function attach() {
        if (cancelled || !hostRef.current || !window.YT?.Player || !videoId) return;
        playerRef.current = new window.YT.Player(hostRef.current, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
        });
      }
      if (window.YT?.Player) {
        attach();
      } else {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          attach();
        };
      }
      return () => {
        cancelled = true;
        playerRef.current = null;
      };
    }, [videoId, unavailable]);

    if (unavailable || !videoId) {
      return (
        <div className={styles.player}>
          <div className={styles.unavailable}>
            <p className={styles.unavailableText}>
              {unavailable ? '삭제되었거나 비공개된 영상이에요.' : '영상을 불러올 수 없어요.'}
            </p>
            {fallbackUrl ? (
              <a
                className={styles.fallbackLink}
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                원본 링크로 이동
              </a>
            ) : null}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.player}>
        {/* API 부착 대상(YT.Player가 이 div를 iframe으로 교체). 미로드 시 아래 정적 iframe이 보임. */}
        <div ref={hostRef} className={styles.apiHost} />
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  },
);
