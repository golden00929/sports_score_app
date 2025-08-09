import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { participantSchema } from '../utils/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { formatVietnamesePhone } from '../utils/validation';

export class ParticipantController {
  // 참가 신청 (공개)
  static async applyParticipant(req: Request, res: Response) {
    try {
      const { error, value } = participantSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.details[0].message,
        });
      }

      // 현재 대회 정보 조회
      const tournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          maxParticipants: true,
          registrationStart: true,
          registrationEnd: true,
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
          message: '현재 진행 중인 대회가 없습니다.',
        });
      }

      // 신청 기간 확인
      const now = new Date();
      const registrationStart = new Date(tournament.registrationStart);
      const registrationEnd = new Date(tournament.registrationEnd);

      if (now < registrationStart) {
        return res.status(400).json({
          error: 'Registration not started',
          message: '아직 신청 기간이 시작되지 않았습니다.',
        });
      }

      if (now > registrationEnd) {
        return res.status(400).json({
          error: 'Registration ended',
          message: '신청 기간이 종료되었습니다.',
        });
      }

      // 정원 확인
      if (tournament._count.participants >= tournament.maxParticipants) {
        return res.status(400).json({
          error: 'Tournament full',
          message: '대회 참가 인원이 모두 찼습니다.',
        });
      }

      // 중복 신청 확인 (전화번호 기준)
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          tournamentId: tournament.id,
          phone: value.phone,
          approvalStatus: { not: 'rejected' }
        }
      });

      if (existingParticipant) {
        return res.status(409).json({
          error: 'Already registered',
          message: '이미 해당 전화번호로 신청된 참가자가 있습니다.',
        });
      }

      // 전화번호 포맷팅
      value.phone = formatVietnamesePhone(value.phone);

      // 참가자 생성
      const participant = await prisma.participant.create({
        data: {
          ...value,
          tournamentId: tournament.id,
        },
      });

      res.status(201).json({
        success: true,
        message: '참가 신청이 완료되었습니다. 관리자 승인 후 안내드리겠습니다.',
        data: {
          id: participant.id,
          name: participant.name,
          phone: participant.phone,
          skillLevel: participant.skillLevel,
          approvalStatus: participant.approvalStatus,
          paymentStatus: participant.paymentStatus,
          registrationDate: participant.registrationDate,
        },
      });
    } catch (error) {
      console.error('Apply participant error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '참가 신청 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자 목록 조회 (관리자 전용)
  static async getParticipants(req: AuthenticatedRequest, res: Response) {
    try {
      const { 
        page = '1', 
        limit = '20', 
        status, 
        skillLevel, 
        gender,
        eventType,
        search 
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // 필터 조건 구성
      const where: any = {};

      // 현재 대회의 참가자만 조회
      const tournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });

      if (tournament) {
        where.tournamentId = tournament.id;
      }

      if (status) {
        where.approvalStatus = status;
      }

      if (skillLevel) {
        where.skillLevel = skillLevel;
      }

      if (gender) {
        where.gender = gender;
      }

      if (eventType) {
        where.eventType = eventType;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } },
          { province: { contains: search as string, mode: 'insensitive' } },
          { district: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // 참가자 목록 조회
      const [participants, totalCount] = await Promise.all([
        prisma.participant.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          select: {
            id: true,
            name: true,
            gender: true,
            birthYear: true,
            province: true,
            district: true,
            phone: true,
            experience: true,
            skillLevel: true,
            eventType: true,
            partnerName: true,
            partnerPhone: true,
            approvalStatus: true,
            paymentStatus: true,
            registrationDate: true,
            createdAt: true,
          }
        }),
        prisma.participant.count({ where })
      ]);

      // 통계 정보
      const stats = await prisma.participant.groupBy({
        by: ['approvalStatus', 'paymentStatus', 'skillLevel', 'eventType'],
        where: tournament ? { tournamentId: tournament.id } : {},
        _count: true,
      });

      res.json({
        success: true,
        data: {
          participants,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalCount / limitNum),
            totalCount,
            limit: limitNum,
          },
          stats,
        },
      });
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '참가자 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자 승인/거부 (관리자 전용)
  static async updateApprovalStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { participantId } = req.params;
      const { approvalStatus, reason } = req.body;

      if (!['approved', 'rejected'].includes(approvalStatus)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: '유효하지 않은 승인 상태입니다.',
        });
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        return res.status(404).json({
          error: 'Participant not found',
          message: '참가자를 찾을 수 없습니다.',
        });
      }

      const updatedParticipant = await prisma.participant.update({
        where: { id: participantId },
        data: {
          approvalStatus,
          // 거부 사유는 별도 필드에 저장하거나 notes 필드 활용
          ...(reason && { notes: reason }),
        },
      });

      res.json({
        success: true,
        message: approvalStatus === 'approved' ? '참가자가 승인되었습니다.' : '참가자가 거부되었습니다.',
        data: updatedParticipant,
      });
    } catch (error) {
      console.error('Update approval status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '승인 상태 변경 중 오류가 발생했습니다.',
      });
    }
  }

  // 결제 상태 업데이트 (관리자 전용)
  static async updatePaymentStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { participantId } = req.params;
      const { paymentStatus, paymentNote } = req.body;

      if (!['pending', 'completed', 'cancelled'].includes(paymentStatus)) {
        return res.status(400).json({
          error: 'Invalid payment status',
          message: '유효하지 않은 결제 상태입니다.',
        });
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        return res.status(404).json({
          error: 'Participant not found',
          message: '참가자를 찾을 수 없습니다.',
        });
      }

      const updatedParticipant = await prisma.participant.update({
        where: { id: participantId },
        data: {
          paymentStatus,
          // 결제 관련 메모 저장
          ...(paymentNote && { notes: paymentNote }),
        },
      });

      res.json({
        success: true,
        message: '결제 상태가 업데이트되었습니다.',
        data: updatedParticipant,
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '결제 상태 변경 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자 정보 수정 (본인 또는 관리자)
  static async updateParticipant(req: AuthenticatedRequest, res: Response) {
    try {
      const { participantId } = req.params;
      const updateData = req.body;

      // 수정 가능한 필드 제한
      const allowedFields = [
        'name', 'gender', 'birthYear', 'province', 'district', 
        'phone', 'experience', 'skillLevel'
      ];

      const filteredData: any = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          error: 'No valid fields to update',
          message: '수정할 수 있는 필드가 없습니다.',
        });
      }

      // 전화번호 포맷팅
      if (filteredData.phone) {
        filteredData.phone = formatVietnamesePhone(filteredData.phone);
      }

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        return res.status(404).json({
          error: 'Participant not found',
          message: '참가자를 찾을 수 없습니다.',
        });
      }

      // 이미 승인된 참가자는 수정 불가 (관리자 제외)
      if (!req.admin && participant.approvalStatus === 'approved') {
        return res.status(403).json({
          error: 'Cannot modify approved participant',
          message: '이미 승인된 참가자는 정보를 수정할 수 없습니다.',
        });
      }

      const updatedParticipant = await prisma.participant.update({
        where: { id: participantId },
        data: filteredData,
      });

      res.json({
        success: true,
        message: '참가자 정보가 수정되었습니다.',
        data: updatedParticipant,
      });
    } catch (error) {
      console.error('Update participant error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '참가자 정보 수정 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자 삭제 (관리자 전용)
  static async deleteParticipant(req: AuthenticatedRequest, res: Response) {
    try {
      const { participantId } = req.params;

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        return res.status(404).json({
          error: 'Participant not found',
          message: '참가자를 찾을 수 없습니다.',
        });
      }

      await prisma.participant.delete({
        where: { id: participantId },
      });

      res.json({
        success: true,
        message: '참가자가 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Delete participant error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '참가자 삭제 중 오류가 발생했습니다.',
      });
    }
  }

  // 참가자 엑셀 다운로드 (관리자 전용)
  static async exportParticipants(req: AuthenticatedRequest, res: Response) {
    try {
      const tournament = await prisma.tournamentInfo.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true }
      });

      if (!tournament) {
        return res.status(404).json({
          error: 'Tournament not found',
          message: '대회를 찾을 수 없습니다.',
        });
      }

      const participants = await prisma.participant.findMany({
        where: { tournamentId: tournament.id },
        orderBy: [
          { approvalStatus: 'asc' },
          { skillLevel: 'asc' },
          { createdAt: 'desc' }
        ],
        select: {
          name: true,
          gender: true,
          birthYear: true,
          province: true,
          district: true,
          phone: true,
          experience: true,
          skillLevel: true,
          approvalStatus: true,
          paymentStatus: true,
          registrationDate: true,
        }
      });

      // CSV 형태로 데이터 생성
      const csvHeaders = [
        '이름', '성별', '출생년도', '시/성', '구/군', '전화번호', 
        '경력', '실력레벨', '승인상태', '결제상태', '신청일시'
      ];

      const csvRows = participants.map((p: any) => [
        p.name,
        p.gender === 'male' ? '남성' : '여성',
        p.birthYear,
        p.province,
        p.district,
        p.phone,
        p.experience || '',
        p.skillLevel,
        p.approvalStatus === 'approved' ? '승인' : 
        p.approvalStatus === 'rejected' ? '거부' : '대기',
        p.paymentStatus === 'completed' ? '완료' : 
        p.paymentStatus === 'cancelled' ? '취소' : '대기',
        p.registrationDate.toLocaleDateString('ko-KR')
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any) => row.join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${tournament.name}_participants.csv"`);
      res.write('\uFEFF'); // UTF-8 BOM for Excel
      res.end(csvContent);
    } catch (error) {
      console.error('Export participants error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '참가자 목록 내보내기 중 오류가 발생했습니다.',
      });
    }
  }
}