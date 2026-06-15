# Unit: u6-chrome-extension

> Sprint <S?> · Wave <W?> · owner=**both** · **mode=인터랙티브 워크트리(사용자 운전)** (content/popup UI = 사용자, ingest 배선·계약 = 헤드리스 보조 가능) · Issue #<n> · dep=u0-design-system(토큰·shared/ui) · **u0b-data-core(ingest 계약·정준키·clips 스키마) 머지 후** · migration **없음**(u0b 계약 위에서 동작)
> ★ **무거운 단위(MV3).** 메인 spec = 확장 골격(WXT·content·popup·background·인증) + 핵심 클립 플로우. 단계가 갈리면 **티켓 증식 ❌ → 폴더 내 서브-spec 분할**(아래 §서브-spec 분할 계획). 매 턴 spec + 대상 Figma 5프레임 + ADR-0001/0002 reload.

## L1 User Story (검증의 north star · 각 인수기준이 여기로 추적)
- **L1-a** As a 신규 사용자, 웹스토어에서 Grabit 확장을 설치하고 → 확장 드롭다운에서 발견 → 툴바에 핀 고정하여, 어느 영상 페이지에서든 확장을 켤 수 있다. (설치·발견·핀 = Step1/Step2)
- **L1-b** As a 영상 시청자, 영상 페이지에 **주입된 플로팅 버튼([영상 인사이트 얻기])** 을 눌러 클립을 시작할 수 있다. (주입 = Step3)
- **L1-c** As a 영상 시청자, 클립 모달에서 **현재 시점 기반 구간(start/end 타임코드 칩)을 트림**하고, **인사이트 메모**를 적고, **공개 범위·저장 폴더·태그**를 지정해 **[완료]로 서버에 전송**할 수 있다. (클립 모달 = Step4)
- **L1-d** As a 로그인된 사용자, 확장은 **웹 로그인 세션(bearer)** 으로 u0b의 ingest 계약에 클립을 보내고, 웹에서 보낸 것과 **동일하게 인제스트**된다. 미인증/401이면 재로그인으로 유도한다.
- **L1-e** As a 사용자, **같은 구간을 재클립**하면 새 클립 대신 **'이미 클립한 구간' 안내 후 메모만 추가**된다. (중복 처리)

**Production acceptance (관찰가능):** prod-like 크롬에서 확장을 로드 → 유튜브 영상 페이지에 플로팅 버튼이 Shadow DOM으로 격리 주입됨 → 버튼 클릭 → 클립 모달(트림 칩·메모·공개·폴더·태그)이 Step4와 1:1로 뜸 → [완료] → u0b ingest로 **웹과 동일 payload** 전송, 새 content/clip 생성(정준키 dedup) → 같은 구간 재클립 시 메모만 추가. 미로그인 상태에서는 로그인 팝업으로 유도. QA가 확장 로드 + e2e 재현.

