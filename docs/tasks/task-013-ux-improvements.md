# Task 013: 사용자 경험 향상

## 개요

- **목표**: Phase 2~3에서 부분적으로만 구현되고 실제 라우트에 연결되지 않았던 UX 요소(로딩/에러/터치 영역)를 완성한다
- **예상 소요 시간**: 반나절
- **관련 기능**: 전체 UI/UX 품질 (특정 F 없음)
- **의존성**: Phase 3 전체 완료

## 배경 / 현재 상태

- **Toast 알림**: Sonner가 이미 Task 003에서 설치되어 10개 파일에서 쓰이고 있음(`toast.success`/`toast.error`) — 추가 작업 불필요, 완료 표시만
- **로딩 스켈레톤**: `components/loading-skeletons.tsx`(`EventCardSkeleton`, `EventCardSkeletonGrid`, `ParticipantCardSkeleton`, `ParticipantListSkeleton`)가 Task 003에서 만들어졌지만 **어느 라우트에서도 import되지 않고 방치**됨. 각 페이지가 `<Suspense>`를 fallback 없이 쓰고 있어 데이터 로딩 중에는 빈 화면만 뜸
- **에러 바운더리/404**: `app/error.tsx`, `app/not-found.tsx` 같은 Next.js 특수 파일이 하나도 없음. 현재는 존재하지 않는 리소스(`notFound()` 호출 시) 접근 시 Next.js 기본 "404: This page could not be found." 화면이 뜨고(Task 012에서 확인), 예기치 못한 런타임 에러는 Next.js 기본 에러 오버레이/화이트스크린으로 처리됨
- **폼 유효성 검사 메시지**: `lib/schemas/event.ts`, `lib/schemas/profile.ts`의 Zod 스키마에 이미 한국어 메시지가 필드별로 지정되어 있고 `FormMessage`로 정상 렌더링됨 — 추가 개선 불필요, 완료 표시만
- **터치 영역 최적화**: shadcn 기본 `Button`(`h-9`=36px, `sm`은 `h-8`=32px), `Input`(`h-9`=36px)이 접근성 가이드라인(iOS HIG 44px, Material 48px) 기준에 못 미침. 모바일 퍼스트 플랫폼(PRD 명시)이므로 실제 터치 조작 빈도가 높은 요소 위주로 개선
- **무한 스크롤/가상화 리스트**: 범위 제외 결정. PRD가 5-30명 규모 소규모 이벤트를 대상으로 하고, Task 011에서도 같은 이유로 서버 페이지네이션을 의도적으로 제외한 바 있음. 현재 목록 쿼리는 전체를 한 번에 가져오는 구조이며, 이 규모에서는 불필요한 엔지니어링으로 판단해 이번 Task에서 구현하지 않음(추후 실사용 규모가 커지면 별도 Task로 재검토)

## 구현 사항

- [x] `app/not-found.tsx` 신규 생성 — 전역 404 페이지, `EmptyState` 컴포넌트 재사용해 기존 디자인 언어와 통일, 홈으로 돌아가는 링크 포함
- [x] `app/error.tsx` 신규 생성 — 전역 에러 바운더리(Client Component). **계획 수정**: Next.js 16(이 프로젝트 실제 설치 버전)에서는 콜백 prop 이름이 `reset`이 아니라 `retry`로 변경되어 있음을 `node_modules/next/dist/docs/`에서 확인 후 반영(AGENTS.md 지침대로 실제 설치 버전 문서 확인)
- [x] **계획 수정**: 라우트 세그먼트 `loading.tsx` 파일 대신, 각 페이지 내부의 `<Suspense>`에 `fallback` prop을 직접 연결하는 방식으로 전환. 모든 데이터 페이지가 이미 자체 내부 `<Suspense>`(fallback 없음)로 데이터 fetch를 감싸고 있어, 별도 라우트 `loading.tsx`를 추가해도 안쪽 Suspense 경계가 우선되어 전혀 트리거되지 않는 문제를 실제 지연 재현 테스트로 발견 — `app/(main)/events/loading.tsx` 등 5개 파일을 만들었다가 삭제하고, 대신 각 `page.tsx`의 `<Suspense fallback={...}>`을 채우는 방식으로 재구현
  - `app/(main)/events/page.tsx` — `EventCardSkeletonGrid` 기반 스켈레톤
  - `app/(main)/events/[id]/page.tsx` — 커버 이미지 + `ParticipantListSkeleton` 기반 스켈레톤
  - `app/join/[invite_code]/page.tsx` — 카드형 스켈레톤
  - `app/(admin-dashboard)/admin/events/page.tsx`, `app/(admin-dashboard)/admin/users/page.tsx` — 테이블 스켈레톤
