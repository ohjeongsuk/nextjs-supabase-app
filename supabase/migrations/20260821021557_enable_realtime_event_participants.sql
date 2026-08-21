-- event_participants 테이블 변경 사항을 Supabase Realtime으로 브로드캐스트하기 위해
-- supabase_realtime publication에 추가한다 (참여자 수 실시간 카운트에 사용)
alter publication supabase_realtime add table event_participants;
