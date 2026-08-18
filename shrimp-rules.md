# AI Agent 작업 규칙 (shrimp-rules.md)

> 이 문서는 AI 코딩 에이전트 전용 운영 규칙이다. 사람을 위한 튜토리얼이 아니며, 일반적인 개발 지식은 포함하지 않는다.
> **일반 규칙(디렉토리 구조, Next.js 16 문법, 인증 흐름)은 이미 `CLAUDE.md`와 `AGENTS.md`에 정의되어 있으므로 반드시 먼저 그 두 파일을 읽는다.** 이 문서는 그 위에 "여러 파일을 동시에 고쳐야 하는 상황"과 "애매할 때 무엇을 우선할지"만 추가로 규정한다.

## 프로젝트 정체성

- 표면적으로는 `with-supabase` Next.js 스타터킷이지만, **실제 개발 목표는 `docs/PRD.md`에 정의된 "Gather" — 일회성 이벤트 관리 플랫폼**이다.
- 새 기능을 만들기 전 반드시 `docs/PRD.md`(요구사항)와 `docs/ROADMAP.md`(작업 순서·우선순위)를 확인한다. ROADMAP에 없는 임의 기능을 먼저 구현하지 않는다.
- `components/tutorial/`, `app/instruments/`는 스타터킷 데모 잔재다. Gather 기능과 무관한 코드를 이 안에 추가하지 말 것 — 실제 기능 개발 시 삭제 대상이므로 신규 로직의 기반으로 삼지 않는다.

## 파일 간 동시 수정이 필요한 연쇄 규칙

### Supabase 스키마 변경 시

- 스키마(테이블/컬럼/RLS 정책)를 바꾸면 **반드시 `supabase/migrations/`에 새 타임스탬프 파일을 추가**한다. 기존 migration 파일(`20260813120000_create_profiles_table.sql`, `20260813140000_backfill_profiles.sql`)은 절대 수정하지 않는다 — 이미 적용된 migration은 불변으로 취급한다.
- migration 적용 후 `mcp__supabase__generate_typescript_types`로 `lib/supabase/types.ts`를 즉시 재생성한다. 타입을 손으로 고치지 않는다.
- RLS 정책은 기존 `profiles` 테이블 migration의 패턴(`enable row level security` → `create policy` → `to anon, authenticated`)을 따른다. 새 테이블에는 RLS를 기본 활성화한다.
- 트리거 함수는 `security definer` + `set search_path = ''`를 유지한다 (기존 `handle_new_user`, `handle_updated_at` 패턴).

### shadcn/ui 컴포넌트 추가 시

- `npx shadcn@latest add`를 직접 실행하기 전에 `mcp__shadcn__search_items_in_registries` / `mcp__shadcn__view_items_in_registries`로 존재 여부와 정확한 이름을 먼저 확인한다.
- `docs/guides/forms-react-hook-form.md`의 코드 예시는 **아직 설치되지 않은 `Form`, `Textarea`, `Select` 컴포넌트를 전제로 작성됨** — 그대로 복사하면 빌드 에러가 난다. 사용 전 `components/ui/`에 실제로 존재하는지 확인하고, 없으면 먼저 설치한다.

### ROADMAP.md 갱신 시

- 완료된 작업은 상태를 ✅로 표시한다 (`docs:update-roadmap` skill 사용 가능).
- 신규 우선순위 작업은 "마지막으로 완료된 작업 다음" 위치에 삽입한다 — 문서 최상단이나 최하단에 임의로 추가하지 않는다.
- API/비즈니스 로직이 포함된 작업 항목에는 "## 테스트 체크리스트" 섹션(Playwright MCP 시나리오)을 반드시 포함한다.

## 서브에이전트 위임 기준

작업을 직접 수행하기 전, 아래 조건에 해당하면 해당 서브에이전트에 위임하는 것을 우선 고려한다:

| 작업 성격                                                                       | 우선 위임 대상                             |
| ------------------------------------------------------------------------------- | ------------------------------------------ |
| Server/Client Component, Server Action, Supabase 연동을 포함한 풀스택 기능 구현 | `nextjs-supabase-fullstack-developer`      |
| 비즈니스 로직 없는 순수 마크업/스타일링                                         | `dev/ui-markup-specialist`                 |
| App Router 라우팅/레이아웃 구조 설계(신규 라우트 스캐폴딩)                      | `dev/nextjs-app-developer`                 |
| 작성 완료된 코드의 리뷰                                                         | `dev/code-reviewer`                        |
| ROADMAP.md 작성/갱신                                                            | `dev/development-planner`                  |
| PRD 작성 / 기술 타당성 검증                                                     | `docs/prd-generator`, `docs/prd-validator` |
| 스타터킷 보일러플레이트 제거                                                    | `dev/starter-cleaner`                      |

풀스택 기능 구현과 순수 마크업이 겹칠 경우 `nextjs-supabase-fullstack-developer`를 우선한다 (더 포괄적인 프로젝트 규칙을 알고 있음).

## MCP 도구 우선순위 (추측 금지)

- Supabase 스키마 조회·마이그레이션·타입 생성·로그·보안 어드바이저 확인은 **직접 SQL을 추측하지 말고** `mcp__supabase__*` 도구를 사용한다.
- 라이브러리(Next.js, Supabase, React Hook Form 등)의 최신 API 문법이 불확실하면 `context7` MCP로 공식 문서를 조회한다 — 특히 `next`가 `"latest"`로 고정되어 버전이 유동적이므로 `node_modules/next/dist/docs/`와 `context7`을 함께 확인한다.
- shadcn 컴포넌트 추가/조회는 `mcp__shadcn__*` 도구를 사용한다.
- 브라우저 동작 확인(E2E)은 Playwright MCP를 사용한다 (ROADMAP 워크플로우 규칙 참고).

## 금지 사항

- 루트의 `proxy.ts`와 `lib/supabase/proxy.ts`를 같은 파일로 착각해 수정하지 말 것 — 이름은 같지만 역할이 다르다 (`CLAUDE.md` 참고).
- 기존에 적용된 `supabase/migrations/*.sql` 파일을 직접 편집하지 말 것 (새 migration으로만 변경).
- `service_role` 키를 Client Component나 브라우저로 전달되는 코드에 노출하지 말 것 — 서버 전용 컨텍스트에서만 사용.
- 하드코딩된 Tailwind 색상(`bg-white`, `text-gray-900` 등) 사용 금지, 시맨틱 색상 변수만 사용 (`docs/guides/styling-guide.md`).
- `docs/guides/project-structure.md`의 `src/` 기반 설명을 그대로 믿고 `src/app`, `src/components` 경로에 파일을 생성하지 말 것 — 실제 구조는 루트 배치.
- Pages Router 패턴(`pages/`, `getServerSideProps`) 도입 금지.
