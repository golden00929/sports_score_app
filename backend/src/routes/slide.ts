import express from 'express';
import { SlideController } from '../controllers/slideController';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// 공개 라우트
router.get('/', SlideController.getSlides);

// 관리자 전용 라우트
router.use(authenticateAdmin);
router.get('/admin', SlideController.getAdminSlides);
router.post('/', SlideController.createSlide);
router.put('/:id', SlideController.updateSlide);
router.delete('/:id', SlideController.deleteSlide);
router.put('/order/update', SlideController.updateSlideOrder);
router.post('/seed', SlideController.seedDefaultSlides);

export default router;