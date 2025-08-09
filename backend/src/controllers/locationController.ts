import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class LocationController {
  // 베트남 모든 지역 조회 (시/성)
  static async getProvinces(req: Request, res: Response) {
    try {
      const provinces = await prisma.vietnamLocation.findMany({
        where: {
          type: 'province',
          isActive: true,
        },
        orderBy: {
          nameEn: 'asc',
        },
        select: {
          id: true,
          nameEn: true,
          nameVi: true,
          nameKo: true,
          code: true,
        },
      });

      res.json({
        success: true,
        data: provinces,
      });
    } catch (error) {
      console.error('Get provinces error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '지역 정보 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 특정 시/성의 구/군 조회
  static async getDistricts(req: Request, res: Response) {
    try {
      const { provinceId } = req.params;

      if (!provinceId) {
        return res.status(400).json({
          error: 'Province code required',
          message: '시/성 코드를 입력해주세요.',
        });
      }

      // 먼저 province ID 찾기
      const province = await prisma.vietnamLocation.findUnique({
        where: { code: provinceId },
        select: { id: true },
      });

      if (!province) {
        return res.status(404).json({
          error: 'Province not found',
          message: '해당 시/성을 찾을 수 없습니다.',
        });
      }

      const districts = await prisma.vietnamLocation.findMany({
        where: {
          type: 'district',
          parentId: province.id,
          isActive: true,
        },
        orderBy: {
          nameEn: 'asc',
        },
        select: {
          id: true,
          nameEn: true,
          nameVi: true,
          nameKo: true,
          code: true,
        },
      });

      res.json({
        success: true,
        data: districts,
      });
    } catch (error) {
      console.error('Get districts error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '구/군 정보 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 지역 검색 (통합)
  static async searchLocations(req: Request, res: Response) {
    try {
      const { query, lang = 'en' } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          error: 'Search query required',
          message: '검색어를 입력해주세요.',
        });
      }

      // 언어별 검색 필드 선택
      let searchField = 'nameEn';
      if (lang === 'vi') searchField = 'nameVi';
      else if (lang === 'ko') searchField = 'nameKo';

      const locations = await prisma.vietnamLocation.findMany({
        where: {
          AND: [
            {
              isActive: true,
            },
            {
              OR: [
                { nameEn: { contains: query } },
                { nameVi: { contains: query } },
                { nameKo: { contains: query } },
              ],
            },
          ],
        },
        orderBy: [
          { type: 'asc' }, // province 먼저, district 나중에
          { [searchField]: 'asc' },
        ],
        take: 20, // 최대 20개 결과
        select: {
          id: true,
          nameEn: true,
          nameVi: true,
          nameKo: true,
          code: true,
          type: true,
          parentId: true,
        },
      });

      // 상위 지역 정보도 함께 반환
      const enrichedLocations = await Promise.all(
        locations.map(async (location: any) => {
          if (location.type === 'district' && location.parentId) {
            const parent = await prisma.vietnamLocation.findUnique({
              where: { id: location.parentId },
              select: {
                nameEn: true,
                nameVi: true,
                nameKo: true,
              },
            });
            return { ...location, parent };
          }
          return location;
        })
      );

      res.json({
        success: true,
        data: enrichedLocations,
      });
    } catch (error) {
      console.error('Search locations error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '지역 검색 중 오류가 발생했습니다.',
      });
    }
  }

  // 특정 지역 상세 정보 조회
  static async getLocationDetail(req: Request, res: Response) {
    try {
      const { locationId } = req.params;

      const location = await prisma.vietnamLocation.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        return res.status(404).json({
          error: 'Location not found',
          message: '지역을 찾을 수 없습니다.',
        });
      }

      let parent = null;
      if (location.parentId) {
        parent = await prisma.vietnamLocation.findUnique({
          where: { id: location.parentId },
          select: {
            id: true,
            nameEn: true,
            nameVi: true,
            nameKo: true,
            code: true,
          },
        });
      }

      res.json({
        success: true,
        data: {
          ...location,
          parent,
        },
      });
    } catch (error) {
      console.error('Get location detail error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: '지역 정보 조회 중 오류가 발생했습니다.',
      });
    }
  }
}