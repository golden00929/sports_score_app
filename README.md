# Miiracer Sports Score - Tournament Management System

## 프로젝트 개요
베트남 현지 사용자를 위한 스포츠 스코어 관리 및 배드민턴 대회 운영 웹애플리케이션

## 기술 스택
- Frontend: React.js + TypeScript
- Backend: Node.js + Express + PostgreSQL
- 인증: JWT 기반 로그인 시스템
- 배포: Docker 컨테이너화

## 주요 기능
1. 대회 개요 관리 (관리자 편집 기능)
2. 참가자 모집 (베트남 현지화)
3. 대진표 생성 (자동/수동)
4. 대회 시간표 관리
5. 대회 결과 관리

## 브랜드 컬러
- Primary Red: #FF0000
- Black: #000000
- White: #FFFFFF
- Light Brown: #D4B896

## 개발 환경 설정
```bash
# Backend 실행
cd backend
npm install
npm run dev

# Frontend 실행
cd frontend
npm install
npm start
```

## 베트남 현지화 특징
- 구글맵 연동
- 베트남 전화번호 형식 (10자리)
- 베트남 지역 선택 옵션
- 시간대: UTC+7
- 다국어 지원 (베트남어/영어/한국어)