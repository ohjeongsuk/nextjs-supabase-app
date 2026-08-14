# 커밋: 개발 도구 설정 (ESLint/Prettier/TypeScript/Husky)

## Context

직전 작업에서 ESLint(Next 16 flat config 전면 재작성 포함), Prettier, `tsc --noEmit` 타입체크, Husky v9 + lint-staged pre-commit 자동화를 구축하고 lint/typecheck/format:check/pre-commit 훅 동작까지 모두 검증 완료했다. 이제 이 변경사항을 사용자 요청대로 **하나로 통합해 단일 커밋**한다.

작업 트리에는 이번 작업과 무관한 `.claude/plans/elegant-singing-curry.md`(이전 세션에서 만들어진, 커밋되지 않은 잔여 계획 파일)가 함께 있다. `/git:commit` 규칙상 "관련 없는 변경사항 분할"이 원칙이므로 이 파일은 이번 커밋에서 제외한다.

## 커밋 대상 파일

**수정:**
- `eslint.config.mjs` — Next 16 공식 flat config 네이티브 패턴으로 재작성 + `eslint-config-prettier/flat` 연동
- `package.json` — `engines`, `scripts`(typecheck/format/format:check/prepare), `lint-staged` 필드 추가, devDependencies 갱신(`eslint-config-next` 16.3.0로 업그레이드, `@eslint/eslintrc` 제거, prettier/husky/lint-staged 등 추가)
- `package-lock.json` — 위 의존성 변경에 따른 락파일 갱신

**신규 추가:**
- `.prettierrc.json`, `.prettierignore` — Prettier 설정
- `.editorconfig` — 에디터 공통 설정
- `.nvmrc` — Node 버전 고정(24.18.0)
- `.husky/` — pre-commit 훅 (`npx lint-staged` 실행)

**제외 (이번 커밋에 포함하지 않음):**
- `.claude/plans/elegant-singing-curry.md` — 이전 세션의 무관한 잔여 계획 파일
- `.claude/plans/steady-snuggling-liskov.md` — 이 계획 파일 자체(작업 메모이므로 커밋 대상 아님, 필요시 별도 판단)

## 실행 순서

1. `git add eslint.config.mjs package.json package-lock.json .prettierrc.json .prettierignore .editorconfig .nvmrc .husky/`
2. `git status`로 스테이지 내용이 위 목록과 정확히 일치하는지, `elegant-singing-curry.md`가 제외됐는지 재확인
3. 한국어 컨벤셔널 커밋 메시지로 커밋 (예: `🔧 chore: ESLint/Prettier/TypeScript/Husky 개발 도구 설정 추가`)
4. `git log -1 --stat`으로 커밋 결과 확인

## 검증

- 커밋 후 `git status`가 깨끗한지(위 신규/수정 파일 기준) 확인
- `elegant-singing-curry.md`가 여전히 untracked 상태로 남아있는지 확인(실수로 포함되지 않았는지)
