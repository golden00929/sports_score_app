import express from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticateAdmin } from '../middleware/auth';
import { uploadSingle, uploadMultiple, resizeImage } from '../middleware/upload';

const router = express.Router();

// POST /api/upload/single - 단일 파일 업로드 (관리자 전용)
router.post('/single',
  authenticateAdmin,
  uploadSingle,
  resizeImage,
  UploadController.uploadSingle
);

// POST /api/upload/multiple - 다중 파일 업로드 (관리자 전용)
router.post('/multiple',
  authenticateAdmin,
  uploadMultiple,
  resizeImage,
  UploadController.uploadMultiple
);

// DELETE /api/upload/:type/:filename - 파일 삭제 (관리자 전용)
router.delete('/:type/:filename',
  authenticateAdmin,
  UploadController.deleteFile
);

export default router;