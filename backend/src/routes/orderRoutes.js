import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order actions require login
router.post('/checkout', createOrder);
router.get('/my-orders', getUserOrders);

export default router;