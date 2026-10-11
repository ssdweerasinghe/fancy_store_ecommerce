import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserIdColumn() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Updating orders table: making user_id nullable...');

    // Make user_id nullable so guest checkout and token-free orders can proceed
    try {
      await connection.query(`
        ALTER TABLE orders MODIFY COLUMN user_id INT NULL;
      `);
      console.log('✅ Altered: user_id is now nullable in orders.');
    } catch (err) {
      console.warn('Note on user_id column:', err.message);
    }

    console.log('🎉 Orders table user_id fix complete!');
  } catch (error) {
    console.error('❌ Failed to update orders table:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixUserIdColumn();