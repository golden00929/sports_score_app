# Miiracer 배드민턴 토너먼트 시스템 개발 가이드

## 🚀 프로젝트 재시작 체크리스트

### 1. 개발 환경 준비
```bash
# WSL Ubuntu 환경에서 실행
cd /home/jay/miiracer-badminton

# Node.js 및 npm 버전 확인
node --version  # v18 이상 필요
npm --version   # v8 이상 필요

# Docker Desktop 실행 상태 확인 (선택사항)
docker --version
```

### 2. 의존성 설치 및 데이터베이스 설정
```bash
# 백엔드 의존성 설치
cd backend
npm install

# 프론트엔드 의존성 설치
cd ../frontend
npm install

# 데이터베이스 초기화 (중요!)
cd ../backend
npx prisma generate
npx prisma db push
```

### 3. 개발 서버 실행
```bash
# 터미널 1: 백엔드 서버 (포트 5000)
cd /home/jay/miiracer-badminton/backend
npm run dev

# 터미널 2: 프론트엔드 서버 (포트 3000)
cd /home/jay/miiracer-badminton/frontend
npm start
```

## 🏗️ 현재 구현 상태

### ✅ 완성된 기능
- [x] 프로젝트 구조 및 환경 설정
- [x] 백엔드 API 서버 (Node.js + Express + TypeScript)
- [x] 데이터베이스 스키마 (Prisma + SQLite)
- [x] JWT 인증 시스템 기반 구조
- [x] 파일 업로드 시스템 (Multer + Sharp)
- [x] 프론트엔드 기본 구조 (React + TypeScript + Material-UI)
- [x] 라우팅 및 네비게이션
- [x] 다국어 지원 기반 (i18next)
- [x] 홈페이지 및 기본 페이지들

### ⏳ 미완성 기능 (우선순위 순)
1. **관리자 로그인 시스템** - 현재 플레이스홀더
2. **참가자 등록 폼** - 베트남 현지화 필드 필요
3. **대진표 생성 기능** - 핵심 토너먼트 기능
4. **실시간 경기 결과 입력**
5. **시간표 관리 시스템**

## 🔧 주요 설정 및 구성

### 백엔드 설정
```typescript
// backend/src/app.ts - 메인 서버 파일
// backend/src/controllers/ - API 컨트롤러
// backend/prisma/schema.prisma - 데이터베이스 스키마
// backend/src/utils/jwt.ts - JWT 유틸리티
```

### 프론트엔드 설정
```typescript
// frontend/src/App.tsx - 메인 앱 컴포넌트
// frontend/src/pages/ - 페이지 컴포넌트들
// frontend/src/contexts/ - Context 프로바이더들
// frontend/src/components/ - 재사용 가능한 컴포넌트들
```

### 중요한 포트 및 URL
- 백엔드: http://localhost:5000
- 프론트엔드: http://localhost:3000
- API 베이스: http://localhost:5000/api

## ⚠️ 자주 발생하는 오류 및 해결법

### 1. Prisma 관련 오류
```bash
# 오류: "@prisma/client did not initialize yet"
# 해결법:
cd backend
npx prisma generate

# 오류: Database schema is not in sync
# 해결법:
npx prisma db push
```

### 2. 포트 충돌 오류
```bash
# 포트 5000이 사용 중인 경우
lsof -ti:5000 | xargs kill -9

# 포트 3000이 사용 중인 경우
lsof -ti:3000 | xargs kill -9
```

### 3. npm 의존성 오류
```bash
# 오류: package-lock.json 관련 문제
# 해결법:
rm package-lock.json
rm -rf node_modules
npm install
```

### 4. TypeScript 컴파일 오류
```bash
# JWT 관련 타입 오류가 발생하면
# backend/src/utils/jwt.ts 파일 확인
# 이미 수정되어 있어야 함
```

## 🎯 다음 작업 우선순위

### 1단계: 관리자 로그인 구현 (필수)
```typescript
// 작업 파일: frontend/src/pages/AdminLogin.tsx
// 백엔드 API: backend/src/controllers/authController.ts
// 필요 작업:
// - 로그인 폼 UI 구현
// - API 연동
// - JWT 토큰 저장 및 관리
// - 인증 상태 관리 (AuthContext)
```

