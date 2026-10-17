import express from 'express';
import pool from '../config/db.js';
import { verifyAdmin, verifyToken } from './authRoutes.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { generateOrderInvoicePDF } from '../services/pdfService.js';

const router = express.Router();

function generateDateTimeTrackingNumber() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value || '00';
  return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}${get('second')}`;
}

// 1. POST /api/orders/checkout (Create order)
router.post('/checkout', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const {
      user_id = null,
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
        message: 'Recipient name, email, phone number, and delivery address are all required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Checkout requires at least one product item'
      });
    }

    const cleanName = customer_name.trim();
    const cleanEmail = customer_email.trim();
    const cleanPhone = customer_phone.trim();
    const cleanAddress = shipping_address.trim();
    const normalizedPaymentMethod = String(payment_method).trim().toLowerCase() || 'cash_on_delivery';
    const trackingNumber = generateDateTimeTrackingNumber();

    await connection.beginTransaction();

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT id, name, price, stock_quantity, target_skin_type, key_ingredients, benefits FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ID ${item.product_id} is no longer available`);
      }

      const product = productRows[0];
      const qty = parseInt(item.quantity, 10) || 1;

      if (product.stock_quantity < qty) {
        throw new Error(`Insufficient inventory for "${product.name}". Available stock: ${product.stock_quantity}`);
      }

      const itemTotal = Number(product.price) * qty;
      totalAmount += itemTotal;

      validatedItems.push({
        product_id: product.id,
        name: product.name,
        target_skin_type: product.target_skin_type,
        key_ingredients: product.key_ingredients,
        benefits: product.benefits,
        quantity: qty,
        unit_price: product.price,
        item_total: itemTotal
      });

      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [qty, product.id]
      );
    }

    const [orderCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders';
    `);
    const availableOrderCols = orderCols.map((c) => c.COLUMN_NAME);

    const orderFields = [];
    const orderValues = [];
    const orderPlaceholders = [];

    const addOrderField = (colName, val) => {
      if (availableOrderCols.includes(colName)) {
        orderFields.push(colName);
        orderValues.push(val);
        orderPlaceholders.push('?');
      }
    };

    addOrderField('tracking_number', trackingNumber);
    addOrderField('customer_name', cleanName);
    addOrderField('customer_email', cleanEmail);
    addOrderField('customer_phone', cleanPhone);
    addOrderField('shipping_address', cleanAddress);
    addOrderField('payment_method', normalizedPaymentMethod);
    addOrderField('total_amount', totalAmount);
    addOrderField('status', 'confirmed');

    addOrderField('name', cleanName);
    addOrderField('email', cleanEmail);
    addOrderField('phone', cleanPhone);
    addOrderField('phone_number', cleanPhone);
    addOrderField('address', cleanAddress);
    if (user_id) addOrderField('user_id', Number(user_id));

    const insertOrderSql = `
      INSERT INTO orders (${orderFields.join(', ')})
      VALUES (${orderPlaceholders.join(', ')})
    `;

    const [orderResult] = await connection.query(insertOrderSql, orderValues);
    const orderId = orderResult.insertId;

    const [itemCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items';
    `);
    const availableItemCols = itemCols.map((c) => c.COLUMN_NAME);

    for (const item of validatedItems) {
      const itemFields = ['order_id', 'product_id', 'quantity'];
      const itemValues = [orderId, item.product_id, item.quantity];
      const itemPlaceholders = ['?', '?', '?'];

      if (availableItemCols.includes('price_at_purchase')) {
        itemFields.push('price_at_purchase');
        itemValues.push(item.unit_price);
        itemPlaceholders.push('?');
      }

      if (availableItemCols.includes('unit_price')) {
        itemFields.push('unit_price');
        itemValues.push(item.unit_price);
        itemPlaceholders.push('?');
      }

      if (availableItemCols.includes('price')) {
        itemFields.push('price');
        itemValues.push(item.unit_price);
        itemPlaceholders.push('?');
      }

      if (availableItemCols.includes('subtotal')) {
        itemFields.push('subtotal');
        itemValues.push(item.item_total);
        itemPlaceholders.push('?');
      }

      const insertItemSql = `
        INSERT INTO order_items (${itemFields.join(', ')})
        VALUES (${itemPlaceholders.join(', ')})
      `;

      await connection.query(insertItemSql, itemValues);
    }

    await connection.commit();

    sendOrderConfirmationEmail({
      order_id: orderId,
      tracking_number: trackingNumber,
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      shipping_address: cleanAddress,
      payment_method: normalizedPaymentMethod,
      total_amount: totalAmount,
      items: validatedItems
    }).catch((err) => console.error('Email dispatch error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Order confirmed and placed successfully',
      data: {
        order_id: orderId,
        tracking_number: trackingNumber,
        customer_name: cleanName,
        customer_email: cleanEmail,
        total_amount: totalAmount,
        payment_method: normalizedPaymentMethod,
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

// 2. GET /api/orders/track/:query (Search by Tracking Number, Order ID, or Phone)
router.get('/track/:query', async (req, res) => {
  try {
    const rawQuery = req.params.query;
    if (!rawQuery) {
      return res.status(400).json({ success: false, message: 'Please provide a tracking reference' });
    }

    const clean = rawQuery.replace(/^[#\s]+/, '').trim();
    const isNum = !isNaN(Number(clean)) && clean !== '';

    const [cols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders';
    `);
    const availableCols = cols.map((c) => c.COLUMN_NAME);

    const conditions = [];
    const params = [];

    if (availableCols.includes('tracking_number')) {
      conditions.push('o.tracking_number = ?');
      params.push(clean);
    }

    if (availableCols.includes('customer_phone')) {
      conditions.push('o.customer_phone LIKE ?');
      params.push(`%${clean}%`);
    } else if (availableCols.includes('phone')) {
      conditions.push('o.phone LIKE ?');
      params.push(`%${clean}%`);
    } else if (availableCols.includes('phone_number')) {
      conditions.push('o.phone_number LIKE ?');
      params.push(`%${clean}%`);
    }

    if (isNum && availableCols.includes('id')) {
      conditions.push('o.id = ?');
      params.push(Number(clean));
    }

    if (conditions.length === 0) {
      return res.status(500).json({ success: false, message: 'Database search index unavailable' });
    }

    const sql = `
      SELECT o.*
      FROM orders o
      WHERE ${conditions.join(' OR ')}
      ORDER BY o.id DESC
      LIMIT 1
    `;

    const [orders] = await pool.query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active order found matching reference: "${rawQuery}". Please verify your tracking number or mobile number.`
      });
    }

    const rawOrder = orders[0];
    const order = {
      id: rawOrder.id,
      tracking_number: rawOrder.tracking_number || String(rawOrder.id),
      customer_name: rawOrder.customer_name || rawOrder.name || 'Valued Customer',
      customer_phone: rawOrder.customer_phone || rawOrder.phone_number || rawOrder.phone || '',
      customer_email: rawOrder.customer_email || rawOrder.email || '',
      shipping_address: rawOrder.shipping_address || rawOrder.address || '',
      payment_method: rawOrder.payment_method || 'cash_on_delivery',
      total_amount: rawOrder.total_amount || 0,
      status: rawOrder.status || 'confirmed',
      created_at: rawOrder.created_at || new Date()
    };

    const [items] = await pool.query(
      `SELECT oi.*, 
              COALESCE(p.name, 'Botanical Skincare Product') AS product_name,
              p.brand, 
              p.image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Order tracking lookup error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving tracking details: ' + err.message });
  }
});

// 3. GET /api/orders/:id/invoice (Stream PDF Order Invoice)
router.get('/:id/invoice', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanId = String(rawId).replace(/^[#\s]+/, '').trim();
    const isNum = !isNaN(Number(cleanId));

    let sql = 'SELECT * FROM orders WHERE tracking_number = ?';
    const params = [cleanId];

    if (isNum) {
      sql += ' OR id = ?';
      params.push(Number(cleanId));
    }

    const [orderRows] = await pool.query(sql, params);

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: `Order #${cleanId} not found` });
    }

    const rawOrder = orderRows[0];
    const order = {
      id: rawOrder.id,
      tracking_number: rawOrder.tracking_number || String(rawOrder.id),
      customer_name: rawOrder.customer_name || rawOrder.name || 'Valued Customer',
      customer_email: rawOrder.customer_email || rawOrder.email || 'N/A',
      customer_phone: rawOrder.customer_phone || rawOrder.phone_number || rawOrder.phone || 'N/A',
      shipping_address: rawOrder.shipping_address || rawOrder.address || 'Address provided during checkout',
      payment_method: rawOrder.payment_method || 'cash_on_delivery',
      total_amount: rawOrder.total_amount || 0,
      status: rawOrder.status || 'confirmed',
      created_at: rawOrder.created_at || new Date()
    };

    const [items] = await pool.query(
      `SELECT oi.*, 
              COALESCE(p.name, 'Botanical Skincare Product') AS product_name,
              p.brand,
              p.target_skin_type,
              p.key_ingredients,
              p.benefits
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="FancyStore_Track_${order.tracking_number}_Receipt.pdf"`
    );

    generateOrderInvoicePDF(order, res);
  } catch (error) {
    console.error('PDF invoice generation error details:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate PDF document' });
    }
  }
});

// 4. GET /api/orders (Staff admin query for recent orders)
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

// 5. PATCH /api/orders/:id/status (Admin updates delivery phase)
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status code' });
    }

    await connection.beginTransaction();

    const [orders] = await connection.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = orders[0].status;

    if (status === 'cancelled' && prevStatus !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    if (prevStatus === 'cancelled' && status !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    await connection.commit();

    res.json({ success: true, message: `Order #${id} marked as ${status}` });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, message: 'Database error updating status' });
  } finally {
    if (connection) connection.release();
  }
});

