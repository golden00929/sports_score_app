"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BracketController = void 0;
const database_1 = require("../config/database");
class BracketController {
    // 브라켓 목록 조회
    static async getBrackets(req, res) {
        try {
            const { tournamentId } = req.params;
            const brackets = await database_1.prisma.bracket.findMany({
                where: { tournamentId },
                include: {
                    matches: {
                        orderBy: { matchNumber: 'asc' },
                        include: {
                            player1: true,
                            player2: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({
                success: true,
                data: brackets,
            });
        }
        catch (error) {
            console.error('Get brackets error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '브라켓 목록 조회 중 오류가 발생했습니다.',
            });
        }
    }
    // 브라켓 생성
    static async createBracket(req, res) {
        try {
            const { tournamentId } = req.params;
            const { name, skillLevel, eventType, type, participantIds } = req.body;
            if (!name || !skillLevel || !eventType) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: '브라켓명, 등급, 경기종목을 입력해주세요.',
                });
            }
            // 참가자 정보 조회
            const participants = await database_1.prisma.participant.findMany({
                where: {
                    tournamentId,
                    id: { in: participantIds || [] },
                    approvalStatus: 'approved',
                    skillLevel,
                    eventType,
                },
            });
            if (participants.length < 2) {
                return res.status(400).json({
                    error: 'Insufficient participants',
                    message: '브라켓 생성을 위해서는 최소 2명의 승인된 참가자가 필요합니다.',
                });
            }
            // 브라켓 구조 생성
            const bracketData = BracketController.generateBracketStructure(participants, type || 'single_elimination');
            // 브라켓 저장
            const bracket = await database_1.prisma.bracket.create({
                data: {
                    tournamentId,
                    name,
                    skillLevel,
                    eventType,
                    type: type || 'single_elimination',
                    participants: JSON.stringify(participantIds),
                    bracketData: JSON.stringify(bracketData),
                    status: 'draft',
                },
            });
            // 매치 생성
            const matches = await BracketController.createMatches(bracket.id, tournamentId, bracketData.matches);
            res.status(201).json({
                success: true,
                message: '브라켓이 성공적으로 생성되었습니다.',
                data: {
                    bracket,
                    matches,
                },
            });
        }
        catch (error) {
            console.error('Create bracket error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '브라켓 생성 중 오류가 발생했습니다.',
            });
        }
    }
    // 브라켓 구조 자동 생성
    static generateBracketStructure(participants, type) {
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
        if (type === 'single_elimination') {
            return BracketController.generateSingleElimination(shuffledParticipants);
        }
        else if (type === 'round_robin') {
            return BracketController.generateRoundRobin(shuffledParticipants);
        }
        return BracketController.generateSingleElimination(shuffledParticipants);
    }
    // 단일 토너먼트 브라켓 생성
    static generateSingleElimination(participants) {
        const rounds = [];
        let currentRound = [...participants];
        let roundNumber = 1;
        const matches = [];
        while (currentRound.length > 1) {
            const nextRound = [];
            const roundMatches = [];
            // 현재 라운드 매치 생성
            for (let i = 0; i < currentRound.length; i += 2) {
                const player1 = currentRound[i];
                const player2 = currentRound[i + 1] || null; // 홀수일 경우 부전승
                const match = {
                    id: `match_${roundNumber}_${Math.floor(i / 2) + 1}`,
                    roundName: BracketController.getRoundName(roundNumber, Math.ceil(Math.log2(participants.length))),
                    matchNumber: Math.floor(i / 2) + 1,
                    player1Id: player1?.id || null,
                    player2Id: player2?.id || null,
                    player1Name: player1?.name || null,
                    player2Name: player2?.name || null,
                    status: player2 ? 'scheduled' : 'completed',
                    winnerId: player2 ? null : player1?.id,
                };
                roundMatches.push(match);
                matches.push(match);
                // 다음 라운드 진출자 결정
                if (player2) {
                    nextRound.push(null); // 매치 결과에 따라 결정됨
                }
                else {
                    nextRound.push(player1); // 부전승
                }
            }
            rounds.push({
                roundNumber,
                roundName: BracketController.getRoundName(roundNumber, Math.ceil(Math.log2(participants.length))),
                matches: roundMatches,
            });
            currentRound = nextRound;
            roundNumber++;
        }
        return {
            type: 'single_elimination',
            totalRounds: rounds.length,
            totalParticipants: participants.length,
            rounds,
            matches,
        };
    }
    // 라운드로빈 브라켓 생성
    static generateRoundRobin(participants) {
        const matches = [];
        let matchNumber = 1;
        // 모든 참가자 간의 매치 생성
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                const match = {
                    id: `rr_match_${matchNumber}`,
                    roundName: '리그전',
                    matchNumber: matchNumber++,
                    player1Id: participants[i].id,
                    player2Id: participants[j].id,
                    player1Name: participants[i].name,
                    player2Name: participants[j].name,
                    status: 'scheduled',
                    winnerId: null,
                };
                matches.push(match);
            }
        }
        return {
            type: 'round_robin',
            totalRounds: 1,
            totalParticipants: participants.length,
            totalMatches: matches.length,
            matches,
        };
    }
    // 라운드명 생성
    static getRoundName(roundNumber, totalRounds) {
        if (totalRounds === 1)
            return '결승';
        if (roundNumber === totalRounds)
            return '결승';
        if (roundNumber === totalRounds - 1)
            return '준결승';
        if (roundNumber === totalRounds - 2)
            return '8강';
        if (roundNumber === totalRounds - 3)
            return '16강';
        return `${roundNumber}회전`;
    }
    // 매치 데이터베이스 저장
    static async createMatches(bracketId, tournamentId, matches) {
        const matchData = matches.map(match => ({
            tournamentId,
            bracketId,
            roundName: match.roundName,
            matchNumber: match.matchNumber,
            player1Id: match.player1Id,
            player2Id: match.player2Id,
            player1Name: match.player1Name,
            player2Name: match.player2Name,
            status: match.status,
            winnerId: match.winnerId,
        }));
        return await database_1.prisma.match.createMany({
            data: matchData,
        });
    }
    // 브라켓 상태 업데이트 (draft -> published -> ongoing -> completed)
    static async updateBracketStatus(req, res) {
        try {
            const { bracketId } = req.params;
            const { status } = req.body;
            const validStatuses = ['draft', 'published', 'ongoing', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    message: '유효하지 않은 상태입니다.',
                });
            }
            const bracket = await database_1.prisma.bracket.update({
                where: { id: bracketId },
                data: { status },
            });
            res.json({
                success: true,
                message: '브라켓 상태가 업데이트되었습니다.',
                data: bracket,
            });
        }
        catch (error) {
            console.error('Update bracket status error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '브라켓 상태 업데이트 중 오류가 발생했습니다.',
            });
        }
    }
    // 매치 결과 업데이트
    static async updateMatchResult(req, res) {
        try {
            const { matchId } = req.params;
            const { player1Score, player2Score, winnerId, notes } = req.body;
            if (player1Score == null || player2Score == null || !winnerId) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: '점수와 승자 정보를 입력해주세요.',
                });
            }
            // 매치 업데이트
            const match = await database_1.prisma.match.update({
                where: { id: matchId },
                data: {
                    player1Score: parseInt(player1Score),
                    player2Score: parseInt(player2Score),
                    winnerId,
                    status: 'completed',
                    actualEndTime: new Date(),
                    notes,
                },
                include: {
                    bracket: true,
                    player1: true,
                    player2: true,
                },
            });
            // 다음 라운드 업데이트 (단일 토너먼트의 경우)
            if (match.bracket && match.bracket.type === 'single_elimination') {
                await BracketController.updateNextRoundMatch(match);
            }
            res.json({
                success: true,
                message: '매치 결과가 업데이트되었습니다.',
                data: match,
            });
        }
        catch (error) {
            console.error('Update match result error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '매치 결과 업데이트 중 오류가 발생했습니다.',
            });
        }
    }
    // 다음 라운드 매치 업데이트
    static async updateNextRoundMatch(completedMatch) {
        try {
            const bracketData = JSON.parse(completedMatch.bracket.bracketData);
            const currentRound = completedMatch.roundName;
            // 다음 라운드가 있는지 확인하고 업데이트
            // 이 부분은 브라켓 구조에 따라 복잡한 로직이 필요함
            // 현재는 기본적인 구현만 포함
            console.log(`Match ${completedMatch.id} completed, winner: ${completedMatch.winnerId}`);
        }
        catch (error) {
            console.error('Update next round error:', error);
        }
    }
    // 브라켓 삭제
    static async deleteBracket(req, res) {
        try {
            const { bracketId } = req.params;
            // 관련 매치들도 함께 삭제됨 (onDelete: Cascade)
            await database_1.prisma.bracket.delete({
                where: { id: bracketId },
            });
            res.json({
                success: true,
                message: '브라켓이 삭제되었습니다.',
            });
        }
        catch (error) {
            console.error('Delete bracket error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '브라켓 삭제 중 오류가 발생했습니다.',
            });
        }
    }
    // 참가자별 브라켓 추천
    static async getSuggestedBrackets(req, res) {
        try {
            const { tournamentId } = req.params;
            // 승인된 참가자 조회
            const participants = await database_1.prisma.participant.findMany({
                where: {
                    tournamentId,
                    approvalStatus: 'approved',
                },
            });
            // 경기종목과 등급별 그룹핑
            const groups = participants.reduce((acc, participant) => {
                const key = `${participant.eventType}_${participant.skillLevel}`;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(participant);
                return acc;
            }, {});
            // 브라켓 제안
            const suggestions = Object.entries(groups).map(([key, participants]) => {
                const [eventType, skillLevel] = key.split('_');
                const count = participants.length;
                // 경기 종목별 한국어 이름 매핑
                const eventTypeNames = {
                    'men_singles': '남자단식',
                    'women_singles': '여자단식',
                    'men_doubles': '남자복식',
                    'women_doubles': '여자복식',
                    'mixed_doubles': '혼성복식'
                };
                return {
                    name: `${skillLevel}조 ${eventTypeNames[eventType] || eventType}`,
                    skillLevel,
                    eventType,
                    participantCount: count,
                    participants,
                    recommendedType: count <= 8 ? 'single_elimination' : 'round_robin',
                };
            });
            res.json({
                success: true,
                data: suggestions,
            });
        }
        catch (error) {
            console.error('Get suggested brackets error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '브라켓 제안 조회 중 오류가 발생했습니다.',
            });
        }
    }
}
exports.BracketController = BracketController;
//# sourceMappingURL=bracketController.js.map