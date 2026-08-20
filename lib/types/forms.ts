// Task 004에서 React Hook Form + Zod로 구현할 폼의 입력값 타입
// Zod 스키마(런타임 검증) 자체는 Task 004에서 작성한다

/**
 * 이벤트 생성/수정 폼 입력값
 * - title: 필수, 최대 50자
 * - description: 선택, 최대 500자
 * - location: 필수, 최대 100자
 * - cover_image: File(새로 업로드) | string(기존 URL 유지) | null(미설정)
 */
export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  event_date: string;
  cover_image: File | string | null;
}

/**
 * 프로필 수정 폼 입력값
 * - name: 최대 50자, email은 수정 불가이므로 폼에 포함하지 않음
 */
export interface ProfileFormValues {
  name: string;
}
