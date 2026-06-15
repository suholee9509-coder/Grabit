import { describe, expect, it, vi } from 'vitest';
import {
  getContentSocialClips,
  getContentHeatmap,
  getContentMeta,
} from './content-read';
import type { SupabaseClient } from './supabase';

/**
 * content-read 배선 테스트 — u0b 락 계약(0002/0007/0008) 호출 경로 단언.
 *   ★ raw `clips` 미쿼리(sanitized RPC/뷰 경로만) · snake→camel 매핑 · null client throw ·
 *     404(maybeSingle null) · sanitized 셰이프에 user_id/실명 키 부재.
 */

function makeClient(overrides: Partial<{
  rpc: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
}> = {}) {
  const rpc = overrides.rpc ?? vi.fn();
  const from = overrides.from ?? vi.fn();
  return { rpc, from } as unknown as SupabaseClient & {
    rpc: ReturnType<typeof vi.fn>;
    from: ReturnType<typeof vi.fn>;
  };
}

describe('getContentSocialClips', () => {
  it('get_content_social_clips RPC를 정확 인자로 호출하고 snake→camel 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          content_id: 'c-1',
          clip_id: 'cl-1',
          start_sec: 611,
          end_sec: 762,
          memo: '메모',
          cohort_job: '프로덕트 디자이너',
          cohort_years: 3,
          cohort_revealed: true,
          created_at: '2026-06-16T09:00:00.000Z',
        },
      ],
      error: null,
    });
    const client = makeClient({ rpc });

    const rows = await getContentSocialClips('c-1', client);

    expect(rpc).toHaveBeenCalledWith('get_content_social_clips', { p_content_id: 'c-1' });
    expect(rows).toEqual([
      {
        contentId: 'c-1',
        clipId: 'cl-1',
        startSec: 611,
        endSec: 762,
        memo: '메모',
        cohortJob: '프로덕트 디자이너',
        cohortYears: 3,
        cohortRevealed: true,
        createdAt: '2026-06-16T09:00:00.000Z',
      },
    ]);
    // ★ raw clips 직접쿼리 안 함(from 미호출) — sanitized RPC 경로만
    expect((client as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled();
  });

  it('★sanitized 셰이프: user_id/display_name/email 키 부재', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          content_id: 'c-1',
          clip_id: 'cl-1',
          start_sec: 0,
          end_sec: 10,
          memo: null,
          cohort_job: null,
          cohort_years: null,
          cohort_revealed: false,
          created_at: null,
        },
      ],
      error: null,
    });
    const rows = await getContentSocialClips('c-1', makeClient({ rpc }));
    const keys = Object.keys(rows[0]);
    expect(keys).not.toContain('userId');
    expect(keys).not.toContain('displayName');
    expect(keys).not.toContain('email');
    // 임계 미달 행: 코호트 null + revealed false
    expect(rows[0].cohortRevealed).toBe(false);
    expect(rows[0].cohortJob).toBeNull();
  });

  it('client null이면 throw(상위 demo 폴백)', async () => {
    await expect(getContentSocialClips('c-1', null)).rejects.toThrow();
  });

  it('RPC error를 throw', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('rpc fail') });
    await expect(getContentSocialClips('c-1', makeClient({ rpc }))).rejects.toThrow('rpc fail');
  });
});

describe('getContentHeatmap', () => {
  it('content_heatmap RPC를 정확 인자로 호출하고 매핑', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        { bucket_start: 0, bucket_end: 10, density: 2 },
        { bucket_start: 10, bucket_end: 20, density: 0 },
      ],
      error: null,
    });
    const client = makeClient({ rpc });

    const buckets = await getContentHeatmap('c-1', client);

    expect(rpc).toHaveBeenCalledWith('content_heatmap', { p_content_id: 'c-1' });
    expect(buckets).toEqual([
      { bucketStart: 0, bucketEnd: 10, density: 2 },
      { bucketStart: 10, bucketEnd: 20, density: 0 },
    ]);
    // ★ raw clips 미쿼리
    expect((client as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled();
  });

  it('client null이면 throw', async () => {
    await expect(getContentHeatmap('c-1', null)).rejects.toThrow();
  });
});

describe('getContentMeta', () => {
  function makeMetaClient(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    return { client: makeClient({ from }), select, eq, maybeSingle, from };
  }

  it('contents 테이블 select + snake→camel 매핑', async () => {
    const { client, from, select, eq } = makeMetaClient({
      data: {
        id: 'c-1',
        provider: 'youtube',
        provider_content_id: 'W3F8I0GNuFg',
        canonical_url: 'https://youtu.be/W3F8I0GNuFg',
        title: '제목',
        channel: 'EO 채널',
        duration_sec: 1500,
        thumbnail_url: 'https://i.ytimg.com/x.jpg',
        is_unavailable: false,
      },
      error: null,
    });

    const meta = await getContentMeta('c-1', client);

    expect(from).toHaveBeenCalledWith('contents');
    expect(select).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'c-1');
    expect(meta).toEqual({
      id: 'c-1',
      provider: 'youtube',
      providerContentId: 'W3F8I0GNuFg',
      canonicalUrl: 'https://youtu.be/W3F8I0GNuFg',
      title: '제목',
      channel: 'EO 채널',
      durationSec: 1500,
      thumbnailUrl: 'https://i.ytimg.com/x.jpg',
      isUnavailable: false,
    });
  });

  it('404: maybeSingle null → null 반환(에러 표면)', async () => {
    const { client } = makeMetaClient({ data: null, error: null });
    const meta = await getContentMeta('missing', client);
    expect(meta).toBeNull();
  });

  it('client null이면 throw', async () => {
    await expect(getContentMeta('c-1', null)).rejects.toThrow();
  });
});
