// Clip modal — Figma Step4 2074:88421 / 2074:88452 (998×702, #1F1F1F, radius 12, shadow effect_PWR0D3,
// dim rgba(0,0,0,.6)). Pixel-perfect assembly of header + left (preview 405×228 / timeline / trim row)
// + right (insight memo callout / public toggle / folder dropdown / tags) + footer [완료] 156×38.
// Submits via the background SW (bearer + 401 handling). States: 로딩/저장중/에러/중복/미인증 ([state]).

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { color, radius, font, shadow } from '@/shared/ui/tokens';
import { formatDurationKo } from '@/shared/lib/time';
import { buildIngestPayload, type ClipDraft } from '@/shared/ingest';
import { sendToBackground } from '@/shared/messaging/protocol';
import type { IngestResult } from '@/shared/ingest/client';
import type { VideoMeta } from '../lib/youtube';
import { seekTo } from '../lib/youtube';
import { useTrim } from '../model/use-trim';
import { TimecodeChip } from './TimecodeChip';
import { Timeline } from './Timeline';
import { PublicToggle } from './PublicToggle';
import { FolderDropdown, type FolderOption } from './FolderDropdown';
import { TagInput } from './TagInput';
import { Toast, type ToastTone } from './Toast';

const MEMO_MAX = 500;

interface ClipModalProps {
  meta: VideoMeta;
  loading: boolean; // meta still resolving → skeleton ([state] 로딩)
  folders: FolderOption[];
  onClose: () => void;
}

const text = (
  weight: number,
  size: number,
  lh: string,
  c: string,
): CSSProperties => ({
  fontFamily: font.family,
  fontWeight: weight,
  fontSize: size,
  lineHeight: lh,
  letterSpacing: font.letterSpacing,
  color: c,
});

function DismissIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke={color.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.25" stroke={color.textPrimary} strokeWidth="1.2" />
      <path d="M9 5.5V9l2.4 1.6" stroke={color.textPrimary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClipModal({ meta, loading, folders, onClose }: ClipModalProps) {
  // Default selection: a window starting at the captured position. With known duration, end is
  // clamped; otherwise a 30s window (server stores end_sec as-is).
  const initialStart = meta.currentSec;
  const initialEnd = meta.currentSec + 30;
  const { startSec, endSec, durationSec, setStart, setEnd } = useTrim(
    meta.durationSec,
    initialStart,
    initialEnd,
  );

  const [memo, setMemo] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);

  // ESC closes the modal (memo ESC = cancel edit handled by blur).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Bidirectional preview: moving a handle seeks the host video to the start.
  useEffect(() => {
    seekTo(startSec);
  }, [startSec]);

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setToast(null);
    const draft: ClipDraft = {
      url: meta.url,
      startSec,
      endSec,
      memo,
      isPublic,
      folderId,
      tags,
      title: meta.title,
      channel: meta.channel,
      durationSec: meta.durationSec,
      thumbnailUrl: meta.thumbnailUrl,
    };
    const payload = buildIngestPayload(draft);
    const { result } = await sendToBackground<{ type: 'INGEST_RESULT'; result: IngestResult }>({
      type: 'INGEST_CLIP',
      payload,
    });
    setSubmitting(false);
    handleResult(result);
  }

  function handleResult(result: IngestResult) {
    switch (result.kind) {
      case 'saved':
        setToast({ message: '클립을 저장했어요.', tone: 'success' });
        setTimeout(onClose, 700);
        break;
      case 'duplicate':
        // 중복 구간 — 서버가 메모만 추가. 입력은 보존(닫지 않음).
        setToast({ message: '이미 클립한 구간이에요. 메모를 추가했어요.', tone: 'info' });
        break;
      case 'unauthenticated':
        // 401 — 세션 폐기됨(background). 재로그인 유도, 입력 보존(재전송 가능).
        void sendToBackground({ type: 'SIGN_IN' });
        setToast({ message: '로그인이 필요해요. 로그인 후 다시 [완료]를 눌러주세요.', tone: 'error' });
        break;
      case 'invalid':
        setToast({ message: '구간 정보를 확인해주세요.', tone: 'error' });
        break;
      case 'network-error':
        setToast({ message: '전송에 실패했어요. 다시 시도해주세요.', tone: 'error' });
        break;
      case 'unconfigured':
        setToast({ message: '확장이 아직 연결되지 않았어요.', tone: 'error' });
        break;
    }
  }

  // ----- layout -----
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: color.dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="컨텐츠 추가"
        style={{
          boxSizing: 'border-box',
          width: 998,
          height: 702,
          background: color.modalBg,
          borderRadius: radius.modal,
          boxShadow: shadow.modal,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ---- header (padding 20 24 20 28, border-bottom rgba(255,255,255,.08)) ---- */}
        <div
          style={{
            boxSizing: 'border-box',
            padding: '20px 24px 20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${color.borderSubtle}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                background: meta.thumbnailUrl ? `url(${meta.thumbnailUrl})` : color.skeleton,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 347 }}>
              <span style={text(700, 20, '130%', color.textPrimary)}>컨텐츠 추가</span>
              <span
                style={{
                  ...text(400, 13, '130%', color.textTertiary),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta.title ?? '제목을 불러오는 중...'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
          >
            <DismissIcon />
          </button>
        </div>

        {/* ---- body ---- */}
        <div style={{ position: 'absolute', top: 85, left: 0, right: 0, bottom: 0 }}>
          {/* left panel */}
          <div style={{ position: 'absolute', left: 28, top: 26 }}>
            {/* preview 405×228 radius 8 */}
            <div
              style={{
                width: 405,
                height: 228,
                borderRadius: radius.preview,
                background: meta.thumbnailUrl ? `url(${meta.thumbnailUrl})` : color.skeleton,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                ...(loading ? { animation: 'grabit-pulse 1.2s ease-in-out infinite' } : {}),
              }}
            />
            {/* timeline strip starts at frame y=353 (preview top 111) → 242px below preview top */}
            <div style={{ marginTop: 14 }}>
              <Timeline
                startSec={startSec}
                endSec={endSec}
                durationSec={durationSec}
                playheadSec={startSec}
                thumbnailUrl={meta.thumbnailUrl}
                onSetStart={setStart}
                onSetEnd={setEnd}
              />
            </div>
            {/* trim input row: start chip — dash — end chip — 구간길이 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TimecodeChip edge="start" seconds={startSec} onCommit={setStart} />
                <span style={{ width: 8, height: 0, borderTop: `1px solid ${color.divider}` }} />
                <TimecodeChip edge="end" seconds={endSec} onCommit={setEnd} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ClockIcon />
                <span style={text(400, 14, '130%', color.textPrimary)}>
                  {formatDurationKo(startSec, endSec)}
                </span>
              </div>
            </div>
          </div>

          {/* right panel (frame x=461) */}
          <div style={{ position: 'absolute', left: 461, top: 26, width: 510 }}>
            {/* insight label + memo callout 509×174 */}
            <span style={text(500, 14, '130%', color.textPrimary)}>인사이트</span>
            <div
              style={{
                boxSizing: 'border-box',
                width: 509,
                height: 174,
                marginTop: 10,
                padding: '10px 12px',
                border: `1px solid ${color.borderCallout}`,
                borderRadius: radius.field,
              }}
            >
              <textarea
                ref={memoRef}
                value={memo}
                maxLength={MEMO_MAX}
                onChange={(e) => setMemo(e.target.value.slice(0, MEMO_MAX))}
                onKeyDown={(e) => {
                  // 엔터 저장(메모 입력 규칙) — Shift+Enter는 줄바꿈. ESC는 모달 닫기(전역).
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                }}
                placeholder="이 구간에서 얻은 인사이트를 적어주세요. (선택)"
                style={{
                  ...text(400, 14, '160%', color.textPrimary),
                  width: '100%',
                  height: '100%',
                  resize: 'none',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: 0,
                }}
              />
            </div>

            {/* settings stack (gap 32) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
              {/* 공개 범위 설정 */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 194 }}>
                  <span style={text(500, 14, '130%', color.textPrimary)}>공개 범위 설정</span>
                  <span style={text(400, 14, '130%', color.textSecondary)}>
                    해당 컨텐츠의 공개 여부를 설정합니다.
                  </span>
                </div>
                <PublicToggle on={isPublic} onChange={setIsPublic} />
              </div>

              {/* 저장 폴더 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={text(500, 14, '130%', color.textPrimary)}>저장 폴더</span>
                <FolderDropdown folders={folders} selectedId={folderId} onSelect={setFolderId} />
              </div>

              {/* 태그 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={text(500, 14, '130%', color.textPrimary)}>태그</span>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </div>
          </div>

          {/* footer [완료] 156×38 at modal-local x=814 y=632 (frame). body inset top:85 →
              bottom = 702-(632+38) = 32; left unchanged (body left=0). */}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
            style={{
              position: 'absolute',
              left: 814,
              bottom: 32,
              width: 156,
              height: 38,
              borderRadius: radius.field,
              background: color.green,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${color.greenText}`,
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'grabit-spin 0.7s linear infinite',
                }}
              />
            ) : (
              <span style={text(600, 14, '130%', color.greenText)}>완료</span>
            )}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />}
    </div>
  );
}
