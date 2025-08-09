import express from 'express';

const router = express.Router();

// 임시 라우트 (추후 구현 예정)
router.get('/', (req, res) => {
  res.json({ message: 'Schedule routes - Coming soon' });
});

export default router;