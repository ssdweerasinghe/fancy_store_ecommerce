import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testDbConnection } from './config/db.js';
import productRoutes from './routes/productRoutes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Database Connection on startup
testDbConnection();

// Root / Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Fancy Store API',
    version: '1.0.0',
    description: 'Skincare E-Commerce & Routine Recommendation Backend',
    status: 'online',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      products: '/api/products'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Fancy Store API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', productRoutes);

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`
  });
});

// Global Error Handling Middleware
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
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('Database pool connections closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await pool.end();
    console.log('Database pool connections closed.');
    process.exit(0);
  });
});

export default app;