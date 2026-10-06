import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const connection = await pool.getConnection();
  try {
    console.log('🌱 Ensuring Categories and Products tables exist and seeding items...');

    // 1. Create categories table if missing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Create products table if missing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        brand VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        flavor_or_type VARCHAR(100) NULL,
        volume_or_weight VARCHAR(100) NULL,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        target_skin_type VARCHAR(100) NULL,
        benefits TEXT NULL,
        key_ingredients TEXT NULL,
        image_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 3. Seed categories
    await connection.query(`
      INSERT INTO categories (id, name, slug, description) VALUES
      (1, 'Eye Care Treatments', 'eye-care', 'Hydrogel under-eye patches, collagen depuffing and firming formulas.'),
      (2, 'Lip Care Treatments', 'lip-care', 'Deeply moisturizing, plumping honey and botanical lip patches.'),
      (3, 'Sleeping Masks', 'sleeping-masks', 'Leave-on overnight jelly sachets, freeze-dried active restoration.'),
      (4, 'Sheet Masks', 'sheet-masks', 'Bio-cellulose concentrated essence masks for radiant complexion.'),
      (5, 'Hand Creams', 'hand-creams', 'Luxurious botanical hand moisturizing and barrier conditioning.')
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    // 4. Seed products
    await connection.query(`
      INSERT INTO products 
        (id, category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients, image_url)
      VALUES
        (1, 1, 'Körmesic', 'Marine Collagen Peptide Hydrogel Eye Gels', 'kormesic-marine-collagen-eye-gels', 'Pearl Blue', '60 Patches (30 Pairs)', 2850.00, 45, 'All Skin Types', 'Depuffs orbital baggage, fades dark circles, and plumps fine lines.', 'Marine Collagen, Niacinamide, Sodium Hyaluronate', '/assets/hero/hero-2.jpg'),
        (2, 1, 'Körmesic', '24K Luxury Gold Bio-Peptide Eye Mask', 'kormesic-24k-gold-eye-mask', 'Pure Gold', '60 Patches (30 Pairs)', 3200.00, 30, 'Aging', 'Intense cellular firming, collagen synthesis, and antioxidant protection.', '24K Colloidal Gold, Acetyl Hexapeptide-8', '/assets/hero/hero-5.jpg'),
        (3, 4, 'Fancy Aura', 'Centella Asiatica Barrier Sheet Mask', 'fancy-aura-cica-sheet-mask', 'Herbal Calming', '25ml Single Sheet', 650.00, 120, 'Sensitive', 'Calms facial redness, accelerates micro-wound healing, and hydrates.', 'Madagascar Centella Asiatica, Madecassoside', '/assets/hero/hero-3.jpg'),
        (4, 3, 'Fancy Aura', 'Rose Freeze-Dried Overnight Sleeping Pod', 'rose-freeze-dried-sleeping-pod', 'Rose Jelly', '4ml Sachet', 450.00, 80, 'Dry', 'Overnight moisture seal, repairs dull texture for morning dew.', 'French Rose Extract, Hyaluronic Complex', '/assets/hero/hero-4.jpg'),
        (5, 2, 'Fancy Aura', 'Honey & Propolis Plumping Lip Mask', 'honey-propolis-plumping-lip-mask', 'Natural Honey', '20 Patches', 1850.00, 25, 'Dehydrated', 'Exfoliates dry cuticles, deeply hydrates and visibly plumps lips.', 'Organic Wild Honey, Propolis, Vitamin E', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'),
        (6, 5, 'Fancy Aura', 'Botanical Shea & Avocado Moisture Hand Cream', 'botanical-shea-avocado-hand-cream', 'Avocado', '30g Tube', 750.00, 60, 'Dry', 'Instantly softens rough palms without greasy residue.', 'Shea Butter, Avocado Oil, Botanical Glycerin', '/assets/hero/hero-1.jpg')
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name),
        price=VALUES(price),
        stock_quantity=VALUES(stock_quantity),
        image_url=VALUES(image_url);
    `);

    console.log('✅ Catalog seeded successfully with categories and 6 core products.');
  } catch (e) {
    console.error('❌ Seeding failed:', e);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();