### 2단계: 참가자 등록 폼 구현
```typescript
// 작업 파일: frontend/src/pages/RegistrationPage.tsx
// 백엔드 API: backend/src/controllers/participantController.ts
// 필요 작업:
// - 베트남 현지화 필드 (전화번호, 지역)
// - 폼 유효성 검사
// - 이미지 업로드 기능
// - 결제 상태 관리
```

### 3단계: 대진표 생성 시스템
```typescript
// 새 파일: frontend/src/components/BracketGenerator.tsx
// 백엔드 API: backend/src/controllers/bracketController.ts
// 필요 작업:
// - 자동 대진표 생성 알고리즘
// - 수동 대진표 편집 기능
// - 시각적 브라켓 표시
```

## 📁 프로젝트 구조 이해

```
miiracer-badminton/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API 엔드포인트 로직
│   │   ├── middleware/      # 인증, 검증 미들웨어
│   │   ├── utils/          # 유틸리티 함수들
│   │   └── app.ts          # Express 앱 설정
│   ├── prisma/
│   │   ├── schema.prisma   # 데이터베이스 스키마
│   │   └── dev.db          # SQLite 데이터베이스 파일
│   └── uploads/            # 업로드된 파일들
├── frontend/
│   ├── src/
│   │   ├── components/     # 재사용 컴포넌트
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── i18n/          # 다국어 설정
│   │   └── App.tsx         # 메인 앱
│   └── public/            # 정적 파일들
├── docker-compose.yml     # Docker 설정
└── DEVELOPMENT_GUIDE.md   # 이 파일
```

## 🔍 디버깅 도구 및 팁

### 1. API 테스트
```bash
# 서버 상태 확인
curl http://localhost:5000/api/health

# 관리자 로그인 테스트 (구현 후)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miiracer.com","password":"admin123!"}'
```

### 2. 데이터베이스 확인
```bash
# SQLite 데이터베이스 내용 확인
cd backend
npx prisma studio
# http://localhost:5555 에서 확인 가능
```

### 3. 로그 및 오류 추적
```typescript
// 개발 중 console.log 활용
console.log('API Response:', response.data);
console.error('Error occurred:', error);
```

## 🌐 베트남 현지화 요구사항

### 전화번호 형식
- 형식: 10자리 (예: 0987654321)
- 유효성 검사: `/^0\d{9}$/`

### 지역 데이터
- 베트남 성/도 데이터 포함
- UTC+7 시간대 설정
- 베트남 동화(VND) 지원

### 언어 지원
- 한국어 (기본)
- 베트남어
- 영어

## 🚨 중요 주의사항

### 1. 데이터베이스 변경 시
```bash
# 스키마 변경 후 반드시 실행
npx prisma db push
npx prisma generate
```

### 2. 환경 변수 설정
```bash
# backend/.env 파일 확인
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 3. CORS 설정
```typescript
// backend/src/app.ts에서 CORS 설정 확인
// 프론트엔드 URL이 허용되어야 함
```

## 📝 개발 진행 시 체크리스트

### 새 기능 개발 시
- [ ] 백엔드 API 엔드포인트 작성
- [ ] 프론트엔드 컴포넌트 작성
- [ ] API 연동 및 테스트
- [ ] 오류 처리 추가
- [ ] UI/UX 검토
- [ ] 베트남 현지화 요구사항 확인

### 코드 커밋 전
- [ ] TypeScript 컴파일 오류 없음
- [ ] console.log 제거
- [ ] 기본 기능 테스트 완료
- [ ] 반응형 디자인 확인

## 🔗 유용한 명령어 모음

```bash
# 프로젝트 전체 재시작
cd /home/jay/miiracer-badminton
npm run clean  # package.json에 스크립트 추가 필요

# 개발 서버 동시 실행 (새 터미널에서)
npm run dev:all  # package.json에 스크립트 추가 필요

# 빌드 테스트
cd frontend && npm run build
cd ../backend && npm run build
```

이 가이드를 참고하여 시행착오 없이 개발을 이어가세요! 🚀