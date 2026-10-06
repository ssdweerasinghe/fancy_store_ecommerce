import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      skin_type: user.skin_type 
    },
    process.env.JWT_SECRET || 'supersecretfancykey_2026',
    { expiresIn: '30d' }
  );
};

// 1. Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, skin_type } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default skin_type can be null or chosen during signup
    const validSkinTypes = ['dry', 'oily', 'combination', 'sensitive', 'normal'];
    const chosenSkinType = validSkinTypes.includes(skin_type) ? skin_type : null;

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, skin_type) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer', chosenSkinType]
    );

    const newUser = {
      id: result.insertId,
      name,
      email,
      role: 'customer',
      skin_type: chosenSkinType
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          skin_type: user.skin_type
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Current User Profile (Protected)
export const getUserProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, skin_type, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};