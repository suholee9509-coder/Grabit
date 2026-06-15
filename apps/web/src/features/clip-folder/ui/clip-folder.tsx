import { Dropdown, type DropdownItem } from '@/shared/ui';
import type { Folder } from '@/entities/folder';
import styles from './clip-folder.module.css';

export interface ClipFolderProps {
  folders: Folder[];
  /** 선택 폴더 id(미선택 null). */
  value: string | null;
  onChange: (folderId: string | null) => void;
}

/**
 * ClipFolder — "저장 폴더" 셀렉트(측정 2087:35043). u0c Dropdown 재사용.
 * 빈 상태(폴더 0개)는 "폴더 없음" 안내(disabled item)로 채움(프레임 공백).
 */
export function ClipFolder({ folders, value, onChange }: ClipFolderProps) {
  const selected = folders.find((f) => f.id === value) ?? null;

  const items: DropdownItem[] =
    folders.length > 0
      ? folders.map((f) => ({ id: f.id, label: f.name }))
      : [{ id: '__empty__', label: '폴더가 없어요', disabled: true }];

  return (
    <div className={styles.root}>
      <span className={styles.label}>저장 폴더</span>
      <Dropdown
        className={styles.dropdown}
        value={value ?? undefined}
        items={items}
        onSelect={(id) => {
          if (id === '__empty__') return;
          onChange(id);
        }}
        trigger={
          <span
            className={[styles.current, selected ? '' : styles.placeholder]
              .filter(Boolean)
              .join(' ')}
          >
            {selected ? selected.name : '폴더 선택'}
          </span>
        }
      />
    </div>
  );
}
