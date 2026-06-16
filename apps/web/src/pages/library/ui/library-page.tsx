import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { ClipAddFlowView, useClipAddFlow } from '@/widgets/clip-add';
import { LibrarySidebar } from '@/widgets/library-sidebar';
import { FolderTree } from '@/widgets/folder-tree';
import { FolderCardGrid } from '@/widgets/folder-card-grid';
import { ContentCardGrid } from '@/widgets/content-card-grid';
import { InsightCardGrid } from '@/widgets/insight-card-grid';
import { SourceFilter } from '@/widgets/source-filter';
import { Button, Toast, type BreadcrumbItem } from '@/shared/ui';
import { sanitizeUserText } from '@/shared/lib';
import { formatContentCount, type LibraryCard } from '@/entities/content';
import { CreateFolderModal } from '@/features/create-folder';
import { RenameFolderModal } from '@/features/rename-folder';
import { DeleteFolderDialog } from '@/features/delete-folder';
import { MoveActionBar, MoveToFolderModal } from '@/features/move-to-folder';
import { SortLibrary } from '@/features/sort-library';
import { useSourceCounts } from '@/features/filter-by-source';
import { useLibraryView } from '../model/use-library-view';
import { useLibraryCards, useFolderCounts, useInsights } from '../api/library-queries';
import styles from './library-page.module.css';

const MAX_FOLDERS = 20;

/**
 * LibraryPage — 라이브러리 셸 호스트(AppShell + Sidebar[activeMenu=library] + Topbar) +
 *   본문(좌 LibrarySidebar 382 + 우 콘텐츠 영역 1437: 헤더·검색바·폴더 카드·필터·그리드).
 * 폴더 CRUD·다중선택 이동·출처/정렬 필터·컨텐츠/인사이트 탭·폴더별 뷰(브레드크럼)를 0011 RPC 위에 배선.
 * 카드 클릭 → /content/:id(u4 상세). 빈/로딩/에러 = u0c 파운데이션.
 * ★ AI 노트 탭·Sparkle FAB·아이콘_노트 미렌더(게이트ⓐ).
 */
