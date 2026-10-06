import bcrypt from 'bcrypt';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const connection = await pool.getConnection();
  try {
    console.log('⏳ Ensuring users table schema has role and phone columns...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Check if the admin account already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@fancystore.lk']
    );

    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@Fancy2026', 10);
      await connection.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ('Store Administrator', 'admin@fancystore.lk', ?, 'admin')`,
        [hashedPassword]
      );
      console.log('✅ Default Admin created: admin@fancystore.lk / Admin@Fancy2026');
    } else {
      console.log('ℹ️ Admin user already exists in the database.');
    }
  } catch (error) {
    console.error('❌ Failed seeding admin:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedAdmin();