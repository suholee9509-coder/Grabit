import { describe, expect, it } from 'vitest';
import { mapIngestError } from './errors';

/** 0006/0009 errcode → 사용자 메시지 매핑. */
describe('mapIngestError', () => {
  it('22023 + url 문구 → invalid-url', () => {
    const m = mapIngestError({ code: '22023', message: 'unsupported or invalid video url: x' });
    expect(m.kind).toBe('invalid-url');
  });
  it('22023 + interval 문구 → invalid-interval', () => {
    const m = mapIngestError({ code: '22023', message: 'invalid interval: [10, 5)' });
    expect(m.kind).toBe('invalid-interval');
  });
  it('28000 → unauthenticated', () => {
    expect(mapIngestError({ code: '28000', message: 'unauthenticated' }).kind).toBe(
      'unauthenticated',
    );
  });
  it('23514 → folder-limit', () => {
    expect(mapIngestError({ code: '23514', message: 'folder limit' }).kind).toBe('folder-limit');
  });
  it('미상/비PG → unknown', () => {
    expect(mapIngestError(new Error('network')).kind).toBe('unknown');
    expect(mapIngestError(null).kind).toBe('unknown');
  });
  it('모든 매핑이 비어있지 않은 메시지 반환', () => {
    for (const e of [
      { code: '22023', message: 'url' },
      { code: '28000', message: '' },
      { code: '23514', message: '' },
      null,
    ]) {
      expect(mapIngestError(e).message.length).toBeGreaterThan(0);
    }
  });
});
