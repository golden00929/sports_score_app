"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentController = void 0;
const database_1 = require("../config/database");
const validation_1 = require("../utils/validation");
const upload_1 = require("../middleware/upload");
class TournamentController {
    // 대회 정보 조회 (공개)
    static async getTournamentInfo(req, res) {
        try {
            const tournament = await database_1.prisma.tournamentInfo.findFirst({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            participants: {
                                where: { approvalStatus: 'approved' }
                            }
                        }
                    }
                }
            });
            if (!tournament) {
                return res.status(404).json({
                    error: 'Tournament not found',
                    message: '대회 정보를 찾을 수 없습니다.',
                });
            }
            // D-Day 계산
            const today = new Date();
            const startDate = new Date(tournament.startDate);
            const registrationEnd = new Date(tournament.registrationEnd);
            const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const daysUntilRegEnd = Math.ceil((registrationEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            // 참가 가능 여부 확인
            const isRegistrationOpen = today >= new Date(tournament.registrationStart) &&
                today <= registrationEnd;
            const isRegistrationFull = tournament._count.participants >= tournament.maxParticipants;
            res.json({
                success: true,
                data: {
                    ...tournament,
                    stats: {
                        approvedParticipants: tournament._count.participants,
                        availableSlots: tournament.maxParticipants - tournament._count.participants,
                        daysUntilStart,
                        daysUntilRegEnd,
                        isRegistrationOpen,
                        isRegistrationFull,
                    }
                }
            });
        }
        catch (error) {
            console.error('Get tournament info error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '대회 정보 조회 중 오류가 발생했습니다.',
            });
        }
    }
    // 대회 정보 생성/수정 (관리자 전용)
    static async upsertTournamentInfo(req, res) {
        try {
            const { error, value } = validation_1.tournamentInfoSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.details[0].message,
                });
            }
            // 기존 대회 정보 조회
            const existingTournament = await database_1.prisma.tournamentInfo.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            // 파일 업로드 정보 처리
            const files = req.files;
            const updateData = { ...value };
            if (files?.poster?.[0]) {
                updateData.posterImage = `images/${files.poster[0].filename}`;
                // 기존 포스터 이미지 삭제
                if (existingTournament?.posterImage) {
                    await (0, upload_1.deleteFile)(existingTournament.posterImage);
                }
            }
            if (files?.document?.[0]) {
                updateData.rulesDocument = `documents/${files.document[0].filename}`;
                // 기존 문서 파일 삭제
                if (existingTournament?.rulesDocument) {
                    await (0, upload_1.deleteFile)(existingTournament.rulesDocument);
                }
            }
            // 협찬사 로고 처리
            if (files?.sponsors) {
                const sponsorImages = files.sponsors.map(file => `images/${file.filename}`);
                const organizerInfo = typeof updateData.organizerInfo === 'string'
                    ? JSON.parse(updateData.organizerInfo)
                    : updateData.organizerInfo || {};
                organizerInfo.sponsorImages = sponsorImages;
                updateData.organizerInfo = organizerInfo;
                // 기존 협찬사 이미지들 삭제
                if (existingTournament?.organizerInfo && typeof existingTournament.organizerInfo === 'object') {
                    const oldOrganizerInfo = existingTournament.organizerInfo;
                    if (oldOrganizerInfo.sponsorImages) {
                        for (const imagePath of oldOrganizerInfo.sponsorImages) {
                            await (0, upload_1.deleteFile)(imagePath);
                        }
                    }
                }
            }
            // 은행 정보 처리
            if (updateData.bankInfo && typeof updateData.bankInfo === 'string') {
                updateData.bankInfo = JSON.parse(updateData.bankInfo);
            }
            // 주최자 정보 처리
            if (updateData.organizerInfo && typeof updateData.organizerInfo === 'string') {
                updateData.organizerInfo = JSON.parse(updateData.organizerInfo);
            }
            let tournament;
            if (existingTournament) {
                // 기존 대회 정보 업데이트
                tournament = await database_1.prisma.tournamentInfo.update({
                    where: { id: existingTournament.id },
                    data: updateData,
                });
            }
            else {
                // 새 대회 정보 생성
                tournament = await database_1.prisma.tournamentInfo.create({
                    data: updateData,
                });
            }
            res.json({
                success: true,
                message: existingTournament ? '대회 정보가 수정되었습니다.' : '대회 정보가 생성되었습니다.',
                data: tournament,
            });
        }
        catch (error) {
            console.error('Upsert tournament info error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '대회 정보 저장 중 오류가 발생했습니다.',
            });
        }
    }
    // 대회 상태 변경 (관리자 전용)
    static async updateTournamentStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ['upcoming', 'ongoing', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Invalid status',
                    message: '유효하지 않은 상태입니다.',
                });
            }
            const tournament = await database_1.prisma.tournamentInfo.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            if (!tournament) {
                return res.status(404).json({
                    error: 'Tournament not found',
                    message: '대회를 찾을 수 없습니다.',
                });
            }
            const updatedTournament = await database_1.prisma.tournamentInfo.update({
                where: { id: tournament.id },
                data: { status },
            });
            res.json({
                success: true,
                message: '대회 상태가 변경되었습니다.',
                data: updatedTournament,
            });
        }
        catch (error) {
            console.error('Update tournament status error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '대회 상태 변경 중 오류가 발생했습니다.',
            });
        }
    }
    // 대회 통계 조회 (관리자 전용)
    static async getTournamentStats(req, res) {
        try {
            const tournament = await database_1.prisma.tournamentInfo.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            if (!tournament) {
                return res.status(404).json({
                    error: 'Tournament not found',
                    message: '대회를 찾을 수 없습니다.',
                });
            }
            // 참가자 통계
            const participantStats = await database_1.prisma.participant.groupBy({
                by: ['approvalStatus', 'paymentStatus', 'skillLevel', 'gender'],
                where: { tournamentId: tournament.id },
                _count: true,
            });
            // 일별 신청 통계
            const dailyRegistrations = await database_1.prisma.$queryRaw `
        SELECT DATE(registration_date) as date, COUNT(*) as count
        FROM participants 
        WHERE tournament_id = ${tournament.id}
        GROUP BY DATE(registration_date)
        ORDER BY date
      `;
            res.json({
                success: true,
                data: {
                    tournament: {
                        id: tournament.id,
                        name: tournament.name,
                        status: tournament.status,
                        maxParticipants: tournament.maxParticipants,
                    },
                    participantStats,
                    dailyRegistrations,
                },
            });
        }
        catch (error) {
            console.error('Get tournament stats error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: '대회 통계 조회 중 오류가 발생했습니다.',
            });
        }
    }
}
exports.TournamentController = TournamentController;
//# sourceMappingURL=tournamentController.js.map