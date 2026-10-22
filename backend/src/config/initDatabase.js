import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseName = process.env.DB_NAME || 'fancy_store_db';

async function ensureColumn(connection, tableName, columnName, definition) {
  const [columns] = await connection.execute(
    `SELECT 1
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  if (columns.length === 0) {
    await connection.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`
    );
  }
}

async function initDatabase() {
  let connection;

  try {
    console.log('🔧 Connecting to MySQL server...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
    });

    const escapedDatabaseName = databaseName.replace(/`/g, '``');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${escapedDatabaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.changeUser({ database: databaseName });
    console.log(`✅ Database '${databaseName}' created or confirmed.`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NULL UNIQUE,
        phone VARCHAR(30) NULL UNIQUE,
        password VARCHAR(255) NULL,
        google_id VARCHAR(100) NULL UNIQUE,
        role VARCHAR(30) NOT NULL DEFAULT 'customer',
        skin_type VARCHAR(100) NULL,
        avatar_url TEXT NULL,
        is_phone_verified TINYINT(1) NOT NULL DEFAULT 0,
        is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
        address_line1 TEXT NULL,
        town VARCHAR(100) NULL,
        district VARCHAR(100) NULL,
        province VARCHAR(100) NULL,
        postal_code VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      ALTER TABLE users
        MODIFY COLUMN email VARCHAR(191) NULL,
        MODIFY COLUMN password VARCHAR(255) NULL;
    `);

    const userColumns = [
      ['phone', 'VARCHAR(30) NULL UNIQUE'],
      ['google_id', 'VARCHAR(100) NULL UNIQUE'],
      ['skin_type', 'VARCHAR(100) NULL'],
      ['avatar_url', 'TEXT NULL'],
      ['is_phone_verified', 'TINYINT(1) NOT NULL DEFAULT 0'],
      ['is_email_verified', 'TINYINT(1) NOT NULL DEFAULT 0'],
      ['address_line1', 'TEXT NULL'],
      ['town', 'VARCHAR(100) NULL'],
      ['district', 'VARCHAR(100) NULL'],
      ['province', 'VARCHAR(100) NULL'],
      ['postal_code', 'VARCHAR(20) NULL'],
    ];
    for (const [columnName, definition] of userColumns) {
      await ensureColumn(connection, 'users', columnName, definition);
    }
    console.log('✅ users table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ categories table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        brand VARCHAR(100) NOT NULL DEFAULT 'Fancy Store',
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        flavor_or_type VARCHAR(100) NULL,
        volume_or_weight VARCHAR(100) NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock_quantity INT NOT NULL DEFAULT 0,
        target_skin_type VARCHAR(150) NOT NULL DEFAULT 'All Skin Types',
        benefits TEXT NULL,
        key_ingredients TEXT NULL,
        image_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category_id),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ products table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_number VARCHAR(50) NULL UNIQUE,
        user_id INT NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(191) NOT NULL,
        customer_phone VARCHAR(30) NOT NULL,
        phone_number VARCHAR(30) NULL,
        shipping_address TEXT NOT NULL,
        payment_method VARCHAR(100) NOT NULL DEFAULT 'cash_on_delivery',
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        order_status VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const orderColumns = [
      ['tracking_number', 'VARCHAR(50) NULL'],
      ['user_id', 'INT NULL'],
      ['customer_name', 'VARCHAR(150) NULL'],
      ['customer_email', 'VARCHAR(191) NULL'],
      ['customer_phone', 'VARCHAR(30) NULL'],
      ['phone_number', 'VARCHAR(30) NULL'],
      ['shipping_address', 'TEXT NULL'],
      ['payment_method', "VARCHAR(100) NULL DEFAULT 'cash_on_delivery'"],
      ['total_amount', 'DECIMAL(10,2) NOT NULL DEFAULT 0.00'],
      ['status', "VARCHAR(50) NOT NULL DEFAULT 'confirmed'"],
      ['order_status', 'VARCHAR(50) NULL'],
    ];
    for (const [columnName, definition] of orderColumns) {
      await ensureColumn(connection, 'orders', columnName, definition);
    }
    await connection.query('ALTER TABLE orders MODIFY COLUMN user_id INT NULL');
    console.log('✅ orders table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_product (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ cart_items table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        price DECIMAL(10,2) NULL,
        price_at_purchase DECIMAL(10,2) NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ order_items table verified.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS verification_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target VARCHAR(191) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose ENUM('phone_verify', 'email_verify', 'forgot_password') NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_target_purpose (target, purpose)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ verification_otps table verified.');

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ refresh_tokens table verified.');

    console.log('🎉 Full database and schema initialized successfully!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Database initialization error:', message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Failed to close MySQL connection:', message);
        process.exitCode = 1;
      }
    }
  }
}

await initDatabase();
