/**
 * u0b RPC/PostgREST 에러 → 사용자 메시지 매핑(0006/0009 errcode 거울).
 *   22023 = unsupported url / invalid interval
 *   28000 = unauthenticated
 *   23514 = folder limit (이 단위는 폴더 선택만 → 일반 안내)
 *   23505 = unique violation (중복) — 무해 처리
 */
export type IngestErrorKind =
  | 'invalid-url'
  | 'invalid-interval'
  | 'unauthenticated'
  | 'folder-limit'
  | 'unknown';

export interface MappedError {
  kind: IngestErrorKind;
  /** 사용자 노출 메시지(토스트/인풋 에러). */
  message: string;
}

interface PgLikeError {
  code?: string;
  message?: string;
}

function asPgError(err: unknown): PgLikeError {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    return {
      code: typeof e.code === 'string' ? e.code : undefined,
      message: typeof e.message === 'string' ? e.message : undefined,
    };
  }
  return {};
}

/** 잘못된 URL(22023 + url 문구) vs 잘못된 구간(22023 + interval 문구) 구분. */
function classify22023(message: string): IngestErrorKind {
  return /interval/i.test(message) ? 'invalid-interval' : 'invalid-url';
}

/** RPC 에러를 사용자 메시지로 매핑. */
export function mapIngestError(err: unknown): MappedError {
  const { code, message = '' } = asPgError(err);

  switch (code) {
    case '22023':
      return classify22023(message) === 'invalid-interval'
        ? { kind: 'invalid-interval', message: '클립 구간이 올바르지 않습니다. 시작과 끝을 다시 확인해 주세요.' }
        : { kind: 'invalid-url', message: '지원하지 않는 링크예요. YouTube 영상 링크를 입력해 주세요.' };
    case '28000':
      return { kind: 'unauthenticated', message: '로그인이 필요합니다.' };
    case '23514':
      return { kind: 'folder-limit', message: '폴더는 최대 20개까지 만들 수 있어요.' };
    default:
      return { kind: 'unknown', message: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}

/**
 * 라이브러리 폴더 작업(생성/이름변경/삭제/이동) 에러 → 사용자 메시지(0011 errcode 거울).
 *   23514 = 공백/중복명 또는 폴더 20개 초과
 *   23503 = 이동 대상 폴더 비소유/미존재
 *   28000 = 미인증
 *   23505 = 중복(unique) — 무해 처리
 */
export type LibraryErrorKind =
  | 'folder-limit'
  | 'folder-name'
  | 'target-folder'
  | 'unauthenticated'
  | 'unknown';

export interface MappedLibraryError {
  kind: LibraryErrorKind;
  message: string;
}

export function mapLibraryError(err: unknown): MappedLibraryError {
  const { code, message = '' } = asPgError(err);

  switch (code) {
    case '23514':
      // folders_name_not_blank + enforce_folder_limit 모두 23514 → 메시지로 구분.
      return /limit|max 20/i.test(message)
        ? { kind: 'folder-limit', message: '폴더는 최대 20개까지 만들 수 있어요.' }
        : { kind: 'folder-name', message: '폴더 이름을 다시 확인해 주세요.' };
    case '23503':
      return { kind: 'target-folder', message: '이동할 폴더를 찾을 수 없어요.' };
    case '23505':
      return { kind: 'folder-name', message: '이미 같은 이름의 폴더가 있어요.' };
    case '28000':
      return { kind: 'unauthenticated', message: '로그인이 필요합니다.' };
    default:
      return { kind: 'unknown', message: '작업에 실패했어요. 잠시 후 다시 시도해 주세요.' };
  }
}
