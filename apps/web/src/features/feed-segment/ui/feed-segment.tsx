import { Tabs } from '@/shared/ui';
import styles from './feed-segment.module.css';

/**
 * FeedSegment — 취향관/피드 1차 세그먼트 토글(제어형).
 * shared/ui Tabs(variant=segment size=lg) 재사용. 기본=취향관.
 * 측정 2087:70406: 선택 글자=흰(#FAFAFA)·비선택 #999999(컴포넌트 분기) · lh130%(CSS override).
 */
export type FeedSegmentValue = 'default' | 'stream';

export interface FeedSegmentProps {
  value: FeedSegmentValue;
  onChange: (value: FeedSegmentValue) => void;
}

/** 취향관 아이콘(quick, 16×16). */
function TasteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .8 4.3L8 11.4 4.1 13.4l.8-4.3-3.1-3 4.3-.6L8 1.6z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 피드 아이콘(feed, 16×16). */
function StreamIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="12" height="2.2" rx="1.1" fill="currentColor" />
      <rect x="2" y="6.9" width="12" height="2.2" rx="1.1" fill="currentColor" />
      <rect x="2" y="10.8" width="8" height="2.2" rx="1.1" fill="currentColor" />
    </svg>
  );
}

export function FeedSegment({ value, onChange }: FeedSegmentProps) {
  return (
    <Tabs
      variant="segment"
      size="lg"
      className={styles.segment}
      value={value}
      onValueChange={(id) => onChange(id as FeedSegmentValue)}
      items={[
        { id: 'default', label: '취향관', leading: <TasteIcon /> },
        { id: 'stream', label: '피드', leading: <StreamIcon /> },
      ]}
    />
  );
}
