import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class BracketController {
    static getBrackets(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createBracket(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static generateBracketStructure(participants: any[], type: string): {
        type: string;
        totalRounds: number;
        totalParticipants: number;
        rounds: any[];
        matches: any[];
    } | {
        type: string;
        totalRounds: number;
        totalParticipants: number;
        totalMatches: number;
        matches: any[];
    };
    static generateSingleElimination(participants: any[]): {
        type: string;
        totalRounds: number;
        totalParticipants: number;
        rounds: any[];
        matches: any[];
    };
    static generateRoundRobin(participants: any[]): {
        type: string;
        totalRounds: number;
        totalParticipants: number;
        totalMatches: number;
        matches: any[];
    };
    static getRoundName(roundNumber: number, totalRounds: number): string;
    static createMatches(bracketId: string, tournamentId: string, matches: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    static updateBracketStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateMatchResult(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateNextRoundMatch(completedMatch: any): Promise<void>;
    static deleteBracket(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getSuggestedBrackets(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=bracketController.d.ts.map