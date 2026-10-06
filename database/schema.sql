-- Create Database
CREATE DATABASE IF NOT EXISTS fancy_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fancy_store_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    skin_type ENUM('dry', 'oily', 'combination', 'sensitive', 'normal') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    flavor_or_type VARCHAR(100) NULL,
    volume_or_weight VARCHAR(50) NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 50,
    target_skin_type VARCHAR(150) DEFAULT 'All Skin Types',
    benefits TEXT NOT NULL,
    key_ingredients VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Eye Care', 'eye-care', 'Hydrogel and collagen eye patches for dark circles and puffiness'),
(2, 'Lip Care', 'lip-care', 'Hydrating, plumping, and anti-wrinkle lip masks'),
(3, 'Sleeping Masks', 'sleeping-masks', 'Overnight portable sachet masks for deep repair and hydration'),
(4, 'Sheet Masks', 'sheet-masks', 'Fancy Aura targeted essence sheet masks'),
(5, 'Hand Creams', 'hand-creams', 'Botanical, fruit, and vitamin-enriched hand care lotions')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Seed Products

-- Category 1: Eye Care
INSERT INTO products (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients) VALUES
(1, 'Körmesic', 'Pearl Blue Marine Collagen Eye Mask', 'kormesic-pearl-blue-eye-mask', 'Pearl Blue', 'Pair', 350.00, 40, 'All Skin Types', 'Moisturizes skin around the eyes and alleviates eye fatigue', 'Marine Collagen, Pearl Extract'),
(1, 'Körmesic', 'Coral Pink Marine Collagen Eye Mask', 'kormesic-coral-pink-eye-mask', 'Coral Pink', 'Pair', 350.00, 40, 'All Skin Types', 'Fades dark circles under the eyes and brightens delicate skin', 'Marine Collagen, Brightening Complex'),
(1, 'Körmesic', 'Lilac Purple Marine Collagen Eye Mask', 'kormesic-lilac-purple-eye-mask', 'Lilac Purple', 'Pair', 350.00, 40, 'Dry / Normal', 'Deep hydration, plumping fine lines, and skin vitality', 'Marine Collagen, Hyaluronic Acid, Pearl Extract'),
(1, 'Körmesic', 'Mermaid Green Marine Collagen Eye Mask', 'kormesic-mermaid-green-eye-mask', 'Mermaid Green', 'Pair', 350.00, 40, 'Mature / Fatigued', 'Anti-wrinkle, tightens under-eye area, moisturizes and brightens', 'Marine Collagen, Algae Extract'),
(1, 'Körmesic', 'Gold Collagen Eye Mask', 'kormesic-gold-collagen-eye-mask', 'Gold Collagen', '7.5g', 400.00, 50, 'All Skin Types', 'Anti-puffiness, dark circle reduction, nourishing, anti-wrinkle', 'Collagen, Gold Essence, Peptides');

-- Category 2: Lip Care
INSERT INTO products (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients) VALUES
(2, 'Körmesic', 'Aloe Vera Lip Mask', 'kormesic-aloe-vera-lip-mask', 'Aloe Vera', '1 Piece', 300.00, 60, 'Dry / Chapped Lips', 'Hydrates, moisturizes, anti-wrinkle, lip plumper, and gentle exfoliation', 'Aloe Vera Extract, Lip Conditioning Factors'),
(2, 'Körmesic', 'Honey Lip Mask', 'kormesic-honey-lip-mask', 'Honey', '1 Piece', 300.00, 60, 'Dry / Rough Lips', 'Hydrates, deeply nourishes, anti-wrinkles, plumping, and smoothing', 'Honey Extract, Natural Emollients');

