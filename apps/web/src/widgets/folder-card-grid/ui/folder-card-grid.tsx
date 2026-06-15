import { Folder, Plus, MoreHorizontal } from 'lucide-react';
import type { FolderWithCount } from '@/entities/folder';
import { formatContentCount } from '@/entities/content';
import { sanitizeUserText } from '@/shared/lib';
import styles from './folder-card-grid.module.css';

/**
 * FolderCardGrid — 본문 폴더 카드 행(2117:22137, row gap11, 카드 160×160 r16).
 *   [폴더 추가 카드(dashed stroke·원형+칩 brand12%)] + 폴더 카드×N(아이콘32·명16·N개의컨텐츠14·더보기).
 * 순수 프레젠테이션. 최대20 도달 시 추가 카드 비활성(addDisabled).
 */
export interface FolderCardGridProps {
  folders: FolderWithCount[];
  onOpenFolder: (folderId: string) => void;
  onAddFolder: () => void;
  /** 폴더 더보기(이름변경/삭제 메뉴) — folderId 전달. */
  onFolderMenu?: (folderId: string, anchor: HTMLElement) => void;
  /** 최대 20개 도달 → 추가 카드 비활성 + 안내. */
  addDisabled?: boolean;
}

export function FolderCardGrid({
  folders,
  onOpenFolder,
  onAddFolder,
  onFolderMenu,
  addDisabled = false,
}: FolderCardGridProps) {
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.addCard}
        onClick={onAddFolder}
        disabled={addDisabled}
        aria-label={addDisabled ? '폴더는 최대 20개까지 만들 수 있어요' : '폴더 추가'}
        title={addDisabled ? '폴더는 최대 20개까지 만들 수 있어요.' : undefined}
      >
        <span className={styles.addInner}>
          <span className={styles.addCircle}>
            <Plus width={24} height={24} color="#66FF4B" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className={styles.addLabel}>폴더 추가</span>
        </span>
      </button>

      {folders.map((f) => (
        <div key={f.id} className={styles.folderCard}>
          <button
            type="button"
            className={styles.folderOpen}
            onClick={() => onOpenFolder(f.id)}
            aria-label={`${sanitizeUserText(f.name)} 폴더 열기`}
          >
            <span className={styles.folderIcon}>
              <Folder width={32} height={32} color="#999999" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span className={styles.folderName}>{sanitizeUserText(f.name)}</span>
            <span className={styles.folderCount}>{formatContentCount(f.contentCount)}</span>
          </button>
          {onFolderMenu ? (
            <button
              type="button"
              className={styles.more}
              aria-label={`${sanitizeUserText(f.name)} 폴더 메뉴`}
              onClick={(e) => onFolderMenu(f.id, e.currentTarget)}
            >
              <MoreHorizontal width={18} height={18} color="#999999" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
