import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedSegment, type FeedSegmentValue } from '@/features/feed-segment';
import { FeedTabDefault } from './feed-tab-default';
import { FeedTabStream } from './feed-tab-stream';
import { RecommendationRail } from './recommendation-rail';
import { SiteFooter } from './site-footer';
import styles from './home-feed.module.css';

/**
 * HomeFeed — 홈 피드 오케스트레이터(3컬럼). 측정: 풀스크롤 2087:70384 §0.
 * 세그먼트 토글(취향관|피드) 상태 보유 → 중앙 본문 스위치 + 우 추천 레일(토글 패널, A3) 합성.
 * 중앙 컬럼 맨 하단 = 사이트 푸터(2087:71659). 카드 클릭 → navigate('/content/:id').
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
        <SiteFooter />
      </div>
      <div className={styles.rail}>
        <RecommendationRail onSelect={onSelect} />
      </div>
      {/*
       * [보류 — 이번 범위 밖, 구현 ❌]
       *  · 토스트 인사이트 와이드 배너(2087:71147/71165): 풀스크롤 중단 와이드 이미지 배너.
       *    노드 분해 재측정 + 취향관 기본(69031) 노출 여부 스코프 확인 선행 → 별도 단위.
       *  · AI Sparkle FAB(2087:71864 44×44 #1F1F1F r21): 게이트ⓐ(AI 제외)로 미구현.
       *    u7 Sparkle FAB(D3)와 공통 FAB 컴포넌트로 일괄 결정 권장.
       */}
    </div>
  );
}
