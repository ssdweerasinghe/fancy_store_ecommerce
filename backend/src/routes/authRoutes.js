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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES (?, ?, ?, ?, 'customer')`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || null]
    );

    const token = jwt.sign(
      { id: result.insertId, email: email.toLowerCase().trim(), name, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: { id: result.insertId, name, email: email.toLowerCase().trim(), role: 'customer' }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, require_admin } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (require_admin && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account is not authorized for administrative access' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/admin/overview
router.get('/admin/overview', verifyAdmin, async (req, res) => {
  try {
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ low_stock_count }]] = await pool.query('SELECT COUNT(*) AS low_stock_count FROM products WHERE stock_quantity < 15');
    
    const [recent_orders] = await pool.query(
      'SELECT id, customer_name, customer_email, total_amount, payment_method, status, created_at FROM orders ORDER BY id DESC LIMIT 10'
    );

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
    console.error('Admin analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin analytics' });
  }
});

export default router;