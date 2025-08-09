"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                error: 'Access token is required',
                message: '접근 토큰이 필요합니다.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = await database_1.prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            }
        });
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                error: 'Invalid or expired token',
                message: '유효하지 않거나 만료된 토큰입니다.'
            });
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: 'Token verification failed',
            message: '토큰 검증에 실패했습니다.'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
// 옵셔널 인증 미들웨어 (공개/비공개 구분용)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const admin = await database_1.prisma.admin.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true,
                }
            });
            if (admin && admin.isActive) {
                req.admin = admin;
            }
        }
        next();
    }
    catch (error) {
        // 토큰이 있지만 유효하지 않은 경우에도 계속 진행
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map