# 프로젝트 구조 가이드

이 문서는 Next.js 16 프로젝트의 폴더 구조, 파일 조직 및 네이밍 컨벤션을 정의합니다.

## 🏗️ 전체 프로젝트 구조

이 프로젝트는 `src/` 디렉토리를 사용하지 않고, `app/`, `components/`, `lib/`가 저장소 루트에 직접 위치합니다.

```
claude-nextjs-supabase-app/
├── docs/                   # 📚 프로젝트 문서
├── app/                    # 🚀 Next.js App Router
├── components/             # 🧩 React 컴포넌트
├── lib/                    # 🛠️ 유틸리티 및 Supabase 클라이언트
├── proxy.ts                # 🔐 Next.js 16 Proxy (구 middleware)
├── components.json         # shadcn/ui 설정
├── next.config.ts          # Next.js 설정
├── package.json            # 의존성 및 스크립트
├── tsconfig.json           # TypeScript 설정
└── CLAUDE.md                # 개발 지침 메인 문서
```

## 📁 세부 폴더 구조

### app/ - App Router 페이지

```
app/
├── layout.tsx                    # 🎨 루트 레이아웃 (전역 설정)
├── page.tsx                      # 🏠 홈페이지 (/)
├── globals.css                   # 🎨 전역 CSS 스타일
├── favicon.ico                   # 🔖 파비콘
├── auth/                         # 🔐 인증 관련 페이지
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── sign-up-success/page.tsx
│   ├── forgot-password/page.tsx
│   ├── update-password/page.tsx
│   ├── error/page.tsx
│   └── confirm/route.ts          # OTP 검증 Route Handler
└── protected/                    # 🔒 로그인 필요 페이지
    ├── layout.tsx
    └── page.tsx
```

**🚀 App Router 규칙:**

- `page.tsx`: 해당 경로의 메인 페이지
- `layout.tsx`: 레이아웃 컴포넌트 (자식 페이지 감쌈)
- `route.ts`: Route Handler (API 엔드포인트)
- `loading.tsx`: 로딩 UI (필요시)
- `error.tsx`: 에러 UI (필요시)
- `not-found.tsx`: 404 페이지 (필요시)

### components/ - 컴포넌트 조직

```
components/
├── ui/                        # 🎛️ 기본 UI 컴포넌트 (shadcn/ui, new-york 스타일)
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   └── label.tsx
├── tutorial/                  # 📖 스타터 킷 기본 튜토리얼 컴포넌트
│   ├── code-block.tsx
│   ├── connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx
│   ├── sign-up-user-steps.tsx
│   └── tutorial-step.tsx
├── login-form.tsx             # 🔐 로그인 폼
├── sign-up-form.tsx           # ✍️ 회원가입 폼
├── forgot-password-form.tsx   # 🔑 비밀번호 찾기 폼
├── update-password-form.tsx   # 🔑 비밀번호 변경 폼
├── auth-button.tsx            # 🔐 인증 상태에 따른 버튼
├── logout-button.tsx          # 🚪 로그아웃 버튼
├── env-var-warning.tsx        # ⚠️ Supabase 환경변수 미설정 경고
├── theme-switcher.tsx         # 🌓 테마 전환
├── hero.tsx                   # 📄 홈페이지 히어로 섹션
├── deploy-button.tsx          # ▲ Vercel 배포 버튼
├── next-logo.tsx              # 로고 아이콘
└── supabase-logo.tsx          # 로고 아이콘
```

> `tutorial/` 하위 컴포넌트는 Supabase 공식 스타터 킷의 튜토리얼 안내용입니다. 실제 제품 기능을 개발하며 튜토리얼 UI가 더 이상 필요 없어지면 삭제 대상입니다.

**🧩 컴포넌트 분류 규칙:**

