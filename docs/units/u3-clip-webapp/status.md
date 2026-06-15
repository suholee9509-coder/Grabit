# u3-clip-webapp — status

> dev가 매 턴 갱신(변경·검증결과·리스크). PM은 이 파일 + STATUS 반환으로 통합 결정.

- 상태: **계획(미스폰)**
- 검증: (미실행 — 스폰 전)
- 변경 파일 (boundary 준수): (없음 — spec/status 스텁만)
- 설계 노트:
  - 데이터 쓰기는 신규 서버코드 없이 u0b `ingest_clip()` RPC 단일 호출로 위임(dedup·정준화·구간검증·메모병합·태그 get-or-create 모두 RPC가 수행). FE는 payload 구성·에러 매핑만.
  - Figma 'AI 요약' 자리 = 사용자 직접 입력 **인사이트 메모**로 대체(게이트 ⓐ AI 제외).
  - 공개 토글 ON = #2563EB(FD2 확정값), Step2 프레임의 Light-Primary와 일치.
  - 폴더=기존 폴더 선택만(생성 CRUD는 u7). 태그=유저별, 자동완성은 본인 태그에서.
- 리스크:
  - [디자인 공백] URL 검증/로딩/실패·완료 토스트·폴더 드롭다운 열림·트림 차단 피드백·메타fetch 실패 화면 = 프레임에 없음 → u0 파운데이션(toast/dropdown/input 에러)으로 채움(spec §state).
  - 트림 핸들 인터랙션(드래그 정밀도·iframe 동기화)은 구현 난도 높음 — 인터랙티브 워크트리에서 사용자 운전 확인 필요.
- ESCALATION: (없음 — 아래 PM 결정 후보는 spec 작성 단계 보고용, §반환 참조)

STATUS = "계획(미스폰) · spec/status 스텁 작성 완료 · 게이트 ⓑ(이슈/보드) 대기"
