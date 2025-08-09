import express from 'express';
import { TournamentController } from '../controllers/tournamentController';
import { authenticateAdmin, optionalAuth } from '../middleware/auth';
import { uploadMultiple, resizeImage } from '../middleware/upload';

const router = express.Router();

// GET /api/tournament - 대회 정보 조회 (공개)
router.get('/', TournamentController.getTournamentInfo);

// GET /api/tournament/all - 모든 대회 목록 조회 (공개)
router.get('/all', TournamentController.getAllTournaments);

// POST /api/tournament - 대회 정보 생성/수정 (관리자 전용)
router.post('/', 
  authenticateAdmin,
  uploadMultiple,
  resizeImage,
  TournamentController.upsertTournamentInfo
);

// POST /api/tournament/simple - 간단한 대회 생성 (관리자 전용, 파일 업로드 없음)
router.post('/simple', 
  authenticateAdmin,
  TournamentController.createSimpleTournament
);

// PUT /api/tournament/:tournamentId - 대회 정보 업데이트 (관리자 전용)
router.put('/:tournamentId', authenticateAdmin, TournamentController.updateTournament);

// DELETE /api/tournament/:tournamentId - 대회 삭제 (관리자 전용)
router.delete('/:tournamentId', authenticateAdmin, TournamentController.deleteTournament);

// PUT /api/tournament/status - 대회 상태 변경 (관리자 전용)
router.put('/status', authenticateAdmin, TournamentController.updateTournamentStatus);

// GET /api/tournament/stats - 대회 통계 조회 (관리자 전용)
router.get('/stats', authenticateAdmin, TournamentController.getTournamentStats);

export default router;