import { Button, Modal } from '@/shared/ui';
import { useExtensionModal } from '../model/use-extension-modal';
import { CheckIcon } from './check-icon';
import { ExtensionIllustration } from './extension-illustration';
import styles from './extension-install-modal.module.css';

/**
 * 확장 설치 안내 모달 — 측정 2087:9468 / 카드 2087:10931 (998×702, bg #1F1F1F, radius 12, shadow '모달').
 * 2단: 좌 일러스트(정적 자산 G7) · 우 콘텐츠(x=525~):
 *   섹션 라벨 "확장 프로그램 설치" 14/130% #66FF4B (x=525 y=116) ·
 *   제목 "크롬 확장 프로그램 설치 안내" 28/700/130% #FAFAFA · 부제 16/400/130% #CECECE (gap 8, y=150) ·
 *   체크 3행(아이콘 20 + 텍스트 16/500/130% #FAFAFA, pad 20/0, 앞2행 하단보더 .08, y=278) ·
 *   CTA 2종(y=576, gap12): "나중에 하기"(secondary 128) / "설치하러 가기"(primary 128).
 * u0c Modal(backdrop·panel·shadow) + 커스텀 2단 본문. CTA = u0c Button compactMd.
 */
export interface ExtensionInstallModalProps {
  /** 온보딩 완료 직후 자동 노출(E5 — dismiss된 사용자는 안 열림). */
  autoOpen?: boolean;
  /** 모달 닫힘 콜백(상위 정리 — 선택). */
  onClose?: () => void;
}

const CHECK_ITEMS = [
  '탭 전환이 필요없는 논스톱 컨텐츠 등록',
  '영상 또는 아티클 시청 중 즉각적인 클리핑',
  '빠르고 접근성 좋은 인사이트 기록 환경',
];

export function ExtensionInstallModal({ autoOpen = true, onClose }: ExtensionInstallModalProps) {
  const { open, pending, dismiss, install } = useExtensionModal(autoOpen);

  const handleDismiss = () => {
    dismiss();
    onClose?.();
  };
  const handleInstall = () => {
    install();
    onClose?.();
  };

  return (
    <Modal open={open} width={998} onClose={undefined}>
      <div className={styles.layout} data-testid="extension-install-modal">
        {/* 좌 일러스트(정적 자산 — 콘텐츠 영역 외 G7) */}
        <div className={styles.illustration} aria-hidden="true">
          <ExtensionIllustration />
        </div>

        {/* 우 콘텐츠 */}
        <div className={styles.content}>
          <span className={styles.sectionLabel}>확장 프로그램 설치</span>

          <div className={styles.titleBlock}>
            <h2 className={styles.title}>크롬 확장 프로그램 설치 안내</h2>
            <p className={styles.subtitle}>
              크롬 확장 프로그램을 설치하고
              <br />
              빠르고 편리하게 인사이트를 기록하세요.
            </p>
          </div>

          <ul className={styles.checkList}>
            {CHECK_ITEMS.map((text, i) => (
              <li
                key={text}
                className={[styles.checkRow, i < CHECK_ITEMS.length - 1 ? styles.bordered : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.checkIcon}>
                  <CheckIcon />
                </span>
                <span className={styles.checkText}>{text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.footer}>
            <Button
              variant="secondary"
              compactMd
              onClick={handleDismiss}
              data-testid="extension-dismiss"
            >
              나중에 하기
            </Button>
            <Button
              variant="primary"
              compactMd
              disabled={pending}
              onClick={handleInstall}
              data-testid="extension-install"
            >
              설치하러 가기
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
