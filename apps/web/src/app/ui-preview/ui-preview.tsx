import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Modal,
  Tabs,
  Toast,
  Toggle,
} from '@/shared/ui';
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
      { name: 'pure-white #FFF', var: '--color-pure-white' },
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
  const [catTab, setCatTab] = useState('mine');
  const [toggleOn, setToggleOn] = useState(true);
  const [model, setModel] = useState('haiku');
  const [folder, setFolder] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

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
          Button — 측정: Primary 네온 #66FF4B + 다크 글자 · h42(md)/h38(sm) · radius 6
        </h3>
        <div className={styles.row}>
          <Button variant="primary">계속</Button>
          <Button variant="secondary">이전</Button>
          <Button variant="tertiary">Tertiary (gap·합리값)</Button>
          <Button variant="primary" size="small">완료 (h38)</Button>
          <Button variant="primary" disabled>비활성 (gap·opacity)</Button>
        </div>
        <div className={styles.row}>
          <Button variant="secondary" compact>이전 (108w)</Button>
          <Button variant="primary" compact>다음 (108w)</Button>
          <Button variant="primary" pill>시작하기 (pill·요금제)</Button>
          <Button variant="secondary" pill>시작하기 (outline pill)</Button>
        </div>
        <div className={styles.row} style={{ maxWidth: 414, flexDirection: 'column', alignItems: 'stretch' }}>
          <Button variant="primary" fullWidth>계속 (full-width CTA)</Button>
        </div>

        <h3 className={styles.subTitle}>
          Chip — 측정: 투명+rgba(white,.12) 보더+흰 글자 · h42 · radius 6 (★pill 아님)
        </h3>
        <div className={styles.row}>
          <Chip>기획·PM</Chip>
          <Chip>개발</Chip>
          <Chip>디자인</Chip>
          <Chip selected>선택 (gap·채움 미측정)</Chip>
          <Chip disabled>비활성</Chip>
        </div>
        <div className={styles.row}>
          <Chip variant="recommend">AI 활용법 (추천칩 h32)</Chip>
          <Chip variant="recommend">시간 관리</Chip>
          <Chip variant="recommend">커리어 전환</Chip>
        </div>

        <h3 className={styles.subTitle}>
          Tabs — 측정: segment 세그먼트 pill (선택 #363636) · underline 카테고리(active #66FF4B)
        </h3>
        <div className={styles.row}>
          <Tabs
            variant="segment"
            value={tab}
            onValueChange={setTab}
            items={[
              { id: 'info', label: '시청 정보' },
              { id: 'source', label: '원본 소스' },
            ]}
          />
        </div>
        <div className={styles.row}>
          <Tabs
            variant="underline"
            value={catTab}
            onValueChange={setCatTab}
            items={[
              { id: 'mine', label: '내 분야' },
              { id: 'programming', label: '프로그래밍' },
              { id: 'design', label: '디자인' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>Toggle ⚠ 측정 GAP (프레임 부재 — 합리 스켈레톤)</h3>
        <div className={styles.row}>
          <Toggle checked={toggleOn} onCheckedChange={setToggleOn} aria-label="알림" />
          <Toggle checked={false} aria-label="off" />
          <Toggle checked disabled aria-label="disabled" />
        </div>

        <h3 className={styles.subTitle}>
          Input — 측정: default h42/bg #242424/placeholder #999999 · search h48/radius 80/bg #1F1F1F
        </h3>
        <div className={styles.row} style={{ maxWidth: 414, flexDirection: 'column', alignItems: 'stretch' }}>
          <Input placeholder="이메일을 입력해 주세요" />
          <Input defaultValue="grabit@example.com" />
          <Input placeholder="에러" invalid />
          <Input placeholder="비활성" disabled />
        </div>
        <div className={styles.row} style={{ maxWidth: 520, flexDirection: 'column', alignItems: 'stretch' }}>
          <Input variant="search" placeholder="검색어를 입력해 주세요" />
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

        <h3 className={styles.subTitle}>Avatar — 측정: xs 18 · xl 82(선택 링 #66FF4B 50%)</h3>
        <div className={styles.row} style={{ alignItems: 'flex-end' }}>
          <Avatar size="xs" initials="A" />
          <Avatar size="sm" initials="SH" />
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
          ⚠ 측정 GAP: Toggle·Toast(프레임 부재) · Chip selected 채움 · disabled/hover 상태 · Tertiary 버튼 ·
          input focus 스트로크 — 측정값 없어 합리 스켈레톤(추측 색 ❌). 상세 extraction-inventory.md §3.
        </p>
      </section>
    </div>
  );
}
