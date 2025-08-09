import express from 'express';
import { ParticipantController } from '../controllers/participantController';
import { authenticateAdmin, optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /api/participants/apply - 참가 신청 (공개)
router.post('/apply', ParticipantController.applyParticipant);

// GET /api/participants - 참가자 목록 조회 (관리자 전용)
router.get('/', authenticateAdmin, ParticipantController.getParticipants);

// PUT /api/participants/:participantId/approval - 참가자 승인/거부 (관리자 전용)
router.put('/:participantId/approval', authenticateAdmin, ParticipantController.updateApprovalStatus);

// PUT /api/participants/:participantId/payment - 결제 상태 업데이트 (관리자 전용)
router.put('/:participantId/payment', authenticateAdmin, ParticipantController.updatePaymentStatus);

// PUT /api/participants/:participantId - 참가자 정보 수정 (본인 또는 관리자)
router.put('/:participantId', optionalAuth, ParticipantController.updateParticipant);

// DELETE /api/participants/:participantId - 참가자 삭제 (관리자 전용)
router.delete('/:participantId', authenticateAdmin, ParticipantController.deleteParticipant);

// GET /api/participants/export - 참가자 엑셀 다운로드 (관리자 전용)
router.get('/export', authenticateAdmin, ParticipantController.exportParticipants);

export default router;