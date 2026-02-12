
import { Router } from 'express';
import { 
    getTerritories, getFactions, toggleNationWar 
} from '../controllers/ServerController';

const router = Router();

router.get('/territories', getTerritories);
router.get('/factions', getFactions);
router.post('/nw/toggle', toggleNationWar);

export default router;
