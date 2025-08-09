"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
class AuthController {
    // 관리자 로그인
    static async login(req, res) {
        try {
            const { error, value } = validation_1.adminLoginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.details[0].message,
                });
            }
            const { email, password } = value;
            // 관리자 계정 조회
            const admin = await database_1.prisma.admin.findUnique({
                where: { email },
            });
            if (!admin || !admin.isActive) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                });
            }
            // 비밀번호 검증
            const isPasswordValid = await (0, password_1.comparePassword)(password, admin.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                });
            }
            // JWT 토큰 생성
            const token = (0, jwt_1.generateToken)({
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            });
            // 로그인 성공 응답
            res.json({
                success: true,
                message: '로그인이 완료되었습니다.',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                        role: admin.role,
                    },
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '로그인 중 오류가 발생했습니다.',
            });
        }
    }
    // 토큰 검증 및 관리자 정보 조회
    static async getProfile(req, res) {
        try {
            const admin = await database_1.prisma.admin.findUnique({
                where: { id: req.admin.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!admin) {
                return res.status(404).json({
                    error: 'Admin not found',
                    message: '관리자를 찾을 수 없습니다.',
                });
            }
            res.json({
                success: true,
                data: admin,
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '프로필 조회 중 오류가 발생했습니다.',
            });
        }
    }
    // 비밀번호 변경
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: '현재 비밀번호와 새 비밀번호를 입력해주세요.',
                });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'Password too short',
                    message: '새 비밀번호는 최소 6자 이상이어야 합니다.',
                });
            }
            const admin = await database_1.prisma.admin.findUnique({
                where: { id: req.admin.id },
            });
            if (!admin) {
                return res.status(404).json({
                    error: 'Admin not found',
                    message: '관리자를 찾을 수 없습니다.',
                });
            }
            // 현재 비밀번호 확인
            const isCurrentPasswordValid = await (0, password_1.comparePassword)(currentPassword, admin.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    error: 'Invalid current password',
                    message: '현재 비밀번호가 올바르지 않습니다.',
                });
            }
            // 새 비밀번호 해시화 및 업데이트
            const hashedNewPassword = await (0, password_1.hashPassword)(newPassword);
            await database_1.prisma.admin.update({
                where: { id: req.admin.id },
                data: { password: hashedNewPassword },
            });
            res.json({
                success: true,
                message: '비밀번호가 성공적으로 변경되었습니다.',
            });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '비밀번호 변경 중 오류가 발생했습니다.',
            });
        }
    }
    // 로그아웃 (클라이언트에서 토큰 삭제)
    static async logout(req, res) {
        res.json({
            success: true,
            message: '로그아웃이 완료되었습니다.',
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map