import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testDbConnection } from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verify database connection
testDbConnection();

// Root API Directory
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Fancy Store API',
    version: '1.0.0',
    description: 'Skincare E-Commerce & Routine Recommendation Backend',
    status: 'online',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      products: '/api/products',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      routine: {
        recommend: 'POST /api/routine/recommend'
      },
      cart: {
        view: 'GET /api/cart',
        add: 'POST /api/cart/add',
        remove: 'DELETE /api/cart/:id'
      },
      orders: {
        checkout: 'POST /api/orders/checkout',
        history: 'GET /api/orders/my-orders'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Fancy Store API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/routine', routineRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('Database pool connections closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('Database pool connections closed.');
    process.exit(0);
  });
});

export default app;