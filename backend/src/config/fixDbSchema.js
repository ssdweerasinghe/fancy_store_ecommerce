import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixSchema() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Updating MySQL users table structure...');

    // 1. Make password and email NULLABLE (so Google and Phone-only users can register)
    try {
      await connection.query('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;');
      console.log('✅ Altered: password column is now nullable.');
    } catch (err) {
      console.warn('Note on password column:', err.message);
    }

    try {
      await connection.query('ALTER TABLE users MODIFY COLUMN email VARCHAR(191) NULL;');
      console.log('✅ Altered: email column is now nullable.');
    } catch (err) {
      console.warn('Note on email column:', err.message);
    }

    // 2. Add phone and all auxiliary columns safely
    const columns = [
      { name: 'phone', sql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(30) UNIQUE NULL;' },
      { name: 'google_id', sql: 'ALTER TABLE users ADD COLUMN google_id VARCHAR(100) UNIQUE NULL;' },
      { name: 'avatar_url', sql: 'ALTER TABLE users ADD COLUMN avatar_url TEXT NULL;' },
      { name: 'is_phone_verified', sql: 'ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;' },
      { name: 'is_email_verified', sql: 'ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;' },
      { name: 'address_line1', sql: 'ALTER TABLE users ADD COLUMN address_line1 VARCHAR(255) NULL;' },
      { name: 'town', sql: 'ALTER TABLE users ADD COLUMN town VARCHAR(100) NULL;' },
      { name: 'district', sql: 'ALTER TABLE users ADD COLUMN district VARCHAR(100) NULL;' },
      { name: 'province', sql: 'ALTER TABLE users ADD COLUMN province VARCHAR(100) NULL;' },
      { name: 'postal_code', sql: 'ALTER TABLE users ADD COLUMN postal_code VARCHAR(20) NULL;' }
    ];

    for (const col of columns) {
      try {
        await connection.query(col.sql);
        console.log(`✅ Added column: ${col.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`ℹ️ Column exists: ${col.name}`);
        } else {
          console.warn(`Warning on ${col.name}:`, err.message);
        }
      }
    }

    // 3. Ensure verification_otps table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target VARCHAR(191) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose ENUM('phone_verify', 'email_verify', 'forgot_password') NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('✅ verification_otps table ready.');

    console.log('🎉 Schema successfully corrected!');
  } catch (error) {
    console.error('❌ Schema update error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixSchema();