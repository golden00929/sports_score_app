import express from 'express';
import { LocationController } from '../controllers/locationController';

const router = express.Router();

// GET /api/locations/provinces - 베트남 모든 시/성 조회
router.get('/provinces', LocationController.getProvinces);

// GET /api/locations/districts/:provinceId - 특정 시/성의 구/군 조회
router.get('/districts/:provinceId', LocationController.getDistricts);

// GET /api/locations/search - 지역 검색
router.get('/search', LocationController.searchLocations);

// GET /api/locations/:locationId - 특정 지역 상세 정보
router.get('/:locationId', LocationController.getLocationDetail);

export default router;