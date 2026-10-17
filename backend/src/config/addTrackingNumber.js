import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

function formatTimestamp(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Adding tracking_number column to orders table...');

    // 1. Add column if not exists
    try {
      await connection.query(`
        ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(50) UNIQUE NULL AFTER id;
      `);
      console.log('✅ Added column: tracking_number');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Column tracking_number already exists.');
      } else {
        console.warn('Notice:', err.message);
      }
    }

    // 2. Backfill existing orders that do not have a tracking_number
    const [orders] = await connection.query('SELECT id, created_at FROM orders WHERE tracking_number IS NULL OR tracking_number = ""');
    for (const ord of orders) {
      const generated = formatTimestamp(ord.created_at || new Date()) + String(ord.id).padStart(2, '0');
      await connection.query('UPDATE orders SET tracking_number = ? WHERE id = ?', [generated, ord.id]);
      console.log(`+ Backfilled Order #${ord.id} with Tracking Number: ${generated}`);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();