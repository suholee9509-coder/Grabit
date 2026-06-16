import type {
  CrossCardModel,
  FieldTab,
  GrabModel,
  GridCardModel,
  HeroFeature,
  RecCardModel,
  StreamGrabModel,
} from '../model/types';
import type { CrossFieldId, FeedCategoryId } from '../model/feed-data';

/**
 * 결정론적 시드 콘텐츠(E3 콜드스타트 폴백) — 프레임 카피를 그대로 상수로 보유.
 * ★ 신규 BE RPC ❌(E1). u0b에 인기/트렌드 집계 RPC 부재 → 이 시드가 MVP 주 데이터 경로.
 * ★ no-leak: 모든 작성자 표시는 가공 직군 라벨(cross-user 식별자 아님). user_id/실명 없음.
 * 테스트는 이 카피로 단언(동어반복 아님 — 필터 인자에 따라 다른 배열 반환을 검증).
 *
 * 측정 카피 출처: 취향관 2087:69031 · 풀스크롤 2087:70384 · 피드 2087:71867 · 재필터 2278:135621.
 */

/* ── 히어로(취향관·피드) ───────────────────────────────────────────── */

export const HERO_DEFAULT: HeroFeature = {
  channel: 'EO Korea',
  viewsLabel: '조회수 114만회',
  clipsLabel: '클립 11만회',
  title: '지금 당신은 원하던 삶을 살고 있나요?\n나답게 살기 위한 실리콘밸리 리더의 도전 이야기',
  imageUrl: null,
  thumbnails: ['', '', '', '', ''],
};

export const HERO_STREAM: HeroFeature = {
  channel: 'EO Korea',
  viewsLabel: '조회수 114만회',
  clipsLabel: '클립 11만회',
  title: '지금 당신은 원하던 삶을 살고 있나요?\n나답게 살기 위한 실리콘밸리 리더의 도전 이야기',
  imageUrl: null,
  thumbnails: ['', '', '', '', ''],
};

/* ── 추천 캐러셀(취향관, 분야 인자에 따라 재필터) ─────────────────────── */

