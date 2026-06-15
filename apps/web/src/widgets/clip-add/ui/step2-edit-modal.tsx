import { useMemo, useState } from 'react';
import { Button, Modal } from '@/shared/ui';
import { isValidInterval, type ClipInterval, type IngestClipInput } from '@/entities/clip';
import type { ContentMeta, VideoRef } from '@/entities/content';
import type { Folder } from '@/entities/folder';
import type { Tag } from '@/entities/tag';
import { ClipInsight, ClipPublic } from '@/features/clip-add';
import { ClipTrim } from '@/features/clip-trim';
import { ClipFolder } from '@/features/clip-folder';
import { ClipTags } from '@/features/clip-tags';
import styles from './step2-edit-modal.module.css';

export interface Step2EditModalProps {
  open: boolean;
  onClose: () => void;
  /** Step1에서 넘어온 원본 URL(ingest p_url). */
  url: string;
  /** 영상 임베드 참조. */
  videoRef: VideoRef | null;
  /** 영상 메타(없으면 null 허용). */
  meta: ContentMeta | null;
  folders: Folder[];
  onSearchTags: (prefix: string) => Tag[] | Promise<Tag[]>;
  /** [완료] — ingest 입력 제출. */
  onSubmit: (input: IngestClipInput) => void;
  /** RPC 진행 중(버튼 로딩·중복 제출 방지). */
  submitting?: boolean;
}

/** 메타 기반 초기 구간 — 프레임 기본(0:32→1:01) 또는 영상 길이에 맞춘 합리값. */
function initialInterval(durationSec: number | null): ClipInterval {
  if (durationSec && durationSec > 33) {
    // 프레임 기본 윈도우(32→61) — 영상이 충분히 길면 그대로
    if (durationSec >= 61) return { startSec: 32, endSec: 61 };
    return { startSec: 0, endSec: Math.min(durationSec, 29) };
  }
  return { startSec: 0, endSec: Math.max(1, durationSec ?? 29) };
}

/**
 * Step2 — 편집 모달(측정 2087:33548, 998×702).
 * Modal 셸(998) + 커스텀 헤더(썸네일+제목+닫기) + 2단(좌 트림 / 우 인사이트·공개·폴더·태그) + [완료].
 * ★AI 요약 자리 없음 — 인사이트=사용자 메모(spec L1-c). [완료] → ingest_clip 입력 제출.
 */
export function Step2EditModal({
  open,
  onClose,
  url,
  videoRef,
  meta,
  folders,
  onSearchTags,
  onSubmit,
  submitting = false,
}: Step2EditModalProps) {
  const durationSec = meta?.durationSec ?? null;
  const [interval, setInterval] = useState<ClipInterval>(() => initialInterval(durationSec));
  const [memo, setMemo] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const canSubmit = useMemo(
    () => isValidInterval(interval) && !submitting,
    [interval, submitting],
  );

  function handleSubmit() {
    if (!canSubmit) return;
    const trimmedMemo = memo.trim();
    onSubmit({
      url,
      startSec: interval.startSec,
      endSec: interval.endSec,
      memo: trimmedMemo === '' ? null : trimmedMemo,
      isPublic,
      folderId,
      tags,
      title: meta?.title ?? null,
      channel: meta?.channel ?? null,
      durationSec: meta?.durationSec ?? null,
      thumbnailUrl: meta?.thumbnailUrl ?? null,
    });
  }

  return (
    <Modal open={open} width={998}>
      <div className={styles.bleed}>
        {/* 커스텀 헤더 — 썸네일 + 제목 + 영상제목 + 닫기 */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            {meta?.thumbnailUrl ? (
              <img className={styles.thumb} src={meta.thumbnailUrl} alt="" />
            ) : (
              <span className={styles.thumb} aria-hidden />
            )}
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>컨텐츠 추가</h2>
              {meta?.title ? <span className={styles.videoTitle}>{meta.title}</span> : null}
            </div>
          </div>
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            <CloseGlyph />
          </button>
        </header>

        {/* 2단 본문 */}
        <div className={styles.content}>
          <div className={styles.left}>
            <ClipTrim
              videoRef={videoRef}
              durationSec={durationSec}
              interval={interval}
              onChange={setInterval}
            />
          </div>
          <div className={styles.right}>
            <ClipInsight value={memo} onChange={setMemo} />
            <ClipPublic checked={isPublic} onChange={setIsPublic} />
            <ClipFolder folders={folders} value={folderId} onChange={setFolderId} />
            <ClipTags tags={tags} onChange={setTags} onSearch={onSearchTags} />
          </div>
        </div>

        {/* 풋터 [완료] */}
        <div className={styles.footer}>
          <Button
            variant="primary"
            size="small"
            className={styles.done}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            완료
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** 닫기 글리프 20px(측정 componentId 1230:5853 Dismiss/Size=20). */
function CloseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
