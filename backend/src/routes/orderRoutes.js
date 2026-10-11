import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin, verifyToken } from './authRoutes.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

// 1. POST /api/orders/checkout (Create order)
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
        name: product.name,
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

    // Insert order record
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [customer_name, customer_email, customer_phone, shipping_address, payment_method, totalAmount]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.item_total]
      );
    }

    await connection.commit();

    // Trigger asynchronous email confirmation
    sendOrderConfirmationEmail({
      order_id: orderId,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      payment_method,
      total_amount: totalAmount,
      items: validatedItems
    }).catch((err) => console.error('Email dispatch error:', err));

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

// 2. GET /api/orders (Staff admin query for recent orders)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, 
        COUNT(oi.id) as items_count 
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.id DESC 
      LIMIT 100
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving orders' });
  }
});

// 3. PATCH /api/orders/:id/status (Admin updates delivery phase)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status code' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Order #${id} marked as ${status}` });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Database error updating status' });
  }
});

// 4. GET /api/orders/track/:query (Customer live lookup by order ID or phone)
router.get('/track/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const isNum = !isNaN(Number(query));

    let sql = `
      SELECT o.id, o.customer_name, o.customer_phone, o.total_amount, o.status, o.payment_method, o.created_at
      FROM orders o
      WHERE ${isNum ? 'o.id = ? OR o.customer_phone LIKE ?' : 'o.customer_phone LIKE ?'}
      ORDER BY o.id DESC
      LIMIT 5
    `;

    const params = isNum ? [query, `%${query}%`] : [`%${query}%`];
    const [orders] = await pool.query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found matching this reference' });
    }

    const order = orders[0];
    const [items] = await pool.query(`
      SELECT oi.*, p.name as product_name, p.brand, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);

    order.items = items;

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Order tracking lookup error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving tracking details' });
  }
});

// 5. GET /api/orders/user/my-orders (Logged in customer order history)
router.get('/user/my-orders', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const [orders] = await pool.query(`
      SELECT o.*, COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.id DESC
    `, [userEmail]);

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('My orders fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve your order history' });
  }
});

export default router;