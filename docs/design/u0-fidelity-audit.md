# u0 디자인시스템 — 픽셀 충실도 감사 (전수)

> 2026-06-15 · 프로토타이핑 `2087:5987` **전 섹션 54프레임 전수** 읽음(10 에이전트 병렬) · Figma MCP 실측 vs 구현 파운데이션 대조.
> 구현 기준: `apps/web/src/app/styles/tokens.css` + `apps/web/src/shared/ui/*`. 읽기 전용 감사(수정은 별도 단계).

**총 190 findings** — 🔴HIGH 48 · 🟡MED 66 · 🟢LOW 76.
타입: wrong-value 66 · missing-component 33 · missing-size 32 · missing-variant 25 · extra 14 · missing-state 11 · layout-diff 9.

프레임 커버리지: onboarding(9) · home(9) · content-add(5) · content-detail(3) · content-detail-ai(4) · extension(7) · library(9) · search(3) · dashboard(2) · payment(3).

> MVP 제외 섹션(AI·대시보드·결제)은 `[mvp-out]` 표기 — 공유 컴포넌트 완전성 참고용.

---

## 🔴 HIGH (48)

### button (13)
- **missing-size** · *height* — Figma: 34px (padding 6px 16px, gap 4, radius 8, bg #66FF4B, label #000000 Body3/Semibold) | 구현: MISSING (button height 42/38만 존재)  (onboarding / `I2074:87941;1613:11280 (layout_UUGQJZ)`)
  - ★프롬프트가 예측한 34px 버튼이 실재. GNB '컨텐츠 추가' CTA가 height 34/pad6×16/radius8. 구현 button은 lg42·sm38만 → 34px 사이즈 누락. 라벨색도 #000000(현 토큰 on-primary #242424/#121212와 또 다른 제3의 네온위 다크값).
- **missing-size** · *height* — Figma: 34px | 구현: 42px(lg)/38px(sm) — 34 없음  (home / `2087:69675 (로그인) / 2087:69673 (확장 프로그램 설치) — layout_90QNK2`)
  - ★ 톱바 로그인·확장설치 버튼이 height 34px. 구현 button은 42/38 2종뿐이라 34px 미존재. 프롬프트 지정 핵심 누락.
- **missing-size** · *height·radius·padding* — Figma: h34 · radius 8px · pad 6px16px · bg #66FF4B · text Body3/Semibold(14/600) #000000 | 구현: button h42/38 · radius 6 · text on-primary #242424  (home / `컨텐츠 추가 I2087:70381;1613:11280 — layout_7PFDXR fill_UX0181`)
  - GNB '컨텐츠 추가' Primary 버튼 h34·radius8. 구현 button 모든 사이즈 radius6(6 고정)·h42/38. radius 8·h34 둘 다 미존재. 글자색 #000000(순흑)도 토큰 미보유.
- **missing-size** · *height* — Figma: 34px (pad 8/14/8/11, lh 라벨 15/500) | 구현: MISSING — button height 42(lg)/38(sm)만 존재  (content-detail / `2087:12635 / 12639 / 12643 (액션 툴바: 원본 링크·좋아요·클립 추가)`)
  - ★프롬프트가 지목한 34px 버튼 사이즈. 본문 액션 툴바 3버튼 모두 height 34 고정. 구현 42/38에 34px 단이 없음. 이 화면 액션 버튼은 전부 34 → 누락 시 픽셀-퍼펙트 불가.
- **missing-size** · *height* — Figma: 34px (pad 8/16, radius 100 pill) | 구현: MISSING — 34px 단 없음(42/38만)  (content-detail / `2087:13116/13118, 14308/14310 (톱바 '확장 프로그램 설치' outline pill + filled pill)`)
  - 톱바 pill 버튼 2종 모두 h34. 구현엔 34 단이 없어 .pill 변형을 42/38로밖에 못 만듦. 같은 34px가 본문/톱바/GNB 전반에 반복 → 사실상 정준 small 사이즈.
- **missing-size** · *height* — Figma: 34px (pad 6/16, gap 4, radius 8, fill #66FF4B, 라벨 14/600/160% #000000) | 구현: MISSING — 34px 없음; 또한 라벨 lh 160%·gap4·radius8 미반영  (content-detail / `I2087:13351;1613:11280 (GNB '컨텐츠 추가' Primary/Small/Fill)`)
  - Figma 디자인시스템 정규 컴포넌트(Type=Primary,State=Default,Size=Small,Resizing=Fill)가 명시적으로 h34·radius8. 구현 small=38px·radius6와 불일치. small 버튼의 정준값은 34/r8/gap4/lh160% 임을 시사.
- **missing-variant** · *fill/variant* — Figma: fill #EFEFEF(밝은 회백) · 라벨 #171717 15/500 · h34 r8 | 구현: MISSING — 밝은 회백 채움 버튼 변형 없음  (content-detail / `2087:12643`)
  - 핵심 CTA '클립 추가'가 #EFEFEF 채움 + 다크 글자(#171717)인 별도 '라이트 솔리드' 변형. 구현 variant=Primary(네온)/Secondary/Tertiary뿐 → 이 라이트-필 버튼 누락. 제품 핵심 액션이라 high.
- **missing-size** · *height* — Figma: 34px (layout_ZDJKIG·layout_33AHA6: h34, padY8) | 구현: MISSING (lg=42 / sm=38만 존재, 34 없음)  (library / `2117:22127 (컨텐츠 추가) · 2117:21057 (그랩 추가)`)
  - ★컨텐츠/그랩 추가 1차 액션 버튼이 h34. 구현 버튼 높이 셋(42/38)에 34px 없음. fill #66FF4B·글자 #121212·14/600/-2.5%. 라이브러리 탭에선 radius 8, 상세 breadcrumb에선 radius 100(pill).
- **missing-size** · *height* — Figma: 34px (layout_G6AJZ4·layout_9F3O6P·layout_R9BZDG·layout_KP14TT·layout_NVF1VN 모두 dimensions.height 34) | 구현: MISSING (button height 42(lg)/38(sm)만 존재)  (search / `2551:20025 (확장 프로그램 설치) / 2551:20027 (로그인) — 톱바 pill; 2087:40715 (컨텐츠 추가) — GNB; 2087:40411 (검색하기) — 검색바 임베드`)
  - 검색 전 화면 전반의 액션 버튼(톱바 로그인/확장설치, GNB 컨텐츠추가, 검색바 검색하기 CTA)이 모두 34px. 현재 토큰 --size-button-lg=42/--size-button-sm=38에 34 없음 → 신규 --size-button-md(34) 필요. 다수 프레임 반복 측정으로 신뢰도 높음.
- **missing-size** `[mvp-out]` · *height* — Figma: 34px (layout_R8WO6N · pad 8/16 · radius 100) | 구현: MISSING (lg=42 / sm=38 만 존재)  (dashboard / `2087:43973 / 2087:43975 (톱바 '확장 프로그램 설치' · '로그인')`)
  - [mvp-out] 톱바 두 버튼 모두 height 34px(라벨 14/600/130%/-2.5%, padding 8/16, radius 100). 구현 button은 42(lg)/38(sm) 2종뿐 → 34px medium-pill 사이즈 누락. 프롬프트 가설 확정. Pro 팝업 CTA(아래)·GNB 컨텐츠추가와 동일 34px → 대시보드 셸 전반의 표준 액션 높이.
- **missing-size** `[mvp-out]` · *height* — Figma: 34px (layout_KGEBZD · pad 8/16 · radius 100 · brand #66FF4B · 라벨 14/600/-2.5% on #121212) | 구현: MISSING (42/38 만)  (dashboard / `2278:135607 ('요금제 업그레이드' CTA)`)
  - [mvp-out] Pro 팝오버 CTA = pill(radius100) Primary 34px. 구현 .pill.medium/.small 은 42/38 height 강제 → 34px 부재. button height 34px은 대시보드에서 2개 프레임·3개 인스턴스에 반복 → 토큰 --size-button-md(34) 추가 후보.
- **missing-size** `[mvp-out]` · *height* — Figma: 48px (layout_BJZVR8 dimensions height 48) | 구현: MISSING (lg 42 / sm 38만 존재)  (payment / `2278:126233 (안전하게 결제하기 CTA)`)
  - [mvp-out] 주 결제 CTA 높이 48px. 파운데이션 버튼 height 42/38에 48px 없음 → 신규 size 필요. (브랜드 #66FF4B bg·다크 글자 #121212·14/600은 primary와 정합)
- **missing-component** `[mvp-out]` · *height + borderRadius + selected fill/border* — Figma: height 56px (layout_DLWMSP), radius 8px, bg #242424, border #66FF4B 1.25px | 구현: MISSING (56px height·결제수단 토글형 버튼 컴포넌트 없음)  (payment / `2278:126137 (카드 결제 — 결제수단 선택 버튼)`)
  - [mvp-out] 결제수단 '카드 결제' 선택형 버튼: height 56·radius 8·솔리드 bg #242424·선택 보더 #66FF4B(brand) 1.25px + 좌측 아이콘 20·중앙정렬. 파운데이션에 이 선택형(selected=brand border) 버튼/세그먼트 컴포넌트 없음.

### shell (10)
- **layout-diff** · *nav items (대시보드 탭)* — Figma: GNB 순서 = 홈·검색·라이브러리·**대시보드**·수신함 + divider + 내 폴더 + 최근 + 컨텐츠추가. 대시보드 탭 존재(icon/dashboard) | 구현: GNB에 대시보드 탭❌ (CLAUDE.md·구현 셸 기준 대시보드 제외)  (onboarding / `I2074:87941;1613:10936 (대시보드 nav item)`)
  - ★Figma 실화면(가입완료 홈·요금제 모달 배경 둘 다)에서 GNB에 '대시보드' 탭이 명시적으로 존재(라이브러리와 수신함 사이). 구현/파운데이션 요지는 '대시보드 탭❌'. 디자인 SoT와 구현 셸 구조 불일치 — 무엇=Figma 원칙상 대시보드 탭 추가 검토 필요.
- **missing-component** · *height / active state / colors* — Figma: nav item h32, pad 8×10, gap8, radius8, list gap4. active=bg #242424 + 텍스트 #FAFAFA(Body3/Medium). inactive=투명 + 텍스트 #B4B4B4(Body3/Regular) | 구현: widgets/ 비어있음(.gitkeep만) — GNB 위젯 미구현  (onboarding / `I2074:87941;1613:10923 (layout_ZH8U3W), fill_IZAWEO/3FQDVT/TR5EBP`)
  - apps/web/src/widgets/는 .gitkeep만 존재 → 앱셸(GNB/톱바) 위젯이 아직 미구현. 측정 스펙: nav item h32·radius8·active bg #242424·active txt #FAFAFA(Medium)·inactive txt #B4B4B4(Regular)·list gap4.
- **missing-component** · *topbar height* — Figma: 56px (width 1601) | 구현: MISSING (widgets/ 비어있음 — 톱바 위젯 미구현)  (home / `2087:69671 Frame 2085668923 — layout_U70BZM`)
  - 톱바 컨테이너 h56. apps/web/src/widgets/는 .gitkeep만 — 앱셸(톱바·GNB) 자체가 미구현. app.tsx는 ui-preview placeholder뿐.
- **missing-component** · *GNB 구조·너비* — Figma: 좌측 사이드바 width 226 · 프로필+Premium배지 / 컨텐츠추가 CTA / 홈·검색·라이브러리·대시보드·수신함 / 내 폴더 / 최근 본 | 구현: MISSING (미구현)  (home / `2087:70381 Sidebar — layout_6R3T0V / B595SB width 226`)
  - GNB 위젯 미구현. Figma 사이드바 width 226·nav item 5개 구조.
- **layout-diff** · *메뉴 항목 구성* — Figma: 홈·검색·라이브러리·대시보드·수신함 (5개) + 내 폴더 + 최근 본 컨텐츠 + 컨텐츠 추가 CTA | 구현: MISSING(widgets 미구현) — 게다가 파운데이션 요지는 '대시보드 탭❌'로 명시  (content-detail / `I2087:13351;1306:4230 (Sidebar Expanded=True)`)
  - ★Figma GNB는 '대시보드' 메뉴를 포함(아이콘 icon/dashboard·라벨 대시보드). 파운데이션 요지엔 '대시보드 탭❌'라 적혀 상충. 또한 GNB/톱바 셸 자체가 widgets/에 미구현(apps/web/src/widgets 디렉터리 부재). 실측: GNB 254px·#121212·r8, 메뉴아이템 h32/pad8·10/gap8/r8/아이콘20/14·400·160% #B4B4B4, 섹션라벨 13/500/150%, divider .08.
- **missing-component** · *dimensions/구성* — Figma: h56 · radius 8/8/0/0 · fill #121212 · border rgba(255,255,255,0.12) · 우측 pill 버튼2(설치 outline+filled)·좌측 브레드크럼(h26·pad6/8·r6·13/400 #767676↔#FFFFFF) | 구현: MISSING(widgets 미구현)  (content-detail / `2087:13114 / 14306`)
  - 톱바 셸 전체 미구현. 브레드크럼 칩(h26/r6/13)·구분자 '/'(rgba(white,0.16) 600)도 별도 패턴. pill 버튼 2종은 h34(위 button findings 참조).
- **missing-state** · *width/상태* — Figma: 펼침 450px · 접힘 60px (rail) · #121212 · border rgba(255,255,255,0.12) · radius 0/0/8/0 · 본문폭 1156↔1546 연동 | 구현: MISSING(셸·사이드바 위젯 미구현)  (content-detail / `2557:23064(450px 펼침) / 2087:14297(60px 접힘)`)
  - 우측 소셜(댓글) 사이드바 2상태(450/60px) 토글. 접힘 시 본문 콘텐츠 폭 확장(1156→1546). 셸 미구현으로 전체 누락. 내부 탭(시청정보/원본소스 underline·item h56·active 밑줄 #FFFFFF 2px)·layout-toggle 32px·작성 CTA 포함.
- **layout-diff** `[mvp-out]` · *nav item 구성 (대시보드 탭)* — Figma: 홈·검색·라이브러리·대시보드·수신함 (+ 내 폴더·최근 본 컨텐츠) · item radius 8 | 구현: 홈/검색/라이브러리/수신함 + 내 폴더 + 최근 본 + 컨텐츠추가 (대시보드 탭❌)  (content-detail-ai / `I2278:132933;1613:11288 (Menu, item componentId 1613:10862)`)
  - [mvp-out] ★Figma GNB에 '대시보드' 탭이 존재(라이브러리·수신함 사이)하나 구현 셸은 대시보드를 제외함. 반대로 Figma 이 화면 GNB엔 '컨텐츠 추가' 버튼 미관측(우측 상세 화면 컨텍스트). nav item radius 8.
- **missing-component** · *구조 / 폴더카드 / 아이콘rail* — Figma: 폴더카드 160x160 radius16 bg rgba(white,0.04) · GNB 폴더리스트 gap11 · 좌측 아이콘 rail(GNB 5아이콘) · 상세 breadcrumb(전체폴더/창업가정신/제목 13px) · 폴더추가 칩 bg rgba(102,255,75,0.12) radius100 | 구현: MISSING (widgets/ 비어있음, app.tsx=라우터 placeholder, GNB/톱바/breadcrumb 미구현)  (library / `2117:22137(폴더리스트) · 2117:25096(좌GNB rail) · 2117:21046(breadcrumb)`)
  - 앱셸 전체 미구현(widgets/.gitkeep만). 라이브러리 화면의 좌측 GNB rail·우측 컨텐츠 패널·상세 breadcrumb·폴더 그리드(160x160/radius16)·폴더추가 칩(네온12% bg) 모두 파운데이션에 컴포넌트 없음. u0(디자인시스템) 범위 밖이나 라이브러리 섹션 충실도엔 영향.
- **missing-component** · *구조/치수* — Figma: GNB width 254(컨테이너), 내부 패널 226 · 컨텐츠추가 버튼 h34(bg #66FF4B·radius 8·pad 8/10/8/6) · nav item h32(pad 8/10·gap 8·radius 8) active bg #242424·Medium14, inactive Regular14/#B4B4B4 · 프로필카드 h50(pad 8/12·radius 10) · 구분선 + 내폴더/최근본 섹션 | 구현: MISSING (apps/web/src/widgets 부재 · GNB/Sidebar 컴포넌트 미구현 · app.tsx는 placeholder 라우터+ui-preview만)  (search / `2087:40714 / 2087:40001 / 2087:40196 (Frame 2085667633, layout_24CNM9/layout_5ZJVVI)`)
  - 좌측 GNB가 컴포넌트로 전혀 구현되지 않음(widgets 디렉토리 없음). 파운데이션 요지엔 의도만 기술. 픽셀값(254/226·item h32·active #242424·컨텐츠추가 h34) 모두 신규 구현 필요.

### chip (9)
- **missing-state** · *selected fill (채움색)* — Figma: 선택: bg #FAFAFA + text #111111 (14/600/lh160%/-2%) | 구현: chip.selected = 채움 미측정(브랜드 보더로 표시) — MISSING  (home / `선택 2087:71871 fill_2E2AG8 / 비선택 2087:71873 fill_70JPEI — layout_WV14CY`)
  - ★ 미측정으로 남겨둔 '칩 선택 채움색' 실제값 발견: 선택 칩 = 흰 채움(#FAFAFA)+다크글자(#111111). 구현 .selected는 채움 없이 브랜드 보더만 → 불일치.
- **missing-size** · *height·padding·radius·unselected fill* — Figma: h30 · pad 10px12px · radius 6 · 비선택 bg rgba(255,255,255,0.06) · text #B4B4B4 14/400/lh160% | 구현: chip h42 / recommend h32 — h30 없음. 기본 chip bg 투명+보더0.12  (home / `비선택 2087:71873 fill_70JPEI text fill_VLHVA5 — layout_WV14CY`)
  - 피드 카테고리 필터칩 = h30·radius6·채움형(0.06 비선택/흰 선택). 구현 chip는 h42(보더형)·h32(recommend pill)뿐 → h30 채움 필터칩 변형 부재. 칩 간 gap 8.
- **missing-size** · *height·padding·bg·border·text* — Figma: h28 · pad 10px(전방향) · radius 6 · bg rgba(255,255,255,0.06) · border 없음 · text 13/Regular400/lh160%/-2% #CECECE | 구현: chip h42(default)/h32(recommend) — h28 없음. text 15/600 또는 14/500  (home / `2087:69045 / 2173:105204 / 2173:105857 — layout_4WPI80·layout_1FO7PZ fill_EB9KRJ·fill_TC6N4V`)
  - 카드 위 카테고리 태그칩(업무생산성/마케팅 등) = h28·채움 0.06·보더없음·13/400 #CECECE. 4개 프레임 일관. 구현 chip 어느 변형과도 불일치(높이·텍스트·채움 모두 다름). #CECECE 토큰 미보유.
- **missing-size** · *height / fill / padding* — Figma: h28, bg rgba(255,255,255,0.06), padding 10/8/10/10, gap2, radius6, text 13/160%/-2% #CECECE, 우측 취소(x) 아이콘 | 구현: MISSING (chip은 h42 default / h32 recommend 2종뿐, h28 없음)  (content-add / `2087:35059 (layout_PHJ3ZL) / 2384:142959 (layout_WDUYT9)`)
  - 선택된 태그 칩 = 높이28·채움 rgba(white,.06)·글자 #CECECE·removable(x). 구현 chip에 h28 변형도 removable 변형도 없음. 4개 프레임 모두 동일 측정.
- **missing-state** · *selected fill color* — Figma: 채움 rgba(255,255,255,0.06), 텍스트 #CECECE | 구현: chip .selected = border #66FF4B + color #66FF4B (채움 미측정으로 보더만)  (content-add / `2087:35060 fill_GSYAUR / 2384:142960 fill_QEDBEN`)
  - ★구현 코드 주석이 'selected 채움 미측정(gap)'이라 했으나, 콘텐츠추가 태그 칩에서 선택칩 채움색이 실측됨 = rgba(white,.06)·텍스트 #CECECE. 브랜드 보더 추측은 실제와 불일치.
- **missing-variant** · *add-chip height/fill/border* — Figma: h28, bg #242424, border 1px rgba(255,255,255,0.08), padding 6/10/6/8, gap10(아이콘블록), radius6, '+'아이콘+'추가' Medium 13/130%/-2% #FAFAFA | 구현: MISSING (해당 변형 없음)  (content-add / `2384:141372 (layout_13H4VA) / 2384:143085 (layout_XWGW6C)`)
  - 태그 '추가' 입력칩 = 채움 #242424·보더 rgba(white,.08)·h28. 칩 default(투명/보더.12/h42)와 전혀 다른 별개 변형. 구현 부재.
- **missing-size** · *height / padding / bg / border / radius* — Figma: height 28 · padding 6/10/6/8 (T/R/B/L) · gap 3(icon-text) · bg #242424 · border rgba(255,255,255,0.08) 1px · radius 6 · 글자 Cap1_Md Pretendard 13/500/130% · 아이콘(더하기) 16×16 | 구현: MISSING — chip 구현은 default(h42) / recommend(h32)뿐. h28 태그칩·#242424 채움·+아이콘 변형 없음  (extension / `2074:88496 (Frame 2085667114)`)
  - ★클립 모달 태그 입력의 '추가' 칩 height=28px (구현 chip 42/32 어디에도 없음). 채움 bg=#242424(surface-200)·border .08·radius6. 이건 recommend(32/pill/ghost)와도 다른 *제3 칩 변형*. 미구현.
- **missing-variant** · *height / padding / bg / radius / 글자색 / remove-icon* — Figma: height 28 · padding 10/8/10/10 (T/R/B/L) · gap 2 · bg rgba(255,255,255,0.06) · radius 6 · 글자 13/400/160% 색 #CECECE · 취소(x) 아이콘 16×16 | 구현: MISSING — 제거가능(removable, trailing x) 태그칩 변형 없음. chip엔 h28·#CECECE 글자·x아이콘 부재  (extension / `2074:88500 / 2074:88505 / 2074:88510`)
  - ★선택/입력된 태그칩 = h28·bg rgba(white,.06)(surface-hover)·radius6·글자 #CECECE(13/400/160%, ★토큰 미등록 색)·trailing 취소(x) 16px. recommend(h32 ghost pill)·default와 모두 다름. 제거버튼 동반 칩 변형 + #CECECE 글자색 미구현.
- **missing-state** · *selected fill / unselected fill / size* — Figma: h32 · radius6 · pad10/12(아이콘有 10/12/10/10) · gap4 · selected bg #FAFAFA(흰) 글자 #111111 14/600/160% · unselected bg rgba(white,0.06) border rgba(white,0.08) 14/500 · count selected #505050 / unselected #B4B4B4 | 구현: chip.selected = 채움 미측정(브랜드 보더로 표시) · recommend h32 radius pill(100) bg .04  (library / `2117:23699 (전체 selected) · 2117:23702 (Youtube) · 2557:34430/34433`)
  - ★구현 chip의 selected 채움이 '미측정(gap)'으로 비워둔 상태인데, 출처필터 칩에서 selected=흰 채움(#FAFAFA)+다크 글자(#111111)로 실측됨. 또 이 칩은 h32·radius 6(구현 recommend는 radius pill 100) — 새 chip 변형. 다중선택 화면 핵심.

### tabs (5)
- **missing-variant** · *nav item height·radius·padding·active bg* — Figma: h32 · radius 8px · pad 8px10px · gap8 · active bg #242424 · text Body3/Medium(14/500) #FAFAFA · inactive Body3/Regular #B4B4B4 | 구현: MISSING (GNB nav 컴포넌트 미정의; tabs는 segment/underline만)  (home / `홈 I2087:70381;1613:10923 — layout_35OS1N fill_9PTZDK`)
  - 사이드바 메뉴 아이템 = 별도 nav-item 컴포넌트(h32/radius8/active bg #242424). 구현 tabs에는 sidebar-nav 변형 없음. active가 brand green 아닌 #242424 채움인 점 주의.
- **wrong-value** · *container background* — Figma: #1B1B1B (solid) | 구현: rgba(255,255,255,0.04) (--color-surface-ghost)  (home / `2173:124313 Control/Segmented — layout_4KXMOQ fill_L8PFJL`)
  - 취향관/피드 세그먼트 컨테이너 = 솔리드 #1B1B1B. 구현 .segment bg는 ghost overlay 0.04. 토큰에 #1B1B1B 미등재.
- **wrong-value** · *item font-size* — Figma: 15px (Body 2: 선택 600 / 비선택 500) | 구현: 13px (--text-caption-1-size, .segment .tab)  (home / `I2173:124313;1613:11577 (취향관 라벨) Body2/Semibold`)
  - 메인 취향관/피드 세그먼트 라벨 15px. 구현 .segment .tab은 13px. 이 세그먼트는 소형 탭이 아닌 1차 내비 토글이라 15px가 정답.
- **wrong-value** · *active color (underline+text)* — Figma: active 밑줄 2px = #FAFAFA(흰) · active 글자 #FAFAFA(fill_2TFNSF) · inactive #B4B4B4 · 16/600/-2% · 탭 h52 pad10/20 | 구현: underline.active = #66FF4B(브랜드 네온) · font 18px · pad 12/0  (library / `2117:20311 (인사이트 active) · 2117:20312/0316`)
  - ★상세 본문 underline 탭 active = 흰색(#FAFAFA 밑줄+글자)이 정답. 구현 underline active는 네온 #66FF4B — 색 불일치. 또 figma 탭 글자 16px(구현 18)·탭 height 52·pad 10/20. 4개 상세 프레임 모두 동일.
- **missing-variant** · *치수/선택표현* — Figma: 세로 리스트형 · item h32 · padding 6px 0px · 선택='전체' 15/Medium(style_K8Q6L8·style_Y58QQ1)/#FAFAFA · 비선택 15/Regular(style_X5AVNC·style_28FZF8)/#999999 · 밑줄 인디케이터 없음 · border-bottom 없음 | 구현: underline 변형: 18px(title-5) · border-bottom 1px · active #66FF4B + 2px 밑줄 · inactive #B4B4B4 — 가로 탭 / segment 변형: pill 컨테이너  (search / `2557:7615~7640 (전체/면접·자소서/포트폴리오…) · layout_XDNHVG/layout_QW07KE/layout_09XUHQ`)
  - 검색 카테고리 사이드바는 세로 리스트·15px·선택=색(#FAFAFA)+굵기(Medium)만으로 표현(밑줄/브랜드그린 없음). 구현 underline(18px·밑줄·#66FF4B)·segment(pill) 어느 것과도 불일치. 'list/text-select' 탭 변형 또는 별도 nav-list 컴포넌트 부재.

### toggle (4)
- **wrong-value** · *track size* — Figma: track 44×22, radius 1000px | 구현: 46×28, radius pill  (content-add / `2087:35027 / 2087:35028 (Hug contents BG) / 2087:35030 (knob)`)
  - 실측 토글 트랙 = 44w×22h. 구현 toggle.module.css = 46×28. 너비·높이 모두 불일치.
- **wrong-value** · *knob size* — Figma: 18×18, fill #FAFAFA, stroke rgba(0,0,0,0.24) 0.5px, shadow(0 2 1 rgba(0,0,0,.04)+0 1 6 rgba(0,0,0,.06)) | 구현: 24×24, fill --color-white, no stroke, no shadow  (content-add / `2087:35030 (knob, layout_E8BI7G)`)
  - knob 실측 18px(+0.5px 보더+이중 그림자). 구현 24px·보더/그림자 없음.
- **wrong-value** · *checked(on) track color* — Figma: #2563EB (Light-Primary, 파랑) | 구현: var(--color-brand-primary) #66FF4B (네온 그린)  (content-add / `2087:35028 (fill Light-Primary)`)
  - ON 상태 트랙색이 실측 파랑 #2563EB인데 구현은 브랜드 그린. ★색상 정체성 충돌 — 사용자 확인 필요. (off/track #313131은 실화면 부재)
- **wrong-value** · *track size / on-color / knob* — Figma: track 44×22 · radius 1000(pill) · on bg #2563EB(Light-Primary) · knob 18×18 흰색+rgba(0,0,0,.24) 0.5 stroke+그림자 · padding 2/2/2/8 | 구현: toggle 46×28 · knob 24 · on bg var-brand-primary(#66FF4B) · radius pill (toggle.module.css)  (extension / `2074:88468~88471 (Fluent toggle)`)
  - ★토글 불일치 다수: 트랙 44×22(Figma) vs 46×28(구현) · knob 18(Figma) vs 24(구현) · ON 색 #2563EB 파랑(Figma, Fluent native) vs #66FF4B 브랜드그린(구현). 단 이 토글은 Fluent2 라이브러리 컴포넌트(외부 디자인킷 잔재)라 Grabit 토큰과 의도적으로 다를 수 있음 — note로 표기. 만약 채택이면 on색·치수 전면 재정의 필요.

### other (4)
- **missing-size** `[mvp-out]` · *button height/padding/radius/fill/typo* — Figma: h34 · pad 8/16/8/14 · radius 100(pill) · 채움/보더 없음(고스트) · icon+text · '새 채팅' Medium 14/130%/-2% #FAFAFA | 구현: button lg42 / sm38 (★34 없음) · pill 변형 radius100 존재  (content-detail-ai / `2278:132338 (Frame 2085668527)`)
  - [mvp-out] ★버튼 height 34px이 구현(42/38)에 없음. pill·고스트(배경/보더 무)·아이콘+라벨. 비대칭 패딩 8/16/8/14(좌14·우16). 타이포 Medium 14=button-sm와 동일.
- **missing-component** `[mvp-out]` · *bubble surface/radius/padding/typo* — Figma: bg #242424 · radius 8 · pad 8/14 · h34 · 우측정렬(hug) · 텍스트 Medium 15/130%/-2% #FAFAFA | 구현: MISSING  (content-detail-ai / `2278:133598 (Frame 2085667673)`)
  - [mvp-out] 채팅 유저 메시지 말풍선. 파운데이션에 chat bubble 컴포넌트 없음. bg #242424(=surface-200), radius 8(토큰 radius-md), 텍스트 15/Medium.
- **missing-component** · *size / border / radius / padding* — Figma: 509×174 · border #363636(Dark-Stroke-300) 1px · radius 6 · padding 10/12 · gap 10 · 본문 B1_Rg 14/400/160%/-2% #FAFAFA | 구현: MISSING — input 컴포넌트는 default(h42)/search(h48) 단행 인풋뿐. 멀티라인 textarea/콜아웃 컴포넌트 부재  (extension / `2074:88456`)
  - ★인사이트 입력란 = 멀티라인 콜아웃(509×174, border #363636 solid stroke, radius6, pad10/12). 구현 input엔 textarea 변형 없음. 또한 border 색이 solid #363636(stroke-300)으로 다른 인풋(.08 overlay)과 다름. 미구현 컴포넌트.
- **missing-component** · *구조/치수* — Figma: 톱바 height 56 · 우측 정렬(gap 12) · '확장 프로그램 설치'(투명+rgba(white)0.24 보더·h34·radius100) + '로그인'(bg #66FF4B·글자 #121212·h34·radius100) · 둘 다 텍스트 14/SemiBold/130%/-2.5% | 구현: MISSING (톱바 컴포넌트 미구현 · widgets 부재)  (search / `2551:20023 / 2087:38851 / 2087:40129 (Frame 2085668923, layout_BHSTSG h56)`)
  - 상단 톱바(h56·확장설치/로그인 pill 페어) 미구현. 확장설치 pill 보더가 rgba(white).24(--color-border-strong)인 점 주의 — Secondary 버튼 기본 보더 0.12와 다름(요금제 outline과 동일 0.24).

### stepper (1)
- **missing-component** · *segment dims / colors* — Figma: 세그먼트 4개, 각 40×4, radius100. active=#66FF4B, inactive=#434343 (1/4→1개·2/4→2개·3/4→3개·4/4→4개 active) | 구현: MISSING (진행바/stepper 컴포넌트 없음)  (onboarding / `2087:8489~8492 등 (layout_LSUTYJ)`)
  - 온보딩 4단계 상단 진행 인디케이터(40×4·radius100·active #66FF4B·inactive #434343)가 4프레임 전부에 존재하나 파운데이션에 progress/stepper 컴포넌트 자체가 없음. inactive 색 #434343도 토큰 미등재(stroke-400 #4E4E4E와 다름).

### dropdown (1)
- **missing-state** `[mvp-out]` · *item height/pad/radius/typo/selected/unselected color* — Figma: h28 · pad 2/6 · gap3 · radius 4(일부 3) · 텍스트 Regular 13/130%/-2% · 선택 bg rgba(255,255,255,0.06)+글자 #FAFAFA · 비선택 글자 #999999 | 구현: item h28~32 · radius4 · hover bg .06 · selected = 흰배경 #FAFAFA + 다크글자 SemiBold · 텍스트 모두 primary #FAFAFA  (content-detail-ai / `I2278:132948;1799:23014~23022 (Frame 2085667409~12)`)
  - [mvp-out] ★선택 표현 불일치: Figma AI 메뉴 선택항목 = bg rgba(255,255,255,0.06)+#FAFAFA(=구현의 hover 색을 selected에 사용), 구현 selected = 흰배경+다크글자. 또 비선택 항목 글자 #999999(dim) vs 구현 전부 #FAFAFA → 비선택 dimmed state 누락. 텍스트 weight도 Regular(구현 selected는 SemiBold).

### card (1)
- **missing-component** `[mvp-out]` · *borderRadius / boxShadow / size* — Figma: radius 10px · border rgba(255,255,255,0.12) 1px · bg #1F1F1F · shadow '0px 8px 24px 0px rgba(0,0,0,0.48), 0px -2px 8px 0px rgba(0,0,0,0.24)' · 442×502 | 구현: MISSING (card radius 12 / modal radius 12 · 두 shadow 모두 상이)  (dashboard / `2278:135560 (AI 어시스턴트 Pro 팝오버 카드)`)
  - [mvp-out] Pro 업셀 팝오버(coachmark)는 radius 10 + 보더 0.12 + 2-레이어 강한 그림자(0.48/0.24)로 card(radius12·bg 0.04)·modal(radius12·shadow-modal) 어디와도 불일치 → 신규 'popover/coachmark surface' 컴포넌트 + --shadow-popover 토큰 누락. surface #1F1F1F는 surface-100과 일치.

## 🟡 MED (66)

### button (18)
- **missing-size** · *width* — Figma: 128px (height 42, gap 12, radius 6) | 구현: 108px (--size-button-compact-w)  (onboarding / `2087:10972 / 2087:10973 (layout_8YZ466)`)
  - 확장설치 모달의 이전/다음 페어 버튼 width=128. 온보딩 1~4단계 이전/다음 페어는 width=108(layout_6L0O21/31JLS1 등에서 확인). 즉 compact width가 108·128 2종 존재 → 구현은 108만. 128px 누락.
- **missing-variant** · *variant (소셜 버튼)* — Figma: h42, pad 18×14, radius6, bg #242424(solid), 텍스트 #FAFAFA 14·160%(아이콘 좌측). = 다크 채움 버튼 | 구현: 근사: secondary=투명+border, primary=네온. #242424 solid-fill 다크 버튼 변형 없음  (onboarding / `2087:8450/8458/8461 (layout_GHCBH3/0CTT8X)`)
  - 소셜로그인 버튼은 bg #242424(solid surface-200)+텍스트 #FAFAFA+1px border 없음(이메일 인풋과 동일 폼). 구현 button variant(Primary 네온 / Secondary 투명보더 / Tertiary ghost)엔 'solid 다크(#242424) 버튼' 없음 → 소셜 버튼 변형 누락. 치수(h42/radius6)는 일치.
- **wrong-value** · *padding* — Figma: 8px 16px | 구현: medium/small 모두 0 18px(padX18)  (home / `2087:69675 / 2087:69673 — layout_90QNK2`)
  - 34px pill 버튼 패딩 8/16. 구현 button .medium/.small은 padX 18, .pill.medium/.small은 8/16(이건 일치). 단 34px 사이즈 자체가 없어 매핑 불가.
- **missing-size** · *variant=primary-pill (bg/text)* — Figma: bg #66FF4B · text #121212 · radius 100 · h34 | 구현: primary bg #66FF4B✓ / text #242424(on-primary) · pill radius100✓ · h34 MISSING  (home / `로그인 2087:69675 fill_UX0181 / text 2087:69677 fill_Z8EJBJ`)
  - 로그인=네온 Primary pill. 색은 brand·radius pill 토큰으로 표현 가능하나 h34 없음. 글자색 측정 #121212(=on-primary-alt)인데 .primary는 기본 #242424 사용.
- **missing-size** · *variant=secondary-pill (border/bg/text)* — Figma: 투명 bg · border rgba(255,255,255,0.24) 1px · text #FAFAFA · radius 100 · h34 | 구현: secondary border 0.12 / .pill.secondary border 0.24✓ · h34 MISSING  (home / `확장 프로그램 설치 2087:69673 strokes fill_D2YZ8T / text fill_D97L5M`)
  - 확장설치=outline pill. 보더 0.24는 .pill.secondary와 일치하나 height 34px 변형 부재. 기본 .secondary 보더는 0.12로 다름(이 버튼은 0.24).
- **wrong-value** · *borderRadius* — Figma: 8px | 구현: 6px (--radius-sm)  (content-detail / `2087:12635 / 12639 (원본 링크·좋아요)`)
  - 본문 액션 버튼 radius=8. 구현 button radius는 6 고정(.button{radius-sm}). GNB '컨텐츠 추가'도 r8. 34px 버튼군은 radius 8 계열.
- **wrong-value** · *border(stroke)* — Figma: solid #363636 1px (투명 배경) | 구현: rgba(255,255,255,0.12) (.secondary border-color)  (content-detail / `2087:12635 / 12639`)
  - 본문 secondary형 버튼 보더가 solid #363636(=stroke-300)인데 구현 Secondary는 반투명 흰 .12. 화면별 secondary 보더색이 갈림 → 별개 변형 또는 토큰 정정 필요.
- **missing-variant** · *fill/radius* — Figma: fill #333333(solid 회색) · radius 7px · h38 · pad 10/18 · 라벨 14/600 #FFFFFF | 구현: 솔리드-회색 변형 MISSING; radius 38px 버튼 구현은 6px  (content-detail / `2557:23065 / 2087:14298 ('작성' 버튼_38px_Short, comp 802:713)`)
  - 댓글 작성 CTA가 solid #333333 채움 + radius 7. 구현엔 회색 솔리드 변형 없고 radius도 6. r7은 비정준 1px 오차로 보이나 채움색 #333333 변형 자체가 누락.
- **missing-component** `[mvp-out]` · *send button box size* — Figma: 32×32 · pad 6 · space-between · 아이콘(전송) | 구현: MISSING  (content-detail-ai / `2278:132332 (Frame 2085669190, layout_4DDWFT)`)
  - [mvp-out] 프롬프트 전송 버튼 32×32 icon-only. 구현에 전용 send 버튼/icon-button 컴포넌트 없음.
- **missing-size** · *height* — Figma: 36px (frame 136×36, padding 9/14, gap 10) | 구현: MISSING (구현 버튼 height = 42 lg / 38 sm 2종뿐 — 36px 없음)  (extension / `2074:88359 / 2074:88301 / 2074:88331 / 2074:88441`)
  - 확장 팝업 메인 CTA 칩버튼 height 36px. 단 이 인스턴스는 SF Pro Bold 13/130%/-2.5%·#66FF4B bg·#000 글자로 *브라우저 확장 팝업 내부* UI(웹앱 토큰 아님). 그래도 36px·fontSize13·글자색 #000000은 구현 button(15/14·#242424/#121212)과 불일치. 확장 popup 전용 사이즈로 별도 정의 필요.
- **wrong-value** · *fill / borderRadius* — Figma: fill #333333 (solid gray) · borderRadius 7px · h38 · pad 10/18 · gap6 · 글자 14/600/130% | 구현: radius 6px · Primary=#66FF4B / Secondary=투명+보더 (#333 solid 변형 없음)  (library / `2117:22120 (버튼_38px_Short '작성')`)
  - INSTANCE componentId 802:713. 실측 radius=7px(구현 6). 채움 #333333 = brand도 secondary 투명도 아님 — '솔리드 그레이(neutral solid)' 버튼 변형이 구현에 없음. 글자 fill_4DERBH(흰).
- **missing-size** · *height / padding / border / radius* — Figma: h34 · pad 8/14/8/11 · border #363636 1px · radius 8 · 글자 15/500/-2% | 구현: secondary: h42/38 · border rgba(white,0.12) · radius 6  (library / `2117:20175 (원본 링크) · 2117:20179 (좋아요)`)
  - 상세 헤더 아웃라인 액션 버튼(원본링크/좋아요)이 h34·radius8·solid #363636 보더. 구현 Secondary 보더는 rgba(white,0.12)(투명도)·h42/38. h34 outline 버튼 변형 미구현.
- **missing-size** · *padding / radius* — Figma: padding 8px 16px · radius 100px · gap 10px (layout_G6AJZ4) | 구현: pill 변형 padding 8/16 ✔, radius 100 ✔ — 단 height 34 미지원  (search / `2551:20025 / 2551:20027 (톱바 pill)`)
  - pill 변형의 pad/radius는 일치하나 적용 height(34)가 없어 실제 톱바 pill을 재현 불가. height 34 추가 시 해소.
- **missing-variant** · *padding / radius* — Figma: padding 14px 16px · radius 80px · bg #66FF4B · 글자 #000000 · 14/600/130%/-2% (layout_9F3O6P·style_FVSDSD·fill_N7TZPR) | 구현: MISSING (h34 없음; radius 80은 --radius-search 토큰만 존재, 버튼엔 미적용; 글자색 #000 미정의)  (search / `2087:40411 (검색하기 — 검색바 임베드 CTA)`)
  - 검색바 우측 임베드 검색하기 버튼 = h34·radius 80(완전 pill)·네온bg·글자 #000000. 버튼 글자색 토큰은 #242424/#121212뿐 → #000000(fill_N7TZPR) 변형 부재. radius 80 버튼 변형도 부재.
- **missing-size** `[mvp-out]` · *height / radius* — Figma: h34 (layout_ETSAQ1 · pad 6/16) · radius 8 · brand #66FF4B · 라벨 Body3/Semibold(14/160%/-2%) on #000000 | 구현: height MISSING(34) · radius 8 = --radius-md(있음) · 라벨 14 SemiBold lh160(button-sm는 lh130)  (dashboard / `I3252:6867;1613:11280 ('컨텐츠 추가' Button/Box)`)
  - [mvp-out] GNB CTA도 34px height(단 radius는 6/100 아닌 8, pad 6/16). 라벨 line-height 160%(Body3/Semibold) — 구현 button-sm는 130%. 34px height + radius8 + lh160 조합 = button에 없는 사이즈/형상.
- **wrong-value** `[mvp-out]` · *borderRadius* — Figma: 8px | 구현: var(--radius-sm)=6px (.button)  (payment / `2278:126233 (안전하게 결제하기 CTA)`)
  - [mvp-out] 결제 CTA radius 8px. 파운데이션 버튼 radius 6px. 결제 섹션 버튼은 radius 8 일관(아래 영수증·홈 버튼도 8) → 결제 버튼 radius 미스매치.
- **wrong-value** `[mvp-out]` · *height + borderRadius + width* — Figma: height 42px, radius 8px, width 328px fixed | 구현: height 42 (일치) / radius 6 (불일치) / compact-w 108 (328 없음)  (payment / `2278:126347·126354 (Case1) / 2278:126466·126473 (Case2)`)
  - [mvp-out] 영수증다운로드/홈으로돌아가기 버튼: height 42 일치, radius 8(파운데이션 6 불일치). width 328은 2-컬럼 동등분할(고정폭이 아닌 grid) — 파운데이션 compact 108과 무관, fullWidth/grid로 처리 가능.
- **missing-variant** `[mvp-out]` · *variant (secondary fill+border)* — Figma: bg #242424 (fill_7AW9BJ) + border rgba(255,255,255,0.1) + 글자 #FAFAFA | 구현: .secondary: bg transparent + border rgba(255,255,255,0.12) + #FAFAFA  (payment / `2278:126347 (영수증 다운로드 — Secondary)`)
  - [mvp-out] 결제 완료 '영수증 다운로드' 세컨더리 버튼은 투명이 아니라 솔리드 #242424 면색 + 보더 0.10. 파운데이션 .secondary는 투명+0.12 보더. 솔리드-세컨더리 변형 미존재.

### chip (8)
- **missing-state** · *selected fill / state* — Figma: 정적 export에 selected(채움) 칩 부재 — 모든 칩이 default(strokes만, fills 없음). 복수선택 화면에도 채움/체크 칩 미노출 | 구현: selected = 브랜드 보더+글자(채움 미정, gap 표기)  (onboarding / `Component 16~27 등 전체 칩 인스턴스`)
  - 전수 확인 결과 온보딩 4프레임 어디에도 선택된 칩의 채움색이 정적으로 export되지 않음 → 구현의 selected 채움 미측정 gap이 정당함을 *확증*. 추가로 복수선택(3/4)인데도 다중선택 어피던스(체크마크/카운터)가 프레임에 없음. 디자인 측 selected 스펙 부재가 근본 원인.
- **missing-state** · *add-chip active(input) state* — Figma: width 193(고정 확장)×h28, bg #242424, border rgba(white,.08), 내부에 '+'아이콘 + 텍스트커서(Rectangle 1.25×16 #FAFAFA) + placeholder '입력 후 Enter로 추가해 보세요.' Cap1_Rg 13 #999999 | 구현: MISSING  (content-add / `2384:141378 (layout_Y8OKU7, 193×28) / I2384:141427;...141346 (layout_RHU4NQ)`)
  - 추가칩이 클릭되면 인라인 텍스트 입력(커서+placeholder)으로 확장. 구현 칩에 입력형 active 상태 없음.
- **missing-variant** · *height/fill/text* — Figma: h28 · pad 10 · radius 6 · fill rgba(255,255,255,0.06) · 텍스트 13/400/160% #B4B4B4(또는 #CECECE) | 구현: chip default h42/투명/15·600 또는 recommend h32/pill — 28h·.06채움·13/400 태그칩 변형 없음  (content-detail / `2087:12572 / 12574, 12695/12697(유사카드)`)
  - 콘텐츠 메타 태그칩(h28·surface-hover .06 채움·13/400)이 구현 chip(default 42 보더형 / recommend 32 pill)과 다른 제3 변형. 상세·유사콘텐츠 카드에서 반복.
- **missing-component** `[mvp-out]` · *size/padding/radius/typo/hover* — Figma: 422×32 · pad 8/10 · gap6(icon+text) · radius 8px · 텍스트 Medium 15/130%/-2% #FAFAFA · hover bg rgba(255,255,255,0.04) | 구현: chip default(h42/radius6/15-600) · recommend(h32/radius100/14-500)  (content-detail-ai / `2660:18523/18521/18522 (Component 25/26/27) · 2278:134220 (hover)`)
  - [mvp-out] 칩처럼 보이나 실제는 menu-item형(가로 fill 422·radius8·icon+text). 구현 chip 2변형 어디에도 매칭 안됨: h32는 recommend와 같으나 radius=8(recommend=pill100), weight=500/size15(recommend=14). hover 채움=ghost .04.
- **missing-size** · *size / border / radius / padding* — Figma: 82×38 · border rgba(255,255,255,0.08) 1px · radius 4 · padding 10/26 · 글자 14/400/130% #FAFAFA | 구현: MISSING — 타임코드 입력 칩(h38·radius4) 변형 없음  (extension / `2074:88546 / 2074:88549`)
  - 영상 트림 구간 시작/끝 타임코드 칩 = 82×38·radius4(★4, 칩/버튼 표준 6과 다름)·border.08·pad10/26. 클립 모달(u3/u6) 전용 위젯. 파운데이션 칩/인풋에 h38·radius4 변형 없음. u6 서브-spec에서 정의 필요.
- **missing-variant** · *size / fill / typo* — Figma: h28 · radius6 · pad10 · gap10 · fill rgba(255,255,255,0.06) · 글자 13/400/160%/-2% | 구현: chip default h42 (또는 recommend h32 pill) — h28 카드태그 변형 없음. badge.neutral은 #2E2E2E solid  (library / `2117:22069/22071 (업무생산성) · 2117:20919 · 2117:22177`)
  - 카드 내부 태그 칩(거의 모든 카드 반복): h28·radius6·반투명 흰 .06·13/400. 구현 chip(42/32)·badge(#2E2E2E)와 치수·채움 모두 다른 별개 변형. dedup 후 1종으로 기록.
- **missing-variant** · *height / padding / radius / bg / border + 카운트 트레일링* — Figma: h32 · padding 10/12/10/10 · radius 100 · bg rgba(255,255,255,0.04) · border rgba(255,255,255,0.08) · 라벨 14/Medium/#FAFAFA(style_BUQSQ5) + 카운트 14/Regular/#B4B4B4(style_ZIAF5E) · gap 4 (layout_APFGHT·fill_ER4C54·fill_JESHQU) | 구현: recommend chip과 동형(h32/pill/0.04/0.08) — 단 '카운트 숫자 트레일링' 슬롯·선택(active)상태 미정의  (search / `2087:38908·38919·38926·38933·38939·38946 (Youtube16/Long Black8/Medium6/Tistory6/EO planet2/Publy2)`)
  - 출처 필터칩 = recommend chip 폼팩터 + 우측 카운트(B4B4B4) 트레일링. 칩 컴포넌트에 trailing 카운트 슬롯 부재. 이 프레임에선 6개 모두 비선택(채움 없음) → 선택 채움색은 여기서도 미측정(기존 chip selected gap 지속).
- **missing-variant** `[mvp-out]` · *height / fill / padding* — Figma: h28 · pad 10(전방향, layout_DBWYTE) · radius 6 · bg rgba(255,255,255,0.06) · 라벨 13/400/160%/-2% #B4B4B4 | 구현: chip default h42 / recommend h32 (h28 채움형 없음)  (dashboard / `2087:43919/43921 (인사이트 카드 '업무생산성' 태그칩)`)
  - [mvp-out] 대시보드 카드 내 채움형 태그칩 = h28·bg overlay-white 0.06·radius6·텍스트 13px #B4B4B4. 구현 chip은 default(42, 투명 보더)·recommend(32, pill ghost) 2종뿐 → 28px '채움 solid 태그칩' 변형 누락. badge.neutral(13/#2E2E2E)와도 다른 면색(0.06).

### input (7)
- **missing-size** · *height / border / bg* — Figma: height 64, padding 10px 12px, radius 6, border #363636(solid 1px), bg 투명, placeholder #999999 14·160% | 구현: MISSING (input default h42/bg#242424/border rgba(white).08 · search h48 — h64 textarea형 없음)  (onboarding / `2087:9224 (layout_Z3XTJ8), placeholder 2087:9225 textStyle B1_Rg`)
  - 관심분야 직접입력용 큰 텍스트필드: h64·border #363636(solid, rgba 아님)·bg 투명 — 구현 input 2종(42 default/48 search)과 치수·border 모두 다름. textarea/large-input 변형 누락. border가 solid #363636(=stroke-300)인 점이 구현의 overlay-white .08 border와 상이.
- **wrong-value** · *border color / layout / height* — Figma: border 1px #363636 (Dark-Stroke-300, 솔리드), column align-stretch, padding 14(전방향), gap10, w530, radius6, 멀티라인 URL 텍스트 13/130%/-2% #FAFAFA (붙여넣은 링크 표시 영역, 고정높이 아님) | 구현: input .wrapper border rgba(255,255,255,0.08), row, h42 고정, padX14  (content-add / `2087:33541 (layout_91R8OE, strokes fill_MEV76G)`)
  - 링크 입력 박스 보더 실측 = 솔리드 #363636(구현 rgba(white,.08)와 다름). 또 단일행 인풋이 아니라 column·멀티라인 텍스트 영역(URL 여러 줄). 구현 input(row/h42) 구조와 불일치 — textarea성 변형 필요.
- **missing-size** `[mvp-out]` · *input box size/surface/border/radius + placeholder type* — Figma: 418×132 · bg #1F1F1F · border rgba(255,255,255,0.12) 1px · radius 10px · placeholder Medium 15/160%/-2% #999999 | 구현: input(default h42 bg#242424 border.08 radius6) / search(h48 radius80 bg#1F1F1F)  (content-detail-ai / `2278:132281 (Rectangle 3466213) / 2278:132282 (placeholder)`)
  - [mvp-out] 멀티라인 프롬프트 입력(고정 132px). 구현 input 2종(42/48)에 없음. border=.12(구현 input은 .08), radius 10(미존재). placeholder 색 #999999=tertiary 일치. bg #1F1F1F=surface-100.
- **missing-size** `[mvp-out]` · *icon button box size* — Figma: 32×32 · pad 10 · 정사각 아이콘 버튼 (아이콘_더하기 등) | 구현: MISSING (버튼 변형에 32px 정사각 icon-only 없음)  (content-detail-ai / `2278:132315/132319 (Frame 2085669173/77, layout_7LAVKG)`)
  - [mvp-out] 입력 하단 툴바의 첨부(+)·보조 액션 = 32×32 icon-only 버튼. 구현 버튼은 42/38 텍스트형뿐, icon-only square 변형 없음.
- **wrong-value** · *height / padding / radius / border* — Figma: h38 · pad 10/14 · radius 100 · border rgba(255,255,255,0.1) 1px · placeholder 14/-2% (style_CY8J0I) | 구현: search: h48 · pad 0/20 · radius 80 · border rgba(white,0.10) · 15px placeholder  (library / `2117:22132 (Frame 2085669039)`)
  - 라이브러리 우측패널 검색바는 h38·radius100·pad10/14·placeholder 14px. 구현 search 변형(홈 측정 기반 h48·radius80·15px)과 다름 — 라이브러리 검색은 더 작은 h38 컴팩트형. (홈 검색바와 별개 컨텍스트)
- **missing-state** · *선택(query) 상태 padding* — Figma: 8px 20px (좌우 20 대칭) · h48 · radius 80 · bg #1F1F1F · border 0.10 · 내부: GNB아이콘18 + 쿼리텍스트15/Regular#FAFAFA + 닫기Icon16(componentId 1230:5857) | 구현: search 변형 padding 0 20 ✔ height/bg/border ✔ — 단 '선택된 쿼리칩 + 닫기(X) 아이콘' 상태 UI 부재  (search / `2087:38859 (layout_XDZUEK) / 2087:40137 (layout_3DWVMY)`)
  - 검색 결과/결과없음 화면의 검색바는 placeholder가 아니라 입력된 쿼리(아이콘+텍스트+우측 X 제거버튼)를 표시하는 'filled/selected' 상태. input 컴포넌트에 좌측 아이콘 슬롯은 있으나 우측 dismiss(X) 트레일링 슬롯/선택값 표시 상태 미구현.
- **wrong-value** `[mvp-out]` · *borderRadius* — Figma: 8px | 구현: var(--radius-sm)=6px (.wrapper)  (payment / `2278:126150 (카드번호)·126159 (만료일)·126164 (CVC)·126169 (소유자명)`)
  - [mvp-out] 결제 텍스트 인풋 4종 모두 radius 8px. 파운데이션 input default radius 6px. 결제 인풋 radius가 8 → 미스매치(8px 변형 없음).

### other (7)
- **missing-size** · *title size / subtitle color* — Figma: 타이틀 36px·600·130%·-2% (예: '어떤 일을 하고 계신가요?'). 서브 16·400·160%·-2% 색 #CECECE | 구현: title 토큰 최대 32(title-1) — 36px 부재. 서브색 #CECECE 토큰 미등재(#DBDBDB/#B4B4B4만)  (onboarding / `style_P7SYD6(타이틀) / style_357ZN9·8N7IR2(서브)`)
  - 온보딩 4단계 질문 타이틀이 36px(토큰 title-1=32px 초과 → 36px 누락). 서브텍스트 색 #CECECE는 tokens.css 그레이스케일 미등재(gray-600 #DBDBDB와 gray-500 #B4B4B4 사이). 구글계정 화면(2087:6043)은 Google 네이티브 OAuth라 DS 대상 외.
- **missing-component** · *dimensions/fill* — Figma: 44x44 · radius 21(원형) · fill #1F1F1F · border rgba(255,255,255,0.08) 1px · 내부 Sparkle 24 | 구현: MISSING — FAB/원형 아이콘버튼 컴포넌트 없음  (content-detail / `2087:13352 / 2278:134997 / 135003`)
  - AI(Sparkle) 플로팅 액션 버튼. 원형 44px 아이콘버튼이 디자인시스템 컴포넌트에 없음(button은 inline-flex 사각형만).
- **missing-component** `[mvp-out]` · *container size + surface + border + radius* — Figma: 442×990 · bg #171717 · border rgba(255,255,255,0.12) 1px · radius 10px · 우측 고정(x:1462,y:82) | 구현: MISSING  (content-detail-ai / `2278:132278 / 2278:132279 (Rectangle 3466212)`)
  - [mvp-out] 콘텐츠 상세 우측 AI 어시스턴트 패널. 파운데이션(shared/ui)에 패널 셸 컴포넌트 없음. radius 10은 토큰에 없음(현 카드=12, 버튼/인풋=6). 컨테이너 surface=#171717(=surface), border=border-chip(.12).
- **missing-variant** `[mvp-out]` · *trigger surface/border/typo* — Figma: 고스트(배경·보더 없음) · 'GPT-4.1 mini' Medium 14/130%/-2% #B4B4B4 + 화살표 아이콘 | 구현: dropdown trigger h38 · radius6 · bg surface-ghost(.04) · border 미정  (content-detail-ai / `2278:132331 / 2278:133580 (Component 15, 1799:23054)`)
  - [mvp-out] AI 모델 트리거는 테두리·배경 없는 텍스트+chevron형. 구현 dropdown trigger(h38/bg.04/radius6)와 형태 다름 → ghost(borderless) trigger 변형 누락. 텍스트 색 #B4B4B4(secondary).
- **missing-component** `[mvp-out]` · *message typo + markdown* — Figma: Medium 15/160%/-2% #FAFAFA · 굵게 weight 700({ts1} 헤딩)·본문({ts2}) · 말풍선 없음(plain) · width 402 | 구현: MISSING (markdown 렌더 텍스트 컴포넌트 없음)  (content-detail-ai / `2278:133601 (markdown 응답)`)
  - [mvp-out] 어시스턴트 답변 = 배경 없는 마크다운 텍스트(불릿/볼드). 본문 15/160%, 볼드 700. 전용 메시지 텍스트 컴포넌트 없음.
- **missing-component** · *size / radius / fill / border* — Figma: 44x44 · radius 21px · pad9 · fill #1F1F1F · border rgba(255,255,255,0.08) 1px | 구현: MISSING (플로팅 액션/AI 버튼 컴포넌트 없음)  (library / `2117:25131 · 2117:23133 (Frame 2085669204)`)
  - 우하단 AI Sparkle 플로팅 버튼 44x44·radius21(거의 원형)·#1F1F1F·border .08. 파운데이션에 FAB/circular-icon-button 없음. 인사이트·드롭다운 프레임에 등장.
- **missing-component** `[mvp-out]` · *size / shape / fill* — Figma: 44×44 (layout_22AR0K/5HJSQA) · pad 9 · radius 21(원형) · bg #1F1F1F · border rgba(255,255,255,0.08) 1px · 내부 Sparkle 24px | 구현: MISSING (icon-only 원형 FAB 컴포넌트 없음)  (dashboard / `2278:135613 / 2278:135416 (Sparkle FAB)`)
  - [mvp-out] AI 어시스턴트 호출 원형 FAB(44px·radius21·#1F1F1F·border 0.08·아이콘 24). 구현 button/모달 어디에도 icon-only 원형 FAB 폼팩터 없음 → 신규 컴포넌트. 두 프레임 공통 셸 요소.

### shell (5)
- **missing-component** · *card dims / inline premium badge* — Figma: 프로필카드 226×50, radius10, border rgba(255,255,255,0.08), pad 8×12. Premium 인라인 = mdi:thunder 아이콘 + 텍스트 12·400·130%·-2.5% 색 #199E41 | 구현: badge.premium.inline = #199E41 (premium-green) — 색 일치 / 프로필카드 컴포넌트는 미구현(widgets 공백)  (onboarding / `I2074:87941;1306:4235 (layout_ABIMB4), Premium I2074:87941;1306:4243 (style_YHCW34)`)
  - Premium 인라인 배지 색(#199E41)은 구현 badge.premium과 일치(우수). 단 프로필 카드(radius10·border.08·226×50·Premium 동반) 자체는 widgets 미구현. radius10은 토큰에 직접 없음(--radius-md=8, --radius-lg=12 사이).
- **missing-state** · *nav 항목 '대시보드' 존재* — Figma: 대시보드 nav item 존재 (icon/dashboard + Body3/Regular) | 구현: 파운데이션 요지: '대시보드 탭❌'  (home / `I2087:70381;1613:10936 (대시보드)`)
  - 파운데이션 노트는 GNB에 대시보드 없음(홈/검색/라이브러리/수신함)이라 명시했으나 Figma GNB에는 대시보드가 홈·검색·라이브러리 다음, 수신함 앞에 실재. 스펙 불일치 — 구현 시 포함 여부 확정 필요.
- **missing-size** · *GNB CTA button size/radius/color* — Figma: 녹색 full-width 버튼: w226 h34, bg #66FF4B, radius 8, padding 8/10/8/6, '+'아이콘+'컨텐츠 추가' SemiBold 14/130%/-2.5% #121212(글자) | 구현: button에 h34·radius8 변형 없음(42/38·radius6만). GNB 위젯 미구현  (content-add / `2087:32079 (Frame 4, layout_D2E6XC) / 2087:32082 text`)
  - ★콘텐츠추가 진입점 = GNB 상단 녹색 버튼 h34·radius8. 구현 button(42/38·radius6)에 없음. widgets/ 비어있어 셸 자체 미구현(layout-diff 동반). 글자 #121212.
- **missing-component** · *card/dimensions* — Figma: 226x50 · pad 8/12 · radius 10 · border rgba(255,255,255,0.08) 1px · 아바타 28 · 이름 14/400 · Premium 12 | 구현: MISSING(셸 미구현)  (content-detail / `I2087:13351;1306:4235`)
  - GNB 상단 사용자 프로필 카드(28px 아바타+Premium 인라인 배지+펼침 화살표). 셸 위젯 부재로 전체 미구현.
- **layout-diff** · *nav 항목 존재여부* — Figma: GNB nav = 홈·검색·라이브러리·대시보드·수신함 (대시보드 포함, componentId 675:643) | 구현: 파운데이션 요지: GNB = 홈/검색/라이브러리/수신함 (★대시보드 탭❌ 명시)  (search / `2087:40750·40751 / 2087:40037·40038 / (결과없음 동일) — 'text: 대시보드'`)
  - 검색 3개 프레임 GNB 모두 '대시보드' nav 항목을 포함(홈↔라이브러리↔대시보드↔수신함 순서). 파운데이션은 대시보드 제외를 명시 → Figma SoT와 충돌. 스코프 결정 필요(왜=문서가 제외라면 의도적 제외일 수 있으나, 무엇=Figma엔 존재).

### card (5)
- **missing-variant** · *size / radius / fill* — Figma: 160x160 고정 · radius 16px · bg rgba(255,255,255,0.04) · 폴더명 16/500 · count 14/400 · 폴더추가 카드는 동일 박스 내 네온12% pill | 구현: card radius=12 (lg) · flush=투명 · compact 18/14 — radius16 폴더카드 변형 없음  (library / `2117:22144/22151/22158 (160x160)`)
  - 폴더 그리드 카드 radius=16px(구현 card는 12). 160x160 정사각·bg .04. 구현 card radius 토큰(xl=16 존재하나 card 컴포넌트엔 lg=12만 적용). 폴더카드 = radius16 신규 변형.
- **wrong-value** `[mvp-out]` · *background fill* — Figma: #1A1A1A (fill_QBEA8X, solid) | 구현: var(--color-surface-ghost) = rgba(255,255,255,0.04) overlay  (payment / `2278:126133 (결제수단+카드정보 카드) / 2278:126182 (주문 요약 PaymentPage)`)
  - [mvp-out] 결제 카드는 불투명 솔리드 #1A1A1A 면색. 파운데이션 card.module.css는 overlay-white 0.04. 결제 섹션 카드 면색이 다름 → 신규 surface 토큰(#1A1A1A) 또는 card variant 필요.
- **wrong-value** `[mvp-out]` · *background fill* — Figma: #1A1A1A (fill_ANMA3A / fill_E8TKUY) | 구현: rgba(255,255,255,0.04) overlay  (payment / `2278:126262 / 2278:126381 등 거래내역·기능 카드`)
  - [mvp-out] 완료화면 거래내역/기능 카드도 솔리드 #1A1A1A. 영수증 안내 카드(2278:126336·126455)는 #242424(fill_7AW9BJ)로 또 다름 → 결제 섹션이 #1A1A1A·#242424 두 솔리드 카드 면색 사용.
- **wrong-value** `[mvp-out]` · *padding* — Figma: 24.9px (≈25px) 상·좌·우 (layout_GQHCX8 pad 24.9), 주문요약 카드 inset 24.9 | 구현: var(--space-10)=20px (.card) / 18·14 (.compact)  (payment / `2278:126133 (layout_GQHCX8) / 2278:126182 (layout_RBPNTB·541J0R)`)
  - [mvp-out] 결제 카드 내부 인셋은 ≈25px(24.9). 파운데이션 card 패딩 20(기본)/18·14(compact)에 25px 없음. 신규 카드 pad variant 필요.
- **wrong-value** `[mvp-out]` · *background fill + borderRadius* — Figma: #242424 (fill_7AW9BJ), radius 8px, border rgba(255,255,255,0.1) | 구현: card: bg 0.04 / radius 12 (--radius-lg)  (payment / `2278:126336 (영수증 안내 카드) / 2278:126455`)
  - [mvp-out] 영수증 발송 안내 카드는 #242424 면색·radius 8(파운데이션 card radius 12 아님). 작은 알림형 카드 변형 미존재.

### badge (4)
- **missing-variant** · *썸네일 duration 오버레이 배지* — Figma: bg rgba(0,0,0,0.6) · radius 4 · h18 · text 11/Medium500/130%/-2.5% #FAFAFA | 구현: badge 변형 없음(neutral/inline/accent/premium/pro/violet/danger만) — MISSING  (home / `2087:72136 '11:32' — layout_RSBBK0 fill_7X6S6T style_ELBY6H`)
  - 썸네일 위 재생시간 배지(검정60% 오버레이·radius4·11px). 구현 badge에 overlay 변형 부재. overlay-black-60·radius-xs 토큰은 있으나 컴포넌트 미연결.
- **missing-variant** · *shape/fill/border* — Figma: (A) r4 · pad 10/5 · rgba(0,0,0,0.6) · 11/500 #FAFAFA  (B) pill r100 · pad 6/10 · rgba(0,0,0,0.6) · 1px #585858 보더 · blur(2px) · 13/400 | 구현: badge=Tag solid #2E2E2E / inline 라벨만 — 오버레이 카운트 배지(black .6) 변형 없음  (content-detail / `2087:12551 (목록형 r4), 12588(원형 카드 pill)`)
  - 섬네일 위 그랩수/duration 오버레이 배지(검정 .6 반투명, blur, 일부 #585858 보더 pill)가 badge 컴포넌트에 없음. 섬네일마다 등장하는 빈출 패턴.
- **missing-variant** · *padding / bg / 색 / height* — Figma: h28 · padding 10px(전방향) · radius 6 · bg rgba(255,255,255,0.06)(fill_1MB0O3/fill_JR3MBS) · 텍스트 13/Regular/#999999(style_M4JLNK) 또는 #CECECE(fill_NBD3P6/fill_ZJAOYY) | 구현: badge neutral: bg #2E2E2E · 글자 #B4B4B4 · padding 4/10 · radius 6 · 13/Regular/150%  (search / `2087:40347·40349 (업무생산성) · 3253:7346 (디자인시스템) · 2087:38963 (AI/특허) — layout_POSD8T / layout_3KETKI`)
  - 카드 내 콘텐츠 분류 태그는 bg rgba(white).06(반투명)·padding 10 all·h28·글자 #999999~#CECECE. 구현 badge neutral은 solid #2E2E2E·padding 4/10·글자 #B4B4B4 → bg/패딩/색 모두 상이. '카드 태그(ghost overlay)' 변형 부재.
- **missing-variant** `[mvp-out]` · *shape / fill* — Figma: pad 4/8 (layout_RHI9Y2) · radius 100(pill) · bg rgba(255,255,255,0.06) · 라벨 13/400/160%/-2% #CECECE(fill_VBDF8Q) | 구현: badge = radius 6(Tag) 또는 inline(0). pill(radius100) 변형 없음  (dashboard / `2557:34559/34570/34579 ('상위 37%/47%/33%' pill)`)
  - [mvp-out] '상위 N%' 순위 배지는 pill(radius100) + overlay-white 0.06 면 + 텍스트 #CECECE. 구현 badge는 solid(radius6)·inline 만 → pill 형 badge 변형 + #CECECE 텍스트색/0.06 면색 누락.

### modal (4)
- **wrong-value** · *header padding / height / border* — Figma: row space-between, padding 24/24/24/28, height 66 fixed, 하단 보더 1px rgba(255,255,255,0.08), radius 12/12/0/0 | 구현: .header padding var(--space-14) var(--space-14) var(--space-6) = 28/28/6, 보더 없음, height auto  (content-add / `2087:33543 (layout_93WYA1)`)
  - 헤더 실측 padding 24/24/24/28(상24·우24·하24·좌28)·고정높이66·하단 1px 디바이더. 구현은 28/28/6·디바이더 없음. (Step2/3/4 헤더는 20/24/20/28 — 화면별 상·하 패딩이 다름.)
- **wrong-value** · *header padding* — Figma: padding 20/24/20/28 (lg 998 모달) | 구현: .header padding 28/28/6  (content-add / `2087:35078 (layout_43GRV9)`)
  - lg 모달 헤더 상·하 패딩=20·좌28·우24. Step1(sm)과도 상/하가 다름(24 vs 20). 구현 단일 헤더 패딩으론 양쪽 다 불일치.
- **wrong-value** · *title font-weight* — Figma: Bold 700, 20px, lineHeight 130%, ls -2% | 구현: .title font-weight var(--font-weight-semibold) = 600, ls var(--letter-spacing-tight) -2.5%  (content-add / `2087:33544 style_YQOWLC / 2087:35091 style_1D95HJ`)
  - 헤더 타이틀('새 클립 추가'/'컨텐츠 추가') 실측 = Bold 700·ls -2%. 구현 .title = semibold 600·ls -2.5%. weight·letter-spacing 둘 다 불일치.
- **wrong-value** · *padding / border-bottom / radius* — Figma: padding 20px 24px 20px 28px · border-bottom 1px rgba(255,255,255,0.08) · radius 12 12 0 0 · 타이틀 '컨텐츠 추가' Pretendard Bold 20/130%/-2% | 구현: header padding 28/28/12 (var-space-14/14/6) · border-bottom 없음 · 타이틀 title-4 20/130% semibold (modal.module.css)  (extension / `2074:88519 (Frame 1707482652)`)
  - Figma header는 비대칭 패딩(top20·right24·bottom20·left28)+하단 1px 디바이더 stroke rgba(white,.08)+icon dismiss(20px) 동반. 구현 header는 패딩(28 28 6)·디바이더 stroke 없음. 타이틀 weight: Figma Bold(700) vs 구현 semibold(600). 헤더 디바이더·비대칭 패딩 미구현.

### dropdown (4)
- **missing-state** · *match highlight* — Figma: 입력어 매치 부분 = #FAFAFA(흰색), 나머지(ts2 span) = #999999(회색)으로 디밍 | 구현: MISSING  (content-add / `I2384:141427;...141354 (text '개발{ts2}자{/ts2}', style ts2 fills #999999)`)
  - 자동완성 항목에서 타이핑한 매치 문자열은 흰색 유지, 비매치 부분은 #999999 디밍하는 2색 하이라이트. 드롭다운 구현에 매치 강조 없음.
- **wrong-value** `[mvp-out]` · *menu surface + border + radius + shadow + width/pad* — Figma: w193 · pad 4 · bg #282828(솔리드) · border rgba(255,255,255,0.08) 1px · radius 6 · shadow 0 0 8 rgba(0,0,0,0.07) | 구현: menu bg surface-ghost rgba(255,255,255,0.04) · border .08 · radius6 · shadow-dropdown(0 0 8 .07)  (content-detail-ai / `I2278:132948;1799:23013 (Frame 2085667415)`)
  - [mvp-out] 메뉴 면색이 다름: Figma=솔리드 #282828, 구현=반투명 ghost(.04). border/radius/shadow는 일치. AI 컨텍스트(다크 패널 위)에선 솔리드 면이 필요 — surface 토큰 #282828(=stroke-200 근사) 미반영.
- **missing-variant** `[mvp-out]` · *lock/pro inline badge* — Figma: 'Pro' 인라인 텍스트 #66FF4B (Regular 13) · GPT-5.2 Instant·Claude Sonnet 4.5 항목 우측 | 구현: badge: inline Pro #66FF4B 존재(텍스트), 단 dropdown item 내 Pro/페이월 슬롯 없음  (content-detail-ai / `I2278:132948;1799:23021 / ;1799:23025 (Pro 텍스트)`)
  - [mvp-out] 페이월 시나리오: 일부 모델에 'Pro' 라벨(#66FF4B=brand). badge 토큰엔 Pro inline(#66FF4B) 있으나 dropdown item이 우측 Pro 라벨 슬롯을 지원 안 함 → 드롭다운 항목 변형(우측 배지) 누락. 색 #66FF4B=brand-primary 일치.
- **missing-variant** · *trigger 폼팩터* — Figma: 인라인 텍스트 트리거 · gap 2 · 라벨 14/Regular/#B4B4B4(style_ZIAF5E) + 화살표 아이콘(componentId 675:463) · 배경/보더/높이 없음(hug) | 구현: dropdown trigger: h38 · padding 14/10 · radius 6 · bg rgba(255,255,255,0.04) · border 0.08 · 라벨 14/Medium  (search / `2087:38904 (최신순 + 짧은 화살표2) · layout_WX9H76 / layout_DG78JV`)
  - 정렬(최신순) 셀렉터는 배경·보더·고정높이 없는 '베어 인라인 텍스트+캐럿' 트리거. 구현 dropdown trigger는 박스형(h38/bg/border)뿐 → ghost/inline trigger 변형 부재. 라벨도 Regular #B4B4B4(구현 Medium).

### tabs (3)
- **wrong-value** · *container bg / radius* — Figma: container radius100·pad4·bg #1B1B1B(solid). item radius100·pad 4/10/4/12·gap10. selected fill #363636 | 구현: segment 컨테이너 bg=surface-ghost rgba(255,255,255,0.04)·radius100·h36 / 아이템 h28·선택 #363636  (onboarding / `2074:86756 (layout_J30RY6 컨테이너 / layout_XUISYR 아이템)`)
  - 세그먼트 컨테이너 bg가 실측 solid #1B1B1B인데 구현은 overlay-white .04. #1B1B1B는 tokens.css 미등재(surface #171717와 surface-100 #1F1F1F 사이). 선택 채움 #363636은 일치. *주로 홈셸 컴포넌트이나 가입완료 직후 첫 화면이라 온보딩 출구에서 노출됨.*
- **wrong-value** · *item padding* — Figma: 4px 12px 4px 10px (비대칭, 아이콘 동반) · container pad 4 · radius 100 | 구현: .segment .tab pad 8px 12px · radius100✓ · container pad4✓  (home / `I2173:124313;1613:11575 selected item — layout_HP9481`)
  - 세그먼트 아이템 패딩 비대칭(좌10/우12, 상하4)·아이콘+라벨 gap4. 구현은 8/12 대칭. 선택 bg #363636는 일치(fill_O2G6GC=#363636=--color-surface-tab-selected).
- **wrong-value** · *item height/padding/active* — Figma: item h56 · pad 10/20 · active 밑줄 #FFFFFF 2px(하단) · 컨테이너 하단 border #2D2D2D 1px | 구현: underline 탭 active=#66FF4B 밑줄 · pad 12/0 · fontSize 18  (content-detail / `2557:23067 (시청정보/원본소스 underline 탭)`)
  - 소셜 사이드바 underline 탭의 active 인디케이터가 흰색(#FFFFFF)·item h56·pad10/20. 구현 underline 변형은 active 네온(#66FF4B)·pad12/0. 화면별 underline active색이 흰/네온으로 갈림.

### avatar (1)
- **wrong-value** · *unselected ring color* — Figma: 비선택 외곽 ring rgba(255,255,255,0.08) 1px | 구현: .xl border 1px solid var(--color-bg) (#000000 검정)  (home / `선택 2173:125355 fill_QL81FI(2px) / 비선택 2173:125363 fill_8NFAX8(1px) — layout_UZWI46`)
  - 카테고리 아바타 82px✓·선택 링 rgba(102,255,75,0.5) 2px✓. 그러나 비선택 기본 링은 흰 8% 1px인데 구현 .xl 기본 보더는 검정(#000) 1px — 색 불일치.

## 🟢 LOW (76)

### button (12)
- **wrong-value** · *letterSpacing* — Figma: -2.5% (style_HDQB2I) | 구현: --letter-spacing-snug -2% (.button)  (home / `style_HDQB2I (톱바 14/600) · GNB CTA Body 3/Semibold`)
- **missing-size** · *width / padding* — Figma: width 156 고정, h38, padding 10/18(Step1)·75/18(Step2, 세로는 고정h38이라 무시), gap6, bg #66FF4B, radius6 | 구현: .small h38·padding 0/18·gap6 ✓ (단 고정 width 156 변형 없음)  (content-add / `2087:33546 (layout_1INQOT) / 2087:35094 (layout_5PO5JZ)`)
- **wrong-value** · *label color on primary* — Figma: #121212 (텍스트), bg #66FF4B | 구현: .primary color var(--color-text-on-primary) = #242424  (content-add / `2087:33547 fill_HAAS4H / 2087:35095 fill_2LOWBB`)
- **wrong-value** · *label fontWeight* — Figma: 500 (Medium), fontSize 15, lh 130% | 구현: 600 (semibold) — .button{font-weight-semibold}  (content-detail / `2087:12638 / 12642 / 12651 등 라벨`)
- **missing-component** · *dimensions/radius* — Figma: (A) h26 · pad 5/6 · gap3 · radius 6 (heart+count)  (B) 32px · pad 3/6 · radius 6 (아이콘만) | 구현: MISSING — 소형 아이콘버튼/아이콘+카운트 칩 없음  (content-detail / `2557:23121(h26 좋아요) / 2557:23086(32px layout-right)`)
- **wrong-value** · *font / text color* — Figma: SF Pro Bold 13px / lineHeight 130% / ls -2.5% · 글자색 #000000 | 구현: Pretendard 15(lg)/14(sm)·weight600 · 글자색 #242424(lg)/#121212(modal) (button.module.css)  (extension / `2074:88359 (style_FYHZ3E, fill_74DDN9)`)
- **wrong-value** · *padding* — Figma: padding 75px 18px (frame 156×38, gap 6, radius 6, bg #66FF4B, 글자 T2_Sb 14/600, 글자색 #121212) | 구현: small: height 38·padding 0 18·gap 6·radius 6·#121212 (button.module.css)  (extension / `2074:88535`)
- **missing-variant** · *fill / color* — Figma: fill #EFEFEF(밝은 회백) · 글자 #171717(다크) · h34 · radius100 · pad 8/14 · 14/500 | 구현: MISSING (밝은-배경 inverse pill 버튼 변형 없음)  (library / `2117:25086 (로그인 pill) · 2117:21055`)
- **wrong-value** `[mvp-out]` · *label color (on-primary)* — Figma: #121212 (fill_MMYUBF · 네온 위 다크 글자) | 구현: #242424 (--color-text-on-primary, primary 기본)  (dashboard / `2087:43975 ('로그인' Primary)`)
- **wrong-value** `[mvp-out]` · *border / fontSize* — Figma: stroke rgba(255,255,255,0.24) 1px · radius 100 · 라벨 14/600/130%/-2.5% | 구현: Secondary border=rgba(white,0.12) 기본 (pill일 때만 0.24) · font 15/100% (lg)  (dashboard / `2087:43973 ('확장 프로그램 설치' Secondary)`)
- **wrong-value** `[mvp-out]` · *label color (on brand)* — Figma: #121212 (fill_8DC7DJ) on #66FF4B | 구현: var(--color-text-on-primary)=#242424 (.primary)  (payment / `2278:126233 텍스트 fill_8DC7DJ`)
- **wrong-value** `[mvp-out]` · *label color (on brand)* — Figma: #121212 (fill_LDKDR9) on #66FF4B (fill_IUFW1K) | 구현: var(--color-text-on-primary)=#242424  (payment / `2278:126354 (홈으로 돌아가기 — Primary)`)

### modal (9)
- **extra** · *panel dims / bg / radius / shadow* — Figma: 998×731, bg #1F1F1F, radius12, shadow 0px20px48px-8px rgba(17,17,17,.24)+0px4px12px-1px rgba(0,0,0,.12)+0px0px0px1px rgba(84,72,49,.1) | 구현: modal lg=998·bg #1F1F1F·radius12·shadow-modal(3레이어 동일)  (onboarding / `2087:12474 (layout_NNUPAH/XXVF35), effect '모달'`)
- **extra** · *panel + feature list + CTA* — Figma: 패널 998×702, bg #1F1F1F, radius12, shadow '모달'. CTA 페어 128×42 radius6(나중에 하기=border .12+#FAFAFA / 설치하러 가기=#66FF4B+#242424). feature 행 pad 20×0·체크아이콘 20×20·텍스트 16·500·하단 border rgba(255,255,255,0.08) | 구현: modal lg 998·#1F1F1F·radius12·shadow-modal 일치 / CTA width 128 누락(위 finding)  (onboarding / `2087:10932 (layout_TD1IKL), CTA 2087:10972/10973`)
- **layout-diff** · *panel width* — Figma: Step1 sm = 582×364, Step2~ lg = 998×702 | 구현: .panel width:100% (max-width 미지정 — 호출측 의존)  (content-add / `2087:33536 layout_JIPVJ5 / 2087:35011 layout_S4K3TE`)
- **layout-diff** · *footer / primary action button placement* — Figma: 버튼이 모달 내부 절대배치(우하단). Step1 x402 y294 / Step2 x814 y632. 버튼 자체 width 156 고정·h38 | 구현: .footer flex justify-end gap10 padding 12/28/28  (content-add / `2087:33546 layout_1INQOT / 2087:35094 layout_5PO5JZ`)
- **missing-component** · *section label typography* — Figma: '저장 폴더'/'태그'/'인사이트' = Medium 14/130%/-2% #FAFAFA (textAlignVertical CENTER) | 구현: MISSING (modal .body는 16/24 secondary — 섹션 행 라벨 스타일 부재)  (content-add / `2087:35044 style_405MAW / 2384:142(저장폴더·태그·인사이트 라벨)`)
- **missing-component** · *callout box* — Figma: row, padding 10/12, w509 h174, border 1px #363636(Dark-Stroke-300), radius6, 본문 B1_Rg(15/160%) #FAFAFA | 구현: MISSING  (content-add / `2087:35015 (layout_PDDLSH, strokes Dark-Stroke-300)`)
- **wrong-value** · *size / bg / radius / shadow* — Figma: 998×702 · bg #1F1F1F · radius 12 · shadow 0 20 48 -8 rgba(17,17,17,.24),0 4 12 -1 rgba(0,0,0,.12),0 0 0 1 rgba(84,72,49,.1) · backdrop rgba(0,0,0,0.6) | 구현: panel bg #1F1F1F·radius12·shadow-modal(동일 3레이어)·backdrop rgba(0,0,0,.6)·lg max=998 (modal.module.css)  (extension / `2074:88452 / rect 2074:88453`)
- **wrong-value** · *size* — Figma: 20×20px (Fluent Dismiss, Size=20) | 구현: close 버튼 box 32×32 (아이콘 size 미지정) (modal.module.css)  (extension / `2074:88534 (Icon)`)
- **extra** · *presence* — Figma: MISSING (라이브러리 9프레임에 모달/다이얼로그 활성 인스턴스 없음) | 구현: modal bg#1F1F1F radius12 backdrop .6 inset28 (홈/요금제 프레임 기반)  (library / `N/A`)

### card (9)
- **extra** · *card + CTA pill* — Figma: 카드 366×520, radius12, bg rgba(255,255,255,0.04), border rgba(255,255,255,0.08). CTA pill h42·pad8×16·radius100. 베이직=outline(border rgba(255,255,255,0.24)+#FAFAFA), 프리미엄=채움 #66FF4B+#121212 | 구현: card overlay.04+border.08+radius12 (일치) / pill button radius100·pad8×16·secondary border .24 (일치)  (onboarding / `2087:12480/12504 (layout_APHK7O), CTA pill 2087:12500/12530 (layout_BOGLKN)`)
- **extra** · *bg·radius·padding* — Figma: bg rgba(255,255,255,0.04) · radius 12 · pad 18px14px · gap 10 · h160 | 구현: card.compact pad 18/14✓ · radius12✓ · bg ghost0.04✓  (home / `2087:69039 Frame 1707483238 — layout_7ZWOGP fill_2NWYC6`)
- **extra** · *radius/fill/border* — Figma: radius 12 · fill rgba(255,255,255,0.04) · border rgba(255,255,255,0.08) 1px (298x208) | 구현: card r12·bg .04·border .08 (일치)  (content-detail / `2087:12952`)
- **wrong-value** · *padding* — Figma: pad 23/28 (radius 12 · fill rgba(255,255,255,0.04)) | 구현: card pad 20(기본)/18·14(compact) — 23/28 단 없음  (content-detail / `2087:13504`)
- **wrong-value** · *radius/padding/fill* — Figma: radius 10 · pad 12 · fill rgba(255,255,255,0.04) | 구현: card radius 12 고정 — radius 10 변형 없음  (content-detail / `2557:23101`)
- **missing-component** · *size / radius / border / shadow* — Figma: 320×205 · radius 12 · border #C2C2C2 1px · shadow 0 4 20 0 rgba(0,0,0,0.2) · 내부 favicon16+텍스트(SF Pro Medium 12) | 구현: MISSING — 브라우저 확장 팝업 카드는 native Chrome UI(웹앱 card 토큰 무관)  (extension / `2074:88369 / 2074:88410`)
- **wrong-value** `[mvp-out]` · *border color + strokeWeight* — Figma: rgba(255,255,255,0.08) (fill_3CBH8O), strokeWeight 0.909px | 구현: 1px solid rgba(255,255,255,0.08)  (payment / `2278:126133 / 2278:126182`)
- **wrong-value** `[mvp-out]` · *border color* — Figma: rgba(255,255,255,0.1) (fill_9JW03M / fill_CZKAS3) | 구현: var(--color-border-subtle) = rgba(255,255,255,0.08)  (payment / `2278:126262·126300 (Case1) / 2278:126381·126419 (Case2) 거래내역·기능 카드`)
- **missing-component** `[mvp-out]` · *feature cell bg + radius + icon chip* — Figma: 셀 bg #242424 (fill_7AW9BJ) radius 8 · 아이콘 칩 rgba(255,255,255,0.06) radius 6 24x24 · 셀 pad 12/12/0/12 gap 12 | 구현: MISSING (아이콘+텍스트 feature 셀 컴포넌트 없음)  (payment / `2278:126304·126312·126320·126328 (활성화된 프리미엄 기능 4셀)`)

### shell (8)
- **wrong-value** · *color (label on neon)* — Figma: #000000 (네온 #66FF4B bg 위) | 구현: #242424(on-primary) / #121212(on-primary-alt) — 순흑 #000000 토큰 부재  (onboarding / `I2074:87941;1613:11280;1613:11114 (fill_JAEICP)`)
- **missing-component** · *우측 패널 토글 탭* — Figma: width40·h1080 · bg #121212 · radius 8 0 0 8(좌측 라운드) · 화살표 아이콘 중앙(pad 623 0) | 구현: MISSING (미구현, 컴포넌트 없음)  (home / `2087:70377 Frame 2085668535 — layout_LFLO2N radius 8px(좌측만)`)
- **wrong-value** · *close icon size* — Figma: 닫기 아이콘 20×20 (헤더 우측, 별도 버튼 박스 없이 아이콘만) | 구현: .close 32×32 버튼(hover bg)  (content-add / `2087:33545 / 2087:35093 (Icon, componentId 1230:5853, layout 20×20)`)
- **extra** `[mvp-out]` · *badge inline color/typo* — Figma: 'Premium' #199E41 · Regular 12/130%/-2.5% · 번개 아이콘(thunder) 12×12 동반 | 구현: badge inline Premium #199E41 (12)  (content-detail-ai / `I2278:132933;1306:4243 (Premium)`)
- **layout-diff** · *shell structure* — Figma: 확장 화면엔 Grabit 앱셸(좌 GNB·톱바) 없음 — 브라우저 위 팝업/플로팅버튼/모달 오버레이만 | 구현: 앱셸(좌 GNB+톱바) 구현됨 — 확장 컨텍스트엔 미적용  (extension / `프레임 전체 (browser screenshot bg)`)
- **missing-component** `[mvp-out]` · *navigation item presence* — Figma: GNB에 '대시보드' 항목 존재 (active state: fill #242424(fill_Y8PSMP) · icon/solid/dashboard · 라벨 Body3/Medium #FAFAFA · h32 pad8/10 radius8) | 구현: MISSING (구현 GNB 요지: 홈/검색/라이브러리/수신함 — '대시보드 탭❌' 명시)  (dashboard / `I3252:6867;1613:10936 (Sidebar '대시보드' nav item)`)
- **missing-component** `[mvp-out]` · *item dimensions / states* — Figma: h32 · pad 8/10 (layout_UR4930) · gap8 · radius8 · icon18 · 라벨 14/130% · selected fill #242424(solid 아이콘+Medium) / unselected 투명(Regular #B4B4B4 fill_21C2SZ) | 구현: MISSING (셸/GNB 컴포넌트 미구현 — widgets/ 비어있음)  (dashboard / `I3252:6867;1613:10923~10940 (Sidebar 메뉴 항목)`)
- **layout-diff** `[mvp-out]` · *shell structure* — Figma: 좌상단 로고(91x24.75)만 있는 미니 헤더, GNB·톱바 없음. 콘텐츠는 중앙정렬 단독 페이지(입력 902w 2컬럼 / 완료 672w 1컬럼) | 구현: 앱셸 = 좌 GNB + 톱바  (payment / `2278:126110 (입력) / 2278:126243 (Case1) / 2278:126362 (Case2)`)

### other (8)
- **extra** · *전체 화면* — Figma: Google 네이티브 'Choose an account' UI — Roboto, Material 카드 528w·bg #1F1F1F·radius8·shadow 0px25px50px-12px, 계정행 pad12×40·아바타 28, 링크색 #1A73E8, 푸터 도움말/약관 | 구현: N/A (서드파티 OAuth 화면)  (onboarding / `2087:6043 전체 (Roboto, Google 컬러)`)
- **missing-component** · *color/weight* — Figma: rgba(255,255,255,0.08) 1px (수평 구분선) | 구현: 토큰 --color-border-subtle 존재하나 divider 컴포넌트 없음  (content-detail / `2087:12672 / I2087:13351;1306:4274`)
- **extra** `[mvp-out]` · *typography* — Figma: 타이틀 SemiBold 18/130%/-2% #FAFAFA · 서브 Regular 15/160%/-2% #B4B4B4 | 구현: N/A (텍스트 토큰: title-5 18/130, body-2 15)  (content-detail-ai / `2278:132286 (무엇을 도와드릴까요?) / 2278:132287 (서브)`)
- **wrong-value** `[mvp-out]` · *header typo/logo color + divider* — Figma: 'Grabit Assistant' Poppins Bold 16/130% #FAFAFA · 로고 Union 채움 #66FF4B · 하단 디바이더 stroke rgba(255,255,255,0.16) 1px (y:66) | 구현: font-family-base=Pretendard만 정의(Poppins 미정의) · brand #66FF4B 존재 · border .16 토큰 미존재  (content-detail-ai / `2278:132326~132329 (Union 로고 + 텍스트 + Vector 454 divider)`)
- **wrong-value** · *text color* — Figma: #CECECE | 구현: MISSING (tokens.css gray 스케일: #898989/#999999/#b4b4b4/#dbdbdb — #CECECE 없음)  (extension / `fill_DPSWNX (2074:88501 등)`)
- **missing-component** · *font* — Figma: Pretendard Medium 14px / lineHeight 130% / ls -2% · 색 #FAFAFA · 고정폭 247 | 구현: N/A — 모달 폼 row 라벨 패턴 파운데이션에 미정의  (extension / `2074:88455 / 2074:88485 / 2074:88494`)
- **extra** · *size / bg / padding / font / icon* — Figma: 439×78 · bg #FFFFFF · padding 15/20 · gap 10/20 · 타이틀 Pretendard SemiBold 34px/130%/-2.5% #000000 · Union 아이콘 40×47 #2E8B1E | 구현: MISSING — 웹스토어 등재용 라이트 배너(흰 bg·34px 타이틀·#2E8B1E 로고)  (extension / `2074:88589 (Frame 2085669209)`)
- **missing-component** · *폼팩터* — Figma: 텍스트 단독 · 18px/Regular/130%/-2%/#B4B4B4(style_PJLBFM·fill_UCJAEQ) · 일러스트/아이콘/CTA 없음 · 카운트 '0' 24px/Regular/#B4B4B4 | 구현: MISSING (empty-state 컴포넌트 부재 — shared/ui에 없음)  (search / `2087:40185 ('…의 검색 결과가 없습니다.') + 2087:40181 (카운트 '0')`)

### badge (7)
- **wrong-value** · *premium inline 라벨* — Figma: text #199E41 · 12/Regular400/130%/-2.5% (배경/패딩 없음, 아이콘 동반) | 구현: badge.premium.inline = #199E41✓ · inline 13px 기준  (home / `I2087:70381;1306:4243 'Premium' fill_182TF9 style_I3SZAH`)
- **missing-variant** · *fill/radius* — Figma: 30x28 · radius 6 · fill rgba(0,0,0,0.32) · blur(2px) | 구현: MISSING  (content-detail / `2087:12708 / 12738 등 ('30x28' 오버레이)`)
- **extra** · *color/size* — Figma: inline · #199E41 · 12/400/130% · 아이콘(mdi:thunder) 동반 | 구현: badge.premium.inline = #199E41 (일치)  (content-detail / `I2087:13351;1306:4243`)
- **wrong-value** · *fontSize* — Figma: 12px / Regular / 130% / -2.5% / #199E41 (인라인 라벨, 아이콘 동반) | 구현: badge inline premium: #199E41 ✔ · font-size 13(--text-caption-1) 기준  (search / `2087:40727 / 2087:40014 (Premium, style_N68BWJ/style_PAL3WC)`)
- **wrong-value** `[mvp-out]` · *color / fontSize* — Figma: inline · #199E41(fill_IT3HAC) · 12/400/130%/-2.5% · 좌측 thunder 아이콘 | 구현: badge.premium.inline = #199E41 (--color-premium-green), inline fontSize 13  (dashboard / `I3252:6867;1306:4243 (Sidebar 'Premium' 인라인 라벨)`)
- **wrong-value** `[mvp-out]` · *inline badge fontSize* — Figma: 14px / 400 / lh 21px (style_BVJ887), color #199E41 + 좌측 아이콘 14 | 구현: .inline font-size 13 (--text-caption-1-size), lh 130%  (payment / `2278:126124 (상단 Premium 라벨)`)
- **wrong-value** `[mvp-out]` · *inline badge fontSize* — Figma: 14px / 400 / lh 21px (style_7P4OEA/H3HJR3), color #FAFAFA + 아이콘 12 | 구현: .inline font-size 13  (payment / `2278:126271+126272 (거래내역 Premium) / 2278:126390+126391`)

### avatar (5)
- **missing-state** · *라벨 색·타이포 (컴포넌트 외부)* — Figma: 선택 #66FF4B / 비선택 #B4B4B4 · 14/SemiBold600/130%/-2.5% center · '분야 추가' #?? 14/Medium500 | 구현: avatar 컴포넌트 외부 라벨 — 구현 측 라벨 스타일 정의 확인 불가(컴포넌트 범위 밖)  (home / `선택 2173:125357 fill_BP0OJH / 비선택 2173:125365 fill_ZHMI5J style_I447TD`)
- **missing-size** · *size* — Figma: 22px (직군 원형칩, r100, fill .04) · 18px(작성자) | 구현: avatar xs18/sm24/md32/lg48/xl82 — 22px 단 없음  (content-detail / `2087:12922(22x22), 2087:12961(18x18), 2557:23099(18x18 이니셜)`)
- **missing-variant** · *fill(배경)* — Figma: #7FFF66 (이니셜 아바타 배경) · 글자 8/600 #000000 | 구현: avatar 기본 bg=surface-300(#313131) — 랜덤 컬러 이니셜 변형 없음  (content-detail / `2557:23099 (계정 프로필 디폴트 랜덤)`)
- **missing-component** · *border / effect* — Figma: radius100 · fill #121212 · border #585858 1px · effect backdrop blur(2px) · 13/-2% 글자 | 구현: avatar selected ring=2px rgba(102,255,75,.5) · 일반 avatar bg surface-300 (썸네일 count pill/backdrop-blur 변형 없음)  (library / `2117:22086 (Frame 2085668491)`)
- **missing-size** `[mvp-out]` · *circular badge size + fill* — Figma: 44x44, fill #66FF4B (brand), radius full(원형), 내부 아이콘 26 | 구현: MISSING (avatar xs18/sm24/md32/lg48/xl82, 44 없음 / brand-fill 원형 없음)  (payment / `2278:126254 (완료 체크 원형) / 2278:126373`)

### dropdown (5)
- **wrong-value** · *background fill* — Figma: 배경 fill 없음(투명), border 1px rgba(255,255,255,0.08), padding 12/10/12/14, w509 h38, radius6, 라벨 '창업가 정신' Medium 14/130%/-2% #FAFAFA + 우측 chevron | 구현: .trigger bg var(--color-surface-ghost) rgba(255,255,255,0.04)  (content-add / `2087:35045 (layout_Z9DTJH)`)
- **extra** · *menu container* — Figma: width 193, padding 4, column, bg rgba(255,255,255,0.04), border 1px rgba(255,255,255,0.08), radius6, shadow 0 0 8 rgba(0,0,0,0.07) | 구현: .menu padding4·bg ghost(.04)·border subtle(.08)·radius6·shadow-dropdown(0 0 8 rgba(0,0,0,0.07)) — 일치  (content-add / `I2384:141427;2384:141352 (layout_MQO7NB, effect Dropdown-100)`)
- **wrong-value** · *item radius* — Figma: 강조(첫)항목 radius 4 + bg rgba(255,255,255,0.06); 비강조 항목 radius 3 + 투명. 공통 h28, padding 2/6, gap3 | 구현: .item radius var(--radius-xs)=4 (전 항목), hover bg surface-hover(.06)  (content-add / `I2384:141427;...141353~141357 (layout_8TNXP1)`)
- **wrong-value** · *height / padding / border / radius / bg* — Figma: height 38 · padding 12/10/12/14 (T/R/B/L) · border rgba(255,255,255,0.08) 1px · radius 6 · bg 없음(투명) · 라벨 14/500/130% #FAFAFA · trailing chevron | 구현: trigger h38·padding 0/14좌·0/10우(세로패딩 0)·border .08·radius6·bg surface-ghost(.04) (dropdown.module.css)  (extension / `2074:88486 (Frame 2085667113)`)
- **wrong-value** · *size / padding / fill / border* — Figma: w298 h38 · pad 12/10/12/14 · radius6 · bg rgba(255,255,255,0.04) · border rgba(255,255,255,0.08) 1px · 라벨 14/500/-2% | 구현: trigger: h38 · padL14/padR10 · radius6 · bg rgba(white,0.04) · border .08 · 14/500  (library / `2117:25128 · 2117:23130 (componentId 2117:26065)`)

### tabs (4)
- **layout-diff** · *item height (고정값 부재)* — Figma: height: hug (고정 28/36 아님 — 라벨+패딩으로 결정, 실측 item ~28~30) | 구현: .segment h36 / .tab h28 (고정)  (home / `unselected 피드 fill_M4EW2J / selected fill_CACBUS`)
- **wrong-value** · *itemSpacing(아이템 간 gap)* — Figma: 4px | 구현: 10px (.segment{gap:--space-5})  (content-detail / `2087:12541 (탭 아이템 행)`)
- **wrong-value** · *size / selected fill / typo* — Figma: 컨테이너 h36 pad4 radius100 bg rgba(white,0.04) · item h28 pad8/12 radius100 · selected bg #363636 글자 #FFFFFF 13/600 · unselected #999999 13/500 | 구현: segment: 컨테이너 h36/pad4/radius100/bg .04 · item h28/pad8·12/radius100 · selected #363636/#FAFAFA/600 · unselected #999999/500 (13/130%)  (library / `2117:25117 · 2557:34420 · 2117:21832`)
- **wrong-value** `[mvp-out]` · *item fontSize / weight / letter-spacing* — Figma: selected 13/600/130%/-2.5% (style_CUT8HA), unselected 13/500/130%/-2.5% (style_R2T4XR), item h28 pad 8/12 radius100, container h36 pad4 radius100 bg rgba(255,255,255,0.04), selected fill #363636, unselected text #999999(RCZPTE) | 구현: segment item 13/130% · selected #363636/600 · unselected #999999/500 (일치) — letter-spacing 만 -2.5%(tab base) vs CSS uses --letter-spacing-tight(-2.5%)  (dashboard / `2557:34597 (월간/연간 세그먼트)`)

### chip (3)
- **wrong-value** · *color (text)* — Figma: #FFFFFF (chip 라벨 fills 4개 프레임 모두 #FFFFFF: fill_UE7X6C/WOTIK8/PC221R/EKXMKV) | 구현: #FAFAFA (--color-white, chip color)  (onboarding / `2087:11006 인스턴스들 (layout_4S67NV/XWPMCG, style_124KJ6/WUZWCD)`)
- **missing-variant** · *height/radius/text* — Figma: h24 · pad 10/8 · radius 4 · fill rgba(255,255,255,0.06) · 14/400/160% #CECECE | 구현: MISSING — h24·r4 태그칩 변형 없음  (content-detail / `2087:12666 / 12668 / 12670`)
- **wrong-value** · *padding / height / radius / bg / border* — Figma: h32 · padding 10/12/10/10 · radius 100 · bg rgba(255,255,255,0.04) · border rgba(255,255,255,0.08) · 텍스트 14/Medium/#FAFAFA · gap 4 (layout_P874YR·fill_NZYMEQ·fill_T6BIA4·style_E0KIIW) | 구현: recommend 변형: h32 ✔ radius pill ✔ bg 0.04 ✔ border 0.08 ✔ 14/500 ✔ gap 4 ✔ padding 10/12(좌우)  (search / `2087:40686~40703 (추천 검색 칩: AI 활용법/시간 관리 등)`)

### input (3)
- **wrong-value** · *padding (vertical) / height* — Figma: padding 18px 14px, height 42, bg #242424, border rgba(255,255,255,0.08), radius 6, placeholder #999999 14·160% | 구현: height 42, padding 0 14px(padX만), bg #242424, border .08, radius6, placeholder #999999 14·160%  (onboarding / `2087:8469 (layout_V0LXXP), placeholder 2087:8470 textStyle B4_Rg`)
- **wrong-value** · *padding* — Figma: 8px 7px 8px 20px (layout_H0HOZ5) · h48 · radius 80 · bg #1F1F1F · border rgba(255,255,255,0.10) · width 520 | 구현: search 변형 padding 0 20(좌우 20 대칭) · h48 ✔ · radius 80 ✔ · bg #1F1F1F ✔ · border 0.10 ✔  (search / `2087:40407 (검색바 디폴트)`)
- **wrong-value** `[mvp-out]` · *padding-x* — Figma: 16px (layout_N8KQOS·FE8B8O padding 0 16) | 구현: var(--space-7)=14px (.wrapper padding 0 14)  (payment / `2278:126150·126159·126164·126169`)

### toggle (2)
- **wrong-value** · *padding* — Figma: 2px 2px 2px 8px (knob 우측정렬=ON) | 구현: 2px (전방향 동일)  (content-add / `2087:35028 (layout_JLJFZG)`)
- **extra** · *presence* — Figma: MISSING — 스위치형 토글(knob 46x28)은 9개 프레임 어디에도 없음. '시청정보/원본소스 토글'은 실제로 세그먼트 pill(h36/h28 radius100) | 구현: toggle 46x28 knob24 on=brand-primary (시청정보/원본소스 탭 높이에 정렬했다고 주석)  (library / `N/A (스위치형 토글 인스턴스 부재)`)

### toast (1)
- **extra** · *presence* — Figma: MISSING (toast/snackbar 인스턴스 9개 프레임 어디에도 없음) | 구현: toast 합리 스켈레톤(모달 surface 기반, 미측정 명시)  (library / `N/A`)
