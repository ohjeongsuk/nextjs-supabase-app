import type { EventStatus } from "@/lib/types";

// event_date(자정 기준 하루)를 기준으로 상태를 파생 계산한다 (F008)
// DB의 status 컬럼은 저장하지 않고, 조회 시점마다 이 함수로 항상 최신 상태를 계산해 사용한다
export function deriveEventStatus(
  eventDate: string,
  now = new Date(),
): EventStatus {
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (today.getTime() < eventDay.getTime()) return "upcoming";
  if (today.getTime() === eventDay.getTime()) return "ongoing";
  return "ended";
}
