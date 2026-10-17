import pool from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const connection = await pool.getConnection();
  try {
    const adminEmail = 'admin@fancystore.lk';
    const rawPass = 'Admin@Fancy2026';
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const [existing] = await connection.query(
      'SELECT id, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE users SET password = ?, role = "admin" WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log('✅ Existing admin updated with role: admin and active key.');
    } else {
      await connection.query(
        `INSERT INTO users (name, email, password, role, is_email_verified) 
         VALUES (?, ?, ?, 'admin', 1)`,
        ['Fancy Store Staff', adminEmail, hashedPassword]
      );
      console.log('✅ Admin user created successfully.');
    }

    console.log(`\nCredentials Ready:\nEmail: ${adminEmail}\nKey: ${rawPass}\n`);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedAdmin();