import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function unifyOrdersTable() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Synchronizing legacy columns in orders table...');

    // 1. Inspect existing columns in orders table
    const [existingColumns] = await connection.query(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders';
    `);

    const colNames = existingColumns.map((c) => c.COLUMN_NAME);
    console.log('Current columns in orders table:', colNames.join(', '));

    // 2. Make all legacy alternate columns NULLABLE so MySQL strict mode won't block inserts
    const legacyColumnsToRelax = [
      'phone_number',
      'phone',
      'user_id',
      'name',
      'email',
      'address',
      'postal_code',
      'tracking_number',
      'notes'
    ];

    for (const legacyCol of legacyColumnsToRelax) {
      if (colNames.includes(legacyCol)) {
        try {
          await connection.query(`ALTER TABLE orders MODIFY COLUMN ${legacyCol} VARCHAR(255) NULL;`);
          console.log(`✅ Altered legacy column to nullable: ${legacyCol}`);
        } catch (err) {
          // If it's an INT column like user_id
          try {
            await connection.query(`ALTER TABLE orders MODIFY COLUMN ${legacyCol} INT NULL;`);
            console.log(`✅ Altered legacy column to nullable (INT): ${legacyCol}`);
          } catch (e) {
            console.warn(`Could not modify ${legacyCol}:`, e.message);
          }
        }
      }
    }

    // 3. Ensure modern target columns exist
    const standardColumns = [
      { name: 'customer_name', sql: 'ALTER TABLE orders ADD COLUMN customer_name VARCHAR(150) NULL;' },
      { name: 'customer_email', sql: 'ALTER TABLE orders ADD COLUMN customer_email VARCHAR(191) NULL;' },
      { name: 'customer_phone', sql: 'ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(30) NULL;' },
      { name: 'shipping_address', sql: 'ALTER TABLE orders ADD COLUMN shipping_address TEXT NULL;' },
      { name: 'payment_method', sql: "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(100) NULL DEFAULT 'cash_on_delivery';" },
      { name: 'total_amount', sql: 'ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;' },
      { name: 'status', sql: "ALTER TABLE orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'confirmed';" }
    ];

    for (const col of standardColumns) {
      if (!colNames.includes(col.name)) {
        try {
          await connection.query(col.sql);
          console.log(`✅ Added standard column: ${col.name}`);
        } catch (err) {
          console.warn(`Warning on ${col.name}:`, err.message);
        }
      }
    }

    console.log('🎉 Orders table unified successfully!');
  } catch (error) {
    console.error('❌ Orders schema unification error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

unifyOrdersTable();