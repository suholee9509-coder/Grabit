import { useState } from 'react';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Modal,
  Stepper,
  Tabs,
  Textarea,
  Toast,
  Toggle,
} from '@/shared/ui';
import { AppShell } from '@/widgets/app-shell';
import { Sidebar, type SidebarMenuKey } from '@/widgets/sidebar';
import { Topbar } from '@/widgets/topbar';
import styles from './ui-preview.module.css';

/**
 * /ui-preview — u0 디자인 시스템 미리보기 (phase ② 정밀 리팩토링).
 * 토큰 팔레트 + 모든 shared/ui 컴포넌트의 변형·상태를 **측정 라벨**과 함께 렌더.
 * 사용자가 Figma 실화면 프레임과 1:1 대조 → 게이트 ⓒ 충실도 사인오프.
 * 색 = 668:29 다크 SoT · 치수/액센트 = 실화면 프레임 픽셀 측정.
 */

const COLOR_GROUPS: { title: string; items: { name: string; var: string }[] }[] = [
  {
    title: 'Surface / Gray (Dark Mode 668:29)',
    items: [
      { name: 'bg #000', var: '--color-bg' },
      { name: 'surface-base #0A0A0A', var: '--color-surface-base' },
      { name: 'surface #171717', var: '--color-surface' },
      { name: 'surface-100 #1F1F1F', var: '--color-surface-100' },
      { name: 'surface-200 #242424', var: '--color-surface-200' },
      { name: 'surface-300 #313131', var: '--color-surface-300' },
      { name: 'surface-tag #2E2E2E', var: '--color-surface-tag' },
      { name: 'tab-selected #363636', var: '--color-surface-tab-selected' },
      { name: 'gray-400 #898989', var: '--color-gray-400' },
      { name: 'gray-450 #999999', var: '--color-gray-450' },
      { name: 'gray-500 #B4B4B4', var: '--color-gray-500' },
      { name: 'gray-600 #DBDBDB', var: '--color-gray-600' },
      { name: 'gray-700 #ECECEC', var: '--color-gray-700' },
      { name: 'white #FAFAFA', var: '--color-white' },
    ],
  },
  {
    title: 'Brand / Accent (측정: point-green 네온)',
    items: [
      { name: 'brand-primary #66FF4B', var: '--color-brand-primary' },
      { name: 'premium-green #199E41', var: '--color-premium-green' },
      { name: 'accent-violet #727AD0', var: '--color-accent-violet' },
      { name: 'accent-mint #72D0A6', var: '--color-accent-mint' },
      { name: 'violet-pro #6D5DFF', var: '--color-accent-violet-pro' },
      { name: 'accent(레거시) #00623A', var: '--color-accent' },
    ],
  },
  {
    title: 'Border / Overlay (측정: 반투명 화이트/블랙)',
    items: [
      { name: 'border-subtle w08', var: '--color-border-subtle' },
      { name: 'border-default w10', var: '--color-border-default' },
      { name: 'border-chip w12', var: '--color-border-chip' },
      { name: 'border-strong w24', var: '--color-border-strong' },
      { name: 'surface-ghost w04', var: '--color-surface-ghost' },
      { name: 'surface-hover w06', var: '--color-surface-hover' },
      { name: 'overlay-black-60', var: '--color-overlay-black-60' },
    ],
  },
  {
    title: 'Stroke (solid) / System',
    items: [
      { name: 'stroke-200 #2E2E2E', var: '--color-stroke-200' },
      { name: 'stroke-300 #363636', var: '--color-stroke-300' },
      { name: 'stroke-400 #4E4E4E', var: '--color-stroke-400' },
      { name: 'stroke-500 #5E5E5E', var: '--color-stroke-500' },
      { name: 'stroke-typing #1F6FEB', var: '--color-stroke-typing' },
      { name: 'system-red #D35541', var: '--color-system-red' },
    ],
  },
];

