import { useParams } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import styles from './content-detail-stub.module.css';

/**
 * ContentDetailStub — /content/:id 최소 스텁(죽은 링크 방지용). u4가 교체할 자리.
 * 카드 클릭 라우팅 타깃(L1-e)만 충족 — 상세 화면 자체는 u4 소관.
 */
export function ContentDetailStub() {
  const { id } = useParams();
  return (
    <AppShell sidebar={<Sidebar />} topbar={<Topbar />}>
      <div className={styles.body}>
        <p className={styles.heading}>콘텐츠 상세</p>
        <p className={styles.sub}>상세 화면은 곧 제공돼요. (u4)</p>
        <p className={styles.id}>content: {id}</p>
      </div>
    </AppShell>
  );
}