export function LibraryPage() {
  const navigate = useNavigate();
  const view = useLibraryView();
  const flow = useClipAddFlow();

  const foldersQuery = useFolderCounts();
  const cardsQuery = useLibraryCards(view.folderId, view.sort);
  const insightsQuery = useInsights(view.folderId);
  const sourceQuery = useSourceCounts(view.folderId);

  const folders = useMemo(() => foldersQuery.data ?? [], [foldersQuery.data]);
  const allCards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data]);
  const insights = insightsQuery.data ?? [];
  const sources = sourceQuery.data?.sources ?? [];
  const total = sourceQuery.data?.total ?? allCards.length;

  // 출처 필터 적용(클라이언트측 — 카드 그리드).
  const filteredCards = useMemo<LibraryCard[]>(() => {
    if (view.selectedProvider === null) return allCards;
    return allCards.filter((c) => c.provider === view.selectedProvider);
  }, [allCards, view.selectedProvider]);

  // "전체 폴더" 트리거 활성 상태(B3) — 모든 폴더가 인라인 펼쳐져 있으면 트리거 active.
  const treeAllExpanded = folders.length > 0 && folders.every((f) => view.expandedIds.has(f.id));

  // 현재 폴더명(폴더별 뷰 헤더·브레드크럼·드롭다운 라벨).
  const activeFolder = folders.find((f) => f.id === view.folderId) ?? null;
  const headerTitle = activeFolder ? sanitizeUserText(activeFolder.name) : '라이브러리';
  const headerSub = activeFolder
    ? formatContentCount(activeFolder.contentCount)
    : '라이브러리를 통해 편리하게 컨텐츠를 관리하고 인사이트를 확인하세요.';

  // 폴더 트리 내부 항목(확장 시) — 폴더별 카드(전체 카드에서 분기 없이 demo/RPC는 folderId 필요 →
  // 확장 폴더의 항목은 전체 카드에서 임시 표기; 정밀 항목은 폴더 진입 시 cardsQuery로 노출).
  const itemsByFolder = useMemo<Record<string, LibraryCard[]>>(() => {
    const map: Record<string, LibraryCard[]> = {};
    for (const f of folders) {
      // 확장 폴더면 현재 활성 폴더 카드 또는 전체 카드 일부로 표기(데모 정합).
      map[f.id] = view.folderId === f.id ? allCards : allCards.slice(0, 6);
    }
    return map;
  }, [folders, allCards, view.folderId]);

  // CRUD modal 상태.
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);

  // 폴더 카드 더보기 메뉴(이름변경/삭제).
  const [cardMenu, setCardMenu] = useState<string | null>(null);

  // Toast.
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const showToast = (kind: 'success' | 'error', message: string) => {
    setToast({ kind, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const atLimit = folders.length >= MAX_FOLDERS;
  const openDetail = (contentId: string) => navigate('/content/' + contentId);

  const breadcrumbItems: BreadcrumbItem[] = activeFolder
    ? [
        { id: 'all', label: '전체 폴더', onClick: () => view.openFolder(null) },
        { id: activeFolder.id, label: sanitizeUserText(activeFolder.name) },
      ]
    : [];

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeMenu="library"
            onMenuSelect={(key) => {
              if (key === 'home') navigate('/');
              else if (key === 'search') navigate('/search');
              else if (key === 'library') navigate('/library');
            }}
            onAddContent={flow.open}
            folders={folders.map((f) => ({ id: f.id, label: f.name }))}
            onFolderSelect={(id) => view.openFolder(id)}
            profile={{ name: 'Grabit 사용자' }}
          />
        }
        topbar={<Topbar breadcrumb={breadcrumbItems} />}
      >
        <div className={styles.body}>
          <LibrarySidebar
            tab={view.sideTab}
            onTabChange={view.setSideTab}
            selectLabel={activeFolder ? sanitizeUserText(activeFolder.name) : '전체 폴더'}
            selectExpanded={treeAllExpanded}
            onSelectClick={() => view.toggleTree(folders.map((f) => f.id))}
            onSearchClick={() => navigate('/search')}
          >
            {view.sideTab === 'bookmark' ? (
              <div className={styles.sideEmpty}>
                <p className={styles.sideEmptyText}>저장한 북마크가 여기에 모여요.</p>
              </div>
            ) : foldersQuery.isLoading ? (
              <div className={styles.sideEmpty}>
                <span className={styles.sideSkeleton} />
                <span className={styles.sideSkeleton} />
                <span className={styles.sideSkeleton} />
              </div>
            ) : folders.length === 0 ? (
              <div className={styles.sideEmpty}>
                <p className={styles.sideEmptyText}>폴더를 만들어 컨텐츠를 정리해 보세요.</p>
              </div>
            ) : (
              <FolderTree
                folders={folders}
                expandedIds={view.expandedIds}
                onToggle={view.toggleExpanded}
                onSelectFolder={(id) => view.openFolder(id)}
                activeFolderId={view.folderId}
                itemsByFolder={itemsByFolder}
                onOpenItem={openDetail}
              />
            )}
          </LibrarySidebar>

          <section className={styles.content}>
            {/* 헤더 행 */}
            <header className={styles.header}>
              <div className={styles.titleBlock}>
                <h2 className={styles.title}>{headerTitle}</h2>
                <p className={styles.sub}>{headerSub}</p>
              </div>
              <Button
                variant="primary"
                size="md"
                neonLabel
                leadingIcon={<Plus width={16} height={16} aria-hidden="true" />}
                onClick={flow.open}
              >
                컨텐츠 추가
              </Button>
            </header>

            {/* 브레드크럼은 톱바 select-box 단일 표기(Figma 2117:23909) — 본문 이중 표기 제거(M2). */}

            {/* 폴더 카드 행(전체 폴더 뷰에서만) — 측정 y209 */}
            {!activeFolder ? (
              <div className={styles.folderRow}>
                <FolderCardGrid
                  folders={folders}
                  onOpenFolder={(id) => view.openFolder(id)}
                  onAddFolder={() => setCreateOpen(true)}
                  onFolderMenu={(id) => setCardMenu((cur) => (cur === id ? null : id))}
                  addDisabled={atLimit}
                />
              </div>
            ) : null}

            {/* 폴더 카드 더보기 메뉴(이름변경/삭제) */}
            {cardMenu ? (
              <div className={styles.cardMenu} role="menu">
                <button
                  type="button"
                  className={styles.cardMenuItem}
                  onClick={() => {
                    const f = folders.find((x) => x.id === cardMenu);
                    if (f) setRenameTarget({ id: f.id, name: f.name });
                    setCardMenu(null);
                  }}
                >
                  이름 변경
                </button>
                <button
                  type="button"
                  className={styles.cardMenuItem}
                  onClick={() => {
                    const f = folders.find((x) => x.id === cardMenu);
                    if (f) setDeleteTarget({ id: f.id, name: f.name });
                    setCardMenu(null);
                  }}
                >
                  삭제
                </button>
              </div>
            ) : null}

            {/* 구분선 */}
            <hr className={styles.divider} />

            {/* 필터 행 + 검색바 */}
            <div className={styles.filterRow}>
              <SourceFilter
                tab={view.panelTab}
                onTabChange={view.setPanelTab}
                sources={sources}
                totalCount={total}
                selectedProvider={view.selectedProvider}
                onSelectProvider={view.setSelectedProvider}
                sortSlot={<SortLibrary value={view.sort} onChange={view.setSort} />}
              />
              <button
                type="button"
                className={styles.searchBar}
                onClick={() => navigate('/search')}
                aria-label="컨텐츠 검색"
              >
                <Search width={18} height={18} color="#B4B4B4" strokeWidth={1.8} aria-hidden="true" />
                <span className={styles.searchPlaceholder}>제목, 메모, 태그로 검색</span>
              </button>
            </div>

            {/* 그리드(컨텐츠/인사이트 스왑) */}
            <div className={styles.grid}>
              {view.panelTab === 'content' ? (
                <ContentCardGrid
                  cards={filteredCards}
                  loading={cardsQuery.isLoading}
                  error={cardsQuery.isError}
                  onRetry={() => cardsQuery.refetch()}
                  selectable={view.selectable}
                  selectedIds={view.selectedIds}
                  onToggleSelect={view.toggleSelect}
                  onOpen={openDetail}
                  emptySlot={
                    <div className={styles.empty}>
                      <p className={styles.emptyText}>
                        {activeFolder
                          ? '이 폴더에는 아직 컨텐츠가 없어요.'
                          : '아직 클립한 컨텐츠가 없어요. 컨텐츠를 추가해 보세요.'}
                      </p>
                      {!activeFolder ? (
                        <Button variant="primary" size="md" neonLabel onClick={flow.open}>
                          컨텐츠 추가
                        </Button>
                      ) : null}
                    </div>
                  }
                />
              ) : (
                <InsightCardGrid
                  insights={insights}
                  loading={insightsQuery.isLoading}
                  error={insightsQuery.isError}
                  onRetry={() => insightsQuery.refetch()}
                  onOpen={openDetail}
                />
              )}
            </div>

            {/* 다중선택 진입 버튼(컨텐츠 탭·카드 존재 시) */}
            {view.panelTab === 'content' && filteredCards.length > 0 && !view.selectable ? (
              <button
                type="button"
                className={styles.selectMode}
                onClick={() => view.toggleSelect(filteredCards[0].contentId)}
              >
                선택 모드
              </button>
            ) : null}
          </section>
        </div>
      </AppShell>

      {/* 다중선택 액션바 + 이동 모달 */}
      <MoveActionBar
        count={view.selectedIds.size}
        onCancel={view.clearSelection}
        onMove={() => setMoveOpen(true)}
      />
      <MoveToFolderModal
        key={moveOpen ? 'move-open' : 'move-closed'}
        open={moveOpen}
        contentIds={[...view.selectedIds]}
        folders={folders}
        onClose={() => setMoveOpen(false)}
        onMoved={(count) => {
          view.clearSelection();
          showToast('success', `${count}개 컨텐츠를 이동했어요.`);
        }}
        onError={(m) => showToast('error', m)}
      />

      {/* 폴더 CRUD — key로 open/target 전환 시 입력 상태 리마운트(effect-free 초기화). */}
      <CreateFolderModal
        key={createOpen ? 'create-open' : 'create-closed'}
        open={createOpen}
        atLimit={atLimit}
        onClose={() => setCreateOpen(false)}
        onCreated={(name) => showToast('success', `'${name}' 폴더를 만들었어요.`)}
        onError={(m) => showToast('error', m)}
      />
      <RenameFolderModal
        key={renameTarget ? `rename-${renameTarget.id}` : 'rename-none'}
        open={renameTarget !== null}
        folderId={renameTarget?.id ?? null}
        initialName={renameTarget?.name ?? ''}
        onClose={() => setRenameTarget(null)}
        onRenamed={() => showToast('success', '폴더 이름을 변경했어요.')}
        onError={(m) => showToast('error', m)}
      />
      <DeleteFolderDialog
        open={deleteTarget !== null}
        folderId={deleteTarget?.id ?? null}
        folderName={deleteTarget?.name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          if (deleteTarget && view.folderId === deleteTarget.id) view.openFolder(null);
          showToast('success', '폴더를 삭제했어요.');
        }}
        onError={(m) => showToast('error', m)}
      />

      <ClipAddFlowView flow={flow} />

      {toast ? (
        <div className={styles.toastWrap}>
          <Toast variant={toast.kind}>{toast.message}</Toast>
        </div>
      ) : null}
    </>
  );
}
