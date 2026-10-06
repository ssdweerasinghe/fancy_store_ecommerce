import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// POST /api/orders/checkout
router.post('/checkout', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      payment_method = 'cash_on_delivery',
      items
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient name, email, phone number, and delivery address'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Checkout requires at least one product item'
      });
    }

    await connection.beginTransaction();

    // 1. Verify products & calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.product_id} no longer exists`);
      }

      const product = productRows[0];
      const qty = parseInt(item.quantity, 10) || 1;

      if (product.stock_quantity < qty) {
        throw new Error(`Insufficient inventory for ${product.name}. Available: ${product.stock_quantity}`);
      }

      const itemTotal = Number(product.price) * qty;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id: product.id,
        quantity: qty,
        unit_price: product.price,
        item_total: itemTotal
      });

      // Deduct inventory
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [qty, product.id]
      );
    }

    // 2. Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [customer_name, customer_email, customer_phone, shipping_address, payment_method, totalAmount]
    );

    const orderId = orderResult.insertId;

    // 3. Insert order items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.item_total]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order_id: orderId,
        customer_name,
        customer_email,
        total_amount: totalAmount,
        payment_method,
        status: 'confirmed',
        items_count: validatedItems.length
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Checkout error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Checkout failed to process'
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/orders (Optional staff query)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC LIMIT 50');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving orders' });
  }
});

export default router;