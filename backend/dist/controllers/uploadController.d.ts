import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class UploadController {
    static uploadSingle(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static uploadMultiple(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteFile(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=uploadController.d.ts.map