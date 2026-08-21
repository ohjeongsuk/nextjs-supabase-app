-- event_participants의 기본키(id)는 event_id를 포함하지 않아,
-- REPLICA IDENTITY DEFAULT(PK만 포함) 상태에서는 DELETE 이벤트의 old 레코드에 event_id가 없다.
-- Realtime 구독의 서버 사이드 필터(event_id=eq.xxx)가 DELETE 페이로드에서 이 컬럼을 찾지 못해
-- 이벤트 자체가 드롭되므로, 전체 컬럼을 old 레코드에 포함시켜 필터가 정상 동작하게 한다.
alter table event_participants replica identity full;
