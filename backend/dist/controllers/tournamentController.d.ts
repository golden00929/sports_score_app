import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class TournamentController {
    static getTournamentInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static upsertTournamentInfo(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateTournamentStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getTournamentStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=tournamentController.d.ts.map