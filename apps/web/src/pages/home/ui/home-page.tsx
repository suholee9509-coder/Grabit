import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExtensionInstallModal } from '@/features/extension-install-modal';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { ClipAddFlowView, useClipAddFlow } from '@/widgets/clip-add';
import { HomeFeed } from '@/widgets/home-feed';
import styles from './home-page.module.css';

/**
 * HomePage — 앱 셸 호스트 + 홈 피드 본문(u2) + 콘텐츠 추가 진입점(u3) + 확장 설치 모달(u1).
 * 사이드바 '컨텐츠 추가' CTA → Step1 링크 모달 오픈(u3 플로우, 보존).
 * ?onboarded=1(온보딩 완료 직후) → 확장 설치 모달 자동 노출(u1, E5: 1회 + dismiss 보존).
 * 본문 = <HomeFeed/>(취향관/피드 세그먼트 + 우 추천 레일).
 */
export function HomePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cameFromOnboarding = params.get('onboarded') === '1';
  const flow = useClipAddFlow();

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeMenu="home"
            onMenuSelect={(key) => {
              if (key === 'search') navigate('/search');
            }}
            onAddContent={flow.open}
            folders={(flow.folders ?? []).map((f) => ({ id: f.id, label: f.name }))}
            profile={{ name: 'Grabit 사용자' }}
          />
        }
        topbar={<Topbar />}
      >
        <div className={styles.body}>
          <HomeFeed />
        </div>
      </AppShell>

      <ClipAddFlowView flow={flow} />
      <ExtensionInstallModal autoOpen={cameFromOnboarding} />
    </>
  );
}
