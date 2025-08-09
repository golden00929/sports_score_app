"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bracketController_1 = require("../controllers/bracketController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// 브라켓 관련 라우트 (모두 인증 필요)
router.use(auth_1.authenticateAdmin);
// 특정 토너먼트의 브라켓 목록 조회
router.get('/tournament/:tournamentId', bracketController_1.BracketController.getBrackets);
// 브라켓 제안 조회 (참가자 기반)
router.get('/tournament/:tournamentId/suggestions', bracketController_1.BracketController.getSuggestedBrackets);
// 브라켓 생성
router.post('/tournament/:tournamentId', bracketController_1.BracketController.createBracket);
// 브라켓 상태 업데이트
router.put('/:bracketId/status', bracketController_1.BracketController.updateBracketStatus);
// 매치 결과 업데이트
router.put('/match/:matchId/result', bracketController_1.BracketController.updateMatchResult);
// 브라켓 삭제
router.delete('/:bracketId', bracketController_1.BracketController.deleteBracket);
exports.default = router;
//# sourceMappingURL=bracket.js.map