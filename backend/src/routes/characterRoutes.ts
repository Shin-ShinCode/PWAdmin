import { Router } from 'express';
import { searchCharacters, getCharacterById } from '../controllers/CharacterController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all character routes
router.use(authenticateToken);

router.get('/search', searchCharacters);
router.get('/:id', getCharacterById);

export default router;
