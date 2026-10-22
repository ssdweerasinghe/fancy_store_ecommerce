import { http } from './httpClient';

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
    const res = await http('/categories', { cache: 'no-store' });
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

    const res = await http(`/products${qs}`, { cache: 'no-store' });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function fetchProductById(id: string | number): Promise<Product | null> {
  try {
    const res = await http(`/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
    const all = await fetchProducts();
    return all.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null;
  } catch {
    return null;
  }
}

export async function createProduct(token: string | null, data: Partial<Product>) {
  try {
    const res = await http('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Server communication error' };
  }
}

export async function updateProduct(token: string | null, id: number, data: Partial<Product>) {
  try {
    const res = await http(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Server communication error' };
  }
}

export async function deleteProduct(token: string | null, id: number) {
  try {
    const res = await http(`/products/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch {
    return { success: false, message: 'Server communication error' };
  }
}

export async function uploadProductImage(token: string | null, file: File) {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const res = await http('/products/upload-image', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (json.success && json.data?.url) {
      return { success: true, url: json.data.url };
    }
    return { success: false, message: json.message || 'Upload failed' };
  } catch {
    return { success: false, message: 'Failed to upload photo' };
  }
}

export async function updateOrderStatus(token: string | null, orderId: number, status: string) {
  try {
    const res = await http(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Failed to update status' };
  }
}

export async function deleteOrder(token: string | null, orderId: number) {
  try {
    const res = await http(`/orders/${orderId}`, { method: 'DELETE' });
    return await res.json();
  } catch {
    return { success: false, message: 'Failed to cancel order' };
  }
}

export async function deleteOrderPermanently(token: string | null, orderId: number) {
  try {
    const res = await http(`/orders/${orderId}/permanent`, { method: 'DELETE' });
    return await res.json();
  } catch {
    return { success: false, message: 'Failed to delete order from database' };
  }
}

export async function trackOrder(query: string) {
  try {
    const res = await http(`/orders/track/${encodeURIComponent(query)}`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { success: false, message: 'Could not connect to tracking server' };
  }
}

export async function fetchUserOrders(token?: string | null) {
  try {
    const res = await http('/orders/user/my-orders', { cache: 'no-store' });
    return await res.json();
  } catch {
    return { success: false, message: 'Could not retrieve orders' };
  }
}

export async function placeOrder(orderData: {
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  items: { product_id: number; quantity: number; price: number }[];
}) {
  try {
    const res = await http('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Could not connect to checkout service' };
  }
}

export async function getRoutineRecommendation(skin_type: string, primary_concern: string) {
  try {
    const res = await http('/routine/recommend', {
      method: 'POST',
      body: JSON.stringify({ skin_type, primary_concern }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error getting recommendations:', err);
    return { success: false, message: 'Could not connect to recommendation engine' };
  }
}

export async function googleLoginApi(credentialToken: string) {
  try {
    const res = await http('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: credentialToken }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Google authentication failed' };
  }
}

export async function checkSessionApi() {
  try {
    const res = await http('/auth/me');
    return await res.json();
  } catch {
    return { success: false, data: null };
  }
}

export async function logoutApi() {
  try {
    const res = await http('/auth/logout', { method: 'POST' });
    return await res.json();
  } catch {
    return { success: true };
  }
}