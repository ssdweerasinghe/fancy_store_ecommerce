import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSetup() {
  console.log('⏳ Connecting to MySQL server...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('📖 Reading schema.sql...');
    // Resolves from backend/src/config/ to database/schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    console.log('🚀 Executing SQL schema and seeding skincare catalog...');
    await connection.query(sqlContent);

    console.log('✅ Database `fancy_store_db` created and fully seeded successfully!');
  } catch (error) {
    console.error('❌ Error executing database setup:', error.message);
  } finally {
    await connection.end();
  }
}

runSetup();