import { useMemo, useState } from 'react';
import {
  INTERESTS_MAX,
  INTERESTS_MIN,
  toUpdateArgs,
  useMyProfile,
  useUpdateProfile,
  type Profile,
  type ProfileEditInput,
} from '@/entities/profile';

/**
 * useProfileEdit — 설정 프로필 섹션의 폼 상태·검증·저장.
 *   조회(useMyProfile) → 로컬 드래프트로 hydrate → 단일칩(직업/연차/상황)·멀티칩(관심 1~5)·표시이름 편집 →
 *   저장(useUpdateProfile, 0013 update_profile). 클라 사전 검증(toUpdateArgs 패턴) + BE 재검증(이중 방어).
 * deleted_at 비NULL(유예중) = 폼 잠금(복구 먼저 — 0013 ACCOUNT_DELETED 차단 미리 반영).
 */

export interface ProfileEditState {
  loading: boolean;
  loadError: boolean;
  /** soft-delete 유예중(폼 잠금 — 복구 필요). */
  locked: boolean;
  displayName: string;
  job: string | null;
  years: string | null;
  goal: string | null;
  interests: string[];
  /** 표시이름 빈/공백 = invalid(차단 UI). */
  displayNameInvalid: boolean;
  /** 관심분야 경계(1~5). */
  interestsTooFew: boolean;
  interestsAtMax: boolean;
  /** 단일필수 미선택(직업/연차/상황). */
  missingRequired: boolean;
  /** 저장 가능(검증 통과 + 변경 있음 + 미잠금). */
  canSave: boolean;
  /** 저장 진행중. */
  saving: boolean;
  setDisplayName: (v: string) => void;
  selectJob: (v: string) => void;
  selectYears: (v: string) => void;
  selectGoal: (v: string) => void;
  toggleInterest: (v: string) => void;
  /** 관심분야 미선택 칩 비활성 판정(5개 도달 시). */
  isInterestDisabled: (v: string) => boolean;
  /** 저장 — 성공/실패 콜백(코드 보존). */
  save: (cb: { onSuccess: () => void; onError: (code: string) => void }) => void;
  /** 드래프트를 서버 값으로 되돌림(취소). */
  reset: () => void;
}

function hydrate(profile: Profile | undefined): ProfileEditInput {
  return {
    display_name: profile?.display_name ?? '',
    job: profile?.job ?? null,
    years: profile?.years ?? null,
    goal: profile?.goal ?? null,
    interests: profile?.interests ?? [],
  };
}

export function useProfileEdit(enabled = true): ProfileEditState {
  const query = useMyProfile(enabled);
  const mutation = useUpdateProfile();

  // 서버 값 → 드래프트(데이터 도착/변경 시 키로 리마운트하거나 명시 reset). 여기선 lazy init +
  // server snapshot 비교로 dirty 판정. data 변경 반영을 위해 server snapshot을 deps에 둔다.
  const server = query.data;
  const [draft, setDraft] = useState<ProfileEditInput>(() => hydrate(server));
  const [hydratedFor, setHydratedFor] = useState<string | null>(server?.id ?? null);

  // 최초 데이터 도착(또는 id 변경) 시 1회 hydrate — effect 없이 렌더 중 동기화(파생 상태 패턴).
  if (server && server.id !== hydratedFor) {
    setDraft(hydrate(server));
    setHydratedFor(server.id);
  }

  const locked = Boolean(server?.deleted_at);

  const displayNameInvalid = draft.display_name.trim() === '';
  const interestsTooFew = draft.interests.length < INTERESTS_MIN;
  const interestsAtMax = draft.interests.length >= INTERESTS_MAX;
  const missingRequired = !draft.job || !draft.years || !draft.goal;

  const dirty = useMemo(() => {
    const base = hydrate(server);
    return (
      base.display_name.trim() !== draft.display_name.trim() ||
      base.job !== draft.job ||
      base.years !== draft.years ||
      base.goal !== draft.goal ||
      base.interests.join('') !== draft.interests.join('')
    );
  }, [server, draft]);

  const valid = !displayNameInvalid && !interestsTooFew && !missingRequired && draft.interests.length <= INTERESTS_MAX;
  const canSave = valid && dirty && !locked && !mutation.isPending;

  return {
    loading: query.isLoading,
    loadError: query.isError,
    locked,
    displayName: draft.display_name,
    job: draft.job,
    years: draft.years,
    goal: draft.goal,
    interests: draft.interests,
    displayNameInvalid,
    interestsTooFew,
    interestsAtMax,
    missingRequired,
    canSave,
    saving: mutation.isPending,
    setDisplayName: (v) => setDraft((d) => ({ ...d, display_name: v })),
    selectJob: (v) => setDraft((d) => ({ ...d, job: v })),
    selectYears: (v) => setDraft((d) => ({ ...d, years: v })),
    selectGoal: (v) => setDraft((d) => ({ ...d, goal: v })),
    toggleInterest: (v) =>
      setDraft((d) => {
        const has = d.interests.includes(v);
        if (has) return { ...d, interests: d.interests.filter((x) => x !== v) };
        if (d.interests.length >= INTERESTS_MAX) return d; // 5개 도달 시 추가 차단
        return { ...d, interests: [...d.interests, v] };
      }),
    isInterestDisabled: (v) => !draft.interests.includes(v) && draft.interests.length >= INTERESTS_MAX,
    save: ({ onSuccess, onError }) => {
      // 클라 사전 검증(차단 UI 보조) — throw 코드 보존.
      try {
        toUpdateArgs(draft);
      } catch (e) {
        onError(e instanceof Error ? e.message : 'UNKNOWN');
        return;
      }
      mutation.mutate(draft, {
        onSuccess: () => onSuccess(),
        onError: (err) => onError(err instanceof Error ? err.message : 'UNKNOWN'),
      });
    },
    reset: () => {
      setDraft(hydrate(server));
    },
  };
}
