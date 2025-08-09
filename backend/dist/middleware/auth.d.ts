import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export declare const authenticateAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map