// 여러 컴포넌트/페이지가 공유하는 UI 상태 타입
// 컴포넌트별 전용 Props는 각 컴포넌트 파일(Task 003 이후)에서 도메인 타입을 직접 참조해 정의한다

import type { EventStatus, UserRole } from "./domain";

// 내 이벤트 목록 페이지 상태 필터 탭 (F008)
export type EventStatusFilter = "all" | EventStatus;

// 관리자 사용자 관리 테이블 역할 필터 (F014)
export type UserRoleFilter = "all" | UserRole;

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
}

export type SortDirection = "asc" | "desc";

export interface SortParams<TKey extends string> {
  key: TKey;
  direction: SortDirection;
}
