import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `요청한 경로 ${req.originalUrl}을(를) 찾을 수 없습니다.`,
    path: req.originalUrl,
    method: req.method,
  });
};