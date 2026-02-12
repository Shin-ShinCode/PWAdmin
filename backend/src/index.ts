import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { checkConnection } from './config/database';
import { initDb } from './utils/initDb';
import authRoutes from './routes/authRoutes';
import characterRoutes from './routes/characterRoutes';
import statusRoutes from './routes/statusRoutes';
import logRoutes from './routes/logRoutes';
import serverRoutes from './routes/serverRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/server', serverRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ status: 'online', system: 'PWAdmin Backend v1.0' });
});

// Start Server
const startServer = async () => {
  const dbConnected = await checkConnection();
  
  if (dbConnected) {
    try {
      await initDb();
    } catch (e) {
      console.error('Failed to init DB:', e);
    }
  } else {
    console.warn('⚠️  SERVER RUNNING IN OFFLINE MODE (MOCK DB) ⚠️');
    console.warn('Real database connection failed. Data will be simulated.');
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
