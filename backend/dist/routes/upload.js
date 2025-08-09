"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// POST /api/upload/single - 단일 파일 업로드 (관리자 전용)
router.post('/single', auth_1.authenticateAdmin, upload_1.uploadSingle, upload_1.resizeImage, uploadController_1.UploadController.uploadSingle);
// POST /api/upload/multiple - 다중 파일 업로드 (관리자 전용)
router.post('/multiple', auth_1.authenticateAdmin, upload_1.uploadMultiple, upload_1.resizeImage, uploadController_1.UploadController.uploadMultiple);
// DELETE /api/upload/:type/:filename - 파일 삭제 (관리자 전용)
router.delete('/:type/:filename', auth_1.authenticateAdmin, uploadController_1.UploadController.deleteFile);
exports.default = router;
//# sourceMappingURL=upload.js.map