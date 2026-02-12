import { Router } from 'express';
import { login, getProfile } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getProfile);

export default router;
