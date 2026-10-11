import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateAuth() {
  const connection = await pool.getConnection();
  try {
    console.log('⏳ Running User Schema Upgrade for SL Localization & Multi-Auth...');

    // 1. Upgrade users table schema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) UNIQUE NULL,
        phone VARCHAR(30) UNIQUE NULL,
        password VARCHAR(255) NULL,
        google_id VARCHAR(100) UNIQUE NULL,
        avatar_url TEXT NULL,
        role ENUM('customer', 'admin') DEFAULT 'customer',
        is_phone_verified BOOLEAN DEFAULT FALSE,
        is_email_verified BOOLEAN DEFAULT FALSE,
        address_line1 VARCHAR(255) NULL,
        town VARCHAR(100) NULL,
        district VARCHAR(100) NULL,
        province VARCHAR(100) NULL,
        postal_code VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Safely add columns if the table already existed with older columns
    const columns = [
      { name: 'google_id', type: 'VARCHAR(100) UNIQUE NULL' },
      { name: 'avatar_url', type: 'TEXT NULL' },
      { name: 'is_phone_verified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'is_email_verified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'address_line1', type: 'VARCHAR(255) NULL' },
      { name: 'town', type: 'VARCHAR(100) NULL' },
      { name: 'district', type: 'VARCHAR(100) NULL' },
      { name: 'province', type: 'VARCHAR(100) NULL' },
      { name: 'postal_code', type: 'VARCHAR(20) NULL' }
    ];

    for (const col of columns) {
      try {
        await connection.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
        console.log(`+ Added column: ${col.name}`);
      } catch (err) {
        // Column already exists, ignore
      }
    }

    // 2. Create verification_otps table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target VARCHAR(191) NOT NULL, -- phone number or email address
        otp VARCHAR(10) NOT NULL,
        purpose ENUM('phone_verify', 'email_verify', 'forgot_password') NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_target_purpose (target, purpose)
      ) ENGINE=InnoDB;
    `);

    console.log('✅ Auth & Sri Lanka Localization Schema updated successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrateAuth();