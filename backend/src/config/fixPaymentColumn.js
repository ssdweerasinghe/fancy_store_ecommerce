import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixPaymentColumn() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Expanding payment_method column in orders table...');

    // Expand payment_method to VARCHAR(100) and allow safe defaults
    await connection.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_method VARCHAR(100) NOT NULL DEFAULT 'cash_on_delivery';
    `);

    console.log('✅ payment_method column successfully modified to VARCHAR(100)!');
  } catch (error) {
    console.error('❌ Failed to alter column:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixPaymentColumn();