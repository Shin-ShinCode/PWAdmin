
import { Router } from 'express';
import { getChatLogs, sendChat } from '../controllers/LogController';

const router = Router();

router.get('/chat', getChatLogs);
router.post('/chat/send', sendChat);

export default router;
