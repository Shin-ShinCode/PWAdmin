
import { Request, Response } from 'express';
import { fetchChatLogs, sendChatMessage } from '../services/LogParserService';

export const getChatLogs = async (req: Request, res: Response) => {
    try {
        const logs = await fetchChatLogs(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat logs' });
    }
};

export const sendChat = async (req: Request, res: Response) => {
    try {
        const { msg, channel } = req.body;
        if (!msg) return res.status(400).json({ error: 'Message is required' });
        
        const success = await sendChatMessage(msg, channel);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send chat message' });
    }
};
