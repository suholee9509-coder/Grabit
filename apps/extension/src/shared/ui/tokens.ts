// Design tokens — extracted 1:1 from Figma SoT (Step3 2074:88253 · Step4 2074:88421).
// Single source so the content-script UI, popup, and shared widgets render pixel-perfect against
// the frames. Every value carries its Figma provenance; no guessed/approximated values (cardinal rule).
// Foundation gaps (states with no dedicated frame) are filled from these same tokens for consistency.

export const color = {
  // Step4 modal surface
  modalBg: '#1F1F1F', // fill_BO3L7S (2074:88453)
  dim: 'rgba(0, 0, 0, 0.6)', // fill_KO2KO3 (2074:88451)
  // text
  textPrimary: '#FAFAFA', // fill_LFXEE7 / Dark-White
  textSecondary: '#B4B4B4', // fill_G3H2L1 (설명·비활성 눈금)
  textTertiary: '#CECECE', // fill_F9R7BL (부제·태그칩)
  // CTA / accents
  green: '#66FF4B', // fill_F039YC / fill_5T3NGP (완료 버튼 · Step3 primary pill)
  greenText: '#121212', // fill_IG90SK (완료 버튼 텍스트 · Step3 라벨 다크)
  pillLabel: '#000000', // fill_UVBDGU (Step3 pill 라벨)
  graySecondaryPill: '#E8E8E8', // fill_90FPCO (Step3 secondary pill)
  trimHandle: '#7FC573', // fill_TPYX22
  playhead: '#BE1616', // fill_QI5AS7
  togglePrimary: '#2563EB', // Light-Primary (공개 토글 ON)
  // chips / fields
  addChipBg: '#242424', // fill_EBFSZM (+추가 칩 배경)
  selectedChipBg: 'rgba(255, 255, 255, 0.06)', // fill_975N6U (선택 태그칩 배경)
  // borders / strokes
  borderSubtle: 'rgba(255, 255, 255, 0.08)', // fill_0T9WU0 (콜아웃X·드롭다운·타임칩·+추가칩·헤더 하단선)
  borderCallout: '#363636', // Dark/Dark-Stroke-300 (인사이트 콜아웃)
  divider: 'rgba(255, 255, 255, 0.16)', // fill_A6BF2U (타임라인 구분선·대시)
  stripBottomBorder: '#434343', // fill_YKV5MB (썸네일 스트립 하단)
  knobBorder: 'rgba(0, 0, 0, 0.24)', // fill_0YZRAI (toggle knob)
  panelBg: '#FFFFFF', // fill_DU6KNW (Step3 흰 패널/카드)
  // foundation-gap fills (states without a frame) — derived from the modal palette
  toggleOffTrack: 'rgba(255, 255, 255, 0.16)', // §4-1 비고 권장 OFF 트랙
  errorToastBg: '#BE1616', // 에러 토스트 (재생헤드 red 재사용 — 위험 시그널)
  skeleton: 'rgba(255, 255, 255, 0.06)', // 로딩 스켈레톤
} as const;

export const shadow = {
  modal:
    '0px 20px 48px -8px rgba(17,17,17,0.24), 0px 4px 12px -1px rgba(0,0,0,0.12), 0px 0px 0px 1px rgba(84,72,49,0.1)', // effect_PWR0D3
  toggleKnob:
    '0px 2px 1px 0px rgba(0,0,0,0.04), 0px 1px 6px 0px rgba(0,0,0,0.06)', // effect_TUG84X
} as const;

export const radius = {
  modal: 12, // 2074:88453
  preview: 8, // 2074:88537
  field: 6, // 드롭다운·콜아웃·완료 버튼·+추가칩·선택칩
  chip: 4, // 타임코드 칩 (2074:88546)
  pill: 6, // Step3 primary pill
  pillFull: 1000, // 공개 토글 트랙
  handle: 100, // 트림 핸들 그립·재생헤드
} as const;

// Pretendard project-global (모달 내부 전부 Pretendard). Step3 pill 라벨만 SF Pro Bold.
export const font = {
  family:
    "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  sfPro: "'SF Pro Display', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
  letterSpacing: '-0.02em', // ls -2% (모달 전역)
} as const;
