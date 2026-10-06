const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  brand: string;
  name: string;
  slug: string;
  flavor_or_type: string;
  volume_or_weight: string;
  price: string | number;
  stock_quantity: number;
  target_skin_type: string;
  benefits: string;
  key_ingredients: string;
  image_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BASE_URL}/categories`, { cache: 'no-store' });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function fetchProducts(category?: string, skinType?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (skinType && skinType !== 'all') params.append('skin_type', skinType);

    const res = await fetch(`${BASE_URL}/products?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function getRoutineRecommendation(skin_type: string, primary_concern: string) {
  try {
    const res = await fetch(`${BASE_URL}/routine/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skin_type, primary_concern })
    });
    return await res.json();
  } catch (err) {
    console.error('Error getting recommendations:', err);
    return { success: false, message: 'Could not connect to server' };
  }
}