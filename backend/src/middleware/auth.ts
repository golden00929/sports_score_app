import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token is required',
        message: '접근 토큰이 필요합니다.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const admin = await prisma.admin.findUnique({
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
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token verification failed',
      message: '토큰 검증에 실패했습니다.' 
    });
  }
};

// 옵셔널 인증 미들웨어 (공개/비공개 구분용)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const admin = await prisma.admin.findUnique({
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
  } catch (error) {
    // 토큰이 있지만 유효하지 않은 경우에도 계속 진행
    next();
  }
};