1. **ui/**: shadcn/ui 기반 재사용 가능한 기본 컴포넌트
   - 순수 UI 컴포넌트만 포함
   - 비즈니스 로직 없음
   - props로 모든 동작 제어

2. **최상위 components/**: 특정 기능(인증, 테마 등)에 종속된 컴포지트 컴포넌트
   - 여러 페이지에서 재사용되는 폼, 버튼류
   - 필요 시 `layout/`, `navigation/` 등 하위 카테고리 폴더로 분리 고려 (현재는 아직 도입되지 않음)

### lib/ - 유틸리티 및 Supabase 클라이언트

```
lib/
├── utils.ts                 # 🛠️ cn() 헬퍼, hasEnvVars 체크
└── supabase/
    ├── client.ts            # 브라우저(Client Component)용 createClient()
    ├── server.ts            # 서버(Server Component/Action)용 createClient()
    ├── proxy.ts             # Proxy에서 세션을 갱신하는 updateSession()
    └── types.ts             # Supabase 생성 타입 (Database)
```

**📚 lib/ 폴더 확장 가이드:**

새 유틸리티가 필요하면 성격에 따라 파일을 분리합니다.

```
lib/
├── utils.ts           # 공통 유틸리티 (기존 파일에 추가)
├── constants.ts        # 상수 정의 (신규 시 생성)
├── schemas/            # 폼/데이터 검증 스키마 (신규 시 생성)
└── supabase/           # Supabase 클라이언트 (기존)
```

## 🏷️ 파일 네이밍 컨벤션

### 파일명 규칙

```bash
# ✅ 올바른 파일명
user-profile.tsx        # kebab-case (이 저장소의 실제 컨벤션)
login-form.tsx           # kebab-case

# ❌ 잘못된 파일명
user_profile.tsx        # snake_case (금지)
UserProfile.tsx          # PascalCase 파일명 (이 저장소에서는 미사용)
```

### 컴포넌트 네이밍

```typescript
// ✅ 올바른 컴포넌트 네이밍
export function LoginForm() {} // PascalCase
export function AuthButton() {} // PascalCase

// ❌ 잘못된 컴포넌트 네이밍
export function loginForm() {} // camelCase (금지)
export function login_form() {} // snake_case (금지)
```

### 폴더 네이밍

```bash
# ✅ 올바른 폴더명
components/             # 소문자
tutorial/               # 소문자

# ❌ 잘못된 폴더명
Components/            # PascalCase (금지)
user_settings/         # snake_case (금지)
```

## 🔗 경로 별칭 (Path Aliases)

`tsconfig.json`과 `components.json`에 정의된 경로 별칭은 저장소 루트를 기준으로 합니다 (`src/`가 없으므로 `@/*` → `./*`).

```typescript
// ✅ 경로 별칭 사용 (권장)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

// ❌ 상대 경로 사용 (금지)
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
```

**📍 정의된 별칭 (`components.json` 기준):**

- `@/components` → `components`
- `@/lib` → `lib`
- `@/hooks` → `hooks` (아직 폴더 없음, 커스텀 훅 추가 시 생성)
- `@/components/ui` → `components/ui`
- `@/lib/utils` → `lib/utils`

## 📝 새 파일/폴더 추가 규칙

### 1. 새 UI 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 커스텀 UI 컴포넌트 추가
components/ui/custom-component.tsx
```

### 2. 새 페이지 추가

```bash
# 정적 페이지
app/about/page.tsx

# 동적 페이지
app/users/[id]/page.tsx

# 그룹 라우트
app/(marketing)/pricing/page.tsx
```

### 3. 새 비즈니스 컴포넌트 추가

```bash
# 위치 결정 기준:
1. 특정 페이지에서만 사용 → 해당 페이지 폴더 내
2. 여러 페이지에서 사용 → components/ 루트 또는 성격별 하위 폴더
3. shadcn/ui 프리미티브 확장 → components/ui/
```

### 4. 새 유틸리티 추가

```bash
# 공통 유틸리티
lib/utils.ts            # 기존 파일에 추가

# 특화된 유틸리티
lib/date-utils.ts       # 새 파일 생성
lib/supabase/           # Supabase 관련은 이 폴더에 추가
```

## 🎯 코드 조직 베스트 프랙티스

### 1. 단일 책임 원칙

- 하나의 파일은 하나의 주요 기능만 담당
- 관련된 타입과 유틸리티는 같은 파일에 포함 가능

### 2. 의존성 순서

```typescript
// 1. 외부 라이브러리
import { useState } from "react";
import Link from "next/link";

// 2. 내부 라이브러리 (@/ 경로)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 3. 상대 경로
import "./component.css";
```

### 3. Export 규칙

```typescript
// ✅ Named export 사용 (컴포넌트, 유틸리티)
export function LoginForm() {}

// ✅ Default export (페이지/레이아웃 컴포넌트, Next.js 요구사항)
export default function LoginPage() {}

// ❌ 혼재 사용 지양
export function LoginForm() {}
export default LoginForm; // 같은 컴포넌트를 두 방식으로 export
```

### 4. 파일 크기 관리

- 단일 파일: 300줄 이하 권장
- 300줄 초과 시 분할 고려

## 🚫 금지사항

### ❌ 피해야 할 구조

```bash
# 깊은 중첩 구조 (4단계 이상)
components/pages/auth/forms/login/login-form.tsx

# 의미 없는 폴더명
components/misc/
components/common/
components/shared/

# 혼재된 케이스
Components/userProfile/LoginForm.tsx
```

### ❌ 피해야 할 패턴

```typescript
// 거대한 파일
export function SuperMegaComponent() {
  // 500줄 이상의 코드
}

// 혼재된 import
import Button from "@/components/ui/button"; // default
import { Card } from "@/components/ui/card"; // named

// 깊은 상대 경로
import { utils } from "../../../../lib/utils";
```

## ✅ 체크리스트

새 파일/폴더 추가 시 확인사항:

- [ ] `src/` 없이 루트 기준 위치에 배치 (app/, components/, lib/)
- [ ] kebab-case 파일명 사용
- [ ] PascalCase 컴포넌트명 사용
- [ ] 경로 별칭(`@/`) 사용
- [ ] 단일 책임 원칙 준수
- [ ] 적절한 export 방식 선택
- [ ] 의존성 import 순서 준수
- [ ] 파일 크기 300줄 이하 유지

이 가이드를 따라 일관성 있고 유지보수하기 쉬운 프로젝트 구조를 만들어보세요!