-- Category 3: Overnight Sleeping Masks
INSERT INTO products (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients) VALUES
(3, 'Bioaqua', 'Firming Good Night Mask Collagen', 'bioaqua-firming-good-night-collagen-mask', 'Collagen', '4ml', 250.00, 50, 'Aging / Dehydrated', 'Firming, elastic recovery, overnight moisture lock', 'Hydrolyzed Collagen'),
(3, 'Sadoer', 'Vitamin C Good Night Gel Mask', 'sadoer-vitamin-c-good-night-gel-mask', 'Vitamin C', '4ml', 250.00, 50, 'Dull / Uneven Tone', 'Awakens skin vitality, improves skin radiance, deep hydration', 'Fresh Orange Essence, Vitamin C'),
(3, 'Körmesic', 'Rose Sleeping Mask (Freeze-Dried Powder)', 'kormesic-rose-sleeping-mask', 'Rose', '4ml', 280.00, 45, 'Sensitive / Dry', 'Firming, soothing, long-lasting water-locking hydration', 'Rose Freeze-Dried Powder'),
(3, 'Körmesic', 'Kiwi Fruit Sleeping Mask (Freeze-Dried Powder)', 'kormesic-kiwi-sleeping-mask', 'Kiwi Fruit', '4ml', 280.00, 45, 'Combination / Dull', 'Anti-aging, brightening, whitening, and continuous moisture', 'Kiwi Fruit Freeze-Dried Powder'),
(3, 'Körmesic', '24K Gold Peptides Sleeping Mask', 'kormesic-24k-gold-peptides-sleeping-mask', '24K Gold', '4ml', 320.00, 40, 'Mature / Aging', 'Deep hydration, anti-aging, wrinkle reduction, brightening complexion', '24K Gold, Peptides Freeze-Dried Powder');

