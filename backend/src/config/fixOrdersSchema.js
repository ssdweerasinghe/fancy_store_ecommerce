import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixOrdersSchema() {
  const connection = await pool.getConnection();
  try {
    console.log('🔧 Verifying and updating MySQL orders table columns...');

    // 1. Ensure orders table exists with primary structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(191) NOT NULL,
        customer_phone VARCHAR(30) NOT NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Safely add any missing columns if the table pre-existed with old structure
    const orderColumns = [
      { name: 'customer_name', sql: 'ALTER TABLE orders ADD COLUMN customer_name VARCHAR(150) NOT NULL;' },
      { name: 'customer_email', sql: 'ALTER TABLE orders ADD COLUMN customer_email VARCHAR(191) NOT NULL;' },
      { name: 'customer_phone', sql: 'ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(30) NOT NULL;' },
      { name: 'shipping_address', sql: 'ALTER TABLE orders ADD COLUMN shipping_address TEXT NOT NULL;' },
      { name: 'payment_method', sql: "ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash_on_delivery';" },
      { name: 'total_amount', sql: 'ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;' },
      { name: 'status', sql: "ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'confirmed';" }
    ];

    for (const col of orderColumns) {
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

    // 3. Ensure order_items table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('✅ order_items table verified.');

    console.log('🎉 Orders table schema fixed successfully!');
  } catch (error) {
    console.error('❌ Orders schema update error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixOrdersSchema();