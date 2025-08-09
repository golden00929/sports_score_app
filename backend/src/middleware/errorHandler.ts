import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Prisma 관련 에러 처리
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: '중복된 데이터입니다.',
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      message: '요청한 데이터를 찾을 수 없습니다.',
    });
  }

  // JWT 관련 에러
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: '유효하지 않은 토큰입니다.',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: '토큰이 만료되었습니다.',
    });
  }

  // Validation 에러
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: '입력값을 확인해주세요.',
      details: error.message,
    });
  }

  // Multer 파일 업로드 에러
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: '파일 크기가 너무 큽니다. (최대 10MB)',
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      error: 'Too many files',
      message: '파일 개수가 초과되었습니다.',
    });
  }

  // 기본 에러 응답
  const statusCode = error.statusCode || 500;
  const message = error.statusCode 
    ? error.message 
    : '서버 내부 오류가 발생했습니다.';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : error.message,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};