// 저장 폴더 드롭다운 (Figma 2074:88486) — 509×38, padding 12px 10px 12px 14px, radius 6, border 1px
// rgba(255,255,255,.08). Selected value (Pretendard Medium 14 #FAFAFA) left, chevron (18×18) right.
// Empty state ([state] 빈): no folders → label "폴더 없음" placeholder; the clip still saves with
// folder_id = null. Folder *management* CRUD is out of scope (u7) — this只 attaches an existing folder.

import { useState, type CSSProperties } from 'react';
import { color, radius, font } from '@/shared/ui/tokens';

export interface FolderOption {
  id: string;
  name: string;
}

interface FolderDropdownProps {
  folders: FolderOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const fieldStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: 509,
  height: 38,
  padding: '12px 10px 12px 14px',
  borderRadius: radius.field,
  border: `1px solid ${color.borderSubtle}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',
  cursor: 'pointer',
};

const valueStyle: CSSProperties = {
  fontFamily: font.family,
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '130%',
  letterSpacing: font.letterSpacing,
};

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 7l4 4 4-4" stroke={color.textPrimary} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FolderDropdown({ folders, selectedId, onSelect }: FolderDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = folders.find((f) => f.id === selectedId) ?? null;
  const empty = folders.length === 0;

  return (
    <div style={{ position: 'relative', width: 509 }}>
      <button
        type="button"
        style={fieldStyle}
        onClick={() => !empty && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={empty}
      >
        <span style={{ ...valueStyle, color: selected ? color.textPrimary : color.textSecondary }}>
          {selected ? selected.name : empty ? '폴더 없음' : '폴더 선택'}
        </span>
        <Chevron />
      </button>
      {open && !empty && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 42,
            left: 0,
            width: 509,
            margin: 0,
            padding: 4,
            listStyle: 'none',
            background: color.addChipBg,
            border: `1px solid ${color.borderSubtle}`,
            borderRadius: radius.field,
            zIndex: 2,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {folders.map((f) => (
            <li
              key={f.id}
              role="option"
              aria-selected={f.id === selectedId}
              onClick={() => {
                onSelect(f.id);
                setOpen(false);
              }}
              style={{
                ...valueStyle,
                color: color.textPrimary,
                padding: '8px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                background: f.id === selectedId ? color.selectedChipBg : 'transparent',
              }}
            >
              {f.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