// 6. DELETE /api/orders/:id (Admin cancels order & restores stock)
router.delete('/:id', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { id } = req.params;

    await connection.beginTransaction();

    const [orders] = await connection.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order does not exist' });
    }

    const currentStatus = orders[0].status;

    if (currentStatus !== 'cancelled') {
      const [items] = await connection.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }

    await connection.query('UPDATE orders SET status = "cancelled" WHERE id = ?', [id]);
    await connection.commit();

    res.json({
      success: true,
      message: `Order #${id} has been cancelled and inventory replenished.`
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error cancelling order:', err);
    res.status(500).json({ success: false, message: 'Server error processing order cancellation' });
  } finally {
    if (connection) connection.release();
  }
});

// 7. GET /api/orders/user/my-orders (Logged-in customer order history)
router.get('/user/my-orders', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user.id;
    const [orders] = await pool.query(
      `SELECT o.*, 
              COALESCE(o.tracking_number, o.id) AS tracking_number,
              COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? OR o.customer_email = ?
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [userId, userEmail]
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('My orders fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve your order history' });
  }
});

// 8. GET /api/orders/user/my-orders (Logged-in customer order history)
router.get('/user/my-orders', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userId = req.user.id;
    const [orders] = await pool.query(
      `SELECT o.*, COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? OR o.customer_email = ?
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [userId, userEmail]
    );

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('My orders fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve your order history' });
  }
});

export default router;