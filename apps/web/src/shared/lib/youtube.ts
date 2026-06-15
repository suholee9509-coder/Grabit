/**
 * 클라이언트 1차 YouTube URL 파싱/검증 — u0b `extract_video_ref()`(0006)의 거울(순수 유틸).
 * ⚠ 권위(SoT)는 RPC. 여기선 [다음] 활성/입력 에러용 선검증(중복 라운드트립 회피).
 * 허용 폼(0006과 1:1): youtu.be/<11> · youtube.com/{shorts|embed|live|v}/<11> ·
 *   youtube.com/watch?v=<11>(또는 &v=) · www/m/music 호스트. 타임스탬프/플레이리스트 무시.
 *
 * FSD: 순수 URL 유틸 → shared/lib(최하위). entities/content가 도메인 타입과 함께 재노출.
 */
export interface YoutubeRef {
  provider: 'youtube';
  /** 11자 영상 id. */
  providerContentId: string;
}

const ID = '[A-Za-z0-9_-]{11}';

const PATTERNS: RegExp[] = [
  new RegExp(`youtu\\.be/(${ID})`),
  new RegExp(`youtube\\.com/(?:shorts|embed|live|v)/(${ID})`),
  new RegExp(`youtube\\.com/(?:[^?]*)[?&]v=(${ID})`),
];

/** URL → YoutubeRef. 미지원/빈값이면 null. (RPC 22023과 동일 경계.) */
export function parseYoutubeUrl(url: string | null | undefined): YoutubeRef | null {
  const u = (url ?? '').trim();
  if (u === '') return null;
  for (const re of PATTERNS) {
    const m = u.match(re);
    if (m?.[1]) {
      return { provider: 'youtube', providerContentId: m[1] };
    }
  }
  return null;
}

/** 클라 1차: 유효한 YouTube 영상 URL인지. */
export function isSupportedVideoUrl(url: string | null | undefined): boolean {
  return parseYoutubeUrl(url) !== null;
}
