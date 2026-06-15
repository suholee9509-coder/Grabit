// Injected floating button (Figma Step3 2074:88271) — green pill "영상 인사이트 얻기".
// 136×36, #66FF4B, radius 6, padding 9px 14px, label SF Pro Bold 13 (lh 130%, ls -2.5%) #000.
// Fixed at the video page top-right (frame x=1545 of 1728, top y=203 → right 47px / top 203px).
// Click → open the clip modal. Lives inside the Shadow DOM (host CSS isolated; spec [non-regression]).

import type { CSSProperties } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';

interface FloatingButtonProps {
  onClick: () => void;
}

const buttonStyle: CSSProperties = {
  boxSizing: 'border-box',
  position: 'fixed',
  top: 203,
  right: 47,
  width: 136,
  height: 36,
  padding: '9px 14px',
  borderRadius: radius.pill,
  background: color.green,
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  cursor: 'pointer',
  zIndex: 2147483646,
};

const labelStyle: CSSProperties = {
  fontFamily: font.sfPro,
  fontWeight: 700,
  fontSize: 13,
  lineHeight: '130%',
  letterSpacing: '-0.025em', // -2.5% (Step3 라벨 전용)
  color: color.pillLabel,
  whiteSpace: 'nowrap',
};

export function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button type="button" style={buttonStyle} onClick={onClick} aria-label="영상 인사이트 얻기">
      <span style={labelStyle}>영상 인사이트 얻기</span>
    </button>
  );
}
