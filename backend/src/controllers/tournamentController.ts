import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { tournamentInfoSchema } from '../utils/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { deleteFile } from '../middleware/upload';
import path from 'path';

export class TournamentController {
  // 대회 정보 조회 (공개)
  static async getTournamentInfo(req: Request, res: Response) {
    try {
      const tournament = await prisma.tournamentInfo.findFirst({
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
    } catch (error) {
      console.error('Get tournament info error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 정보 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 모든 대회 목록 조회 (공개)
  static async getAllTournaments(req: Request, res: Response) {
    try {
      const tournaments = await prisma.tournamentInfo.findMany({
        orderBy: { startDate: 'desc' },
        include: {
          _count: {
            select: {
              participants: {
                where: { approvalStatus: 'approved' }
              },
              brackets: true
            }
          }
        }
      });

      const tournamentsWithStats = tournaments.map(tournament => {
        const today = new Date();
        const startDate = new Date(tournament.startDate);
        const registrationEnd = new Date(tournament.registrationEnd);
        const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilRegEnd = Math.ceil((registrationEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // 대회 상태 결정
        let status = 'upcoming';
        if (today > new Date(tournament.endDate || tournament.startDate)) {
          status = 'completed';
        } else if (today >= startDate) {
          status = 'ongoing';
        }

        // 참가 가능 여부 확인
        const isRegistrationOpen = today >= new Date(tournament.registrationStart) && 
                                  today <= registrationEnd;
        const isRegistrationFull = tournament._count.participants >= tournament.maxParticipants;

        return {
          ...tournament,
          status,
          stats: {
            approvedParticipants: tournament._count.participants,
            availableSlots: tournament.maxParticipants - tournament._count.participants,
            daysUntilStart,
            daysUntilRegEnd,
            isRegistrationOpen,
            isRegistrationFull,
            totalBrackets: tournament._count.brackets
          }
        };
      });

      res.json({
        success: true,
        data: tournamentsWithStats,
      });
    } catch (error) {
      console.error('Get all tournaments error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 대회 정보 생성/수정 (관리자 전용)
  static async upsertTournamentInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { error, value } = tournamentInfoSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
        });
      }

      // 기존 대회 정보 조회
      const existingTournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      // 파일 업로드 정보 처리
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const updateData: any = { ...value };

      if (files?.poster?.[0]) {
        updateData.posterImage = `images/${files.poster[0].filename}`;
        // 기존 포스터 이미지 삭제
        if (existingTournament?.posterImage) {
          await deleteFile(existingTournament.posterImage);
        }
      }

      if (files?.document?.[0]) {
        updateData.rulesDocument = `documents/${files.document[0].filename}`;
        // 기존 문서 파일 삭제
        if (existingTournament?.rulesDocument) {
          await deleteFile(existingTournament.rulesDocument);
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
          const oldOrganizerInfo = existingTournament.organizerInfo as any;
          if (oldOrganizerInfo.sponsorImages) {
            for (const imagePath of oldOrganizerInfo.sponsorImages) {
              await deleteFile(imagePath);
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
        tournament = await prisma.tournamentInfo.update({
          where: { id: existingTournament.id },
          data: updateData,
        });
      } else {
        // 새 대회 정보 생성
        tournament = await prisma.tournamentInfo.create({
          data: updateData,
        });
      }

      res.json({
        success: true,
        message: existingTournament ? '대회 정보가 수정되었습니다.' : '대회 정보가 생성되었습니다.',
        data: tournament,
      });
    } catch (error) {
      console.error('Upsert tournament info error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 정보 저장 중 오류가 발생했습니다.',
      });
    }
  }

  // 대회 상태 변경 (관리자 전용)
  static async updateTournamentStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.body;
      const validStatuses = ['upcoming', 'ongoing', 'completed'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: '유효하지 않은 상태입니다.',
        });
      }

      const tournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found',
          message: '대회를 찾을 수 없습니다.',
        });
      }

      const updatedTournament = await prisma.tournamentInfo.update({
        where: { id: tournament.id },
        data: { status },
      });

      res.json({
        success: true,
        message: '대회 상태가 변경되었습니다.',
        data: updatedTournament,
      });
    } catch (error) {
      console.error('Update tournament status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 상태 변경 중 오류가 발생했습니다.',
      });
    }
  }

  // 대회 정보 업데이트 (관리자 전용)
  static async updateTournament(req: AuthenticatedRequest, res: Response) {
    try {
      const { tournamentId } = req.params;
      const { 
        name, 
        description, 
        location, 
        maxParticipants, 
        startDate, 
        endDate,
        registrationEnd 
      } = req.body;

      // 입력 검증
      if (!name || !location || !maxParticipants) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: '필수 정보를 모두 입력해주세요.',
        });
      }

      const updatedTournament = await prisma.tournamentInfo.update({
        where: { id: tournamentId },
        data: {
          name,
          description,
          location,
          maxParticipants: parseInt(maxParticipants),
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          registrationEnd: registrationEnd ? new Date(registrationEnd) : undefined,
        },
      });

      res.json({
        success: true,
        message: '대회 정보가 업데이트되었습니다.',
        data: updatedTournament,
      });
    } catch (error) {
      console.error('Update tournament error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 정보 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  // 대회 통계 조회 (관리자 전용)
  static async getTournamentStats(req: AuthenticatedRequest, res: Response) {
    try {
      const tournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' }
      });

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found',
          message: '대회를 찾을 수 없습니다.',
        });
      }

      // 기본 통계 집계
      const totalParticipants = await prisma.participant.count({
        where: { tournamentId: tournament.id }
      });

      const approvedParticipants = await prisma.participant.count({
        where: { 
          tournamentId: tournament.id,
          approvalStatus: 'approved' 
        }
      });

      const pendingParticipants = await prisma.participant.count({
        where: { 
          tournamentId: tournament.id,
          approvalStatus: 'pending' 
        }
      });

      const paidParticipants = await prisma.participant.count({
        where: { 
          tournamentId: tournament.id,
          paymentStatus: 'completed' 
        }
      });

      res.json({
        success: true,
        data: {
          totalParticipants,
          approvedParticipants,
          pendingParticipants,
          paidParticipants,
        },
      });
    } catch (error) {
      console.error('Get tournament stats error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 통계 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 간단한 대회 생성 (관리자 전용, 파일 업로드 없음)
  static async createSimpleTournament(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        name, 
        description, 
        startDate, 
        endDate,
        registrationStart,
        registrationEnd, 
        location, 
        venue,
        maxParticipants,
        participantFee 
      } = req.body;

      // 입력 검증
      if (!name || !location || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: '필수 정보를 모두 입력해주세요.',
        });
      }

      // 날짜 유효성 검증
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      if (startDateTime > endDateTime) {
        return res.status(400).json({
          error: 'Invalid date range',
          message: '시작일이 종료일보다 늦을 수 없습니다.',
        });
      }

      // 새 대회 생성
      const tournament = await prisma.tournamentInfo.create({
        data: {
          name,
          description: description || '',
          startDate: startDateTime,
          endDate: endDateTime,
          registrationStart: registrationStart ? new Date(registrationStart) : startDateTime,
          registrationEnd: registrationEnd ? new Date(registrationEnd) : startDateTime,
          location,
          venue: venue || location, // venue가 없으면 location 사용
          maxParticipants: parseInt(maxParticipants) || 64,
          participantFee: parseInt(participantFee) || 200000,
        },
      });

      res.json({
        success: true,
        message: '대회가 성공적으로 생성되었습니다.',
        data: tournament,
      });
    } catch (error) {
      console.error('Create simple tournament error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 생성 중 오류가 발생했습니다.',
      });
    }
  }

  // 대회 삭제 (관리자 전용)
  static async deleteTournament(req: AuthenticatedRequest, res: Response) {
    try {
      const { tournamentId } = req.params;

      // 토너먼트 존재 확인
      const tournament = await prisma.tournamentInfo.findUnique({
        where: { id: tournamentId },
        include: {
          _count: {
            select: {
              participants: true,
              brackets: true,
              matches: true,
              schedules: true
            }
          }
        }
      });

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found',
          message: '대회를 찾을 수 없습니다.',
        });
      }

      // 관련 데이터가 있는지 확인
      if (tournament._count.participants > 0 || tournament._count.brackets > 0) {
        return res.status(400).json({
          error: 'Cannot delete tournament',
          message: '참가자 또는 대진표가 있는 대회는 삭제할 수 없습니다.',
        });
      }

      // 파일 삭제 (포스터 이미지, 규칙 문서, 협찬사 이미지)
      if (tournament.posterImage) {
        await deleteFile(tournament.posterImage);
      }
      
      if (tournament.rulesDocument) {
        await deleteFile(tournament.rulesDocument);
      }

      if (tournament.organizerInfo && typeof tournament.organizerInfo === 'object') {
        const orgInfo = tournament.organizerInfo as any;
        if (orgInfo.sponsorImages && Array.isArray(orgInfo.sponsorImages)) {
          for (const imagePath of orgInfo.sponsorImages) {
            await deleteFile(imagePath);
          }
        }
      }

      // 토너먼트 삭제 (CASCADE로 관련 데이터 자동 삭제)
      await prisma.tournamentInfo.delete({
        where: { id: tournamentId }
      });

      res.json({
        success: true,
        message: '대회가 성공적으로 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Delete tournament error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '대회 삭제 중 오류가 발생했습니다.',
      });
    }
  }
}