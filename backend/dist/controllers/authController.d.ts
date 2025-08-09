import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class AuthController {
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getProfile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static changePassword(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static logout(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map