const REC_BY_FIELD: Record<string, RecCardModel[]> = {
  mine: [
    {
      id: 'rec-mine-1',
      title: '디자인 시스템 구축 시 꼭 알아야 할 토큰 체계 설계법',
      thumbnailUrl: null,
      summary: '쿠팡 디자인 리드가 정리한 토큰 네이밍과 위계 전략',
      author: { role: '프로덕트 디자이너 5년차', affiliation: '쿠팡', tone: 'violet' },
      tags: ['디자인시스템', '토큰'],
      clipCount: 18,
    },
    {
      id: 'rec-mine-2',
      title: '오디오 제품 UI/UX, 사용자 흐름을 다시 설계하다',
      thumbnailUrl: null,
      summary: '제품 디자이너가 본 오디오 인터페이스의 핵심 패턴',
      author: { role: '프로덕트 디자이너 3년차', affiliation: '드림어스', tone: 'violet' },
      tags: ['제품디자인', '오디오'],
      clipCount: 16,
    },
    {
      id: 'rec-mine-3',
      title: '브랜드 디자이너의 포트폴리오 구성법',
      thumbnailUrl: null,
      summary: '심사를 통과하는 케이스 스터디 구조',
      author: { role: '브랜드 디자이너 6년차', affiliation: '토스', tone: 'magenta' },
      tags: ['포트폴리오', '브랜딩'],
      clipCount: 24,
    },
    {
      id: 'rec-mine-4',
      title: 'UX 라이팅: 마이크로카피로 전환율 높이기',
      thumbnailUrl: null,
      summary: '버튼 한 줄이 바꾸는 사용자 행동',
      author: { role: 'UX 라이터 4년차', affiliation: '배달의민족', tone: 'mint' },
      tags: ['UX라이팅', '전환'],
      clipCount: 12,
    },
  ],
  leadership: [
    {
      id: 'rec-leader-1',
      title: '실리콘밸리 리더가 말하는 팀 신뢰의 조건',
      thumbnailUrl: null,
      summary: '심리적 안전감을 만드는 1:1 미팅 운영법',
      author: { role: '엔지니어링 리드 9년차', affiliation: '구글', tone: 'violet' },
      tags: ['리더십', '조직문화'],
      clipCount: 31,
    },
    {
      id: 'rec-leader-2',
      title: '성과를 끌어내는 OKR 정렬 회의 설계',
      thumbnailUrl: null,
      summary: '목표를 행동으로 바꾸는 분기 리추얼',
      author: { role: 'VP of Product 11년차', affiliation: '당근', tone: 'magenta' },
      tags: ['OKR', '팀빌딩'],
      clipCount: 27,
    },
    {
      id: 'rec-leader-3',
      title: '공백기를 이겨내는 실리콘밸리 마인드셋',
      thumbnailUrl: null,
      summary: '회복 탄력성을 키우는 리더의 루틴',
      author: { role: '창업가 8년차', affiliation: 'EO Studio', tone: 'mint' },
      tags: ['마인드셋', '회복탄력성'],
      clipCount: 19,
    },
    {
      id: 'rec-leader-4',
      title: '모두가 안된다고 할 때, 결정을 내리는 법',
      thumbnailUrl: null,
      summary: '불확실성 속에서의 의사결정 프레임',
      author: { role: 'CEO 13년차', affiliation: '리멤버', tone: 'violet' },
      tags: ['의사결정', '리더십'],
      clipCount: 22,
    },
  ],
  programming: [
    {
      id: 'rec-prog-1',
      title: 'Lovable로 노코드 웹앱 30분 만에 만들기',
      thumbnailUrl: null,
      summary: 'AI 코딩 도구로 MVP를 빠르게 검증하기',
      author: { role: '풀스택 개발자 7년차', affiliation: '네이버', tone: 'violet' },
      tags: ['노코드', '웹개발'],
      clipCount: 22,
    },
    {
      id: 'rec-prog-2',
      title: '프론트엔드 성능 최적화: React 렌더링 다이어트',
      thumbnailUrl: null,
      summary: '불필요한 리렌더를 잡는 실전 패턴',
      author: { role: '프론트엔드 개발자 5년차', affiliation: '토스', tone: 'mint' },
      tags: ['React', '성능'],
      clipCount: 18,
    },
    {
      id: 'rec-prog-3',
      title: '백엔드 아키텍처 설계: MSA 전환의 함정',
      thumbnailUrl: null,
      summary: '모놀리스에서 마이크로서비스로의 현실',
      author: { role: '백엔드 개발자 8년차', affiliation: '쿠팡', tone: 'magenta' },
      tags: ['MSA', '아키텍처'],
      clipCount: 26,
    },
    {
      id: 'rec-prog-4',
      title: '개발자가 같이 일하고 싶은 협업의 기술',
      thumbnailUrl: null,
      summary: '코드 리뷰와 문서화로 신뢰를 쌓는 법',
      author: { role: '시니어 개발자 9년차', affiliation: '배달의민족', tone: 'violet' },
      tags: ['협업', '코드리뷰'],
      clipCount: 14,
    },
  ],
};

/** 취향관 추천 캐러셀 — 분야 인자에 따라 결정론적 시드 반환. 미지정 분야 → 'mine'. */
export function seedRecItems(field: string): RecCardModel[] {
  return REC_BY_FIELD[field] ?? REC_BY_FIELD.mine;
}

/* ── 크로스 트렌드 / 인사이트 (탭 + 카드, 분야 인자) ───────────────────── */

export const CROSS_TABS: FieldTab[] = [
  { id: 'data', prefix: '프로덕트 디자이너가 보는 ', emphasis: '데이터 사이언스', suffix: ' 아티클' },
  { id: 'frontend', prefix: '프로덕트 디자이너가 보는 ', emphasis: '프론트엔드', suffix: ' 영상' },
  { id: 'marketing', prefix: '프로덕트 디자이너가 보는 ', emphasis: '마케팅', suffix: ' 아티클' },
];

export const INSIGHT_TABS: FieldTab[] = [
  {
    id: 'data',
    prefix: '',
    emphasis: 'AI 도구는 쓰는데 왜 내 업무는 안 줄어들까?',
    suffix: ' 5년차들이 찾은 답',
  },
  {
    id: 'frontend',
    prefix: '',
    emphasis: '코파일럿을 써도 생산성이 안 오르는 이유,',
    suffix: ' 5년차 개발자들이 말한 진짜 병목',
  },
  {
    id: 'marketing',
    prefix: '',
    emphasis: '자동화 툴은 많은데 성과는 왜 그대로일까?',
    suffix: ' 5년차 마케터의 현실적인 답',
  },
];

