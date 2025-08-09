"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const participantController_1 = require("../controllers/participantController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// POST /api/participants/apply - 참가 신청 (공개)
router.post('/apply', participantController_1.ParticipantController.applyParticipant);
// GET /api/participants - 참가자 목록 조회 (관리자 전용)
router.get('/', auth_1.authenticateAdmin, participantController_1.ParticipantController.getParticipants);
// PUT /api/participants/:participantId/approval - 참가자 승인/거부 (관리자 전용)
router.put('/:participantId/approval', auth_1.authenticateAdmin, participantController_1.ParticipantController.updateApprovalStatus);
// PUT /api/participants/:participantId/payment - 결제 상태 업데이트 (관리자 전용)
router.put('/:participantId/payment', auth_1.authenticateAdmin, participantController_1.ParticipantController.updatePaymentStatus);
// PUT /api/participants/:participantId - 참가자 정보 수정 (본인 또는 관리자)
router.put('/:participantId', auth_1.optionalAuth, participantController_1.ParticipantController.updateParticipant);
// DELETE /api/participants/:participantId - 참가자 삭제 (관리자 전용)
router.delete('/:participantId', auth_1.authenticateAdmin, participantController_1.ParticipantController.deleteParticipant);
// GET /api/participants/export - 참가자 엑셀 다운로드 (관리자 전용)
router.get('/export', auth_1.authenticateAdmin, participantController_1.ParticipantController.exportParticipants);
exports.default = router;
//# sourceMappingURL=participant.js.map