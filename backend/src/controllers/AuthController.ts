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