-- Category 4: Sheet Masks (Fancy Aura Collection)
INSERT INTO products (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients) VALUES
(4, 'Fancy Aura', 'Cherry Sheet Mask', 'fancy-aura-cherry-mask', 'Cherry', '25g', 200.00, 30, 'Dull / Dry', 'Fruit hydration, skin conditioning, radiance boost', 'Cherry Fruit Extract'),
(4, 'Fancy Aura', 'Honey Peach Sheet Mask', 'fancy-aura-honey-peach-mask', 'Honey Peach', '25g', 200.00, 30, 'Normal / Dry', 'Softening, nourishing, and moisture retention', 'Peach Extract, Honey'),
(4, 'Fancy Aura', 'Milk Sheet Mask', 'fancy-aura-milk-mask', 'Fresh Milk', '25g', 200.00, 30, 'Dry / Flaky', 'Skin barrier smoothing, gentle deep moisturizing', 'Milk Protein Extract'),
(4, 'Fancy Aura', 'Lavender Sheet Mask', 'fancy-aura-lavender-mask', 'Lavender', '25g', 200.00, 30, 'Stressed / Irritated', 'Calming, aromatic soothing, and barrier recovery', 'Lavender Flower Extract'),
(4, 'Fancy Aura', 'Watermelon Sheet Mask', 'fancy-aura-watermelon-mask', 'Watermelon', '25g', 200.00, 30, 'Dehydrated', 'Cooling relief, intense moisture infusion', 'Watermelon Extract'),
(4, 'Fancy Aura', 'Olive Sheet Mask', 'fancy-aura-olive-mask', 'Olive', '25g', 200.00, 30, 'Rough / Very Dry', 'Deep lipid nourishment, dry patch smoothing', 'Olive Fruit Oil'),
(4, 'Fancy Aura', 'Aloe Vera Sheet Mask', 'fancy-aura-aloe-vera-mask', 'Aloe Vera', '25g', 200.00, 35, 'Sensitive / Sun-exposed', 'Instant cooling, redness alleviation, calming', 'Aloe Barbadensis Leaf Juice'),
(4, 'Fancy Aura', 'Lemon Sheet Mask', 'fancy-aura-lemon-mask', 'Lemon', '25g', 200.00, 30, 'Oily / Dull', 'Skin clarifying, oil balancing, vibrant glow', 'Lemon Fruit Extract, Citric Bioflavonoids'),
(4, 'Fancy Aura', 'Goat Milk Sheet Mask', 'fancy-aura-goat-milk-mask', 'Goat Milk', '25g', 200.00, 30, 'Sensitive / Dry', 'Rich nutrient supply, skin softness, lipid repair', 'Goat Milk Extract'),
(4, 'Fancy Aura', 'Red Ginseng Sheet Mask', 'fancy-aura-red-ginseng-mask', 'Red Ginseng', '25g', 250.00, 25, 'Tired / Aging', 'Cellular revitalizing, firming, micro-circulation boost', 'Red Ginseng Extract'),
(4, 'Fancy Aura', 'Centella Asiatica Sheet Mask', 'fancy-aura-centella-mask', 'Centella Asiatica', '25g', 220.00, 35, 'Acne-Prone / Sensitive', 'Blemish calming, redness reduction, rapid barrier soothing', 'Cica / Centella Asiatica Extract'),
(4, 'Fancy Aura', 'Hyaluronic Acid Sheet Mask', 'fancy-aura-hyaluronic-acid-mask', 'Hyaluronic Acid', '25g', 220.00, 40, 'All Skin Types', 'Multi-layer hydration, plumping, eliminates tightness', 'Hyaluronic Acid'),
(4, 'Fancy Aura', 'Retinol Sheet Mask', 'fancy-aura-retinol-mask', 'Retinol', '25g', 250.00, 30, 'Aging / Fine Lines', 'Collagen support, texture refinement, anti-wrinkle', 'Retinol Complex'),
(4, 'Fancy Aura', 'Turmeric Sheet Mask', 'fancy-aura-turmeric-mask', 'Turmeric', '25g', 220.00, 30, 'Uneven Tone / Blemished', 'Anti-inflammatory, clears dullness, promotes even tone', 'Turmeric Root Extract'),
(4, 'Fancy Aura', 'Nicotinamide Sheet Mask', 'fancy-aura-nicotinamide-mask', 'Nicotinamide', '25g', 220.00, 40, 'Pigmentation / Uneven', 'Pore reduction, dark spot fading, tone brightening', 'Nicotinamide (Niacinamide)'),
(4, 'Fancy Aura', 'Snail Serum Sheet Mask', 'fancy-aura-snail-serum-mask', 'Snail Serum', '25g', 250.00, 30, 'Damaged / Scarred', 'Skin regeneration, elasticity replenishment, deep repair', 'Snail Secretion Filtrate'),
(4, 'Fancy Aura', 'Vitamin C Sheet Mask', 'fancy-aura-vitamin-c-mask', 'Vitamin C', '25g', 220.00, 35, 'Dull / Sun-damaged', 'Powerful antioxidant defense, instant glow, skin brightening', 'Vitamin C Complex'),
(4, 'Fancy Aura', 'Cherry Blossom Sheet Mask', 'fancy-aura-cherry-blossom-mask', 'Cherry Blossom', '25g', 200.00, 30, 'Sensitive / Normal', 'Delicate soothing, brightening, floral hydration', 'Cherry Blossom Extract'),
(4, 'Fancy Aura', 'Himalayan Salt Sheet Mask', 'fancy-aura-himalayan-salt-mask', 'Himalayan Salt', '25g', 200.00, 25, 'Oily / Congested', 'Pore detox, mineral balancing, clarifying', 'Himalayan Mineral Salts'),
(4, 'Fancy Aura', 'Bamboo Charcoal Sheet Mask', 'fancy-aura-bamboo-charcoal-mask', 'Bamboo Charcoal', '25g', 220.00, 35, 'Oily / Blackhead-Prone', 'Impurity absorption, deep pore cleansing, oil balance', 'Bamboo Charcoal Powder'),
(4, 'Fancy Aura', 'Gold Collagen Sheet Mask', 'fancy-aura-gold-collagen-mask', 'Gold Collagen', '25g', 250.00, 30, 'Mature / Sagging', 'Luxurious firming, elasticity boosting, radiant finish', 'Hydrolyzed Collagen, Colloidal Gold'),
(4, 'Fancy Aura', 'Pure Collagen Sheet Mask', 'fancy-aura-collagen-sheet-mask', 'Collagen', '25g', 220.00, 40, 'Dehydrated / Aging', 'Structural hydration, tightens skin texture', 'Collagen Essence'),
(4, 'Fancy Aura', 'Retinol Ampoule Serum Mask', 'fancy-aura-retinol-ampoule-mask', 'Retinol Serum', '28ml', 280.00, 25, 'Fine Lines / Loss of Elasticity', 'Intensive active anti-aging treatment', 'Concentrated Retinol Ampoule'),
(4, 'Fancy Aura', 'Hyaluronic Acid Ampoule Serum Mask', 'fancy-aura-ha-ampoule-mask', 'Hyaluronic Acid Serum', '28ml', 280.00, 30, 'Extremely Dehydrated', 'Deep multi-molecular moisture saturation', 'Concentrated Hyaluronic Acid Serum'),
(4, 'Fancy Aura', 'Collagen Ampoule Serum Mask', 'fancy-aura-collagen-ampoule-mask', 'Collagen Serum', '28ml', 280.00, 30, 'Loss of Elasticity', 'Intensive structural plumping and firming ampoule', 'Collagen Serum Concentrate'),
(4, 'Fancy Aura', 'Vitamin C Ampoule Serum Mask', 'fancy-aura-vitamin-c-ampoule-mask', 'Vitamin C Serum', '28ml', 280.00, 30, 'Pigmented / Dull', 'Intensive tone-correcting serum treatment', 'Active Vitamin C Serum');

