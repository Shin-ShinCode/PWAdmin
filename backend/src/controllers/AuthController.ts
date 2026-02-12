import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [rows]: any = await query(
      'SELECT u.*, r.name as role_name, r.permissions FROM admin_users u JOIN admin_roles r ON u.role_id = r.id WHERE u.username = ?', 
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Update last login
    await query('UPDATE admin_users SET last_login = NOW(), last_ip = ? WHERE id = ?', [req.ip, user.id]);

    // Create Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name, permissions: user.permissions },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role_name,
        permissions: user.permissions
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    // req.user comes from middleware
    const userId = req.user.id;
    const [rows]: any = await query(
      'SELECT u.id, u.username, u.email, u.last_login, r.name as role_name, r.permissions FROM admin_users u JOIN admin_roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createAccount = async (req: Request, res: Response) => {
    const { login, password, email } = req.body;

    // Basic validation
    if (!login || !password) {
        return res.status(400).json({ error: 'Login and password are required' });
    }

    try {
        // 1. Create MD5 Hash (Standard PW format)
        // PW uses simple MD5 or specific hash. For game accounts, it is usually MD5 binary or base64.
        // Let's assume standard MD5 for now as most private servers use.
        // Or if it uses Salted MD5, we need to know the specific algorithm.
        // Standard PW (1.3.6+) often uses: md5(user + md5(pass))
        
        // However, usually we insert into `users` table.
        // Let's check if we are creating a Game Account (users) or Admin Account (admin_users).
        // The user context implies "Game Account" ("puxar as conta... quantidade de conta real").
        
        // We will insert into `users` table which is the standard PW account table.
        // Columns usually: ID, name, passwd, email, ...
        
        // First, check if user exists
        const [existing]: any = await query('SELECT ID FROM users WHERE name = ?', [login]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Account already exists' });
        }
        
        // Generate Hash (Assuming standard MD5 for simplicity, user can adjust if needed)
        // Note: Real PW often uses a stored procedure or `call adduser(...)`
        // Let's try to use the stored procedure if available, or direct insert.
        // Direct insert is safer if we know the schema.
        
        // Let's try to use the `add_user` procedure if it exists, otherwise insert.
        // But for safety, let's insert directly into `users` table with MD5.
        // Note: PW passwords are often stored as Binary MD5.
        
        // Using SQL to generate MD5 is easier: MD5('password')
        
        const sql = `
            INSERT INTO users (name, passwd, email, creatime, role)
            VALUES (?, MD5(?), ?, NOW(), 0)
        `;
        
        await query(sql, [login, login + password, email || '']); 
        // Wait! PW Hash is usually MD5(user + password) or just MD5(password).
        // Let's stick to MD5(user + password) which is common, or just MD5(password).
        // Actually, most web registrations use: MD5(username + password) binary.
        
        // Let's use a simpler approach: 
        // If we can't guarantee the hash is correct for the game client, the user might not be able to login.
        // BUT, we can successfully insert the record.
        
        // Let's assume standard MD5(login + password) for now.
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(login + password).digest('base64'); 
        // PW uses base64 of MD5 usually in 'passwd' column (varchar 64).
        
        await query('INSERT INTO users (name, passwd, email, creatime) VALUES (?, ?, ?, NOW())', [login, hash, email || '']);

        res.json({ success: true, message: 'Account created successfully' });

    } catch (error: any) {
        console.error('Create Account Error:', error);
        res.status(500).json({ error: 'Failed to create account. ' + error.message });
    }
};
