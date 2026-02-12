import pool from '../config/database';
import bcrypt from 'bcryptjs';

export const initDb = async () => {
  const connection = await pool.getConnection();
  try {
    console.log('Checking database tables...');

    // Create admin_roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        permissions TEXT NOT NULL,
        level INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin_users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        last_ip VARCHAR(45),
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (role_id) REFERENCES admin_roles(id)
      )
    `);

    // Check if roles exist, if not seed them
    const [roles]: any = await connection.query('SELECT COUNT(*) as count FROM admin_roles');
    if (roles[0].count === 0) {
      console.log('Seeding default roles...');
      await connection.query(`
        INSERT INTO admin_roles (name, permissions, level) VALUES
        ('viewer', 'read:characters,read:audit', 1),
        ('gm', 'read:characters,write:characters,read:audit,write:items', 2),
        ('super_admin', 'read:characters,write:characters,read:audit,write:items,manage:users,manage:system', 3)
      `);
    }

    // Check if admin exists, if not seed it
    const [users]: any = await connection.query('SELECT COUNT(*) as count FROM admin_users');
    if (users[0].count === 0) {
      console.log('Seeding default admin user...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      // Get super_admin role id
      const [roleResult]: any = await connection.query("SELECT id FROM admin_roles WHERE name = 'super_admin'");
      const roleId = roleResult[0].id;

      await connection.query(
        'INSERT INTO admin_users (username, password_hash, email, role_id) VALUES (?, ?, ?, ?)',
        ['admin', hash, 'admin@pwadmin.local', roleId]
      );
      console.log('Default admin user created: admin / admin123');
    }

    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    connection.release();
  }
};
