-- 테스트용 참가자 데이터 추가
INSERT INTO participants (id, tournamentId, name, gender, birthYear, province, district, phone, experience, skillLevel, approvalStatus, paymentStatus) VALUES
  ('test-01', 'sample-tournament-id', '김민수', 'male', 1990, 'HCM', 'HCM-Q1', '0987654321', 'advanced', 'A', 'approved', 'completed'),
  ('test-02', 'sample-tournament-id', '이준호', 'male', 1992, 'HCM', 'HCM-Q3', '0987654322', 'expert', 'A', 'approved', 'completed'),
  ('test-03', 'sample-tournament-id', '박성민', 'male', 1988, 'HCM', 'HCM-Q5', '0987654323', 'advanced', 'A', 'approved', 'completed'),
  ('test-04', 'sample-tournament-id', '정우진', 'male', 1993, 'HCM', 'HCM-Q7', '0987654324', 'intermediate', 'B', 'approved', 'completed'),
  ('test-05', 'sample-tournament-id', '홍길동', 'male', 1991, 'HCM', 'HCM-BT', '0987654325', 'intermediate', 'B', 'approved', 'completed'),
  ('test-06', 'sample-tournament-id', '조현우', 'male', 1989, 'HCM', 'HCM-PN', '0987654326', 'beginner', 'C', 'approved', 'completed'),
  ('test-07', 'sample-tournament-id', '김지영', 'female', 1994, 'HCM', 'HCM-TD', '0987654327', 'advanced', 'A', 'approved', 'completed'),
  ('test-08', 'sample-tournament-id', '박소연', 'female', 1992, 'HCM', 'HCM-Q1', '0987654328', 'intermediate', 'B', 'approved', 'completed'),
  ('test-09', 'sample-tournament-id', '이수정', 'female', 1990, 'HCM', 'HCM-Q3', '0987654329', 'expert', 'A', 'approved', 'completed'),
  ('test-10', 'sample-tournament-id', '최민정', 'female', 1995, 'HCM', 'HCM-Q5', '0987654330', 'beginner', 'C', 'approved', 'completed');