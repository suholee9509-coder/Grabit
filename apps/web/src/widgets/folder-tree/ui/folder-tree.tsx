import { Folder, FolderOpen } from 'lucide-react';
import type { FolderWithCount } from '@/entities/folder';
import {
  formatProviderLabel,
  formatUploadDate,
  SourceIcon,
  type LibraryCard,
} from '@/entities/content';
import { sanitizeUserText } from '@/shared/lib';
import styles from './folder-tree.module.css';

/**
 * FolderTree — 좌측 사이드바 폴더 트리(2117:23917, w362 gap14).
 *   확장 폴더 = open 아이콘18 + 명15 #ECECEC + 카운트14 #999999 → 내부 컨텐츠 항목(pad12/10 r8) → 하단 구분선 #242424.
 *   접힘 폴더 = closed 아이콘18 + 명 + 카운트 + 구분선 rgba(255,255,255,.08).
 *   토글 = 폴더 아이콘 open↔closed(별도 chevron 노드 없음 — 측정).
 *   내부 항목: 좌측 텍스트(제목14/600 #FAFAFA + 메타[출처18 #DEDEDE · 점2×2 · 날짜12 #767676]) + 썸네일 102×58 r4.
 * 순수 프레젠테이션. 확장 상태·내부 항목 데이터는 page가 주입.
 */
export interface FolderTreeProps {
  folders: FolderWithCount[];
  /** 펼쳐진 폴더 id 집합. */
  expandedIds: Set<string>;
  onToggle: (folderId: string) => void;
  /** 폴더 선택(헤더 클릭 → 폴더별 뷰 진입). */
  onSelectFolder: (folderId: string) => void;
  /** 현재 활성(선택) 폴더 id. */
  activeFolderId?: string | null;
  /** 폴더별 내부 컨텐츠 항목(확장 시 노출). page가 fetch해 주입. */
  itemsByFolder: Record<string, LibraryCard[]>;
  /** 내부 항목 클릭 → 상세. */
  onOpenItem: (contentId: string) => void;
}

export function FolderTree({
  folders,
  expandedIds,
  onToggle,
  onSelectFolder,
  activeFolderId,
  itemsByFolder,
  onOpenItem,
}: FolderTreeProps) {
  return (
    <div className={styles.tree}>
      {folders.map((f) => {
        const expanded = expandedIds.has(f.id);
        const items = itemsByFolder[f.id] ?? [];
        return (
          <div key={f.id} className={styles.folderGroup}>
            <div className={styles.headerRow}>
              <button
                type="button"
                className={[
                  styles.folderHead,
                  activeFolderId === f.id ? styles.active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  onToggle(f.id);
                  onSelectFolder(f.id);
                }}
                aria-expanded={expanded}
              >
                <span className={styles.headLeft}>
                  <span className={styles.folderIcon}>
                    {expanded ? (
                      <FolderOpen width={18} height={18} color="#ECECEC" strokeWidth={1.6} aria-hidden="true" />
                    ) : (
                      <Folder width={18} height={18} color="#ECECEC" strokeWidth={1.6} aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.folderName}>{sanitizeUserText(f.name)}</span>
                </span>
                <span className={styles.folderCount}>{f.contentCount}</span>
              </button>
            </div>

            {expanded ? (
              <div className={styles.items}>
                {items.map((item) => (
                  <button
                    key={item.contentId}
                    type="button"
                    className={styles.item}
                    onClick={() => onOpenItem(item.contentId)}
                  >
                    <span className={styles.itemRow}>
                      <span className={styles.itemTextCol}>
                        <span className={styles.itemTitle}>
                          {sanitizeUserText(item.title) || '제목 없음'}
                        </span>
                        <span className={styles.itemMeta}>
                          <span className={styles.itemSource}>
                            <span className={styles.itemSourceIcon}>
                              <SourceIcon provider={item.provider} />
                            </span>
                            {formatProviderLabel(item.provider)}
                          </span>
                          <span className={styles.dot} aria-hidden="true" />
                          <span className={styles.itemDate}>
                            {formatUploadDate(item.lastClipAt) ?? ''}
                          </span>
                        </span>
                      </span>
                      <span className={styles.itemThumb}>
                        {item.thumbnailUrl ? (
                          <img className={styles.itemThumbImg} src={item.thumbnailUrl} alt="" loading="lazy" />
                        ) : null}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* 폴더 하단 구분선 — 확장 폴더는 #242424, 접힘 폴더는 rgba(255,255,255,.08)(측정). 마지막 접힘 폴더도 유지. */}
            <span
              className={[styles.divider, expanded ? styles.dividerExpanded : ''].filter(Boolean).join(' ')}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
