"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const locationController_1 = require("../controllers/locationController");
const router = express_1.default.Router();
// GET /api/locations/provinces - 베트남 모든 시/성 조회
router.get('/provinces', locationController_1.LocationController.getProvinces);
// GET /api/locations/districts/:provinceId - 특정 시/성의 구/군 조회
router.get('/districts/:provinceId', locationController_1.LocationController.getDistricts);
// GET /api/locations/search - 지역 검색
router.get('/search', locationController_1.LocationController.searchLocations);
// GET /api/locations/:locationId - 특정 지역 상세 정보
router.get('/:locationId', locationController_1.LocationController.getLocationDetail);
exports.default = router;
//# sourceMappingURL=location.js.map