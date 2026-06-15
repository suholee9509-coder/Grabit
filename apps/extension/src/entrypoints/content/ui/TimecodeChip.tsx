// 타임코드 칩 위젯 — clip-modal-only widget DEFINED IN THIS UNIT (u6, not u0c shared).
// Figma 2074:88546/88549: 82×38, radius 4, border 1px rgba(255,255,255,.08), Pretendard Regular 14
// (lh 130%, ls -2%), text #FAFAFA, value = m:ss. Editable: click → inline edit, parsed back to
// seconds and pushed to the trim model (bidirectional with the trim handles).

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';
import { formatTimecode } from '@/shared/lib/time';

const chipStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: 82,
  height: 38,
  padding: '10px 26px',
  borderRadius: radius.chip,
  border: `1px solid ${color.borderSubtle}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  background: 'transparent',
  cursor: 'text',
};

const textStyle: CSSProperties = {
  fontFamily: font.family,
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '130%',
  letterSpacing: font.letterSpacing,
  color: color.textPrimary,
  textAlign: 'center',
};

/** Parse "m:ss" or a raw seconds string → seconds, or null if unparseable. */
function parseTimecode(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length !== 2) return null;
    const m = Number(parts[0]);
    const s = Number(parts[1]);
    if (!Number.isFinite(m) || !Number.isFinite(s) || s < 0 || s >= 60) return null;
    return Math.floor(m) * 60 + Math.floor(s);
  }
  const raw = Number(trimmed);
  return Number.isFinite(raw) ? Math.floor(raw) : null;
}

export interface TimecodeChipProps {
  /** 'start' | 'end' — for accessible labelling. */
  edge: 'start' | 'end';
  seconds: number;
  onCommit: (sec: number) => void;
}

export function TimecodeChip({ edge, seconds, onCommit }: TimecodeChipProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => formatTimecode(seconds));
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the display in sync when the value changes from the trim handles (one-way: model → chip).
  useEffect(() => {
    if (!editing) setDraft(formatTimecode(seconds));
  }, [seconds, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const parsed = parseTimecode(draft);
    if (parsed != null) onCommit(parsed);
    setEditing(false);
    setDraft(formatTimecode(parsed != null ? parsed : seconds));
  }

  return (
    <div
      style={chipStyle}
      onClick={() => setEditing(true)}
      role="group"
      aria-label={edge === 'start' ? '시작 시간' : '종료 시간'}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(formatTimecode(seconds));
              setEditing(false);
            }
          }}
          style={{
            ...textStyle,
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
          }}
          inputMode="numeric"
        />
      ) : (
        <span style={textStyle}>{formatTimecode(seconds)}</span>
      )}
    </div>
  );
}
