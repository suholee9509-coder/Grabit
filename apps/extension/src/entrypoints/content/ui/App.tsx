// Content-script app root (rendered inside the Shadow DOM). Owns the open/closed state of the clip
// flow: the injected floating button (Step3) → clip modal (Step4). On open it captures the host
// video metadata and asks the background for the user's folders. Re-capture on each open so the
// player position / title is fresh (YouTube SPA can change the video without remounting us).

import { useCallback, useState } from 'react';
import { sendToBackground } from '@/shared/messaging/protocol';
import type { FolderOption } from '@/shared/folders/client';
import { captureMeta, type VideoMeta } from '../lib/youtube';
import { FloatingButton } from './FloatingButton';
import { ClipModal } from './ClipModal';

export function App() {
  const [open, setOpen] = useState(false);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = useCallback(async () => {
    setMeta(captureMeta());
    setOpen(true);
    setLoading(true);
    // Folders load asynchronously; the dropdown shows its empty/placeholder state until they arrive.
    try {
      const res = await sendToBackground<{ type: 'FOLDERS'; folders: FolderOption[] }>({
        type: 'GET_FOLDERS',
      });
      setFolders(res.folders ?? []);
    } catch {
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {!open && <FloatingButton onClick={() => void openModal()} />}
      {open && meta && (
        <ClipModal meta={meta} loading={loading} folders={folders} onClose={close} />
      )}
    </>
  );
}
