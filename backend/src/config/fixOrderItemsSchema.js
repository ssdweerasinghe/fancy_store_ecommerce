import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixOrderItemsSchema() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Verifying and updating MySQL order_items table columns...');

    // 1. Inspect existing columns in order_items table
    const [existingColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items';
    `);

    const colNames = existingColumns.map((c) => c.COLUMN_NAME);
    console.log('Current columns in order_items table:', colNames.join(', '));

    // 2. Ensure both 'unit_price' and 'price' exist and are nullable or properly typed
    if (!colNames.includes('unit_price')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) NULL;');
      console.log('✅ Added column: unit_price');
    }

    if (!colNames.includes('price')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2) NULL;');
      console.log('✅ Added column: price');
    }

    if (!colNames.includes('subtotal')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN subtotal DECIMAL(10,2) NULL;');
      console.log('✅ Added column: subtotal');
    }

    console.log('🎉 order_items table schema synchronized successfully!');
  } catch (error) {
    console.error('❌ order_items schema update error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixOrderItemsSchema();