import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { mockDb } from '../services/MockDatabase';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000 
});

let isConnected = false;

export const checkConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    isConnected = true;
    return true;
  } catch (error: any) {
    console.error('Database connection failed (Using MockDB):', error.message);
    isConnected = false;
    return false;
  }
};

export const query = async (sql: string, params: any[] = []) => {
  if (isConnected) {
    return pool.query(sql, params);
  } else {
    return mockDb.query(sql, params);
  }
};

export default pool;
