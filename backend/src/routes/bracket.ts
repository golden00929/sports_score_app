import express from 'express';
import { BracketController } from '../controllers/bracketController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// 브라켓 관련 라우트 (모두 인증 필요)
router.use(authenticateAdmin);

// 특정 토너먼트의 브라켓 목록 조회
router.get('/tournament/:tournamentId', BracketController.getBrackets);

// 브라켓 제안 조회 (참가자 기반)
router.get('/tournament/:tournamentId/suggestions', BracketController.getSuggestedBrackets);

// 브라켓 생성
router.post('/tournament/:tournamentId', BracketController.createBracket);

// 브라켓 상태 업데이트
router.put('/:bracketId/status', BracketController.updateBracketStatus);

// 브라켓 매치 업데이트
router.put('/:bracketId/matches', BracketController.updateBracketMatches);

// 매치 결과 업데이트
router.put('/match/:matchId/result', BracketController.updateMatchResult);

// 브라켓 삭제
router.delete('/:bracketId', BracketController.deleteBracket);

export default router;