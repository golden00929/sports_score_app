import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class ParticipantController {
    static applyParticipant(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getParticipants(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateApprovalStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updatePaymentStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateParticipant(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteParticipant(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static exportParticipants(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=participantController.d.ts.map