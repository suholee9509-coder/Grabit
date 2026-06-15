import { useSearchParams } from 'react-router-dom';
import { ExtensionInstallModal } from '@/features/extension-install-modal';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { ClipAddFlowView, useClipAddFlow } from '@/widgets/clip-add';
import styles from './home-page.module.css';

/**
 * HomePage — 앱 셸 호스트 + 콘텐츠 추가 진입점(u3) + 온보딩 도착 시 확장 설치 모달(u1).
 * 사이드바 '컨텐츠 추가' CTA → Step1 링크 모달 오픈(u3 플로우).
 * ?onboarded=1(온보딩 완료 직후) → 확장 설치 모달 자동 노출(u1, E5: 1회 + dismiss 보존).
 * 홈 피드 본문은 u2 소관 — 여기선 자리표시(파운데이션).
 */
export function HomePage() {
  const [params] = useSearchParams();
  const cameFromOnboarding = params.get('onboarded') === '1';
  const flow = useClipAddFlow();

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeMenu="home"
            onAddContent={flow.open}
            folders={(flow.folders ?? []).map((f) => ({ id: f.id, label: f.name }))}
            profile={{ name: 'Grabit 사용자' }}
          />
        }
        topbar={<Topbar />}
      >
        <div className={styles.body}>
          <p className={styles.heading}>콘텐츠를 클립으로 모아 보세요</p>
          <p className={styles.sub}>
            좌측 [컨텐츠 추가]를 눌러 YouTube 영상 링크를 붙여넣고
            <br />
            핵심 구간을 잘라 인사이트와 함께 저장하세요.
          </p>
        </div>
      </AppShell>

      <ClipAddFlowView flow={flow} />
      <ExtensionInstallModal autoOpen={cameFromOnboarding} />
    </>
  );
}
