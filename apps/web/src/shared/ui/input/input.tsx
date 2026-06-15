import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import styles from './input.module.css';

/**
 * Input — 실화면 측정 정밀(phase ② → u0c 보강).
 * default(이메일 인풋, 2087:8469): h42·bg #242424·radius 6·placeholder #999999(측정).
 * search(둥근 검색바, 2087:40407): h48·radius 80·bg #1F1F1F(측정).
 *   - size 'sm'(라이브러리 검색바, 2117:22132): h38·radius 100·bg 투명·border .10·placeholder 14/130%.
 *   - selected(쿼리 채워진 상태, 2087:38859): 좌아이콘 + 채워진 쿼리(#FAFAFA 15/160%/-2.5%) + 우 X dismiss.
 * focus 스트로크는 실화면 부재(gap) → Dark-Stroke-Typing 합리값.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
  /** 둥근 검색바 변형(측정 2087:40407). */
  variant?: 'default' | 'search';
  /** search 사이즈 — 'md'=홈 h48/radius80(2087:40407, 기본) · 'sm'=라이브러리 h38/radius100(2117:22132). */
  size?: 'md' | 'sm';
  /** search 쿼리 선택(채워진) 상태 — 텍스트색 #FAFAFA·트레일링 dismiss 노출(2087:38859). */
  selected?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** search selected 시 우측 X dismiss 핸들러(2087:38859 componentId 1230:5857). 있으면 dismiss 버튼 렌더. */
  onDismiss?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    invalid = false,
    variant = 'default',
    size = 'md',
    selected = false,
    leadingIcon,
    trailingIcon,
    onDismiss,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const wrapperClasses = [
    styles.wrapper,
    variant === 'search' ? styles.search : '',
    variant === 'search' && size === 'sm' ? styles.searchSm : '',
    variant === 'search' && selected ? styles.selected : '',
    invalid ? styles.invalid : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      <input ref={ref} className={styles.input} disabled={disabled} {...rest} />
      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="검색어 지우기">
          <DismissGlyph />
        </button>
      ) : null}
      {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
    </div>
  );
});

/** X(dismiss) 글리프 — 16px 프레임/11px 글리프·색 #999999(측정 2087:38863 fill_265I6N). */
function DismissGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Textarea — 멀티라인 인풋 변형(측정 §1/§2/§3).
 * border solid #363636 · radius 6 공유, 레이아웃/폰트/패딩은 mode로 분기:
 *   - 'lg'(온보딩 관심분야 textarea, 2087:9224): h64 고정·pad 10/12·14px/160%·top정렬.
 *     callout(2074:88456 509×174)·고정치수는 width/height(또는 rows) prop으로 지정.
 *   - 'link'(콘텐츠추가 링크 붙여넣기, 2087:33541): pad 14·13px/130%·column·hug(가변)·w530.
 * 채워진 본문색 #FAFAFA·placeholder #999999 (멀티라인 focus/hover/invalid는 default와 동일 토큰 — gap).
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** 멀티라인 모드 — 'lg'=온보딩 h64(2087:9224, 기본) · 'link'=링크입력 13px/pad14 hug(2087:33541). */
  mode?: 'lg' | 'link';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, mode = 'lg', className, disabled, ...rest },
  ref,
) {
  const classes = [
    styles.textarea,
    mode === 'link' ? styles.textareaLink : '',
    invalid ? styles.invalid : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <textarea ref={ref} className={classes} disabled={disabled} {...rest} />;
});
