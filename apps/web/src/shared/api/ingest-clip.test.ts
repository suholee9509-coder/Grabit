import { describe, expect, it, vi } from 'vitest';
import { ingestClip } from './ingest-clip';
import type { SupabaseClient } from './supabase';
import type { IngestClipParams } from './types';

const INPUT: IngestClipParams = {
  url: 'https://youtu.be/dQw4w9WgXcQ',
  startSec: 32,
  endSec: 61,
  memo: '회복 탄력성',
  isPublic: true,
  folderId: 'f-startup',
  tags: ['개발자', '창업'],
  title: '제목',
  channel: '채널',
  durationSec: 92,
  thumbnailUrl: 'https://i.ytimg.com/x.jpg',
};

describe('ingestClip', () => {
  it('p_* snake 인자로 ingest_clip RPC 단일 호출(시그니처 0009)', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { id: 'c1', content_id: 'k1', start_sec: 32, end_sec: 61, memo: '회복 탄력성', is_public: true, folder_id: 'f-startup' },
      error: null,
    });
    const client = { rpc } as unknown as SupabaseClient;

    const clip = await ingestClip(INPUT, client);

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('ingest_clip', {
      p_url: 'https://youtu.be/dQw4w9WgXcQ',
      p_start_sec: 32,
      p_end_sec: 61,
      p_memo: '회복 탄력성',
      p_is_public: true,
      p_folder_id: 'f-startup',
      p_tags: ['개발자', '창업'],
      p_title: '제목',
      p_channel: '채널',
      p_duration_sec: 92,
      p_thumbnail_url: 'https://i.ytimg.com/x.jpg',
    });
    // 구간은 정수
    const call = rpc.mock.calls[0][1];
    expect(Number.isInteger(call.p_start_sec)).toBe(true);
    expect(Number.isInteger(call.p_end_sec)).toBe(true);
    // 반환 매핑(snake → camel)
    expect(clip).toEqual({
      id: 'c1',
      contentId: 'k1',
      startSec: 32,
      endSec: 61,
      memo: '회복 탄력성',
      isPublic: true,
      folderId: 'f-startup',
    });
  });

  it('RPC 에러 → throw(상위 매핑)', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: '22023', message: 'invalid interval' } });
    const client = { rpc } as unknown as SupabaseClient;
    await expect(ingestClip(INPUT, client)).rejects.toMatchObject({ code: '22023' });
  });

  it('배열 반환도 1행으로 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ id: 'c2', content_id: 'k2', start_sec: 0, end_sec: 5 }],
      error: null,
    });
    const client = { rpc } as unknown as SupabaseClient;
    const clip = await ingestClip({ ...INPUT, startSec: 0, endSec: 5 }, client);
    expect(clip.id).toBe('c2');
    expect(clip.endSec).toBe(5);
  });
});