const TEXT_TOKENS = [
  { label: 'title-1 / 32', sizeVar: '--text-title-1-size', lineVar: '--text-title-1-line', weight: 600 },
  { label: 'title-2 / 28', sizeVar: '--text-title-2-size', lineVar: '--text-title-2-line', weight: 600 },
  { label: 'title-3 / 24', sizeVar: '--text-title-3-size', lineVar: '--text-title-3-line', weight: 600 },
  { label: 'title-4 / 20', sizeVar: '--text-title-4-size', lineVar: '--text-title-4-line', weight: 500 },
  { label: 'title-5 / 18', sizeVar: '--text-title-5-size', lineVar: '--text-title-5-line', weight: 500 },
  { label: 'body-1 / 16', sizeVar: '--text-body-1-size', lineVar: '--text-body-1-line', weight: 400 },
  { label: 'body-2 / 15', sizeVar: '--text-body-2-size', lineVar: '--text-body-2-line', weight: 400 },
  { label: 'body-3 / 14', sizeVar: '--text-body-3-size', lineVar: '--text-body-3-line', weight: 400 },
  { label: 'body-4 / 13', sizeVar: '--text-body-4-size', lineVar: '--text-body-4-line', weight: 400 },
  { label: 'caption-1 / 13', sizeVar: '--text-caption-1-size', lineVar: '--text-caption-1-line', weight: 400 },
  { label: 'caption-2 / 12', sizeVar: '--text-caption-2-size', lineVar: '--text-caption-2-line', weight: 400 },
  { label: 'caption-3 / 11', sizeVar: '--text-caption-3-size', lineVar: '--text-caption-3-line', weight: 400 },
];

const SPACE_TOKENS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '14', '16', '20'];
const RADIUS_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill'];
const SHADOW_TOKENS = [
  { name: 'overlay', var: '--shadow-overlay' },
  { name: 'drop', var: '--shadow-drop' },
  { name: 'modal (측정)', var: '--shadow-modal' },
  { name: 'dropdown (측정)', var: '--shadow-dropdown' },
];

