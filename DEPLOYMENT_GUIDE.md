# Miiracer Badminton 배포 가이드

## 개발 환경 실행

### 1. 환경 변수 설정
```bash
# Backend 환경 변수 (.env)
cp backend/.env.example backend/.env
# 필요한 값들 수정: DATABASE_URL, JWT_SECRET, GOOGLE_MAPS_API_KEY 등
```

### 2. Docker로 전체 실행
```bash
docker-compose up -d
```

### 3. 개별 서비스 실행

#### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

#### Frontend  
```bash
cd frontend
npm install
npm start
```

## 프로덕션 배포

### 1. 환경 변수 설정
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: 32자 이상 랜덤 문자열
- `GOOGLE_MAPS_API_KEY`: 구글맵 API 키 (베트남 지역 활성화)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: 초기 관리자 계정

### 2. 데이터베이스 초기화
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 3. 도메인 및 SSL 설정
- nginx 리버스 프록시 설정
- Let's Encrypt SSL 인증서 설정

## 기본 관리자 계정
- 이메일: admin@miiracer.com
- 비밀번호: admin123!
- ⚠️ 프로덕션에서는 반드시 변경하세요

## 주요 기능 체크리스트

### 관리자 기능
- [ ] 관리자 로그인
- [ ] 대회 정보 편집 (이미지 업로드 포함)
- [ ] 참가자 목록 관리
- [ ] 승인/거부 처리
- [ ] 결제 확인
- [ ] 데이터 엑셀 내보내기

### 사용자 기능
- [ ] 대회 정보 조회
- [ ] 참가 신청 (베트남 현지화)
- [ ] 대진표 조회 (추후 구현)
- [ ] 시간표 조회 (추후 구현)
- [ ] 결과 조회 (추후 구현)

## 다음 개발 단계
1. 대진표 생성 시스템 (자동/수동)
2. 시각적 브라켓 UI
3. 시간표 관리 시스템
4. 경기 결과 입력/관리
5. PWA 설정
6. 구글맵 연동

## 지원 및 문의
- 개발팀: dev@miiracer.com
- 기술지원: support@miiracer.com