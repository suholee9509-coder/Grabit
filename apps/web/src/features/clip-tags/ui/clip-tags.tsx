import { useEffect, useId, useRef, useState } from 'react';
import { Chip } from '@/shared/ui';
import { normalizeTagLabel, type Tag } from '@/entities/tag';
import { highlightMatch } from '../lib/highlight';
import { CancelIcon, PlusIcon } from './icons';
import styles from './clip-tags.module.css';

export interface ClipTagsProps {
  /** 현재 태그 라벨(순서 유지). */
  tags: string[];
  onChange: (next: string[]) => void;
  /** prefix → 추천 태그(본인 태그). 결정론적이면 동기 배열도 허용. */
  onSearch: (prefix: string) => Tag[] | Promise<Tag[]>;
}

/**
 * ClipTags — [추가] 칩 → 입력 → 자동완성 → Enter/선택 → 칩 추가/제거.
 * 측정 2087:35052/35127/36708/2384:141451 1:1.
 * 신규 칩은 [추가] 칩 바로 뒤(기존 칩들 앞)에 삽입(측정 §4.3). 중복/빈 라벨 무시.
 */
export function ClipTags({ tags, onChange, onSearch }: ClipTagsProps) {
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // 입력모드 진입 시 포커스
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // 쿼리 → 추천(결정론적). 비동기 결과는 .then 콜백에서만 setState(effect 본문 동기 setState ❌).
  useEffect(() => {
    const q = query.trim();
    if (!editing || q === '') return;
    let alive = true;
    Promise.resolve(onSearch(q)).then((res) => {
      if (!alive) return;
      // 이미 추가된 태그는 추천에서 제외
      const filtered = res.filter(
        (t) => !tags.some((x) => x.toLowerCase() === t.name.toLowerCase()),
      );
      setSuggestions(filtered);
      setActiveIdx(filtered.length > 0 ? 0 : -1);
    });
    return () => {
      alive = false;
    };
  }, [query, editing, onSearch, tags]);

  // 입력 변경 — 빈 쿼리면 추천 즉시 비움(이벤트 핸들러에서 동기 클리어).
  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim() === '') {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  function addTag(rawLabel: string) {
    const label = normalizeTagLabel(rawLabel);
    if (label === '') return;
    const exists = tags.some((t) => t.toLowerCase() === label.toLowerCase());
    if (!exists) {
      // 신규는 맨 앞(= [추가] 칩 바로 뒤, 기존 칩 앞)
      onChange([label, ...tags]);
    }
    // 입력 비우고 [추가] 칩으로 복귀
    setQuery('');
    setSuggestions([]);
    setActiveIdx(-1);
    setEditing(false);
  }

  function removeTag(label: string) {
    onChange(tags.filter((t) => t !== label));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        addTag(suggestions[activeIdx].name);
      } else {
        addTag(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0)
        setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setQuery('');
      setSuggestions([]);
      setEditing(false);
    } else if (e.key === 'Backspace' && query === '' && tags.length > 0) {
      // 빈 입력에서 Backspace → 마지막(시각상 첫) 칩 제거
      removeTag(tags[0]);
    }
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>태그</span>
      <div className={styles.chips}>
        {/* [추가] 칩 또는 입력 모드 */}
        {editing ? (
          <div className={styles.inputCol}>
            <div className={styles.inputChip}>
              <span className={styles.inputIcon}>
                <PlusIcon />
              </span>
              <input
                ref={inputRef}
                className={styles.inputField}
                value={query}
                placeholder="입력 후 Enter로 추가해 보세요."
                aria-label="태그 입력"
                aria-autocomplete="list"
                aria-controls={listId}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  // 패널 클릭으로 닫히는 케이스는 mousedown preventDefault로 보존
                  if (query.trim() === '') setEditing(false);
                }}
              />
            </div>

            {/* 자동완성 패널 — 패널 mousedown preventDefault로 입력 포커스 유지(blur 방지) */}
            {query.trim() !== '' ? (
              <ul
                id={listId}
                className={styles.menu}
                role="listbox"
                onMouseDown={(e) => e.preventDefault()}
              >
                {suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === activeIdx}
                        className={[
                          styles.menuItem,
                          i === activeIdx ? styles.menuItemActive : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => addTag(s.name)}
                        onMouseEnter={() => setActiveIdx(i)}
                      >
                        {highlightMatch(s.name, query).map((seg, k) => (
                          <span
                            key={k}
                            className={seg.matched ? styles.segMatched : styles.segDim}
                          >
                            {seg.text}
                          </span>
                        ))}
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className={styles.menuEmpty} role="option" aria-selected={false}>
                      Enter로 “{query.trim()}” 추가
                    </span>
                  </li>
                )}
              </ul>
            ) : null}
          </div>
        ) : (
          <Chip
            variant="add"
            leadingIcon={<PlusIcon />}
            onClick={() => setEditing(true)}
            aria-label="태그 추가"
          >
            추가
          </Chip>
        )}

        {/* 기존 태그 칩(removable) */}
        {tags.map((t) => (
          <Chip
            key={t}
            variant="tag"
            ceceTone
            removable
            removeIcon={<CancelIcon />}
            onRemove={() => removeTag(t)}
          >
            {t}
          </Chip>
        ))}
      </div>
    </div>
  );
}
