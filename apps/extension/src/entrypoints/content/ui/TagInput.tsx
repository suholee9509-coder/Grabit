// 태그 칩 입력 (Figma 2074:88493) — "+추가" 칩 (#242424, border 1px rgba(255,255,255,.08), radius 6,
// padding 6px 10px 6px 8px, h28, "+" 16×16 + "추가" Medium 13 #FAFAFA) + selected chips
// (rgba(255,255,255,.06), radius 6, Regular 13 #CECECE, x 16×16). Empty state = +추가 칩만.
// Clicking +추가 reveals an inline input; Enter adds a chip, the x removes one.

import { useState, type CSSProperties } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const addChipStyle: CSSProperties = {
  boxSizing: 'border-box',
  height: 28,
  padding: '6px 10px 6px 8px',
  background: color.addChipBg,
  border: `1px solid ${color.borderSubtle}`,
  borderRadius: radius.field,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  cursor: 'pointer',
};

const addLabelStyle: CSSProperties = {
  fontFamily: font.family,
  fontWeight: 500,
  fontSize: 13,
  lineHeight: '130%',
  letterSpacing: font.letterSpacing,
  color: color.textPrimary,
};

const selectedChipStyle: CSSProperties = {
  boxSizing: 'border-box',
  height: 28,
  padding: '10px 8px 10px 10px',
  background: color.selectedChipBg,
  borderRadius: radius.field,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
};

const selectedLabelStyle: CSSProperties = {
  fontFamily: font.family,
  fontWeight: 400,
  fontSize: 13,
  lineHeight: '160%',
  letterSpacing: font.letterSpacing,
  color: color.textTertiary,
};

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke={color.textPrimary} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke={color.textTertiary} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  function commit() {
    const name = draft.trim();
    if (name !== '' && !tags.some((t) => t.toLowerCase() === name.toLowerCase())) {
      onChange([...tags, name]);
    }
    setDraft('');
    setAdding(false);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {adding ? (
        <span style={addChipStyle}>
          <PlusIcon />
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft('');
                setAdding(false);
              }
            }}
            placeholder="태그"
            style={{
              ...addLabelStyle,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: 0,
              width: 64,
            }}
          />
        </span>
      ) : (
        <button type="button" style={addChipStyle} onClick={() => setAdding(true)} aria-label="태그 추가">
          <PlusIcon />
          <span style={addLabelStyle}>추가</span>
        </button>
      )}

      {tags.map((tag) => (
        <span key={tag} style={selectedChipStyle}>
          <span style={selectedLabelStyle}>{tag}</span>
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`${tag} 제거`}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
          >
            <CloseIcon />
          </button>
        </span>
      ))}
    </div>
  );
}
