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
 * /ui-preview — u0 디자인 시스템 미리보기.
 * 토큰 팔레트(색/타이포/간격/반경/그림자) + 모든 shared/ui 컴포넌트 갤러리.
 * 사용자가 Figma 668:29 / 2562:7927 와 1:1로 대조해 phase ② 픽셀-퍼펙트 마감.
 */

const COLOR_GROUPS: { title: string; items: { name: string; var: string }[] }[] = [
  {
    title: 'Surface / Gray (Dark Mode)',
    items: [
      { name: 'bg', var: '--color-bg' },
      { name: 'surface', var: '--color-surface' },
      { name: 'surface-100', var: '--color-surface-100' },
      { name: 'surface-200', var: '--color-surface-200' },
      { name: 'surface-300', var: '--color-surface-300' },
      { name: 'gray-400', var: '--color-gray-400' },
      { name: 'gray-500', var: '--color-gray-500' },
      { name: 'gray-600', var: '--color-gray-600' },
      { name: 'gray-700', var: '--color-gray-700' },
      { name: 'white', var: '--color-white' },
    ],
  },
  {
    title: 'Accent (Brand Green)',
    items: [
      { name: 'accent', var: '--color-accent' },
      { name: 'accent-stroke', var: '--color-accent-stroke' },
      { name: 'accent-100', var: '--color-accent-100' },
      { name: 'accent-stroke-100', var: '--color-accent-stroke-100' },
    ],
  },
  {
    title: 'Stroke',
    items: [
      { name: 'stroke-100', var: '--color-stroke-100' },
      { name: 'stroke-200', var: '--color-stroke-200' },
      { name: 'stroke-300', var: '--color-stroke-300' },
      { name: 'stroke-400', var: '--color-stroke-400' },
      { name: 'stroke-500', var: '--color-stroke-500' },
      { name: 'stroke-typing', var: '--color-stroke-typing' },
    ],
  },
  {
    title: 'System',
    items: [{ name: 'system-red', var: '--color-system-red' }],
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

const SPACE_TOKENS = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20'];
const RADIUS_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill'];
const SHADOW_TOKENS = [
  { name: 'overlay', var: '--shadow-overlay' },
  { name: 'drop', var: '--shadow-drop' },
  { name: 'inset-light', var: '--shadow-inset-light' },
  { name: 'inset-dark', var: '--shadow-inset-dark' },
];

export function UiPreviewPage() {
  const [tab, setTab] = useState('curation');
  const [filter, setFilter] = useState('all');
  const [toggleOn, setToggleOn] = useState(true);
  const [model, setModel] = useState('haiku');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Grabit — Design System (u0)</h1>
      <p className={styles.pageSub}>
        Figma 668:29 토큰 + 2562:7927 컴포넌트 · phase ① 추출/스켈레톤 (픽셀-퍼펙트 마감 = phase ②)
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
        <h2 className={styles.sectionTitle}>Spacing</h2>
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

        <h3 className={styles.subTitle}>Button (Primary / Secondary / Tertiary × state)</h3>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="small">
            Small
          </Button>
        </div>

        <h3 className={styles.subTitle}>Chip (Selected true/false)</h3>
        <div className={styles.row}>
          <Chip selected>개발</Chip>
          <Chip>디자인</Chip>
          <Chip>기획</Chip>
          <Chip disabled>비활성</Chip>
        </div>

        <h3 className={styles.subTitle}>Tabs (underline / pill)</h3>
        <div className={styles.row}>
          <Tabs
            variant="underline"
            value={tab}
            onValueChange={setTab}
            items={[
              { id: 'curation', label: '취향관' },
              { id: 'feed', label: '피드' },
            ]}
          />
        </div>
        <div className={styles.row}>
          <Tabs
            variant="pill"
            value={filter}
            onValueChange={setFilter}
            items={[
              { id: 'all', label: '전체' },
              { id: 'dev', label: '개발' },
              { id: 'design', label: '디자인' },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>Toggle</h3>
        <div className={styles.row}>
          <Toggle checked={toggleOn} onCheckedChange={setToggleOn} aria-label="알림" />
          <Toggle checked={false} aria-label="off" />
          <Toggle checked disabled aria-label="disabled" />
        </div>

        <h3 className={styles.subTitle}>Input</h3>
        <div className={styles.row} style={{ maxWidth: 360, flexDirection: 'column', alignItems: 'stretch' }}>
          <Input placeholder="URL 붙여넣기" />
          <Input defaultValue="입력된 값" />
          <Input placeholder="에러" invalid />
          <Input placeholder="비활성" disabled />
        </div>

        <h3 className={styles.subTitle}>Dropdown (모델 선택 — Pro 배지)</h3>
        <div className={styles.row}>
          <Dropdown
            trigger={model === 'haiku' ? 'Claude Haiku 3' : 'Claude Sonnet 4.5'}
            value={model}
            onSelect={setModel}
            defaultOpen
            items={[
              { id: 'haiku', label: 'Claude Haiku 3', trailing: <Badge tone="neutral">Free</Badge> },
              { id: 'sonnet', label: 'Claude Sonnet 4.5', trailing: <Badge tone="pro" solid>Pro</Badge> },
            ]}
          />
        </div>

        <h3 className={styles.subTitle}>Card</h3>
        <div className={styles.row}>
          <Card style={{ width: 240 }}>기본 카드</Card>
          <Card interactive style={{ width: 240 }}>
            인터랙티브 카드 (hover)
          </Card>
        </div>

        <h3 className={styles.subTitle}>Avatar</h3>
        <div className={styles.row}>
          <Avatar size="sm" initials="SH" />
          <Avatar size="md" initials="GB" />
          <Avatar size="lg" initials="A" />
        </div>

        <h3 className={styles.subTitle}>Badge (Solid / Soft)</h3>
        <div className={styles.row}>
          <Badge tone="neutral">Free</Badge>
          <Badge tone="accent" solid>
            저장됨
          </Badge>
          <Badge tone="pro" solid>
            Pro
          </Badge>
          <Badge tone="danger">긴급</Badge>
        </div>

        <h3 className={styles.subTitle}>Toast (⚠ 공백 추정)</h3>
        <div className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <Toast variant="success">클립이 저장되었습니다</Toast>
          <Toast variant="error">저장에 실패했습니다</Toast>
        </div>

        <h3 className={styles.subTitle}>Modal</h3>
        <div className={styles.row}>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            모달 열기
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="새 클립 추가"
          footer={
            <>
              <Button variant="tertiary" onClick={() => setModalOpen(false)}>
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
          ⚠ Toggle/Toast 및 Pro 보라/일부 치수는 Figma 공백/미토큰화 — extraction-inventory.md 참조,
          phase ②에서 사용자 확인.
        </p>
      </section>
    </div>
  );
}