const CROSS_BY_FIELD: Record<CrossFieldId, CrossCardModel[]> = {
  data: [
    {
      id: 'cross-data-1',
      title: '데이터 분석으로 사용자 행동 패턴 읽기: SQL부터 시각화까지',
      thumbnailUrl: null,
      author: { role: '데이터 애널리스트 4년차', affiliation: '카카오', tone: 'mint' },
      summary: '로그 데이터에서 인사이트를 뽑는 분석 흐름',
    },
    {
      id: 'cross-data-2',
      title: 'A/B 테스트 결과를 잘못 읽지 않는 법',
      thumbnailUrl: null,
      author: { role: '데이터 사이언티스트 6년차', affiliation: '쿠팡', tone: 'violet' },
      summary: '통계적 유의성과 실험 설계의 함정',
    },
    {
      id: 'cross-data-3',
      title: '대시보드가 의사결정을 바꾸지 못하는 이유',
      thumbnailUrl: null,
      author: { role: 'BI 엔지니어 5년차', affiliation: '토스', tone: 'magenta' },
      summary: '지표를 행동으로 연결하는 설계',
    },
    {
      id: 'cross-data-4',
      title: '리텐션 분석: 코호트로 보는 사용자 생애',
      thumbnailUrl: null,
      author: { role: '그로스 애널리스트 3년차', affiliation: '당근', tone: 'mint' },
      summary: '이탈 시점을 찾아내는 코호트 차트',
    },
  ],
  frontend: [
    {
      id: 'cross-fe-1',
      title: '프론트엔드 성능 최적화: React 렌더링의 모든 것',
      thumbnailUrl: null,
      author: { role: '프론트엔드 개발자 5년차', affiliation: '네이버', tone: 'mint' },
      summary: '메모이제이션과 코드 스플리팅 실전',
    },
    {
      id: 'cross-fe-2',
      title: '디자인 토큰을 코드로: 디자이너-개발자 협업',
      thumbnailUrl: null,
      author: { role: '프론트엔드 개발자 4년차', affiliation: '토스', tone: 'violet' },
      summary: '피그마 변수에서 CSS 변수까지의 파이프라인',
    },
    {
      id: 'cross-fe-3',
      title: '웹 접근성, 어디서부터 시작할까',
      thumbnailUrl: null,
      author: { role: '웹 엔지니어 7년차', affiliation: '카카오', tone: 'magenta' },
      summary: 'ARIA와 키보드 내비게이션 기본기',
    },
    {
      id: 'cross-fe-4',
      title: '상태 관리, 라이브러리 없이 버티기',
      thumbnailUrl: null,
      author: { role: '프론트엔드 리드 8년차', affiliation: '배달의민족', tone: 'violet' },
      summary: 'Context와 reducer로 충분한 경우',
    },
  ],
  marketing: [
    {
      id: 'cross-mkt-1',
      title: '브랜드 퍼널 전략으로 마케팅 ROI 극대화하기',
      thumbnailUrl: null,
      author: { role: 'CMO 8년차', affiliation: '무신사 마케팅본부', tone: 'magenta' },
      summary: '인지부터 전환까지 퍼널별 KPI 설계',
    },
    {
      id: 'cross-mkt-2',
      title: '마이크로 인플루언서 협업으로 CPE 70% 절감한 비결',
      thumbnailUrl: null,
      author: { role: '브랜드 마케터 5년차', affiliation: '올리브영', tone: 'violet' },
      summary: '소규모 협업의 비용 효율 전략',
    },
    {
      id: 'cross-mkt-3',
      title: '퍼포먼스 마케팅 자동화: AI 입찰 전략의 모든 것',
      thumbnailUrl: null,
      author: { role: '퍼포먼스 마케터 6년차', affiliation: '토스 그로스팀', tone: 'mint' },
      summary: '예산 배분을 자동화하는 입찰 로직',
    },
    {
      id: 'cross-mkt-4',
      title: '이탈 고객 30%를 되돌린 CRM 시나리오 설계법',
      thumbnailUrl: null,
      author: { role: 'CRM 마케터 2년차', affiliation: '컬리', tone: 'magenta' },
      summary: '라이프사이클별 메시지 트리거',
    },
  ],
};

/** 크로스 트렌드/인사이트 카드 — 분야 인자에 따라 결정론적 시드 반환. */
export function seedCrossItems(field: CrossFieldId): CrossCardModel[] {
  return CROSS_BY_FIELD[field] ?? CROSS_BY_FIELD.data;
}

