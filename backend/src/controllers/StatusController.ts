
import { Request, Response } from 'express';
import { fetchRemoteStatus } from '../services/RemoteStatusService';

export const getRealtimeStatus = async (req: Request, res: Response) => {
  try {
    const status = await fetchRemoteStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status from remote server' });
  }
};
