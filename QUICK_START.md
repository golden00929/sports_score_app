# 🚀 Miiracer 배드민턴 프로젝트 빠른 시작 가이드

## 30초 재시작 가이드

```bash
# 1. 프로젝트 폴더로 이동
cd /home/jay/miiracer-badminton

# 2. 백엔드 시작 (터미널 1)
cd backend && npm run dev

# 3. 프론트엔드 시작 (터미널 2 - 새 터미널 열고)
cd /home/jay/miiracer-badminton/frontend && npm start
```

## 문제 해결 원샷 명령어

```bash
# 모든 문제 해결 명령어 (오류 발생 시 실행)
cd /home/jay/miiracer-badminton/backend
npx prisma generate && npx prisma db push
cd ../frontend && npm install
cd ../backend && npm install
```

## 현재 상태 요약

| 기능 | 상태 | 파일 위치 |
|------|------|-----------|
| 홈페이지 | ✅ 완료 | `frontend/src/pages/HomePage.tsx` |
| 관리자 로그인 | ❌ 플레이스홀더 | `frontend/src/pages/AdminLogin.tsx` |
| 참가자 등록 | ❌ 플레이스홀더 | `frontend/src/pages/RegistrationPage.tsx` |
| 대진표 | ❌ 미구현 | `frontend/src/pages/BracketPage.tsx` |
| 백엔드 API | ✅ 기본 구조 | `backend/src/controllers/` |

## 다음 작업할 것

1. **관리자 로그인 구현** (가장 중요!)
2. **참가자 등록 폼 완성**
3. **대진표 생성 기능**

## 접속 URL

- 🌐 프론트엔드: http://localhost:3000
- 🚀 백엔드 API: http://localhost:5000
- 📊 데이터베이스 관리: `npx prisma studio` (포트 5555)

## SOS - 급한 문제 해결

### 서버가 안 켜져요!
```bash
# 포트 충돌 해결
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### Prisma 오류가 나와요!
```bash
cd backend
npx prisma generate
npx prisma db push
```

### npm 오류가 나와요!
```bash
rm -rf node_modules package-lock.json
npm install
```

---
**💡 팁**: 이 파일을 즐겨찾기 해두고 다음에 작업할 때 바로 참고하세요!