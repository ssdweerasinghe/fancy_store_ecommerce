import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fancy_store_super_secret_key_2026';

// Middleware to verify session token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token' });
  }
};

// Middleware to verify Admin role
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required' });
    }
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. SEND OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { target, purpose = 'phone_verify' } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, message: 'Phone number or email is required' });
    }

    const cleanTarget = target.trim();
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await pool.query(
      'DELETE FROM verification_otps WHERE target = ? AND purpose = ?',
      [cleanTarget, purpose]
    );

    await pool.query(
      'INSERT INTO verification_otps (target, otp, purpose, expires_at) VALUES (?, ?, ?, ?)',
      [cleanTarget, otp, purpose, expiresAt]
    );

    console.log(`📱 [SMS/OTP] Target: ${cleanTarget} | Code: ${otp} | Purpose: ${purpose}`);

    res.json({
      success: true,
      message: `Verification code sent to ${cleanTarget}`,
      demo_code: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to dispatch verification code' });
  }
});

// 2. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { target, otp, purpose = 'phone_verify' } = req.body;
    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Target and OTP are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM verification_otps WHERE target = ? AND otp = ? AND purpose = ? AND expires_at > NOW()',
      [target.trim(), otp.trim(), purpose]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    await pool.query('DELETE FROM verification_otps WHERE id = ?', [rows[0].id]);

    if (purpose === 'phone_verify') {
      await pool.query('UPDATE users SET is_phone_verified = TRUE WHERE phone = ?', [target.trim()]);
    }

    res.json({ success: true, message: 'Verification successful' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification processing failed' });
  }
});

// 3. REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address_line1,
      town,
      district,
      province,
      postal_code,
      phone_verified = false
    } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Name and either email or phone are required' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = phone ? phone.trim() : null;

    if (cleanEmail) {
      const [byEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (byEmail.length > 0) return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    if (cleanPhone) {
      const [byPhone] = await pool.query('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
      if (byPhone.length > 0) return res.status(409).json({ success: false, message: 'Phone number is already registered' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      `INSERT INTO users 
        (name, email, phone, password, role, is_phone_verified, is_email_verified, address_line1, town, district, province, postal_code) 
       VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        cleanEmail,
        cleanPhone,
        hashedPassword,
        phone_verified ? 1 : 0,
        cleanEmail ? 1 : 0,
        address_line1 || null,
        town || null,
        district || null,
        province || null,
        postal_code || null
      ]
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: result.insertId,
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          role: 'customer',
          address_line1,
          town,
          district,
          province,
          postal_code
        }
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
});

// 4. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, require_admin } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (email/phone) and password are required' });
    }

    const cleanId = identifier.trim();

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [cleanId.toLowerCase(), cleanId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'No account found with this email or phone number' });
    }

    const user = rows[0];

    if (require_admin && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required' });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was authenticated via Google. Please click "Continue with Google" or reset password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please verify your credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
          role: user.role,
          address_line1: user.address_line1,
          town: user.town,
          district: user.district,
          province: user.province,
          postal_code: user.postal_code
        }
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
});

// 5. GOOGLE AUTH
router.post('/google', async (req, res) => {
  try {
    const { google_id, email, name, avatar_url } = req.body;

    if (!google_id || !email) {
      return res.status(400).json({ success: false, message: 'Google authentication payload missing' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const [existing] = await pool.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1',
      [google_id, cleanEmail]
    );

    let user;
    if (existing.length > 0) {
      user = existing[0];
      await pool.query(
        'UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
        [google_id, avatar_url || null, user.id]
      );
    } else {
      // Provide an empty string or random hash if strict mode expects a string for password
      const placeholderPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const [insertRes] = await pool.query(
        `INSERT INTO users (name, email, password, google_id, avatar_url, is_email_verified, role) 
         VALUES (?, ?, ?, ?, ?, 1, 'customer')`,
        [name || 'Google Member', cleanEmail, placeholderPassword, google_id, avatar_url || null]
      );
      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [insertRes.insertId]);
      user = newUser[0];
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google authentication verified',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
          role: user.role,
          address_line1: user.address_line1,
          town: user.town,
          district: user.district,
          province: user.province,
          postal_code: user.postal_code
        }
      }
    });
  } catch (error) {
    console.error('Google auth error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Google authentication failed' });
  }
});

// 6. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { target, otp, new_password } = req.body;

    if (!target || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Target, OTP code, and new password are required' });
    }

    const cleanTarget = target.trim();

    const [otps] = await pool.query(
      'SELECT * FROM verification_otps WHERE target = ? AND otp = ? AND purpose = "forgot_password" AND expires_at > NOW()',
      [cleanTarget, otp.trim()]
    );

    if (otps.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const [userUpdate] = await pool.query(
      'UPDATE users SET password = ? WHERE email = ? OR phone = ?',
      [hashedPassword, cleanTarget.toLowerCase(), cleanTarget]
    );

    if (userUpdate.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'No registered user matches this email or phone' });
    }

    await pool.query('DELETE FROM verification_otps WHERE id = ?', [otps[0].id]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Password reset procedure failed' });
  }
});

// Overview & Profile
router.get('/admin/overview', verifyAdmin, async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ low_stock_count }]] = await pool.query('SELECT COUNT(*) AS low_stock_count FROM products WHERE stock_quantity < 15');
    const [recent_orders] = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 10');

    res.json({
      success: true,
      data: {
        total_orders,
        total_revenue: Number(total_revenue),
        total_products,
        low_stock_count,
        recent_orders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;