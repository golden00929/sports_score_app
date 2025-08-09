import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return (jwt as any).sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};