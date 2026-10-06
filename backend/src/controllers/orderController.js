import pool from '../config/db.js';

// 1. Checkout / Create Order from Cart
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { shipping_address, phone_number, payment_method = 'cod' } = req.body;

    if (!shipping_address || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and phone number are required'
      });
    }

    await connection.beginTransaction();

    // Fetch user's cart items
    const [cartItems] = await connection.query(`
      SELECT c.product_id, c.quantity, p.price, p.stock_quantity, p.name 
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Verify stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.name}`
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Insert order record
    const [orderResult] = await connection.query(`
      INSERT INTO orders (user_id, total_amount, shipping_address, phone_number, payment_method, order_status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `, [userId, totalAmount, shipping_address, phone_number, payment_method]);

    const orderId = orderResult.insertId;

    // Insert order items and deduct stock
    for (const item of cartItems) {
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price]);

      await connection.query(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `, [item.quantity, item.product_id]);
    }

    // Clear user cart
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId,
        totalAmount,
        itemCount: cartItems.length,
        status: 'pending'
      }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 2. Get User Order History
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};