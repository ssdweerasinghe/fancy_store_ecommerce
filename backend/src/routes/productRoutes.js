import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { verifyAdmin } from './authRoutes.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|avif/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, avif) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Photo Upload Endpoint (Admin Only)
router.post('/products/upload-image', verifyAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        filename: req.file.filename,
        url: fileUrl
      }
    });
  } catch (err) {
    console.error('Error handling image upload:', err);
    res.status(500).json({ success: false, message: 'Failed to process file upload' });
  }
});

// GET Categories
const getCategoriesHandler = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

router.get('/categories', getCategoriesHandler);

// GET Products
const getProductsHandler = async (req, res) => {
  try {
    const { category, skin_type } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (skin_type && skin_type !== 'all') {
      query += ' AND p.target_skin_type LIKE ?';
      params.push(`%${skin_type}%`);
    }

    query += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

router.get('/products', getProductsHandler);
router.get('/', getProductsHandler);

// GET Single Product
const getSingleProductHandler = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    if (idOrSlug === 'categories' || idOrSlug === 'products' || idOrSlug === 'upload-image') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const isNumeric = !isNaN(Number(idOrSlug));
    const query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'}
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [idOrSlug]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching single product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

router.get('/products/:idOrSlug', getSingleProductHandler);
router.get('/:idOrSlug', getSingleProductHandler);

// POST: Add Product (Admin Only)
const addProductHandler = async (req, res) => {
  try {
    const {
      category_id,
      brand,
      name,
      slug,
      flavor_or_type,
      volume_or_weight,
      price,
      stock_quantity,
      target_skin_type,
      benefits,
      key_ingredients,
      image_url
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [result] = await pool.query(
      `INSERT INTO products 
        (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        brand || 'Fancy Store',
        name,
        finalSlug,
        flavor_or_type || 'Standard',
        volume_or_weight || 'Regular Pack',
        price,
        stock_quantity || 0,
        target_skin_type || 'All Skin Types',
        benefits || '',
        key_ingredients || '',
        image_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: error.message || 'Database error adding product' });
  }
};

router.post('/products', verifyAdmin, addProductHandler);
router.post('/', verifyAdmin, addProductHandler);

// PUT: Update Product (Admin Only)
const updateProductHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      brand,
      name,
      slug,
      flavor_or_type,
      volume_or_weight,
      price,
      stock_quantity,
      target_skin_type,
      benefits,
      key_ingredients,
      image_url
    } = req.body;

    await pool.query(
      `UPDATE products SET
        category_id = COALESCE(?, category_id),
        brand = COALESCE(?, brand),
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        flavor_or_type = COALESCE(?, flavor_or_type),
        volume_or_weight = COALESCE(?, volume_or_weight),
        price = COALESCE(?, price),
        stock_quantity = COALESCE(?, stock_quantity),
        target_skin_type = COALESCE(?, target_skin_type),
        benefits = COALESCE(?, benefits),
        key_ingredients = COALESCE(?, key_ingredients),
        image_url = ?
       WHERE id = ?`,
      [
        category_id,
        brand,
        name,
        slug,
        flavor_or_type,
        volume_or_weight,
        price,
        stock_quantity,
        target_skin_type,
        benefits,
        key_ingredients,
        image_url,
        id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message || 'Database error updating product' });
  }
};

router.put('/products/:id', verifyAdmin, updateProductHandler);
router.put('/:id', verifyAdmin, updateProductHandler);

// DELETE: Remove Product (Admin Only)
const deleteProductHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Database error deleting product' });
  }
};

router.delete('/products/:id', verifyAdmin, deleteProductHandler);
router.delete('/:id', verifyAdmin, deleteProductHandler);

export default router;