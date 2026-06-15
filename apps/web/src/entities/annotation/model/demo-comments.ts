import type { MockComment } from './types';

/**
 * DEMO_COMMENTS — 프레임 카피 목 상수(2087:12538 우측 사이드바 댓글/답글 카드 스택).
 * ★ DM1 옵션1: BE 미연결(get_content_annotations 미호출). 픽셀퍼펙트 UI 렌더 전용.
 *   작성자 실명(이수호/이하성/손종원 등)은 목 상수에 한정 — 실 백엔드 익명 위반 0.
 */
export const DEMO_COMMENTS: MockComment[] = [
  {
    id: 'mc-1',
    authorName: '이수호',
    authorInitials: '수호',
    cohortLabel: '3년차 프로덕트 디자이너',
    body: '성공 사례보다 실패를 견디는 태도가 더 오래 남는다는 말이 인상 깊었어요. 결국 버티는 사람이 이긴다는 것.',
    intervalLabel: '10:11~12:42',
    timeLabel: '1시간 전',
    likeCount: 3,
    totalReplies: 3,
    replies: [
      {
        id: 'mr-1-1',
        authorName: '이하성',
        authorInitials: '하성',
        cohortLabel: '5년차 백엔드 개발자',
        body: '100번의 NO 끝에 한 번의 YES, 이 비율이 현실적이라 더 공감됐습니다.',
        timeLabel: '52분 전',
        likeCount: 1,
      },
    ],
  },
  {
    id: 'mc-2',
    authorName: '이하성',
    authorInitials: '하성',
    cohortLabel: '5년차 백엔드 개발자',
    body: '미국 진출을 결심한 이유가 단순 시장 크기가 아니라 "거절에 익숙한 문화"였다는 점이 새로웠어요.',
    intervalLabel: '08:24~09:51',
    timeLabel: '2시간 전',
    likeCount: 5,
    totalReplies: 0,
    replies: [],
  },
  {
    id: 'mc-3',
    authorName: '손종원',
    authorInitials: '종원',
    cohortLabel: '4년차 IT 기획자',
    body: '초기 팀 빌딩에서 가장 중요한 건 신뢰라는 부분, 우리 팀에도 적용해 보고 싶네요.',
    intervalLabel: '14:02~15:30',
    timeLabel: '3시간 전',
    likeCount: 2,
    totalReplies: 1,
    replies: [
      {
        id: 'mr-3-1',
        authorName: '이수호',
        authorInitials: '수호',
        cohortLabel: '3년차 프로덕트 디자이너',
        body: '신뢰가 결국 실행 속도를 만든다는 데 동의합니다.',
        timeLabel: '2시간 전',
        likeCount: 0,
      },
    ],
  },
  {
    id: 'mc-4',
    authorName: '김도윤',
    authorInitials: '도윤',
    cohortLabel: '6년차 그로스 마케터',
    body: '실패를 데이터로 쌓아두면 다음 의사결정이 빨라진다는 관점이 좋았습니다.',
    intervalLabel: '17:45~19:10',
    timeLabel: '5시간 전',
    likeCount: 4,
    totalReplies: 0,
    replies: [],
  },
  {
    id: 'mc-5',
    authorName: '박서연',
    authorInitials: '서연',
    cohortLabel: '2년차 데이터 분석가',
    body: '한국과 미국의 투자 환경 차이를 솔직하게 비교해 줘서 실질적인 도움이 됐어요.',
    intervalLabel: '21:08~22:40',
    timeLabel: '6시간 전',
    likeCount: 6,
    totalReplies: 0,
    replies: [],
  },
];
