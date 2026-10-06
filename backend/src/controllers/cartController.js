import pool from '../config/db.js';

// 1. Get current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [items] = await pool.query(`
      SELECT 
        c.id AS cart_item_id,
        c.quantity,
        p.id AS product_id,
        p.name,
        p.slug,
        p.brand,
        p.price,
        p.stock_quantity,
        (p.price * c.quantity) AS subtotal
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    const totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    res.status(200).json({
      success: true,
      data: {
        items,
        totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Add product to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    // Check if item exists in cart already
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + Number(quantity);
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart_item_id

    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};