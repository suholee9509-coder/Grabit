import { Button, Chip, Input } from '@/shared/ui';
import {
  GOAL_OPTIONS,
  INTEREST_OPTIONS,
  INTERESTS_MAX,
  JOB_OPTIONS,
  YEARS_OPTIONS,
} from '@/entities/profile';
import { useProfileEdit } from '../model/use-profile-edit';
import styles from './profile-edit-section.module.css';

/**
 * ProfileEditSection — 설정 '프로필' 섹션(L1-b). public 코호트(직업·연차) vs private(표시이름·관심·상황) 분리.
 * ★ 전용 Figma 프레임 없음 = 디자인 공백 → u0 토큰·shared/ui(Input·Chip·Button)로만 조립(발명 ❌).
 *   단일칩(직업/연차/상황) + 멀티칩(관심 1~5) = 온보딩과 동일 폼팩터(shared/ui Chip default, 온보딩 코드 import ❌).
 * 저장 = update_profile(0013). 빈/공백 표시이름·관심 1~5·단일필수 = 클라 차단(BE 재검증 이중 방어).
 * deleted_at 유예중 = 폼 잠금(복구 먼저). 상태 = 로딩 스켈레톤·저장 펜딩·인라인 invalid.
 */
export interface ProfileEditSectionProps {
  /** 인증 여부(미인증 시 조회 비활성). */
  enabled?: boolean;
  /** 저장 결과 토스트 — 페이지가 처리. */
  onSaved: () => void;
  onError: (code: string) => void;
}

/** 검증 코드 → 인라인 한국어 안내(파운데이션 카피). */
function errorCopy(code: string): string {
  switch (code) {
    case 'DISPLAY_NAME_REQUIRED':
      return '표시 이름을 입력해 주세요.';
    case 'INTERESTS_MIN':
      return '관심분야를 1개 이상 선택해 주세요.';
    case 'INTERESTS_MAX':
      return '관심분야는 최대 5개까지 선택할 수 있어요.';
    case 'JOB_REQUIRED':
    case 'YEARS_REQUIRED':
    case 'GOAL_REQUIRED':
      return '직업·연차·상황을 모두 선택해 주세요.';
    case 'ACCOUNT_DELETED':
      return '탈퇴 유예 중에는 프로필을 수정할 수 없어요. 먼저 계정을 복구해 주세요.';
    default:
      return '저장에 실패했어요. 잠시 후 다시 시도해 주세요.';
  }
}

export function ProfileEditSection({ enabled = true, onSaved, onError }: ProfileEditSectionProps) {
  const form = useProfileEdit(enabled);

  if (form.loading) {
    return (
      <div className={styles.skeletonWrap} aria-label="프로필 불러오는 중">
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
      </div>
    );
  }

  if (form.loadError) {
    return (
      <div className={styles.errorState} role="alert">
        <p className={styles.errorText}>프로필을 불러오지 못했어요.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* private — 표시 이름 */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-display-name">
          표시 이름
          <span className={styles.privacyTag}>나만 보기</span>
        </label>
        <Input
          id="profile-display-name"
          variant="default"
          value={form.displayName}
          invalid={form.displayNameInvalid}
          disabled={form.locked}
          maxLength={60}
          placeholder="표시할 이름을 입력하세요"
          aria-label="표시 이름"
          onChange={(e) => form.setDisplayName(e.target.value)}
        />
        {form.displayNameInvalid ? (
          <p className={styles.fieldHint} role="alert">
            표시 이름을 입력해 주세요.
          </p>
        ) : null}
      </div>

      {/* public 코호트 — 직업 */}
      <div className={styles.field}>
        <span className={styles.label}>
          직업
          <span className={[styles.privacyTag, styles.publicTag].join(' ')}>코호트 공개</span>
        </span>
        <div className={styles.chipRow} role="group" aria-label="직업">
          {JOB_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              variant="default"
              selected={form.job === opt}
              disabled={form.locked}
              onClick={() => form.selectJob(opt)}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      {/* public 코호트 — 연차 */}
      <div className={styles.field}>
        <span className={styles.label}>
          연차
          <span className={[styles.privacyTag, styles.publicTag].join(' ')}>코호트 공개</span>
        </span>
        <div className={styles.chipRow} role="group" aria-label="연차">
          {YEARS_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              variant="default"
              selected={form.years === opt}
              disabled={form.locked}
              onClick={() => form.selectYears(opt)}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      {/* private — 현재 상황(목표, 단일) */}
      <div className={styles.field}>
        <span className={styles.label}>
          현재 상황
          <span className={styles.privacyTag}>나만 보기</span>
        </span>
        <div className={styles.chipRow} role="group" aria-label="현재 상황">
          {GOAL_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              variant="default"
              selected={form.goal === opt}
              disabled={form.locked}
              onClick={() => form.selectGoal(opt)}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </div>

      {/* private — 관심분야(멀티 1~5) */}
      <div className={styles.field}>
        <span className={styles.label}>
          관심분야
          <span className={styles.privacyTag}>나만 보기</span>
          <span className={styles.counter}>
            {form.interests.length}/{INTERESTS_MAX}
          </span>
        </span>
        <div className={styles.chipRow} role="group" aria-label="관심분야">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = form.interests.includes(opt);
            return (
              <Chip
                key={opt}
                variant="default"
                selected={selected}
                disabled={form.locked || (!selected && form.isInterestDisabled(opt))}
                onClick={() => form.toggleInterest(opt)}
              >
                {opt}
              </Chip>
            );
          })}
        </div>
        {form.interestsTooFew ? (
          <p className={styles.fieldHint} role="alert">
            관심분야를 1개 이상 선택해 주세요.
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="md" disabled={form.saving} onClick={form.reset}>
          되돌리기
        </Button>
        <Button
          variant="primary"
          size="md"
          neonLabel
          disabled={!form.canSave}
          onClick={() =>
            form.save({
              onSuccess: onSaved,
              onError: (code) => onError(errorCopy(code)),
            })
          }
        >
          저장
        </Button>
      </div>
    </div>
  );
}
