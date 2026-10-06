import express from 'express';
import { 
  getAllCategories, 
  getAllProducts, 
  getProductBySlug 
} from '../controllers/productController.js';

const router = express.Router();

// Category routes
router.get('/categories', getAllCategories);

// Product catalog routes
router.get('/products', getAllProducts);
router.get('/products/:slug', getProductBySlug);

export default router;