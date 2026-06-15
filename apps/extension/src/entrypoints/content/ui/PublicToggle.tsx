// 공개 토글 (Figma 2074:88468) — 44×22 track, radius 1000, ON = #2563EB with knob (18×18 #FAFAFA,
// border .5px rgba(0,0,0,.24), shadow effect_TUG84X) at the right. OFF = knob left + gray track
// (rgba(255,255,255,.16) — §4-1 비고, OFF 프레임 미제공이라 파운데이션 토큰으로).

import type { CSSProperties } from 'react';
import { color, radius, shadow } from '@/shared/ui/tokens';

interface PublicToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
}

const knobStyle: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: color.textPrimary,
  border: `0.5px solid ${color.knobBorder}`,
  boxShadow: shadow.toggleKnob,
};

export function PublicToggle({ on, onChange }: PublicToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="공개 범위 설정"
      onClick={() => onChange(!on)}
      style={{
        boxSizing: 'border-box',
        width: 44,
        height: 22,
        borderRadius: radius.pillFull,
        background: on ? color.togglePrimary : color.toggleOffTrack,
        border: 'none',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      <span style={knobStyle} />
    </button>
  );
}
