# Quality Standards

Grabit 프로젝트의 코드 품질 기준. **Reviewer Agent**의 핵심 참조 문서이며, **Dev Agent**가 작업 시 따라야 할 표준.

> 변경은 PR로만. 에이전트가 임의로 수정 금지.

---

## §1. 명명 (Naming)

### §1.1 일반
- 변수/함수: camelCase (TypeScript), snake_case (Python)
- 클래스/타입/컴포넌트: PascalCase
- 상수: SCREAMING_SNAKE_CASE
- 파일: kebab-case 권장 (단, React 컴포넌트는 PascalCase)
- 약어: 두 글자는 모두 대문자 (`URL`, `ID`), 세 글자 이상은 첫만 (`Json`, `Http`)

### §1.2 의미
- 이름이 *무엇을* 명확히 — `data` X, `userPreferences` O
- 1글자 변수: 루프 인덱스(`i`), 람다 인자(짧은 컨텍스트)만 허용
- 부정형: `isEmpty` O, `isNotEmpty` X (이중 부정 금지)
- 비대칭: `start` 와 `stop`은 OK, `start` 와 `end`는 OK, `start` 와 `finish`는 X (대칭)

---

## §2. 함수 / 컴포넌트

### §2.1 크기
- 1 함수 ≤ 30줄 권장 (그 이상은 추출 검토)
- 1 React 컴포넌트 ≤ 100줄 권장
- 1 파일 ≤ 300줄 권장

### §2.2 인자
- 인자 수 ≤ 4개 권장. 5+ 면 객체로 묶기 (`function f({ a, b, c, d, e })`)
- Boolean 인자 X — enum 또는 별도 함수로 분리

### §2.3 부수 효과 (Side Effects)
- 함수 이름에 부수 효과 명시 — `getUser()` X (DB 호출이면), `fetchUser()` O
- 순수 함수 우선 — 필요할 때만 부수 효과

---

## §3. 에러 처리

### §3.1 경계에서만
에러 처리는 **외부 경계**에서만:
- 외부 API 호출
- 사용자 입력 (HTTP request body, form)
- 파일 시스템 / DB 연결

내부 함수 호출에 try/catch 두지 마라 — 신뢰.

### §3.2 메시지
- 사용자 노출 메시지: *무엇이 잘못되었나* + *무엇을 해야 하나*
- 로그: 디버깅 가능한 컨텍스트 (`user_id`, `request_id`, 입력값 sanitize)
- 절대 노출 X: stack trace, DB 쿼리, 시크릿

### §3.3 타입
- TypeScript: `Result<T, E>` 또는 union type 권장. throw는 진짜 예외만.
- Python: 명시적 raise + 명시적 except. catch-all 금지.

---

## §4. 테스트

### §4.1 무엇을 테스트하나
- **외부 동작** 기준 — 함수의 *입력 → 출력*
- 내부 구조(어떤 헬퍼 함수가 호출되는지) X — brittleness

### §4.2 커버리지
- 새 기능 PR: AC당 최소 1개 단위 테스트
- 버그 수정 PR: regression 테스트 1개
- 단순 UI 컴포넌트 (로직 X): 테스트 면제 (수동 QA로 검증)

### §4.3 명명
- 테스트 이름: "should <기대 동작> when <조건>"
- 예: `should return null when user is not found`

---

## §5. 보안

### §5.1 시크릿
- 절대 코드/repo에 하드코딩 X
- `.env` 사용 (`.gitignore` 처리)
- 빌드 산출물에 포함 X

### §5.2 입력 검증
- *모든* 외부 입력 검증 (zod, pydantic 등)
- 검증 위치: 진입점 (handler / route)
- 검증 실패: 400 응답 + 사용자 친화 메시지

### §5.3 SQL / Query
- ORM 사용 (Drizzle, Prisma, SQLAlchemy 등) — raw SQL 금지
- 부득이 raw SQL 시: prepared statement / parameterized query

### §5.4 XSS / Injection
- React: `dangerouslySetInnerHTML` 사용 시 sanitize 필수
- Backend: 사용자 입력을 HTML/JSON에 직접 삽입 X

---

## §6. 의존성

### §6.1 새 의존성 추가 기준
- 자체 구현 가능한 작은 유틸 (≤ 50 LOC) → 추가 X
- 메인테너 활성, 다운로드 충분, 라이선스 호환
- 보안 이슈 (CVE) 확인

### §6.2 버전 핀
- `package.json`에 정확한 버전 (`^` 와일드카드 X — 새 버전 사용 시 의도적으로)
- `bun.lockb` / `package-lock.json` 커밋

---

## §7. 주석 / 문서

### §7.1 주석은 *왜* 만 (대부분 안 씀)
- 코드가 *무엇*을 하는지 — 코드가 직접 말하게
- 주석은 *왜* 또는 *어떤 비자명한 제약*만
- "fixed bug" 같은 의미 없는 주석 금지

### §7.2 PR 본문
- AC 매핑 명시
- "Why" 문단 1개
- Out of Scope 명시

### §7.3 README
- 필요 시만 (디렉토리당 1개 권장)
- 무엇을 / 왜 / 어떻게 사용

---

## §8. 커밋

### §8.1 메시지
- 첫 줄: ≤ 72자, 명령형 ("add" / "fix" / "refactor", "added" X)
- 본문: 왜 변경했는지, 어떤 트레이드오프
- 의미 있게 — "fix bug" X, "fix race in session merge on simultaneous magic-link clicks" O

### §8.2 단위
- 1 커밋 = 1 논리 단위
- 큰 작업은 단위로 쪼개서 여러 커밋
- WIP / 의미 없는 커밋 squash

---

## §9. UI / Frontend

### §9.1 디자인 시스템
- `shared-context/brand-system.md` 토큰만 사용
- 직접 색/폰트/간격 임의 결정 X (위반 시 Reviewer가 REQUEST_CHANGES)

### §9.2 카피
- `[copy:N]` 플레이스홀더만 (UI/UX Designer 산출), Brand Designer가 채움
- 시스템 메시지 ("Loading...", "Error") 만 직접 작성 OK

### §9.3 접근성
- 모든 인터랙티브 요소: 키보드 접근 가능
- alt 텍스트 (이미지)
- aria-label / role (시맨틱 HTML 부족 시)
- 색 대비 WCAG AA

---

## §10. 일반 원칙

### §10.1 YAGNI
- 추측으로 기능 추가 X — 실제 필요할 때만

### §10.2 DRY (단, 적당히)
- 3번째 반복 시 추상화 검토 — 너무 빨리 추출하면 잘못된 추상화

### §10.3 Boy Scout Rule (제한적)
- 이번 PR scope 내 작은 정리는 OK
- scope 외 광범위 리팩토링 X — 별도 티켓

### §10.4 단순 우선
- 짧은 직선 코드 > 영리한 추상화
- 미래 확장성 추측보다 *지금 명확*

---

## §11. 위반 처리

### Reviewer 시
- 명확한 위반 → REQUEST_CHANGES + 이 §X 인용
- 모호 케이스 (style 선호) → REQUEST_CHANGES X (이 문서 외 강요 X)

### Dev 시
- 위반했음을 인지하면 self-review 시 수정
- 표준이 부족하다고 느끼면 → 별도 티켓으로 표준 보강 PR
