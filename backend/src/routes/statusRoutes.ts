
import express from 'express';
import { getRealtimeStatus } from '../controllers/StatusController';

const router = express.Router();

router.get('/realtime', getRealtimeStatus);

export default router;
