import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './chip.module.css';

/**
 * Chip — 실화면 측정 정밀(phase ②→③ u0c 보강). 9개 칩 폼팩터를 1:1 구현.
 * SoT: file 5GGyKsjXEOpjKMLtUodeSs · "프로토타이핑" 2087:5987 하위 실화면 프레임 픽셀 실측.
 *
 * variant:
 *   default(온보딩 직업/관심분야 2087:8476·8968): 투명 + rgba(white,.12) 보더 + 흰 글자 ·
 *     42h · pad 10/18 · radius 6 · 15/600/130%/-2%. ★pill 아님(정정).
 *   recommend(검색 추천칩 2087:40686): surface-ghost(.04) + border-subtle(.08) · #FAFAFA ·
 *     32h · pad 10/12 · radius 100(pill) · 14/500/130%.
 *   filter(홈 카테고리 필터칩 §1·§2, 2087:71871/71873): h30 · pad 10/12 · radius 6 · 14/160% · -2%.
 *     unselected = surface-hover(.06)/#B4B4B4/400 · selected = #FAFAFA/#111111/600 (실측 확정).
 *   source(출처필터칩 §3·§4·§6, 2117:23699/23702·2087:38908): h32 · pad 10/12/10/10 ·
 *     14/130%/-2% · 내부 leadingIcon↔label gap 6 · label↔count gap 4 · trailing count 슬롯.
 *     라이브러리 = radius 6(기본) · 검색 = pill 변형(pill prop). bg .06(unselected)/#FAFAFA(selected).
 *     선택색: label #111111 / count #505050. 비선택: label #FAFAFA(500) / count #B4B4B4(400).
 *   tag(카드 내부 분류 태그 §9, 2117:22069 등): h28 · pad 10 · radius 6 · surface-hover(.06) ·
 *     13/400/160%/-2% · 색 #B4B4B4(기본, gray-500) / #CECECE(홈, ceceTone prop, gray-550).
 *     removable=true 시 trailing x(16px) 슬롯 + pad 10/8/10/10 + gap 2 (§7 2087:35059, 글자 #CECECE).
 *   add(태그 추가 트리거 "+추가" §8, 2384:141372): h28 · pad 6/10/6/8 · radius 6 · #242424 +
 *     border-subtle(.08) · leadingIcon(+,16px)↔라벨 gap 3 · "추가" #FAFAFA 13/500/130%/-2%.
 *
 * 슬롯: leadingIcon(플랫폼/+ 아이콘) · count(출처필터 트레일링 숫자) · removable+onRemove(x 16px).
 * ⚠ default selected 채움색은 온보딩 정적 export 부재 → 브랜드 보더 강조(추측 채움 ❌, gap).
 *   filter/source의 selected는 실측 확정값(#FAFAFA/#111111).
 */
export type ChipVariant =
  | 'default'
  | 'recommend'
  | 'filter'
  | 'source'
  | 'tag'
  | 'add';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  /** filter/source: 흰 채움 선택 상태(#FAFAFA/#111111). default: 브랜드 보더 표시(gap). */
  selected?: boolean;
  /** leading 아이콘 슬롯 — source 플랫폼 아이콘(20px) / add "+" 아이콘(16px) / recommend 등. */
  leadingIcon?: ReactNode;
  /** source 변형 trailing 카운트 슬롯(예: "16"). 선택 시 #505050, 비선택 시 #B4B4B4. */
  count?: ReactNode;
  /** source 변형: 검색 출처필터는 pill(radius 100). 미지정 시 라이브러리 radius 6. */
  pill?: boolean;
  /** tag 변형: trailing 취소(x, 16px) 슬롯 노출(§7 removable). */
  removable?: boolean;
  /** removable 태그칩의 x 슬롯 콘텐츠(취소 아이콘). 없으면 기본 "×" glyph. */
  removeIcon?: ReactNode;
  /** removable x 클릭 핸들러 — 칩 onClick과 분리(이벤트 버블 차단). */
  onRemove?: () => void;
  /** tag 변형 글자색 #CECECE(홈 카드태그, §9) — 기본 #B4B4B4. */
  ceceTone?: boolean;
}

export function Chip({
  variant = 'default',
  selected = false,
  leadingIcon,
  count,
  pill = false,
  removable = false,
  removeIcon,
  onRemove,
  ceceTone = false,
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  const classes = [
    styles.chip,
    styles[variant] ?? '',
    variant === 'source' && pill ? styles.pill : '',
    variant === 'tag' && ceceTone ? styles.cece : '',
    selected ? styles.selected : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  // source/add 변형: leadingIcon + label을 inner 블록(gap 6 / 3)으로 묶는다(실측 구조).
  const grouped = variant === 'source' || variant === 'add';
  const label = grouped ? (
    <span className={styles.inner}>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
    </span>
  ) : (
    <>
      {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
      {children}
    </>
  );

  return (
    <button type={type} className={classes} aria-pressed={selected} {...rest}>
      {label}
      {count != null ? <span className={styles.count}>{count}</span> : null}
      {removable ? (
        <span
          className={styles.remove}
          role="button"
          tabIndex={-1}
          aria-label="제거"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          {removeIcon ?? <span aria-hidden>×</span>}
        </span>
      ) : null}
    </button>
  );
}
