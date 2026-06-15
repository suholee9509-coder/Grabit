// YouTube host-page reads (content script). Read-only DOM/video access — we never mutate the host
// page (Shadow DOM keeps our UI isolated; spec [non-regression]). All values are advisory metadata;
// the server keeps existing good metadata and canonicalizes the URL form (ADR-0002).

export interface VideoMeta {
  url: string; // current watch URL, sent AS-IS (server canonicalizes)
  title: string | null;
  channel: string | null;
  durationSec: number | null;
  currentSec: number; // player position at the moment of capture
  thumbnailUrl: string | null;
}

/** The 11-char YouTube id from the current ?v= param (for the thumbnail URL only). */
function videoId(): string | null {
  const m = location.search.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** The page's <video> element (the main player). */
export function getVideoEl(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video.html5-main-video, video');
}

function readTitle(): string | null {
  const el =
    document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ??
    document.querySelector('h1.title yt-formatted-string') ??
    document.querySelector('meta[name="title"]');
  if (el instanceof HTMLMetaElement) return el.content || null;
  const text = el?.textContent?.trim();
  return text && text !== '' ? text : (document.title.replace(/ - YouTube$/, '').trim() || null);
}

function readChannel(): string | null {
  const el =
    document.querySelector('ytd-channel-name #text a') ??
    document.querySelector('ytd-channel-name yt-formatted-string a') ??
    document.querySelector('#owner #channel-name a');
  const text = el?.textContent?.trim();
  return text && text !== '' ? text : null;
}

export function captureMeta(): VideoMeta {
  const video = getVideoEl();
  const id = videoId();
  const duration = video && Number.isFinite(video.duration) ? Math.floor(video.duration) : null;
  return {
    url: location.href,
    title: readTitle(),
    channel: readChannel(),
    durationSec: duration,
    currentSec: video ? Math.floor(video.currentTime) : 0,
    thumbnailUrl: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
  };
}

/** Seek the host video to a given second (preview when dragging trim handles). Best-effort. */
export function seekTo(sec: number): void {
  const video = getVideoEl();
  if (video && Number.isFinite(sec)) video.currentTime = Math.max(0, sec);
}
