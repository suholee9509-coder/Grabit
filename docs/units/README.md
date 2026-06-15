# docs/units/ — 작업단위 산출물

각 Feature 작업단위는 `docs/units/<slug>/` 폴더 하나를 가진다 (sprint-kickoff에서 PM이 단위마다 생성):

| 파일 | 내용 | 작성자 | 주기 |
|---|---|---|---|
| `spec.md` | User Story(L1) + 5섹션 성공조건 — `/goal` 정본 | PM | 계획 시 |
| `plan.md` | 구현 순서 | dev | 착수 시 |
| `status.md` | 변경·검증결과·리스크 | dev | 매 턴 갱신 |

> 규격: `config/work-unit-contract.md` §B. **현재 = 비어 있음** (분해 전).
> dev `/goal`은 매 턴 `spec.md`를 reload하고 `status.md`를 갱신한다 (context rot 방지).
