import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import { ClipAddFlowView, useClipAddFlow } from '@/widgets/clip-add';
import styles from './home-page.module.css';

/**
 * HomePage — 앱 셸 호스트 + 콘텐츠 추가 진입점(이 단위 스코프).
 * 사이드바 '컨텐츠 추가' CTA → Step1 링크 모달 오픈(플로우). 홈 피드 본문은 범위 밖(u4/u8).
 * 동일레이어 위젯 크로스슬라이스 ❌ → AppShell 슬롯에 Sidebar/Topbar 주입(상위 조합).
 */
export function HomePage() {
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
    </>
  );
}
