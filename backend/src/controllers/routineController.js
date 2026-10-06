import pool from '../config/db.js';

export const getRoutineRecommendation = async (req, res) => {
  try {
    const { skin_type, primary_concern } = req.body;

    if (!skin_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'skin_type is required (dry, oily, combination, sensitive, normal)' 
      });
    }

    // Normalized lookup variables
    const typeTerm = skin_type.toLowerCase();
    const concernTerm = (primary_concern || '').toLowerCase();

    // Query all catalog items
    const [allProducts] = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug 
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `);

    // Helper to score match relevance
    const rankProduct = (product) => {
      let score = 0;
      const target = (product.target_skin_type || '').toLowerCase();
      const benefits = (product.benefits || '').toLowerCase();
      const ingredients = (product.key_ingredients || '').toLowerCase();

      if (target.includes(typeTerm) || target.includes('all skin types')) score += 3;
      if (concernTerm) {
        if (benefits.includes(concernTerm)) score += 4;
        if (ingredients.includes(concernTerm)) score += 2;
      }
      return score;
    };

    // Filter by categories
    const eyePatches = allProducts.filter(p => p.category_slug === 'eye-care');
    const lipCare = allProducts.filter(p => p.category_slug === 'lip-care');
    const sleepingMasks = allProducts.filter(p => p.category_slug === 'sleeping-masks');
    const sheetMasks = allProducts.filter(p => p.category_slug === 'sheet-masks');
    const handCreams = allProducts.filter(p => p.category_slug === 'hand-creams');

    // Pick top scored products
    const bestEyeCare = [...eyePatches].sort((a, b) => rankProduct(b) - rankProduct(a))[0];
    const bestLipCare = [...lipCare].sort((a, b) => rankProduct(b) - rankProduct(a))[0];
    const bestSleepingMask = [...sleepingMasks].sort((a, b) => rankProduct(b) - rankProduct(a))[0];
    const bestSheetMask = [...sheetMasks].sort((a, b) => rankProduct(b) - rankProduct(a))[0];
    const bestHandCream = [...handCreams].sort((a, b) => rankProduct(b) - rankProduct(a))[0];

    // Build curated AM and PM routine advice
    const routine = {
      user_profile: {
        skin_type,
        primary_concern: primary_concern || 'General Hydration & Barrier Maintenance'
      },
      am_routine: {
        step_1_treatment: bestSheetMask ? {
          step: 'Targeted Hydration / Glow',
          product: bestSheetMask.name,
          category: 'Sheet Mask',
          instruction: 'Apply for 15-20 minutes, gently tap remaining serum into skin.'
        } : null,
        step_2_eyes: bestEyeCare ? {
          step: 'Awaken & Depuff Under-Eye',
          product: bestEyeCare.name,
          category: 'Eye Care',
          instruction: 'Place hydrogel patches under eyes for 10-15 minutes.'
        } : null,
        step_3_protection: bestHandCream ? {
          step: 'Day Nourishment',
          product: bestHandCream.name,
          category: 'Hand Cream',
          instruction: 'Massage over hands and cuticles throughout the day.'
        } : null
      },
      pm_routine: {
        step_1_lip: bestLipCare ? {
          step: 'Lip Nourish & Plump',
          product: bestLipCare.name,
          category: 'Lip Mask',
          instruction: 'Apply lip mask before bed to wake up with smoothed lips.'
        } : null,
        step_2_repair: bestSleepingMask ? {
          step: 'Overnight Cellular Repair',
          product: bestSleepingMask.name,
          category: 'Sleeping Mask',
          instruction: 'Smooth 1 sachet over face as final nighttime step; rinse in morning.'
        } : null
      },
      recommended_bundle: [
        bestSheetMask,
        bestEyeCare,
        bestSleepingMask,
        bestLipCare,
        bestHandCream
      ].filter(Boolean)
    };

    res.status(200).json({
      success: true,
      message: `Curated routine generated for ${skin_type} skin`,
      data: routine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};