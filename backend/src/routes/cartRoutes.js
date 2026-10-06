import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart actions require login
router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/:id', removeFromCart);

export default router;