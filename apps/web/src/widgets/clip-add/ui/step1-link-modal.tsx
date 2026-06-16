import { useState } from 'react';
import { Button, Modal, Textarea } from '@/shared/ui';
import { isSupportedVideoUrl } from '@/entities/content';
import styles from './step1-link-modal.module.css';

export interface Step1LinkModalProps {
  open: boolean;
  onClose: () => void;
  /** [다음] — 유효 URL 제출. */
  onSubmit: (url: string) => void;
  /** 메타 fetch 진행 중 — [다음] 로딩·중복 제출 방지. */
  loading?: boolean;
}

/**
 * Step1 — 링크 붙여넣기 모달(측정 2087:32073, 582×364).
 * Modal 셸(582) + 커스텀 헤더(타이틀 Bold700 + 닫기 20px SVG, 측정 2087:33543 pad 24/24/24/28·66h)
 * + 라벨/헬퍼/URL Textarea(link) + [다음] 버튼.
 * ★헤더는 Step2와 동일한 커스텀 헤더 패턴 — 공유 Modal 헤더(SemiBold·텍스트 ✕)를 재사용하지 않아
 *   타 모달에 영향 없이 프레임과 1:1(타이틀 700·닫기 SVG·padding).
 * 클라 1차 검증(parseYoutubeUrl = extract_video_ref 거울) — 빈/형식불일치 시 [다음] 차단·인풋 에러.
 */
export function Step1LinkModal({ open, onClose, onSubmit, loading = false }: Step1LinkModalProps) {
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmed = url.trim();
  const valid = isSupportedVideoUrl(trimmed);
  const showError = touched && trimmed !== '' && !valid;

  function handleClose() {
    setUrl('');
    setTouched(false);
    onClose();
  }

  function handleNext() {
    setTouched(true);
    if (!valid || loading) return;
    onSubmit(trimmed);
    setUrl('');
    setTouched(false);
  }

  return (
    <Modal
      open={open}
      width={582}
      footer={
        <Button
          variant="primary"
          size="small"
          className={styles.next}
          disabled={trimmed === '' || !valid || loading}
          onClick={handleNext}
        >
          {loading ? '불러오는 중…' : '다음'}
        </Button>
      }
    >
      {/* 커스텀 헤더 — 타이틀 Bold700 + 닫기 20px SVG (측정 2087:33543 pad 24/24/24/28·66h·하단보더 .08) */}
      <header className={styles.header}>
        <h2 className={styles.title}>새 클립 추가</h2>
        <button type="button" className={styles.close} aria-label="닫기" onClick={handleClose}>
          <CloseGlyph />
        </button>
      </header>

      <div className={styles.labelBlock}>
        <span className={styles.label}>링크 붙여넣기</span>
        <span className={styles.helper}>
          YouTube 등 컨텐츠를 불러올 웹사이트의 링크를 입력해 주세요.
        </span>
      </div>
      <Textarea
        mode="link"
        className={styles.input}
        value={url}
        invalid={showError}
        placeholder="https://www.youtube.com/watch?v=..."
        aria-label="컨텐츠 링크"
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => setTouched(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNext();
          }
        }}
      />
      {showError ? (
        <p className={styles.error} role="alert">
          지원하지 않는 링크예요. YouTube 영상 링크를 입력해 주세요.
        </p>
      ) : null}
    </Modal>
  );
}

/** 닫기 글리프 20px(측정 componentId 1230:5853 Dismiss/Size=20 — Step2 CloseGlyph와 동일). */
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