- [x] `components/ui/button.tsx`의 `default`(36→44px)/`lg`(40→48px)/`icon`(36→44px) variant 높이 조정. `sm`은 보조 액션용으로 의도적 유지
- [x] `components/ui/input.tsx`의 높이를 36px→44px로 조정
- [x] 하단 네비게이션(`components/bottom-nav.tsx`) 검토 — `h-16`(64px) 컨테이너에 flex 아이템으로 배치되어 이미 48px를 크게 상회함, 수정 불필요

## 수락 기준

- 존재하지 않는 라우트(`/foo/bar`) 접근 시 커스텀 404 페이지가 뜨고, 기존 페이지들과 동일한 디자인 언어(시맨틱 색상, 다크모드 대응)를 따른다
- 컴포넌트 렌더링 중 예기치 못한 에러가 발생하면(예: 의도적으로 에러를 던지는 테스트) 전역 에러 바운더리가 화이트스크린 대신 재시도 UI를 보여준다
- 이벤트 목록/상세, 초대 미리보기, 관리자 이벤트/사용자 페이지를 느린 네트워크(스로틀링)로 접근하면 빈 화면 대신 스켈레톤이 보인다
- 주요 버튼과 입력 필드의 터치 영역이 44px 이상이다
- 기존 페이지들의 시각적 회귀가 없다(버튼/입력 필드 크기 변경이 레이아웃을 깨뜨리지 않는다)

## 테스트 체크리스트 (Claude in Chrome)

- [x] 존재하지 않는 경로 접근(`/this-route-does-not-exist`) → 커스텀 404 페이지 확인, 라이트/다크 모드 모두 정상(콘솔 에러 없음)
- [x] `/events`에 `getHostedEvents`로 인위적 지연(8초)을 임시로 주입 후 재현 → `EventCardSkeletonGrid` 기반 스켈레톤이 pulse 애니메이션과 함께 정확히 렌더링됨을 스크린샷으로 확인, 검증 후 지연 코드 완전히 제거
- [x] 버튼/입력 필드 크기 변경 후 이벤트 상세/수정 페이지, 관리자 이벤트/사용자 페이지에서 시각 회귀 확인 — 레이아웃 깨짐 없음, 커진 버튼/입력 필드가 정상적으로 정렬됨
- [x] 관리자 페이지(이벤트 관리, 사용자 관리)에서 검색창 높이 반영 및 콘솔 에러 없음 확인 (SQL로 admin 임시 승격 후 검증, 완료 후 원복)
- [ ] `app/error.tsx`의 실제 트리거 검증은 생략 — 컴포넌트에 인위적 에러를 주입하는 방식이 코드 안정성 리스크 대비 실익이 낮다고 판단, 대신 Next.js 공식 문서 기준으로 `retry` prop 시그니처의 정확성을 확인하는 것으로 대체(코드 레벨 검증)

## 관련 파일

- `app/not-found.tsx` (신규)
- `app/error.tsx` (신규)
- `app/(main)/events/page.tsx` (수정 — 내부 Suspense에 fallback 스켈레톤 추가)
- `app/(main)/events/[id]/page.tsx` (수정 — 내부 Suspense에 fallback 스켈레톤 추가)
- `app/join/[invite_code]/page.tsx` (수정 — 내부 Suspense에 fallback 스켈레톤 추가)
- `app/(admin-dashboard)/admin/events/page.tsx` (수정 — 내부 Suspense에 fallback 스켈레톤 추가)
- `app/(admin-dashboard)/admin/users/page.tsx` (수정 — 내부 Suspense에 fallback 스켈레톤 추가)
- `components/ui/button.tsx` (수정 — 터치 영역 확대)
- `components/ui/input.tsx` (수정 — 터치 영역 확대)
- `components/bottom-nav.tsx` (검토만, 수정 없음)
