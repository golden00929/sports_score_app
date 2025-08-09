import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export class SlideController {
  // 슬라이드 목록 조회 (공개)
  static async getSlides(req: Request, res: Response) {
    try {
      const slides = await prisma.promoSlide.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
      });

      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      console.error('Get slides error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '슬라이드 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 관리자용 슬라이드 목록 조회 (비활성 포함)
  static async getAdminSlides(req: AuthenticatedRequest, res: Response) {
    try {
      const slides = await prisma.promoSlide.findMany({
        orderBy: { orderIndex: 'asc' },
      });

      res.json({
        success: true,
        data: slides,
      });
    } catch (error) {
      console.error('Get admin slides error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '관리자 슬라이드 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 슬라이드 생성
  static async createSlide(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, subtitle, description, imageUrl, orderIndex, isActive } = req.body;

      if (!title) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: '슬라이드 제목을 입력해주세요.',
        });
      }

      const slide = await prisma.promoSlide.create({
        data: {
          title,
          subtitle,
          description,
          imageUrl,
          orderIndex: orderIndex || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      res.status(201).json({
        success: true,
        message: '슬라이드가 성공적으로 생성되었습니다.',
        data: slide,
      });
    } catch (error) {
      console.error('Create slide error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '슬라이드 생성 중 오류가 발생했습니다.',
      });
    }
  }

  // 슬라이드 수정
  static async updateSlide(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, subtitle, description, imageUrl, orderIndex, isActive } = req.body;

      const slide = await prisma.promoSlide.update({
        where: { id },
        data: {
          title,
          subtitle,
          description,
          imageUrl,
          orderIndex,
          isActive,
        },
      });

      res.json({
        success: true,
        message: '슬라이드가 성공적으로 수정되었습니다.',
        data: slide,
      });
    } catch (error) {
      console.error('Update slide error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '슬라이드 수정 중 오류가 발생했습니다.',
      });
    }
  }

  // 슬라이드 삭제
  static async deleteSlide(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.promoSlide.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: '슬라이드가 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Delete slide error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '슬라이드 삭제 중 오류가 발생했습니다.',
      });
    }
  }

  // 슬라이드 순서 변경
  static async updateSlideOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { slides } = req.body; // [{ id, orderIndex }, ...]

      if (!Array.isArray(slides)) {
        return res.status(400).json({
          error: 'Invalid data format',
          message: '유효하지 않은 데이터 형식입니다.',
        });
      }

      // 트랜잭션으로 모든 순서 업데이트
      await prisma.$transaction(
        slides.map((slide) =>
          prisma.promoSlide.update({
            where: { id: slide.id },
            data: { orderIndex: slide.orderIndex },
          })
        )
      );

      res.json({
        success: true,
        message: '슬라이드 순서가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('Update slide order error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '슬라이드 순서 변경 중 오류가 발생했습니다.',
      });
    }
  }

  // 기본 슬라이드 데이터 시드
  static async seedDefaultSlides(req: AuthenticatedRequest, res: Response) {
    try {
      const existingSlides = await prisma.promoSlide.count();
      
      if (existingSlides > 0) {
        return res.json({
          success: true,
          message: '이미 슬라이드가 존재합니다.',
        });
      }

      const defaultSlides = [
        {
          title: 'Miiracer Sports Score Tournament',
          subtitle: '2024 베트남 호치민 배드민턴 챔피언십',
          description: 'Miiracer Sports Score가 제공하는 프리미엄 배드민턴 토너먼트! A조부터 C조까지 모든 레벨의 선수가 참가할 수 있으며, 실시간 스코어 관리 시스템을 제공합니다.',
          imageUrl: '/images/promo/sample-promo-1.svg',
          orderIndex: 0,
          isActive: true,
        },
        {
          title: '총 상금 50,000,000₫',
          subtitle: 'Miiracer Sports Score 시스템',
          description: '실시간 경기 결과 · 자동 대진표 생성 · 선수 통계 분석 기능을 제공하는 최첨단 토너먼트 관리 시스템',
          imageUrl: '/images/promo/sample-promo-2.svg',
          orderIndex: 1,
          isActive: true,
        },
        {
          title: '호치민에서 만나요!',
          subtitle: 'Saigon Sports Complex',
          description: '2024년 12월 1일 · 호치민시 7군 스포츠 센터 · 참가비 200,000₫',
          imageUrl: '/images/promo/sample-promo-3.svg',
          orderIndex: 2,
          isActive: true,
        },
      ];

      await prisma.promoSlide.createMany({
        data: defaultSlides,
      });

      res.json({
        success: true,
        message: '기본 슬라이드 데이터가 생성되었습니다.',
      });
    } catch (error) {
      console.error('Seed slides error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '기본 슬라이드 생성 중 오류가 발생했습니다.',
      });
    }
  }
}