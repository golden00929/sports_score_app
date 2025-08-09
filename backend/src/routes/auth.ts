import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/login - 관리자 로그인
router.post('/login', AuthController.login);

// GET /api/auth/profile - 관리자 프로필 조회 (인증 필요)
router.get('/profile', authenticateAdmin, AuthController.getProfile);

// POST /api/auth/change-password - 비밀번호 변경 (인증 필요)
router.post('/change-password', authenticateAdmin, AuthController.changePassword);

// POST /api/auth/logout - 로그아웃 (인증 필요)
router.post('/logout', authenticateAdmin, AuthController.logout);

export default router;