export function UiPreviewPage() {
  const [tab, setTab] = useState('info');
  const [homeNav, setHomeNav] = useState('taste');
  const [catTab, setCatTab] = useState('mine');
  const [listTab, setListTab] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [sourceSel, setSourceSel] = useState('youtube');
  const [tags, setTags] = useState(['업무생산성', '마케팅']);
  const [toggleOn, setToggleOn] = useState(true);
  const [model, setModel] = useState('haiku');
  const [folder, setFolder] = useState('all');
  const [searchSm, setSearchSm] = useState('피그마');
  const [modalOpen, setModalOpen] = useState(false);
  const [shellMenu, setShellMenu] = useState<SidebarMenuKey>('home');

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Grabit — Design System (u0)</h1>
      <p className={styles.pageSub}>
        phase ② 정밀 리팩토링 · 색 = Figma 668:29 다크 SoT · 치수/액센트 = 실화면 프레임 픽셀 측정
        (Figma 1:1 대조 → 게이트 ⓒ)
      </p>

      {/* COLORS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Color</h2>
        {COLOR_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className={styles.subTitle}>{group.title}</h3>
            <div className={styles.swatchGrid}>
              {group.items.map((c) => (
                <div key={c.var} className={styles.swatch}>
                  <div className={styles.swatchColor} style={{ backgroundColor: `var(${c.var})` }} />
                  <div className={styles.swatchMeta}>
                    <div className={styles.swatchName}>{c.name}</div>
                    <div className={styles.swatchVar}>{c.var}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* TYPOGRAPHY */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Typography · Pretendard</h2>
        {TEXT_TOKENS.map((t) => (
          <div key={t.label} className={styles.typeRow}>
            <span className={styles.typeLabel}>{t.label}</span>
            <span
              style={{
                fontSize: `var(${t.sizeVar})`,
                lineHeight: `var(${t.lineVar})`,
                fontWeight: t.weight,
                letterSpacing: 'var(--letter-spacing-tight)',
              }}
            >
              콘텐츠 큐레이션 · Grabit AaBbCc 123
            </span>
          </div>
        ))}
      </section>

      {/* SPACING */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing (4px 베이스 + 측정 7/9/14)</h2>
        <div className={styles.tokenStrip}>
          {SPACE_TOKENS.map((s) => (
            <div key={s} className={styles.tokenCell}>
              <div className={styles.spaceBox} style={{ width: `var(--space-${s})` }} />
              <div className={styles.tokenCaption}>space-{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* RADIUS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Radius</h2>
        <div className={styles.tokenStrip}>
          {RADIUS_TOKENS.map((r) => (
            <div key={r} className={styles.tokenCell}>
              <div className={styles.radiusBox} style={{ borderRadius: `var(--radius-${r})` }} />
              <div className={styles.tokenCaption}>radius-{r}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SHADOW */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Shadow / Effect</h2>
        <div className={styles.tokenStrip}>
          {SHADOW_TOKENS.map((s) => (
            <div key={s.name} className={styles.tokenCell}>
              <div className={styles.shadowBox} style={{ boxShadow: `var(${s.var})` }} />
              <div className={styles.tokenCaption}>{s.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPONENTS */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Components · shared/ui</h2>

        <h3 className={styles.subTitle}>
          Button · 사이즈 — 측정: medium h42 · small h38 · ★md h34(GNB CTA·검색·상세 액션 정준)
        </h3>
        <div className={styles.row}>
          <Button variant="primary" size="medium">계속 (h42 medium)</Button>
          <Button variant="primary" size="small">완료 (h38 small)</Button>
          <Button variant="primary" size="md">컨텐츠 추가 (h34 md)</Button>
          <Button variant="primary" size="md" neonLabel>검색하기 (md·neonLabel #000)</Button>
        </div>

        <h3 className={styles.subTitle}>
          Button · 변형 — Primary 네온 / Secondary 투명보더 / Tertiary ghost / lightSolid /
          socialSolidDark / solidGray
        </h3>
        <div className={styles.row}>
          <Button variant="primary">Primary (네온 #66FF4B)</Button>
          <Button variant="secondary">Secondary (투명·보더 .12)</Button>
          <Button variant="tertiary">Tertiary (ghost·gap)</Button>
        </div>
        <div className={styles.row}>
          <Button variant="lightSolid" size="md">클립 추가 (lightSolid #EFEFEF)</Button>
          <Button variant="socialSolidDark">Google로 계속하기 (socialSolidDark #242424)</Button>
          <Button variant="solidGray">작성 (solidGray #333·radius7)</Button>
        </div>

        <h3 className={styles.subTitle}>
          Button · 상태/형태 — disabled · pill(요금제 radius100) · compact 108 / compactMd 128
        </h3>
        <div className={styles.row}>
          <Button variant="primary" disabled>비활성 (gap·opacity)</Button>
          <Button variant="primary" pill>시작하기 (pill·요금제)</Button>
          <Button variant="secondary" pill>설치 (outline pill .24)</Button>
          <Button variant="primary" size="md" pill neonLabel>로그인 (md pill·#000)</Button>
        </div>
        <div className={styles.row}>
          <Button variant="secondary" compact>이전 (108w compact)</Button>
          <Button variant="primary" compact>다음 (108w compact)</Button>
          <Button variant="secondary" compactMd>이전 (128w compactMd)</Button>
          <Button variant="primary" compactMd>다음 (128w compactMd)</Button>
        </div>
        <div className={styles.row} style={{ maxWidth: 414, flexDirection: 'column', alignItems: 'stretch' }}>
          <Button variant="primary" fullWidth>계속 (full-width CTA·Fill)</Button>
        </div>

        <h3 className={styles.subTitle}>
          Chip · default (온보딩 직업/관심분야) — 투명+보더 .12 · h42 · radius 6 · 15/600 (★pill 아님)
        </h3>
        <div className={styles.row}>
          <Chip>기획·PM</Chip>
          <Chip>개발</Chip>
          <Chip selected>선택 (브랜드 보더·채움 gap)</Chip>
          <Chip disabled>비활성</Chip>
        </div>

        <h3 className={styles.subTitle}>
          Chip · recommend (검색 추천칩) — ghost .04 + 보더 .08 · h32 · radius 100(pill) · 14/500
        </h3>
        <div className={styles.row}>
          <Chip variant="recommend">AI 활용법</Chip>
          <Chip variant="recommend">시간 관리</Chip>
          <Chip variant="recommend">커리어 전환</Chip>
        </div>

        <h3 className={styles.subTitle}>
          Chip · filter (홈 카테고리 필터) — h30 · radius 6 · 비선택 .06/#B4B4B4 · 선택 #FAFAFA/#111111(실측)
        </h3>
        <div className={styles.row}>
          {[
            { id: 'all', label: '전체' },
            { id: 'biz', label: '업무생산성' },
            { id: 'mkt', label: '마케팅' },
            { id: 'career', label: '커리어' },
          ].map((c) => (
            <Chip
              key={c.id}
              variant="filter"
              selected={filterCat === c.id}
              onClick={() => setFilterCat(c.id)}
            >
              {c.label}
            </Chip>
          ))}
        </div>

        <h3 className={styles.subTitle}>
          Chip · source (출처 필터·trailing count) — h32 · 라이브러리 radius 6 / 검색 pill · 선택 #FAFAFA
        </h3>
        <div className={styles.row}>
          {[
            { id: 'all', label: '전체', count: '32' },
            { id: 'youtube', label: 'Youtube', count: '16' },
            { id: 'tistory', label: 'Tistory', count: '6' },
          ].map((s) => (
            <Chip
              key={s.id}
              variant="source"
              count={s.count}
              selected={sourceSel === s.id}
              onClick={() => setSourceSel(s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
        <div className={styles.row}>
          <Chip variant="source" pill count="16" selected>Youtube (검색 pill·선택)</Chip>
          <Chip variant="source" pill count="6">Tistory (검색 pill·비선택)</Chip>
        </div>

        <h3 className={styles.subTitle}>
          Chip · tag (카드 분류 태그) — h28 · radius 6 · .06 채움 · 13/400 · #B4B4B4 / #CECECE(ceceTone) / removable
        </h3>
        <div className={styles.row}>
          <Chip variant="tag">업무생산성</Chip>
          <Chip variant="tag">마케팅</Chip>
          <Chip variant="tag" ceceTone>커리어 (ceceTone #CECECE)</Chip>
        </div>
        <div className={styles.row}>
          {tags.map((t) => (
            <Chip
              key={t}
              variant="tag"
              ceceTone
              removable
              onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
            >
              {t}
            </Chip>
          ))}
          {tags.length === 0 ? <span className={styles.note}>(모든 태그 제거됨)</span> : null}
        </div>

        <h3 className={styles.subTitle}>
          Chip · add (태그 추가 트리거) — h28 · radius 6 · #242424 + 보더 .08 · &quot;+추가&quot; 13/500
        </h3>
        <div className={styles.row}>
          <Chip variant="add" leadingIcon={<span aria-hidden>+</span>}>추가</Chip>
        </div>

        <h3 className={styles.subTitle}>
          Tabs · segment sm — pill 컨트롤 · 13px · ghost bg · 선택 #363636 채움(상세/라이브러리)
        </h3>
        <div className={styles.row}>
          <Tabs
            variant="segment"
            size="sm"
            value={tab}
            onValueChange={setTab}
            items={[
              { id: 'info', label: '시청 정보' },
              { id: 'source', label: '원본 소스' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Tabs · segment lg — 홈 1차 내비(2173:124313) · 15px · #1B1B1B 컨테이너 · 선택 600
        </h3>
        <div className={styles.row}>
          <Tabs
            variant="segment"
            size="lg"
            value={homeNav}
            onValueChange={setHomeNav}
            items={[
              { id: 'taste', label: '취향관' },
              { id: 'feed', label: '피드' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Tabs · underline (★FD3) — active 흰 #FAFAFA 글자+밑줄 2px(네온 제거) · 16/600 · trailing 카운트
        </h3>
        <div className={styles.row}>
          <Tabs
            variant="underline"
            value={catTab}
            onValueChange={setCatTab}
            items={[
              { id: 'mine', label: '인사이트', trailing: <span style={{ marginLeft: 6 }}>12</span> },
              { id: 'programming', label: '원본 소스' },
              { id: 'design', label: '시청 정보' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Tabs · list (검색 카테고리 세로) — item h32 · 15px · 선택=색(#FAFAFA)+굵기(500)만(밑줄/네온 없음)
        </h3>
        <div className={styles.row} style={{ alignItems: 'flex-start' }}>
          <Tabs
            variant="list"
            value={listTab}
            onValueChange={setListTab}
            items={[
              { id: 'all', label: '전체' },
              { id: 'interview', label: '면접·자소서' },
              { id: 'portfolio', label: '포트폴리오' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Toggle (★FD2) — track 44×22 r1000 · ON #2563EB(Figma 파랑) · knob 18 #FAFAFA + stroke .5 + 이중 그림자
        </h3>
        <div className={styles.row}>
          <Toggle checked={toggleOn} onCheckedChange={setToggleOn} aria-label="알림 (인터랙티브)" />
          <Toggle checked aria-label="on" />
          <Toggle checked={false} aria-label="off (#313131 gap)" />
          <Toggle checked disabled aria-label="disabled on" />
          <Toggle checked={false} disabled aria-label="disabled off" />
        </div>

        <h3 className={styles.subTitle}>
          Stepper — 온보딩 진행 인디케이터 · 세그먼트 40×4 radius100 · active #66FF4B / inactive #434343
        </h3>
        <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
          <Stepper total={4} current={1} aria-label="1/4 단계" />
          <Stepper total={4} current={2} aria-label="2/4 단계" />
          <Stepper total={4} current={3} aria-label="3/4 단계" />
          <Stepper total={4} current={4} aria-label="4/4 단계" />
        </div>

        <h3 className={styles.subTitle}>
          Breadcrumb — 톱바 좌측 경로 · 칩 h26·pad6/8·r6 · 마지막=활성(★FD3 #FAFAFA) · 구분자 &apos;/&apos; .16
        </h3>
        <div className={styles.row}>
          <Breadcrumb
            items={[
              { id: 'b1', label: '홈' },
              { id: 'b2', label: '창업가 정신' },
              { id: 'b3', label: '최선을 다했지만 실패한 당신에게' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Input · default — h42 · bg #242424 · radius 6 · placeholder #999999(측정) · invalid / disabled
        </h3>
        <div className={styles.row} style={{ maxWidth: 414, flexDirection: 'column', alignItems: 'stretch' }}>
          <Input placeholder="이메일을 입력해 주세요" />
          <Input defaultValue="grabit@example.com" />
          <Input placeholder="에러" invalid />
          <Input placeholder="비활성" disabled />
        </div>

        <h3 className={styles.subTitle}>
          Input · search — md(홈 h48/radius80/bg #1F1F1F) · sm(라이브러리 h38/radius100/투명) · selected+dismiss
        </h3>
        <div className={styles.row} style={{ maxWidth: 520, flexDirection: 'column', alignItems: 'stretch' }}>
          <Input variant="search" placeholder="검색어를 입력해 주세요" />
          <Input variant="search" size="sm" placeholder="라이브러리 검색 (sm)" />
          <Input
            variant="search"
            size="sm"
            selected
            value={searchSm}
            onChange={(e) => setSearchSm(e.target.value)}
            onDismiss={() => setSearchSm('')}
          />
        </div>

        <h3 className={styles.subTitle}>
          Textarea — 멀티라인 · border solid #363636 · radius 6 · lg(온보딩 h64/14px) / link(링크입력 13px/pad14)
        </h3>
        <div className={styles.row} style={{ maxWidth: 520, flexDirection: 'column', alignItems: 'stretch' }}>
          <Textarea mode="lg" placeholder="관심 분야를 자유롭게 적어주세요 (lg · h64)" />
          <Textarea mode="link" placeholder="YouTube 링크를 붙여넣어 주세요 (link · 13px/pad14)" />
          <Textarea mode="lg" placeholder="에러 상태" invalid />
        </div>

        <h3 className={styles.subTitle}>
          Dropdown — 측정: trigger h38/bg w04 · menu shadow Dropdown-100 · selected 흰 배경
        </h3>
        <div className={styles.row}>
          <Dropdown
            trigger={model === 'haiku' ? 'GPT-5.2 Instant' : 'Claude Sonnet 4.5'}
            value={model}
            onSelect={setModel}
            defaultOpen
            items={[
              { id: 'haiku', label: 'GPT-5.2 Instant' },
              { id: 'sonnet', label: 'Claude Sonnet 4.5', trailing: <Badge tone="pro" inline>Pro</Badge> },
            ]}
          />
          <Dropdown
            trigger="전체 폴더"
            value={folder}
            onSelect={setFolder}
            defaultOpen
            items={[
              { id: 'all', label: '전체' },
              { id: 'youtube', label: 'Youtube' },
              { id: 'archive', label: '아카이브' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>
          Card — 측정: overlay-white(.04) surface · radius 12 · pad 20(기본)/18·14(compact)
        </h3>
        <div className={styles.row} style={{ alignItems: 'stretch' }}>
          <Card style={{ width: 298 }}>인사이트 카드 (pad 20)</Card>
          <Card compact style={{ width: 298 }}>홈 가로 카드 (pad 18/14)</Card>
          <Card interactive style={{ width: 240 }}>interactive (hover·gap)</Card>
        </div>

        <h3 className={styles.subTitle}>
          Avatar — 측정: xs 18 · sm 24 · profile 28(GNB) · md 32 · lg 48 · xl 82(선택 링 #66FF4B 50%)
        </h3>
        <div className={styles.row} style={{ alignItems: 'flex-end' }}>
          <Avatar size="xs" initials="A" />
          <Avatar size="sm" initials="SH" />
          <Avatar size="profile" initials="GB" />
          <Avatar size="md" initials="GB" />
          <Avatar size="lg" initials="L" />
          <Avatar size="xl" initials="내" />
          <Avatar size="xl" initials="내" selected />
        </div>

        <h3 className={styles.subTitle}>
          Badge — 측정: Tag solid #2E2E2E/#B4B4B4 · inline Premium #199E41 · Pro #66FF4B
        </h3>
        <div className={styles.row}>
          <Badge tone="neutral">Label</Badge>
          <Badge tone="accent" solid>저장됨</Badge>
          <Badge tone="violet" solid>Pro</Badge>
          <Badge tone="danger">긴급</Badge>
        </div>
        <div className={styles.row}>
          <Badge tone="premium" inline icon={<span aria-hidden>⚡</span>}>Premium</Badge>
          <Badge tone="pro" inline>Pro</Badge>
        </div>

        <h3 className={styles.subTitle}>Toast ⚠ 측정 GAP (프레임 부재 — 모달 surface 합리값)</h3>
        <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Toast variant="success">클립이 저장되었습니다</Toast>
          <Toast variant="error">저장에 실패했습니다</Toast>
        </div>

        <h3 className={styles.subTitle}>
          Modal — 측정: bg #1F1F1F · radius 12 · backdrop rgba(0,0,0,.6) · shadow '모달' · inset 28
        </h3>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            모달 열기 (sm 582)
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="콘텐츠 추가"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                취소
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                추가
              </Button>
            </>
          }
        >
          <Input placeholder="YouTube URL 붙여넣기" />
        </Modal>

        <p className={`${styles.note} ${styles.warn}`}>
          ⚠ 잔여 측정 GAP(프레임 부재 → 디자인시스템 토큰 일관 채움, 추측 색 ❌): Toast surface ·
          Toggle OFF 트랙 #313131/disabled · Chip default selected 채움 · button Tertiary/disabled/hover ·
          input/textarea focus 스트로크. ★해소(FD): Toggle ON #2563EB(FD2) · filter/source selected
          #FAFAFA·#111111(실측) · underline active 흰 #FAFAFA(FD3). 상세 u0-fidelity-audit.md.
        </p>
      </section>

      {/* APP SHELL (u0c widgets — GNB 254 · 톱바 56 · 브레드크럼 · 프로필) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>App Shell (widgets)</h2>
        <p className={styles.note}>
          GNB 254/패널 226 · nav h32(active #242424) · CTA h34 #66FF4B · 프로필 226×50 r10 · 톱바 h56
          border-b 0.12 · 브레드크럼 칩 h26 · pill 페어 h34 — 측정 1:1 (홈 2087:70381 / 상세 2087:13114).
          ★FD1 4탭(대시보드 제외) · ★FD3 #FAFAFA.
        </p>

        <h3 className={styles.subTitle}>Topbar (단독) — 홈(브레드크럼 없음) : pill 페어만</h3>
        <div
          style={{
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: 'var(--space-10)',
          }}
        >
          <Topbar />
        </div>

        <h3 className={styles.subTitle}>AppShell (조합) — Sidebar(FD1 4탭) + Topbar(상세·브레드크럼) + 본문</h3>
        <div
          style={{
            height: 560,
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <AppShell
            sidebar={
              <Sidebar
                activeMenu={shellMenu}
                onMenuSelect={setShellMenu}
                folders={[
                  { id: 'f1', label: '창업가 정신' },
                  { id: 'f2', label: '피그마 실습 강의' },
                  { id: 'f3', label: '디자인 트렌드' },
                ]}
                recent={[
                  { id: 'r1', label: '서울대 의대 출신 창업가가 6년 삽질하고 깨달은 사업의 원리' },
                  { id: 'r2', label: '한국의 젊은 창업가들이 미국으로 가는' },
                  { id: 'r3', label: '조수용 대표의 감각이 좋은 디자이너란' },
                ]}
                profile={{ name: 'Leesuho', premium: true }}
              />
            }
            topbar={
              <Topbar
                breadcrumb={[
                  { id: 'b1', label: '홈' },
                  { id: 'b2', label: '최선을 다했지만 실패한 당신에게 들려주고픈 이야기' },
                ]}
              />
            }
          >
            <div style={{ padding: 'var(--space-10)', color: 'var(--color-text-secondary)' }}>
              본문 슬롯 (children) — 페이지 콘텐츠가 여기에 렌더됩니다.
            </div>
          </AppShell>
        </div>
      </section>
    </div>
  );
}
