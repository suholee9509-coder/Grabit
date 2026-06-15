import { describe, expect, it } from 'vitest';
import { isSupportedVideoUrl, parseYoutubeUrl } from './youtube';

/** 0006 extract_video_ref 거울 — 허용 폼별 11자 id 추출(타임스탬프/플레이리스트 무시). */
describe('parseYoutubeUrl', () => {
  it('watch?v= 형식', () => {
    expect(parseYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      provider: 'youtube',
      providerContentId: 'dQw4w9WgXcQ',
    });
  });

  it('youtu.be 단축', () => {
    expect(parseYoutubeUrl('https://youtu.be/dQw4w9WgXcQ?t=42')?.providerContentId).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('shorts / embed / live / v', () => {
    expect(parseYoutubeUrl('https://youtube.com/shorts/dQw4w9WgXcQ')?.providerContentId).toBe(
      'dQw4w9WgXcQ',
    );
    expect(parseYoutubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')?.providerContentId).toBe(
      'dQw4w9WgXcQ',
    );
    expect(parseYoutubeUrl('https://m.youtube.com/live/dQw4w9WgXcQ')?.providerContentId).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('music 호스트 + 추가 파라미터', () => {
    expect(
      parseYoutubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=ABC')
        ?.providerContentId,
    ).toBe('dQw4w9WgXcQ');
  });

  it('미지원/빈/비유튜브 → null', () => {
    expect(parseYoutubeUrl('')).toBeNull();
    expect(parseYoutubeUrl('   ')).toBeNull();
    expect(parseYoutubeUrl('https://vimeo.com/12345')).toBeNull();
    expect(parseYoutubeUrl('https://example.com/?v=dQw4w9WgXcQ')).toBeNull(); // 비유튜브 호스트
    expect(parseYoutubeUrl('https://youtube.com/watch?v=short')).toBeNull(); // 11자 미만
  });

  it('isSupportedVideoUrl', () => {
    expect(isSupportedVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isSupportedVideoUrl('not a url')).toBe(false);
  });
});
