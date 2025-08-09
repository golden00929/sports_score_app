"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// POST /api/auth/login - 관리자 로그인
router.post('/login', authController_1.AuthController.login);
// GET /api/auth/profile - 관리자 프로필 조회 (인증 필요)
router.get('/profile', auth_1.authenticateAdmin, authController_1.AuthController.getProfile);
// POST /api/auth/change-password - 비밀번호 변경 (인증 필요)
router.post('/change-password', auth_1.authenticateAdmin, authController_1.AuthController.changePassword);
// POST /api/auth/logout - 로그아웃 (인증 필요)
router.post('/logout', auth_1.authenticateAdmin, authController_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map