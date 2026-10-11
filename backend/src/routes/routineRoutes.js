import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const { skin_type = 'all', primary_concern = 'hydration' } = req.body;

    // Fetch active products
    const [allProducts] = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity > 0
      ORDER BY p.id ASC
    `);

    if (allProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active stock available for routine generation'
      });
    }

    const normalizedSkin = skin_type.toLowerCase();
    const normalizedConcern = primary_concern.toLowerCase();

    // 1. Step 1: Prep / Cleansing / Sheet Mask
    let step1 = allProducts.find(
      (p) =>
        (p.category_slug === 'sheet-masks' || p.category_slug === 'eye-care') &&
        (p.target_skin_type.toLowerCase().includes(normalizedSkin) || p.target_skin_type.toLowerCase().includes('all'))
    ) || allProducts[0];

    // 2. Step 2: Active Bio-Targeting (Eye Care or Lip Care)
    let step2 = allProducts.find(
      (p) =>
        p.id !== step1.id &&
        (p.category_slug === 'eye-care' || p.category_slug === 'lip-care') &&
        (p.benefits.toLowerCase().includes(normalizedConcern) || p.target_skin_type.toLowerCase().includes(normalizedSkin))
    ) || allProducts.find((p) => p.id !== step1.id) || allProducts[0];

    // 3. Step 3: Moisture Barrier / Overnight Pod / Hand Care
    let step3 = allProducts.find(
      (p) =>
        p.id !== step1.id &&
        p.id !== step2.id &&
        (p.category_slug === 'sleeping-masks' || p.category_slug === 'hand-creams')
    ) || allProducts.find((p) => p.id !== step1.id && p.id !== step2.id) || allProducts[0];

    const routineItems = [
      { step_number: 1, step_name: 'Prep & Penetration Activation', product: step1 },
      { step_number: 2, step_name: 'Targeted Bio-Active Infusion', product: step2 },
      { step_number: 3, step_name: 'Cellular Moisture Barrier Seal', product: step3 }
    ];

    const totalPrice = routineItems.reduce((acc, curr) => acc + Number(curr.product.price), 0);

    res.json({
      success: true,
      data: {
        skin_type,
        primary_concern,
        total_price: totalPrice,
        steps: routineItems
      }
    });
  } catch (error) {
    console.error('Algorithmic routine consultation error:', error);
    res.status(500).json({ success: false, message: 'Server error generating consultation' });
  }
});

export default router;