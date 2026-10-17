import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixPriceAtPurchase() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Synchronizing order_items columns...');

    // 1. Inspect existing columns
    const [existingCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items';
    `);

    const colNames = existingCols.map((c) => c.COLUMN_NAME);
    console.log('Current order_items columns:', colNames.join(', '));

    // 2. Relax price_at_purchase if it exists
    if (colNames.includes('price_at_purchase')) {
      await connection.query(`
        ALTER TABLE order_items MODIFY COLUMN price_at_purchase DECIMAL(10,2) NULL DEFAULT 0.00;
      `);
      console.log('✅ Altered: price_at_purchase is now nullable.');
    }

    // 3. Relax subtotal if it exists
    if (colNames.includes('subtotal')) {
      await connection.query(`
        ALTER TABLE order_items MODIFY COLUMN subtotal DECIMAL(10,2) NULL DEFAULT 0.00;
      `);
      console.log('✅ Altered: subtotal is now nullable.');
    }

    // 4. Ensure standard unit_price and price exist
    if (!colNames.includes('unit_price')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) NULL DEFAULT 0.00;');
      console.log('✅ Added column: unit_price');
    }

    if (!colNames.includes('price')) {
      await connection.query('ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2) NULL DEFAULT 0.00;');
      console.log('✅ Added column: price');
    }

    console.log('🎉 order_items repair complete!');
  } catch (error) {
    console.error('❌ Failed to update order_items table:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixPriceAtPurchase();