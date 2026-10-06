import pool from '../config/db.js';

// 1. Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all products (with optional filtering by category slug or skin type)
export const getAllProducts = async (req, res) => {
  try {
    const { category, skin_type, search } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (skin_type) {
      query += ' AND (p.target_skin_type LIKE ? OR p.target_skin_type = "All Skin Types")';
      params.push(`%${skin_type}%`);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.key_ingredients LIKE ? OR p.flavor_or_type LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.id ASC';

    const [products] = await pool.query(query, params);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get single product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug 
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};