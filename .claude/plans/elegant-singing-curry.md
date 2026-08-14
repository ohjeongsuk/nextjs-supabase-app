# 커밋 계획: 관심사별 분할 커밋

## Context

현재 작업 트리에는 이번 대화에서 진행한 "실제 코드에 맞춘 CLAUDE.md/docs 문서화" 작업과, 이와 무관한 여러 설정 변경(MCP 서버 추가, Claude Code 서브에이전트/명령어/훅 설정, shrimp-task-manager 런타임 데이터)이 섞여 있다. `/git:commit` 규칙(원자적 커밋, 관련 없는 변경사항 분할)에 따라 관심사별로 나누어 커밋한다. 스테이지된 파일이 없으므로 전체 워킹트리 변경사항을 대상으로 분류한다.

## 현재 변경사항 분류

- **수정**: `CLAUDE.md`, `.mcp.json`
- **미추적(신규)**: `docs/` (project-structure.md, forms-react-hook-form.md, component-patterns.md, styling-guide.md, nextjs-16.md), `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`, `shrimp_data/`

## 실행 단계

### 1. `.gitignore`에 `shrimp_data/` 추가
- `shrimp_data/`는 `.mcp.json`의 `shrimp-task-manager` 서버가 `DATA_DIR`로 사용하는 로컬 런타임 데이터 디렉토리(로컬 절대경로 `D:\claude\...` 포함, 공유 불필요)
- `.gitignore` 파일 끝에 `/shrimp_data/` 항목 추가 (misc 섹션 이후 새 섹션으로)
- 이 변경 자체도 별도로 커밋 (chore)

### 2. 커밋 1 — 문서화 (📝 docs)
- 대상: `CLAUDE.md`, `docs/project-structure.md`, `docs/forms-react-hook-form.md`, `docs/component-patterns.md`, `docs/styling-guide.md`, `docs/nextjs-16.md`
- 메시지: `📝 docs: 실제 코드에 맞춰 CLAUDE.md 및 docs 문서 갱신`
- 본문: src/ 미사용 구조 반영, Tailwind v3/실제 색상 변수 반영, 미설치 라이브러리(react-hook-form/zod) 예시를 실제 useState 기반 패턴으로 교체, typedRoutes 미적용 상태 명시 등 요약

### 3. 커밋 2 — `.gitignore` 갱신 (🔧 chore)
- 대상: `.gitignore`
- 메시지: `🔧 chore: shrimp-task-manager 런타임 데이터 디렉토리 gitignore 추가`

### 4. 커밋 3 — MCP 서버 구성 (🔧 chore)
- 대상: `.mcp.json`
- 메시지: `🔧 chore: playwright, context7 등 MCP 서버 구성 추가`
- 본문: 추가된 서버 나열 (playwright, context7, sequential-thinking, shadcn, shrimp-task-manager)

### 5. 커밋 4 — Claude Code 설정 (🔧 chore)
- 대상: `.claude/agents/`, `.claude/commands/`, `.claude/hooks/`
- 메시지: `🔧 chore: Claude Code 서브에이전트, 명령어, 훅 설정 추가`

## 검증

- 각 커밋 후 `git status`로 의도한 파일만 스테이지/커밋되었는지 확인
- 마지막에 `git log --oneline -5`로 4개 커밋이 순서대로 생성되었는지 확인
- 커밋 메시지에 Claude 서명 추가하지 않음 (`/git:commit` 규칙)