## Figma frames (디자인 SoT — '무엇', 픽셀-퍼펙트)
- **Step1 — 드롭다운 발견** `2074:88339`: 크롬 확장 퍼즐 드롭다운에 "Grabit -  어디서든 발견한 인…" 항목(파비콘 #121212 radius3) + 핀 affordance(Rectangle 3466231) + 툴바 강조 ellipse(rgba 0,0,0,.06).
- **Step2 — 툴바 핀** `2074:88279`: 확장 아이콘 툴바 핀 고정 상태 + 주입 버튼 미리보기(좌하단 `Frame 2085669112` 137×28 / `Frame 2085669110` 127×38 green #66FF4B).
- **Step3 — 주입 플로팅 버튼** `2074:88253`: 영상 페이지에 주입된 상태 — 우상단 green pill "영상 인사이트 얻기"(136×36 #66FF4B radius6, SF Pro Bold 13/130% −2.5%, 텍스트 #000) + 좌하단 회색 변형 버튼(#E8E8E8) + 툴바 active 아이콘.
- **Step4 — 클립 모달** `2074:88421`(998×702 모달 #1F1F1F radius12, shadow effect_P5KKQV, dim rgba(0,0,0,.6)):
  - 좌측 = 영상 프리뷰(405×228 radius8) + 타임라인 스크러버(밀도/마커) + 트림 핸들(좌 #7FC573 ↔ 우) + 구간 라벨 "0:32 / 1:01" **타임코드 칩(82×38, radius4, stroke rgba(255,255,255,.08), 가운데정렬 Pretendard Rg 14)** + "29초" 구간 길이 칩.
  - 우측 패널: **인사이트** 메모(콜아웃 509×174, stroke #363636 radius6, 본문 B1_Rg 14/160%) · **공개 범위 설정**(타이틀+설명 "해당 컨텐츠의 공개 여부를 설정합니다." + 토글 44×22 Light-Primary #2563EB) · **저장 폴더**(드롭다운 509×38, 값 "창업가 정신", chevron) · **태그**(칩 입력 — "+추가" 칩 #242424 + 선택칩 #ffffff0F radius6, 텍스트 #CECECE, "취소" x 16×16).
  - 헤더: 썸네일 44×44 + "컨텐츠 추가"(Pretendard Bold 20) + 영상 제목(Rg 13) + 닫기(Dismiss 20).
  - 하단: **[완료]** 버튼(green #66FF4B radius6, T2_Sb 14, 텍스트 #121212).
  - 타임라인 시간눈금 텍스트(0:32/0:52/1:12/1:32 — Pretendard Rg 12), 진행 핸들 dot #BE1616.

> 빈/로딩/에러/저장중/미인증/중복 상태는 **프레임에 단독 화면이 없음 → [디자인 공백]** (아래 [state] + §디자인 공백). u0 파운데이션(토큰·shared/ui 토스트·버튼·스피너)으로 일관 채움. 추측 ❌.

---
/goal --tokens <예산>  [WXT 기반 MV3 확장(content script Shadow DOM 주입 + popup + background SW + 웹세션 bearer 인증)을 구현해, 영상 페이지에서 플로팅 버튼 → 클립 모달(트림·메모·공개·폴더·태그)로 구간 클립을 만들고 u0b ingest 계약(웹 동일 payload)으로 서버 전송하며, 중복 구간은 메모만 추가하고 미인증은 재로그인으로 유도한다. 설치/발견/핀/주입/모달 4프레임과 픽셀-퍼펙트. 형용사 금지.]

### Source of truth (매 턴 reload)
- read   docs/units/u6-chrome-extension/spec.md (이 파일) · follow plan.md · update status.md
- view   Figma `2074:88339`(Step1) · `2074:88279`(Step2) · `2074:88253`(Step3) · `2074:88421`(Step4) (Figma MCP) — 토큰·간격·상태 정확값. (Step4 모달이 가장 load-bearing)
- 참조: state/decisions.md **ADR-0001**(WXT·content/popup/background·Shadow DOM·웹세션 bearer·401 재로그인·Google+Kakao OAuth) · **ADR-0002**(정준키·[start,end)·clips 스키마·get_or_create_content·중복 처리·soft-delete·folder 부착) · config/quality_standards.md(FSD·하향임포트·배럴) · u0b ingest 계약(`supabase/functions/clip-ingest` payload·401·중복) · u0 토큰/`shared/ui`.

### Acceptance criteria (스토리 도출 · 관찰가능 · 각 항목 → L1-x)
**BE / 계약** (owner=both — 신규 BE 코드 없음, u0b 계약 *준수*가 핵심)
- [behavior] 확장이 보내는 클립 payload = **u0b `clip-ingest` 계약과 1:1**(url·provider 정준화 전송, start_sec/end_sec 정수 [start,end), memo, is_public, folder_id?, tags[]). 웹앱과 동일 스키마. → L1-d
- [behavior] **정준키 dedup 신뢰**: 같은 영상 다른 URL 형태(youtu.be/Shorts/모바일/타임스탬프 파라미터)도 서버 `get_or_create_content`가 1 content로 합치므로 확장은 **원본 url을 그대로 전송**하고 클라에서 임의 content 생성 ❌. → L1-d
- [behavior] **중복 구간**: 같은 content+동일/겹치는 구간 재전송 시 서버 응답 규칙(메모 추가)에 따라 UI가 '이미 클립한 구간' 안내. (판정 주체 = 서버 — u0b 계약. 클라는 응답 해석만) → L1-e
- [negative] 401(만료/미인증) → 토큰 폐기 + 로그인 팝업 유도, 클립 입력 내용 보존(재전송). 네트워크 실패 → 실패 토스트 + 재시도. 삭제/비공개 영상·메타 fetch 실패 → 서버 규칙 위임(u0b), 클라는 에러 표면화.
- [negative] **브라우저측 외부 API 키 호출 ❌**(Frozen) — 확장은 서버 ingest만 호출, LLM/외부키 직접 호출 금지.

**FE** (owner=both, 인터랙티브 워크트리)
- [behavior] **설치/발견/핀**: 웹스토어 설치 안내(웹 페이지 `2074:88587` "Grabit Web Clipper") → 확장 드롭다운 발견(Step1) → 툴바 핀(Step2). 설치 후 popup/온보딩이 웹 로그인 세션을 잡는 경로 명시. → L1-a
- [behavior] **content script 주입**: 영상 페이지(유튜브 우선)에 플로팅 버튼([영상 인사이트 얻기] green pill)을 **Shadow DOM 격리** 주입(host 페이지 CSS 충돌·역주입 ❌). 버튼 클릭 → 클립 모달 오픈. → L1-b
- [behavior] **클립 모달**(Step4): 영상 프리뷰 + 타임라인 스크러버 + **트림(start/end 타임코드 칩)** + 인사이트 메모(500자 제한·엔터 저장/ESC 취소·3초 자동저장은 메모 입력 규칙 S-HEWHTN) + 공개 토글 + 저장 폴더 드롭다운 + 태그 칩 입력 → [완료] 전송. → L1-c
- [behavior] **타임코드 칩 위젯**(82×38 radius4): 클립 모달 전용 위젯으로 **이 유닛에서 정의**(u0c 공용 범위 밖). start/end 두 칩, 값=mm:ss, 트림 핸들과 양방향 바인딩. → L1-c
- [behavior] **인증**: 웹 로그인 팝업으로 Supabase 세션 획득 → `chrome.storage`에 세션 저장·갱신 → 모든 ingest 호출에 bearer 첨부 → 401 시 세션 폐기 + 재로그인. (popup = React) → L1-d
- [behavior] **popup(React)**: 툴바 아이콘 클릭 시 팝업(로그인 상태/계정/현재 페이지 클립 가능 여부 — 최소 셸). [디자인 공백] → 파운데이션으로 채움.
- [negative] 빈 메모로 [완료] 차단 또는 메모 없이도 구간만 저장 가능 여부 = **[디자인 공백] → ESCALATION**(서버 계약상 memo nullable? 기획은 '메모 입력' 전제). XSS: 메모는 텍스트로 escape, host DOM 주입 시 sanitize. 미로그인 클릭 시 로그인 유도.
- [non-regression] content script가 host 페이지(유튜브) 동작·레이아웃을 깨지 않음(Shadow DOM 격리). 웹앱(`apps/web`) 빌드 영향 0.
- [state] **빈**: 폴더/태그 없음 → "+추가" 칩만(Step4) · 메모 placeholder. **로딩**: 모달 오픈 시 영상 메타/썸네일 로딩 스켈레톤(공백→u0 스피너). **저장중**: [완료] 클릭 후 버튼 로딩(공백→u0). **에러**: 전송 실패 토스트(공백→u0 토스트) · 메타 fetch 실패. **미인증**: 로그인 유도(공백). **중복**: '이미 클립한 구간' 안내(공백→토스트/인라인). 각 정의 → §디자인 공백.
- [fidelity] **Step4 클립 모달**(`2074:88421`)과 1:1: 모달 998×702 #1F1F1F radius12·shadow, 타임코드 칩 82×38 radius4, 공개 토글 44×22 #2563EB, 폴더 드롭다운 509×38, 태그 칩 #242424/#ffffff0F radius6, [완료] green #66FF4B. **Step3 주입 버튼**(`2074:88253`) green pill 136×36 radius6 SF Pro Bold 13. **Step1/Step2**(`2074:88339`/`2074:88279`) 발견·핀(브라우저 크롬 UI는 OS/브라우저 소유 → 안내·핀 affordance만 구현). → L1-b/c

### Validation (증명 명령 — QA가 clean checkout 재실행 · AI/외부 목킹 · 동어반복 ❌)
- `clip-ingest.contract.test`(확장 payload가 u0b 계약과 동일 — 웹 fixture와 byte 동등 + 401 + 중복 응답 해석). **서버 목킹 → 결정론적.**
- content script 주입 단위 테스트: Shadow DOM root 격리(host 스타일 누출 0), 버튼 mount/unmount, SPA 내비게이션 시 재주입(유튜브 pushState).
- 타임코드 칩 위젯 테스트: 트림 핸들 ↔ 칩 값 양방향, [start,end) 경계·0길이·역전 방지.
- 인증 플로우 테스트: 세션 저장/만료/401 → 재로그인 (chrome.storage 목킹).
- `tsc -b` 0 · `pnpm lint` 0 · `pnpm lint:fsd` 0 · 확장 빌드(`wxt build`) 성공 · 콘솔 0.
- `/design-review` 충실도: Step4 모달 1:1 PASS + Step3 주입 버튼 PASS + 스크린샷. (Step1/Step2는 브라우저 크롬 의존분 제외하고 affordance 충실도)

### Boundaries
- only edit (FE/확장): `apps/extension/**`(WXT: `entrypoints/{content,popup,background}/**`, content script 주입·클립 모달·타임코드 칩 위젯·popup) · 공유 타입 추출 시 `packages/ui/**` 또는 `packages/shared/**`(ADR-0001: u6 시작 시 워크스페이스 추가·추출 1회) · 웹스토어 안내 페이지가 웹에 있으면 `apps/web/src/pages/extension-install/**`(`2074:88587`).
- only edit (계약): **신규 BE ❌.** u0b `supabase/functions/clip-ingest`는 **frozen 계약(미접촉)** — 확장은 소비만. 계약 불충분 발견 시 PM 보고(새 티켓 ❌ → u0b 또는 이 유닛 서브-spec).
- do not change: `supabase/migrations/**`·`supabase/functions/**`(u0b frozen) · `apps/web` 기존 화면 · u0 토큰/`shared/ui`(소비만). preserve: FSD 하향임포트·배럴 · RLS/익명화/정준키 계약(ADR-0002).
- 정적 유지: 아티클 클리핑·하이라이트·AI 요약·대시보드·소셜 애노테이션 뷰어 = 이 유닛 ❌(다른 유닛).
- **게이트 ⓐ 제외(엄수)**: ★AI 전면 제외 · 대시보드 제외(FD1) · 구독/결제·요금제모달·페이월 제외 · **아티클 클리핑/하이라이트 제외 → 영상 전용** · 연간 플랜 제외.
- out of scope: 아티클 텍스트 클리핑(F-DTQJKN)·DOM 위치 저장 → 영상만 · 콘텐츠 상세/히트맵 뷰어(u4) · 라이브러리(u7) · 폴더 *관리* CRUD(u7 — 여기선 부착용 드롭다운만) · Naver OAuth(후순위) · 자동완성/검색(u8).
- main 직접 푸시 ❌ · force-push ❌ · `.env` 커밋 ❌ · blast radius = `feat/u6-chrome-extension`.

### 서브-spec 분할 계획 (티켓 증식 ❌ — 한 유닛 유지, 폴더 내 단계 분할)
무거우면 *계획 시점에* 같은 폴더에 단계 spec/status를 둔다(작업 중 즉흥 분할 ❌):
- `spec.md` / `status.md` (이 파일) — **확장 골격 + content 주입 + 클립 모달 UI**(인터랙티브 워크트리·사용자 운전).
- `auth-spec.md` / `auth-status.md` (필요 시) — **웹세션 bearer·chrome.storage·401 재로그인·MV3 SW sleep 토큰갱신 위협모델**.
- `ingest-spec.md` / `ingest-status.md` (필요 시) — **u0b 계약 배선·contract 테스트·중복/네트워크 처리**(헤드리스 보조 가능, frozen 계약 명시).
- `install-spec.md` (선택) — 웹스토어 안내 페이지(`2074:88587`) + 발견/핀 안내.
> 분할 시 각 서브-spec은 frozen(앞 단계가 잠근 것 "미접촉") + 파일경로·동작·테스트로 작성.

### Loop behavior
- 의미있는 변경마다 validation(contract/주입/인증/빌드) 실행 · status.md 갱신(변경·검증결과·디자인공백 결정 기록).
- ⚠ **goal = 모든 L1-x(설치·발견·핀·주입·클립모달·전송·중복·인증)의 production acceptance가 관찰가능하게 충족될 때까지 루프.** 미충족 done ❌ → ESCALATION(§C no-fake-done).
- in-flight 발견은 이 유닛이 흡수(또는 위 서브-spec), 범위 밖은 PM 보고(새 티켓 ❌) · 토큰/턴 예산 초과 시 차단 사유 기록 후 정지.
