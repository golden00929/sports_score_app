"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tournamentController_1 = require("../controllers/tournamentController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// GET /api/tournament - 대회 정보 조회 (공개)
router.get('/', tournamentController_1.TournamentController.getTournamentInfo);
// POST /api/tournament - 대회 정보 생성/수정 (관리자 전용)
router.post('/', auth_1.authenticateAdmin, upload_1.uploadMultiple, upload_1.resizeImage, tournamentController_1.TournamentController.upsertTournamentInfo);
// PUT /api/tournament/status - 대회 상태 변경 (관리자 전용)
router.put('/status', auth_1.authenticateAdmin, tournamentController_1.TournamentController.updateTournamentStatus);
// GET /api/tournament/stats - 대회 통계 조회 (관리자 전용)
router.get('/stats', auth_1.authenticateAdmin, tournamentController_1.TournamentController.getTournamentStats);
exports.default = router;
//# sourceMappingURL=tournament.js.map