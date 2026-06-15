import type { ReactNode } from 'react';
import { Chip, Tabs, type TabItem } from '@/shared/ui';
import { formatProviderLabel, SourceIcon, type SourceCount } from '@/entities/content';
import styles from './source-filter.module.css';

/**
 * SourceFilter — 우측 필터 행(2117:22471 / 24845 / 23005 / 23688).
 *   [컨텐츠/인사이트 토글] — [세로 디바이더] — [출처 카운트 칩 행] — (우측 정렬 슬롯).
 * 순수 프레젠테이션(props in / 콜백 out). fetch·필터 상태는 page/features가 보유.
 *
 * 측정 1:1:
 *   토글 = Tabs segment sm(h36 컨테이너·h28 item·선택 #363636 SemiBold13·비선택 투명 Medium13 #999999).
 *   디바이더 = w0×h28 stroke rgba(255,255,255,.16).
 *   출처 칩 = Chip variant=source(h32 r6). 전체(selected)=#FAFAFA bg·#111111 글자·#505050 카운트.
 *     비선택 = rgba(255,255,255,.06) bg·border .08·#FAFAFA 글자·#B4B4B4 카운트. leadingIcon=로고 20×20.
 */

export interface SourceFilterProps {
  /** 우측 본문 토글 값. */
  tab: 'content' | 'insight';
  onTabChange: (tab: 'content' | 'insight') => void;
  /** 출처 카운트(전체 = sources 합 또는 totalCount). */
  sources: SourceCount[];
  /** 전체 칩 카운트(distinct content 합 — 서버 totalCount). */
  totalCount: number;
  /** 선택된 출처(null=전체). */
  selectedProvider: string | null;
  onSelectProvider: (provider: string | null) => void;
  /** 우측 정렬 드롭다운 슬롯(sort-library feature). */
  sortSlot?: ReactNode;
}

const TAB_ITEMS: TabItem[] = [
  { id: 'content', label: '컨텐츠' },
  { id: 'insight', label: '인사이트' },
];

export function SourceFilter({
  tab,
  onTabChange,
  sources,
  totalCount,
  selectedProvider,
  onSelectProvider,
  sortSlot,
}: SourceFilterProps) {
  return (
    <div className={styles.row}>
      <Tabs
        items={TAB_ITEMS}
        value={tab}
        onValueChange={(id) => onTabChange(id as 'content' | 'insight')}
        variant="segment"
        size="sm"
      />

      <span className={styles.divider} aria-hidden="true" />

      <div className={styles.chips} role="group" aria-label="출처 필터">
        <Chip
          variant="source"
          selected={selectedProvider === null}
          count={totalCount}
          onClick={() => onSelectProvider(null)}
        >
          전체
        </Chip>
        {sources.map((s) => (
          <Chip
            key={s.provider}
            variant="source"
            selected={selectedProvider === s.provider}
            leadingIcon={<SourceIcon provider={s.provider} />}
            count={s.count}
            onClick={() => onSelectProvider(s.provider)}
          >
            {formatProviderLabel(s.provider)}
          </Chip>
        ))}
      </div>

      {sortSlot ? <div className={styles.sort}>{sortSlot}</div> : null}
    </div>
  );
}
