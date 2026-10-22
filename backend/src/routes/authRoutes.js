import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/db.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback_key';
const IS_PROD = process.env.NODE_ENV === 'production';

// Helper to hash refresh tokens before database storage
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// Issue Access and Refresh Tokens into Secure HTTP-only cookies
async function issueAuthCookies(res, user) {
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'customer'
  };

  // 1. Short-lived Access Token (15 minutes)
  const accessToken = jwt.sign(tokenPayload, ACCESS_SECRET, { expiresIn: '15m' });

  // 2. Long-lived Refresh Token (7 days)
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  const tokenHashValue = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 3. Persist Refresh Token to MySQL
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
    [user.id, refreshToken, tokenHashValue, expiresAt]
  );

  // 4. Attach Access Token Cookie (15 mins)
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/'
  });

  // 5. Attach Refresh Token Cookie (7 days)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });

  return { accessToken, refreshToken };
}

// Middleware: Authenticate via HTTP-only Cookie OR Authorization Header
export function verifyToken(req, res, next) {
  const token = req.cookies?.access_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
    if (err) {
      // 403 status code triggers client interceptor to call /api/auth/refresh
      return res.status(403).json({ success: false, message: 'Token expired or invalid' });
    }
    req.user = decoded;
    next();
  });
}

// Middleware: Admin Authorization
export function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required' });
    }
  });
}

// 1. POST /api/auth/google (Google One-Tap / Button Login with HTTP-only Cookies)
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'No verified email returned from Google' });
    }

    // Look up user by email
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (existing.length > 0) {
      user = existing[0];
      // Sync avatar or google_id if missing
      await pool.query(
        'UPDATE users SET avatar_url = COALESCE(avatar_url, ?), is_email_verified = 1 WHERE id = ?',
        [picture || null, user.id]
      );
    } else {
      // Create user profile
      const [insertResult] = await pool.query(
        `INSERT INTO users (name, email, avatar_url, role, is_email_verified)
         VALUES (?, ?, ?, 'customer', 1)`,
        [name || 'Botanical User', email, picture || null]
      );
      const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      user = newUser[0];
    }

    // Issue Cookies
    await issueAuthCookies(res, user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar_url: user.avatar_url || picture || null
    };

    return res.json({
      success: true,
      message: 'Google authentication successful',
      data: { user: safeUser }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Google credential token: ' + error.message });
  }
});

// 2. POST /api/auth/refresh (Silent Token Refresh via Cookie)
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token cookie missing' });
    }

    // 1. Verify cryptographic signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (e) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // 2. Validate token presence in MySQL database
    const tokenHashValue = hashToken(refreshToken);
    const [rows] = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND expires_at > NOW()',
      [tokenHashValue, decoded.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Session revoked or expired' });
    }

    // 3. Retrieve user data
    const [userRows] = await pool.query('SELECT id, name, email, phone, role, avatar_url FROM users WHERE id = ?', [decoded.id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User record no longer exists' });
    }
    const user = userRows[0];

    // 4. Issue a new 15-minute access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // 5. Overwrite the access_token cookie
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

// 3. POST /api/auth/logout (Clears Cookies & Revokes Database Session)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const tokenHashValue = hashToken(refreshToken);
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHashValue]);
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// 4. GET /api/auth/me (Check current logged-in user from Cookie)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, avatar_url, address_line1, town, district, province, postal_code 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: { user: rows[0] } });
  } catch (error) {
    console.error('Fetch me error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

// 5. POST /api/auth/login (Standard email/password login supporting cookies)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password, require_admin } = req.body;
    const loginId = (identifier || email || '').trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (email/phone) and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [loginId, loginId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (require_admin && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrative access restricted' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Please sign in with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await issueAuthCookies(res, user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url
    };

    return res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 6. GET /api/auth/admin/overview (KPI Stats for Dashboard)
router.get('/admin/overview', verifyAdmin, async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) as total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != "cancelled"');
    const [[{ low_stock_count }]] = await pool.query('SELECT COUNT(*) as low_stock_count FROM products WHERE stock_quantity < 15');
    const [recent_orders] = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 50');

    res.json({
      success: true,
      data: {
        total_orders,
        total_revenue,
        low_stock_count,
        recent_orders
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve overview stats' });
  }
});

export default router;