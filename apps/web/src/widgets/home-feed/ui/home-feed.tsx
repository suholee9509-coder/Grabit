import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedSegment, type FeedSegmentValue } from '@/features/feed-segment';
import { FeedTabDefault } from './feed-tab-default';
import { FeedTabStream } from './feed-tab-stream';
import { RecommendationRail } from './recommendation-rail';
import styles from './home-feed.module.css';

/**
 * HomeFeed — 홈 피드 오케스트레이터(3컬럼). 측정: 풀스크롤 2087:70384 §0.
 * 세그먼트 토글(취향관|피드) 상태 보유 → 중앙 본문 스위치 + 우 추천 레일(E4) 합성.
 * 카드 클릭 → navigate('/content/:id') (widget 레벨에서 router 연결 — entities 카드는 onSelect 콜백만).
 */
export function HomeFeed() {
  const [segment, setSegment] = useState<FeedSegmentValue>('default');
  const navigate = useNavigate();
  const onSelect = (id: string) => navigate(`/content/${id}`);

  return (
    <div className={styles.layout}>
      <div className={styles.center}>
        <div className={styles.segment}>
          <FeedSegment value={segment} onChange={setSegment} />
        </div>
        {segment === 'default' ? (
          <FeedTabDefault onSelect={onSelect} />
        ) : (
          <FeedTabStream onSelect={onSelect} />
        )}
      </div>
      <div className={styles.rail}>
        <RecommendationRail onSelect={onSelect} />
      </div>
    </div>
  );
}
