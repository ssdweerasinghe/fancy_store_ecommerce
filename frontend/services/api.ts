const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
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
    let res = await fetch(`${BASE_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`${BASE_URL}/products/categories`, { cache: 'no-store' });
    }
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
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

    const qs = params.toString() ? `?${params.toString()}` : '';

    let res = await fetch(`${BASE_URL}/products${qs}`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`${BASE_URL}${qs}`, { cache: 'no-store' });
    }

    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function fetchProductById(id: string | number): Promise<Product | null> {
  try {
    // 1. Direct fetch try #1
    let res = await fetch(`${BASE_URL}/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }

    // 2. Direct fetch try #2
    res = await fetch(`${BASE_URL}/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }

    // 3. Resilient fallback: lookup in full products list
    const allProducts = await fetchProducts();
    const matched = allProducts.find(
      (p) => String(p.id) === String(id) || p.slug === String(id)
    );
    return matched || null;
  } catch (err) {
    console.error(`Error fetching product ${id}:`, err);
    try {
      const allProducts = await fetchProducts();
      return allProducts.find((p) => String(p.id) === String(id)) || null;
    } catch {
      return null;
    }
  }
}

export async function createProduct(token: string, data: Partial<Product>) {
  try {
    let res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      res = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
    }

    return await res.json();
  } catch (err) {
    console.error('Error creating product:', err);
    return { success: false, message: 'Server communication error' };
  }
}

export async function updateProduct(token: string, id: number, data: Partial<Product>) {
  try {
    let res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      res = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
    }

    return await res.json();
  } catch (err) {
    console.error('Error updating product:', err);
    return { success: false, message: 'Server communication error' };
  }
}

export async function deleteProduct(token: string, id: number) {
  try {
    let res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      res = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    return await res.json();
  } catch (err) {
    console.error('Error deleting product:', err);
    return { success: false, message: 'Server communication error' };
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

export async function placeOrder(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  items: { product_id: number; quantity: number; price: number }[];
}) {
  try {
    const res = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return await res.json();
  } catch (err) {
    console.error('Error placing order:', err);
    return { success: false, message: 'Could not connect to checkout service' };
  }
}

export async function uploadProductImage(token: string, file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${BASE_URL}/products/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const json = await res.json();
    if (json.success && json.data?.url) {
      return { success: true, url: json.data.url };
    }
    return { success: false, message: json.message || 'Upload failed' };
  } catch (err) {
    console.error('Error uploading product image:', err);
    return { success: false, message: 'Failed to upload photo from local disk' };
  }
}