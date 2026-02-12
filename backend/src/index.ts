import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { checkConnection } from './config/database';
import { initDb } from './utils/initDb';
import authRoutes from './routes/authRoutes';
import characterRoutes from './routes/characterRoutes';

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

// Basic Route
app.get('/', (req, res) => {
  res.json({ status: 'online', system: 'PWAdmin Backend v1.0' });
});

// Start Server
const startServer = async () => {
  const dbConnected = await checkConnection();
  if (!dbConnected) {
    console.error('CRITICAL: Could not connect to database. Server starting in limited mode.');
  } else {
    await initDb();
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
