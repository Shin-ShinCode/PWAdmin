
import { Request, Response } from 'express';
import axios from 'axios';

const PHP_API = 'http://95.111.235.239/apipw/test_access.php';

export const getTerritories = async (req: Request, res: Response) => {
    try {
        const response = await axios.get(PHP_API, { params: { action: 'get_territories' } });
        if (response.data && response.data.success) {
            res.json(response.data.data);
        } else {
            res.status(500).json({ error: response.data.error || 'Failed to fetch territories' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch territories' });
    }
};

export const getFactions = async (req: Request, res: Response) => {
    try {
        const response = await axios.get(PHP_API, { params: { action: 'get_factions' } });
        if (response.data && response.data.success) {
            res.json(response.data.data);
        } else {
            res.status(500).json({ error: response.data.error || 'Failed to fetch factions' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch factions' });
    }
};

export const toggleNationWar = async (req: Request, res: Response) => {
    try {
        const { enable } = req.body;
        const response = await axios.get(PHP_API, { 
            params: { action: 'toggle_nw', enable: enable ? 'true' : 'false' } 
        });
        
        if (response.data && response.data.success) {
            res.json(response.data);
        } else {
            res.status(500).json({ error: response.data.error || 'Failed to toggle Nation War' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle Nation War' });
    }
};
