import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function initRefreshTokensTable() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Creating refresh_tokens table in MySQL...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token TEXT NOT NULL,
        token_hash VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token_hash (token_hash),
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('✅ refresh_tokens table created/verified successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize refresh_tokens table:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

initRefreshTokensTable();