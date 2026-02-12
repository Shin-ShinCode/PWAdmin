import { Router } from 'express';
import { login, getProfile, createAccount } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/create', authenticateToken, createAccount); // Protected route for creating game accounts
router.get('/me', authenticateToken, getProfile);

export default router;
