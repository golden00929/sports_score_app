# 🗺️ Miiracer 배드민턴 기능 로드맵

## 📋 현재 할 일 목록 (우선순위)

### 🔥 1순위 - 핵심 기능 (이번 주)

#### 1.1 관리자 로그인 시스템
- **파일**: `frontend/src/pages/AdminLogin.tsx`
- **작업 내용**:
  - 로그인 폼 UI 구현 (이메일, 비밀번호)
  - 로그인 API 호출 (`/api/auth/login`)
  - JWT 토큰 저장 (localStorage)
  - 로그인 성공 시 대시보드로 리다이렉트
- **API 엔드포인트**: 이미 구현됨 (`backend/src/controllers/authController.ts`)

#### 1.2 관리자 대시보드 실제 구현
- **파일**: `frontend/src/pages/AdminDashboard.tsx`
- **작업 내용**:
  - 대회 정보 실시간 편집 폼
  - 참가자 목록 및 승인/거부 기능
  - 이미지 업로드 기능
  - 통계 대시보드

### 🎯 2순위 - 사용자 기능 (다음 주)

#### 2.1 참가자 등록 폼 완성
- **파일**: `frontend/src/pages/RegistrationPage.tsx`
- **작업 내용**:
  - 베트남 현지화 폼 필드
  - 전화번호 유효성 검사 (10자리)
  - 이미지 업로드 (프로필 사진)
  - 결제 상태 관리
- **베트남 현지화 요구사항**:
  - 전화번호: 0987654321 형식
  - 지역: 베트남 성/도 선택
  - 시간대: UTC+7

#### 2.2 대진표 생성 시스템
- **새 파일**: `frontend/src/components/BracketGenerator.tsx`
- **백엔드**: `backend/src/controllers/bracketController.ts` (신규 생성)
- **작업 내용**:
  - 자동 대진표 생성 알고리즘
  - 수동 대진표 편집
  - 시각적 브라켓 디스플레이
  - 대진표 저장/불러오기

### 🏆 3순위 - 고급 기능 (한 달 내)

#### 3.1 실시간 경기 결과 시스템
- **파일**: `frontend/src/pages/ResultsPage.tsx`
- **작업 내용**:
  - 실시간 스코어 입력
  - 자동 순위 계산
  - 경기 통계 및 기록
  - 결과 공유 기능

#### 3.2 시간표 관리 시스템
- **파일**: `frontend/src/pages/SchedulePage.tsx`
- **작업 내용**:
  - 코트별 경기 일정
  - 실시간 진행 상황
  - 경기 지연/변경 공지
  - 베트남 시간대 표시

## 🛠️ 구현 가이드

### 1단계: 관리자 로그인 구현 상세

#### AdminLogin.tsx 수정
```typescript
// 현재 상태: 플레이스홀더
// 필요 작업:
1. useState로 폼 상태 관리
2. 로그인 API 호출 함수
3. 오류 처리 및 로딩 상태
4. 성공 시 리다이렉트
```

#### 필요한 새 Hook
```typescript
// frontend/src/hooks/useAuth.ts
// 인증 관련 로직 분리
```

#### AuthContext 수정
```typescript
// frontend/src/contexts/AuthContext.tsx
// 현재 더미 데이터, 실제 API 연동 필요
```

### 2단계: 대시보드 구현 상세

#### AdminDashboard.tsx 구조
```
📊 관리자 대시보드
├── 🏆 대회 정보 편집 섹션
├── 👥 참가자 관리 섹션  
├── 📁 파일 업로드 섹션
├── 📈 통계 섹션
└── ⚙️ 설정 섹션
```

## 📁 새로 생성해야 할 파일들

### 프론트엔드
```
frontend/src/
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx        # 로그인 폼
│   │   ├── RegistrationForm.tsx # 참가자 등록 폼
│   │   └── TournamentForm.tsx   # 대회 정보 편집 폼
│   ├── dashboard/
│   │   ├── StatisticsCard.tsx   # 통계 카드
│   │   ├── ParticipantList.tsx  # 참가자 목록
│   │   └── FileUploadZone.tsx   # 파일 업로드
│   └── bracket/
│       ├── BracketView.tsx      # 대진표 보기
│       └── BracketEditor.tsx    # 대진표 편집
├── hooks/
│   ├── useAuth.ts              # 인증 훅
│   ├── useParticipants.ts      # 참가자 관리 훅
│   └── useTournament.ts        # 대회 정보 훅
└── utils/
    ├── api.ts                  # API 호출 유틸리티
    ├── validation.ts           # 유효성 검사
    └── vietnamData.ts          # 베트남 지역 데이터
```

### 백엔드
```
backend/src/
├── controllers/
│   ├── bracketController.ts    # 대진표 관리
│   └── fileController.ts       # 파일 업로드
├── services/
│   ├── bracketService.ts       # 대진표 비즈니스 로직
│   └── notificationService.ts  # 알림 서비스
└── utils/
    └── bracketGenerator.ts     # 대진표 생성 알고리즘
```

## 🎨 디자인 시스템

### 색상 팔레트 (이미 정의됨)
```typescript
// 브랜드 컬러
primary: '#FF0000'    // Miiracer 레드
secondary: '#D4B896'  // 골드
background: '#F5F5F5' // 라이트 그레이
```

### 컴포넌트 스타일 가이드
- Material-UI 기본 컴포넌트 사용
- 반응형 디자인 필수
- 모바일 우선 접근법
- 베트남 사용자 UX 고려

## 🧪 테스트 계획

### 기능별 테스트 시나리오

#### 관리자 로그인
- [ ] 올바른 credentials로 로그인 성공
- [ ] 잘못된 credentials로 로그인 실패
- [ ] 토큰 만료 시 자동 로그아웃
- [ ] 새로고침 시 로그인 상태 유지

#### 참가자 등록
- [ ] 모든 필드 올바른 입력 시 등록 성공
- [ ] 베트남 전화번호 형식 검증
- [ ] 이미지 업로드 기능
- [ ] 중복 등록 방지

#### 대진표 생성
- [ ] 자동 대진표 생성
- [ ] 수동 대진표 편집
- [ ] 대진표 저장/불러오기
- [ ] 참가자 수 변경 시 대진표 업데이트

## 🚀 배포 준비 체크리스트

### 개발 환경 → 프로덕션
- [ ] 환경 변수 설정
- [ ] 데이터베이스 마이그레이션 (SQLite → PostgreSQL)
- [ ] Docker 컨테이너 최적화
- [ ] HTTPS 설정
- [ ] 베트남 서버 배포 고려

## 📞 도움이 필요할 때

### 막혔을 때 확인할 것들
1. `DEVELOPMENT_GUIDE.md` - 상세 개발 가이드
2. `QUICK_START.md` - 빠른 재시작 방법
3. `MIIRACER_LEARNING.md` - 전체 프로젝트 이해

### 자주 참고할 파일들
- `backend/prisma/schema.prisma` - 데이터베이스 구조
- `frontend/src/App.tsx` - 라우팅 및 전역 설정
- `backend/src/controllers/` - API 엔드포인트들

---

**🎯 목표**: 다음 작업 시 이 로드맵을 보고 우선순위에 따라 체계적으로 개발하기!