-- Category 5: Hand Creams
INSERT INTO products (category_id, brand, name, slug, flavor_or_type, volume_or_weight, price, stock_quantity, target_skin_type, benefits, key_ingredients) VALUES
(5, 'Körmesic', 'Strawberry Hand Cream', 'kormesic-strawberry-hand-cream', 'Strawberry', '30g', 220.00, 30, 'Dry Hands', 'Smooth anti-oxidant protection, softening and hydrating', 'Strawberry Extract'),
(5, 'Körmesic', 'Turmeric Hand Cream', 'kormesic-turmeric-hand-cream', 'Turmeric', '30g', 220.00, 30, 'Dull / Rough Hands', 'Energizing, brightening, skin tone evening', 'Turmeric Extract'),
(5, 'Körmesic', 'Grapefruit Hand Cream', 'kormesic-grapefruit-hand-cream', 'Grapefruit', '30g', 220.00, 30, 'Dry / Fatigued Hands', 'Calming, glossy nourishment, natural Vitamin C boost', 'Grapefruit Extract, Natural Vitamin C'),
(5, 'Körmesic', 'Avocado Hand Cream', 'kormesic-avocado-hand-cream', 'Avocado', '30g', 240.00, 35, 'Very Dry / Cracked', 'Deep repair and nourishment, protective moisture layer', 'Avocado Oil'),
(5, 'Körmesic', 'Peach Hand Cream', 'kormesic-peach-hand-cream', 'Peach', '30g', 220.00, 35, 'Wrinkled / Dry Hands', 'Softens weakening wrinkles, rich nourishing care', 'Peach Extract'),
(5, 'Körmesic', 'Green Apple Hand Cream', 'kormesic-green-apple-hand-cream', 'Green Apple', '30g', 220.00, 30, 'Uneven / Rough Hands', 'Whitening, smoothing, and invigorating fresh fruit hydration', 'Green Apple Extract'),
(5, 'Körmesic', 'Rose Hand Cream', 'kormesic-rose-hand-cream', 'Rose', '30g', 240.00, 40, 'Dry / Uneven Hands', 'Tender and smooth hand texture, improves skin tone', 'Rose Essential Oil'),
(5, 'Körmesic', 'Chamomile Hand Cream', 'kormesic-chamomile-hand-cream', 'Chamomile', '30g', 220.00, 30, 'Sensitive / Irritated', 'Protecting, refreshing, and calming redness', 'Chamomile Extract'),
(5, 'Körmesic', 'Vitamin C Brightening Hand Cream', 'kormesic-vitamin-c-hand-cream', 'Vitamin C', '30g', 240.00, 35, 'Dull / Sun-exposed Hands', 'Whitening and brightening hand cream, antioxidant defense', 'Active Vitamin C'),
(5, 'Körmesic', 'Grape Hand Cream', 'kormesic-grape-hand-cream', 'Grape', '30g', 220.00, 30, 'Normal / Dry', 'Soothing, gentle whitening, and hydration', 'Grape Seed Extract'),
(5, 'Körmesic', 'Papaya Hand Cream', 'kormesic-papaya-hand-cream', 'Papaya', '30g', 220.00, 30, 'Rough / Thickened Skin', 'Nourishing, fresh smoothing, and softening dry cuticles', 'Papaya Fruit Extract'),
(5, 'Körmesic', 'Cherry Blossom Hand Cream', 'kormesic-cherry-blossom-hand-cream', 'Cherry Blossom', '30g', 220.00, 35, 'Dry Hands', 'Moisturizing, delicate floral scent, hydrating care', 'Cherry Blossom Extract'),
(5, 'Körmesic', 'Green Tea Hand Cream', 'kormesic-green-tea-hand-cream', 'Green Tea', '30g', 220.00, 35, 'Stressed / Oily-Dry Hands', 'Anti-oxidant soothing, refreshing, reduces oxidation', 'Tea Polyphenols'),
(5, 'Körmesic', 'Lemon Hand Cream', 'kormesic-lemon-hand-cream', 'Lemon', '30g', 220.00, 35, 'Dull / Active Hands', 'Anti-bacterial, clarifying, whitening, and fresh scent', 'Lemon Essential Oil');