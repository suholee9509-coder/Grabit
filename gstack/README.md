# gstack 통합

이 폴더는 Grabit 프로젝트가 [gstack](https://github.com/garrytan/gstack)을 어떻게 활용하는지 문서화합니다.

> ⚠️ **gstack 자체는 글로벌 설치**입니다 (`~/.claude/skills/gstack/`). 이 폴더에는 *문서/매핑만* 있고 실제 스킬 파일은 없습니다. gstack의 설계 원칙(무벤더링, 자동 업데이트)을 준수합니다.

---

## 설치 확인

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

미설치 시:
```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

이 프로젝트는 **팀 모드**로 설정되어 있어 세션 시작 시 자동 업데이트됩니다.

---

## 파일

| 파일 | 내용 |
|------|------|
| [version.lock](version.lock) | 호환 검증된 gstack 버전 |
| [skills-in-use.md](skills-in-use.md) | 우리가 사용하는 스킬 + 어느 에이전트가 어떤 걸 쓰는지 |

---

## 자주 쓰는 gstack 스킬 (이 프로젝트 기준)

| 스킬 | 사용 에이전트 | 목적 |
|------|------------|------|
| `/office-hours` | Solution Planner | 데맨드 검증 (6 forcing questions) |
| `/plan-ceo-review` | Solution Planner | 전략적 스코프 검토 |
| `/investigate` | Dev | 디버깅, 근본 원인 분석 |
| `/ship` | Dev | 테스트 → 리뷰 → PR 생성 |
| `/review` | Reviewer | PR 사전 리뷰 (SQL safety, LLM trust 등) |
| `/qa` | QA | 브라우저 기반 기능 테스트 |
| `/design-shotgun` | UI/UX Designer | UI 변형 다수 생성 |
| `/design-html` | UI/UX Designer | 선택된 변형 → HTML/CSS |
| `/design-review` | UI/UX Designer, QA | 디자인 사전 감사 (시각 일관성, AI slop 패턴) |
| `/design-consultation` | Brand Designer | 브랜드 시스템 도출 |
| `/cso` | Security | 풀 보안 감사 (OWASP, STRIDE, 의존성 등) |
| `/browse` | 전 에이전트 | 모든 웹 브라우징 (mcp 도구 X) |

자세한 매핑은 [skills-in-use.md](skills-in-use.md) 참고.