/* ── 피드: 실시간 인기 그랩(가로형, 카테고리 인자) ─────────────────────── */

const STREAM_ALL: StreamGrabModel[] = [
  {
    id: 'stream-1',
    title: '네이버 CTO 출신 프론트엔드의 Next.js 구현 전략',
    thumbnailUrl: null,
    tags: ['업무생산성', '프론트엔드'],
    clipCount: 16,
    author: { role: '프론트엔드 개발자 6년차', affiliation: '데브서찬', tone: 'violet' },
    summary: '대신 프론트엔드의 Next.js를 구현하는 방법에 대해 작성하였습니다.',
    timecode: '10:11~12:42',
  },
  {
    id: 'stream-2',
    title: 'GA4로 보는 마케팅 퍼널 완벽 가이드',
    thumbnailUrl: null,
    tags: ['마케팅', 'GA4'],
    clipCount: 21,
    author: { role: '그로스 마케터 4년차', affiliation: '토스', tone: 'magenta' },
    summary: '이벤트 기반 분석으로 전환을 추적하는 법',
    timecode: '03:20~06:05',
  },
  {
    id: 'stream-3',
    title: 'AI 코딩 어시스턴트, 어디까지 믿어야 할까',
    thumbnailUrl: null,
    tags: ['AI', '개발생산성'],
    clipCount: 33,
    author: { role: '시니어 개발자 9년차', affiliation: '쿠팡', tone: 'mint' },
    summary: '코파일럿을 실무에 녹이는 워크플로우',
    timecode: '01:00~04:30',
  },
];

const STREAM_BY_CATEGORY: Partial<Record<FeedCategoryId, StreamGrabModel[]>> = {
  ai: [STREAM_ALL[2]],
  marketing: [STREAM_ALL[1]],
  frontend: [STREAM_ALL[0]],
};

export function seedStreamItems(category: FeedCategoryId): StreamGrabModel[] {
  if (category === 'all') return STREAM_ALL;
  return STREAM_BY_CATEGORY[category] ?? [];
}

/* ── 피드: 분야별 트렌드 그리드(대형 세로 카드, 카테고리 인자) ──────────── */

const GRID_ALL: GridCardModel[] = [
  {
    id: 'grid-1',
    title: '2026 마케팅 트렌드: AI 큐레이션이 바꾸는 광고',
    thumbnailUrl: null,
    tags: ['마케팅', '2026트렌드'],
    clipCount: 16,
    author: { role: '마케팅 리드 7년차', affiliation: '임서찬', tone: 'magenta' },
    meta: '2025. 11. 22',
  },
  {
    id: 'grid-2',
    title: 'Lovable로 노코드 웹앱 만들기',
    thumbnailUrl: null,
    tags: ['노코드', '웹개발'],
    clipCount: 22,
    author: { role: '풀스택 개발자 5년차', affiliation: '박준혁', tone: 'violet' },
    meta: '2025. 12. 31',
  },
  {
    id: 'grid-3',
    title: '오디오 제품 UI/UX, 사용자 흐름 다시 설계',
    thumbnailUrl: null,
    tags: ['제품디자인', '오디오'],
    clipCount: 16,
    author: { role: '프로덕트 디자이너 4년차', affiliation: '김민지', tone: 'mint' },
    meta: '2025. 10. 18',
  },
  {
    id: 'grid-4',
    title: 'MSA 아키텍처 전환, 1년의 기록',
    thumbnailUrl: null,
    tags: ['백엔드', 'MSA'],
    clipCount: 19,
    author: { role: '백엔드 개발자 8년차', affiliation: '데브서찬', tone: 'violet' },
    meta: '2025. 09. 03',
  },
  {
    id: 'grid-5',
    title: 'AI로 비교 분석: ChatGPT vs Gemini vs Claude 실전 활용법',
    thumbnailUrl: null,
    tags: ['AI', '생산성'],
    clipCount: 24,
    author: { role: '프로덕트 디자이너 5년차', affiliation: '강서찬', tone: 'mint' },
    meta: '2025. 12. 09',
  },
  {
    id: 'grid-6',
    title: 'ChatGPT 모바일 인터페이스 디자인 분석으로 보는 UX 인사이트',
    thumbnailUrl: null,
    tags: ['UXUI', 'AI'],
    clipCount: 14,
    author: { role: 'UX 리서처 6년차', affiliation: '한서윤', tone: 'violet' },
    meta: '2025. 11. 28',
  },
  {
    id: 'grid-7',
    title: 'Lovable로 디자인 시스템·브랜드 아이덴티티 구축 프로세스',
    thumbnailUrl: null,
    tags: ['디자인시스템', '노코드'],
    clipCount: 18,
    author: { role: '브랜드 디자이너 4년차', affiliation: '이도현', tone: 'magenta' },
    meta: '2025. 12. 02',
  },
  {
    id: 'grid-8',
    title: 'Notion으로 데이터 프로젝트 관리하기: 협업 워크플로우 구축',
    thumbnailUrl: null,
    tags: ['생산성', '협업'],
    clipCount: 21,
    author: { role: '데이터 애널리스트 5년차', affiliation: '정민서', tone: 'violet' },
    meta: '2025. 10. 30',
  },
  {
    id: 'grid-9',
    title: 'Simplicity 컨퍼런스 2026: 심플함 속 강력한 디자인 철학',
    thumbnailUrl: null,
    tags: ['디자인', '컨퍼런스'],
    clipCount: 12,
    author: { role: '프로덕트 디자이너 7년차', affiliation: '서지안', tone: 'mint' },
    meta: '2025. 11. 15',
  },
  {
    id: 'grid-10',
    title: 'Figma vs 경쟁 협업툴 완벽 비교 가이드',
    thumbnailUrl: null,
    tags: ['Figma', '협업툴'],
    clipCount: 17,
    author: { role: 'UXUI 디자이너 6년차', affiliation: '박하늘', tone: 'violet' },
    meta: '2025. 12. 18',
  },
  {
    id: 'grid-11',
    title: '모바일 앱 개발자를 위한 Flutter vs React Native 비교 분석',
    thumbnailUrl: null,
    tags: ['모바일', '프론트엔드'],
    clipCount: 29,
    author: { role: '모바일 개발자 8년차', affiliation: '최강록', tone: 'magenta' },
    meta: '2025. 11. 05',
  },
  {
    id: 'grid-12',
    title: '세련된 로고 디자인을 위한 폰트 20가지',
    thumbnailUrl: null,
    tags: ['타이포그래피', '로고'],
    clipCount: 15,
    author: { role: '그래픽 디자이너 5년차', affiliation: '안성재', tone: 'mint' },
    meta: '2025. 10. 12',
  },
];

