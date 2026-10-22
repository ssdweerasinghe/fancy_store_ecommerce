import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databaseName = process.env.DB_NAME || 'fancy_store_db';

async function runSetup() {
  let connection;

  console.log('⏳ Connecting to MySQL server...');

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
      multipleStatements: true
    });

    console.log('📖 Reading schema.sql...');
    // Resolves from backend/src/config/ to database/schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const escapedDatabaseName = databaseName.replace(/`/g, '``');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8')
      .replaceAll('fancy_store_db', `\`${escapedDatabaseName}\``);

    console.log('🚀 Executing SQL schema and seeding skincare catalog...');
    await connection.query(sqlContent);

    console.log(`✅ Database '${databaseName}' created and fully seeded successfully!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error executing database setup:', message);
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

await runSetup();