const GRID_BY_CATEGORY: Partial<Record<FeedCategoryId, GridCardModel[]>> = {
  ai: [GRID_ALL[1]],
  marketing: [GRID_ALL[0]],
  uxui: [GRID_ALL[2]],
  backend: [GRID_ALL[3]],
  frontend: [GRID_ALL[1]],
};

export function seedGridItems(category: FeedCategoryId): GridCardModel[] {
  if (category === 'all') return GRID_ALL;
  return GRID_BY_CATEGORY[category] ?? [];
}

/* ── 우레일: 실시간 그랩(버블 + 임베드) ──────────────────────────────── */

export const REALTIME_GRABS: GrabModel[] = [
  {
    id: 'grab-1',
    authorInitial: '수',
    authorName: '이수호',
    role: '3년차 프로덕트 디자이너',
    roleTone: 'violet',
    body: '성공 사례보다 실패를 견디는 회복력이 진짜 자산이라는 말이 오래 남는다.',
    embedTitle: '나답게 살기 위한 실리콘밸리 리더의 도전',
    embedChannel: '이오플래닛',
    embedThumbnailUrl: null,
    timeLabel: '1시간 전',
  },
  {
    id: 'grab-2',
    authorInitial: '민',
    authorName: '김민재',
    role: '5년차 백엔드 개발자',
    roleTone: 'magenta',
    body: '서비스가 커질수록 단순함을 지키는 게 더 어렵다는 걸 매번 느낀다.',
    embedTitle: 'MSA 전환 1년, 우리가 배운 것',
    embedChannel: '데브토크',
    embedThumbnailUrl: null,
    timeLabel: '3시간 전',
  },
  {
    id: 'grab-3',
    authorInitial: '지',
    authorName: '박지원',
    role: '4년차 그로스 마케터',
    roleTone: 'mint',
    body: '데이터를 보면 볼수록, 결국 사람의 마음을 읽는 일이라는 걸 깨닫는다.',
    embedTitle: 'GA4로 보는 마케팅 퍼널 가이드',
    embedChannel: '마케팅인사이드',
    embedThumbnailUrl: null,
    timeLabel: '5시간 전',
  },
];
