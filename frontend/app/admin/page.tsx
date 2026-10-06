'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  LogOut, 
  ShieldCheck, 
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  UploadCloud,
  FileImage
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchCategories, 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  Product, 
  Category 
} from '@/services/api';
import { getProductImage } from '@/app/catalog/page';

export default function AdminDashboardPage() {
  const { user, token, isAdmin, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Fancy Store',
    category_id: 1,
    price: '',
    stock_quantity: 50,
    volume_or_weight: '30ml / Regular',
    target_skin_type: 'All Skin Types',
    image_url: '',
    benefits: '',
    key_ingredients: ''
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const loadData = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const [statsRes, catData, prodData] = await Promise.all([
        fetch(`${BASE_URL}/auth/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then((r) => r.json()),
        fetchCategories(),
        fetchProducts()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      setCategories(catData);
      setProducts(prodData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !isAdmin) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [token, isAdmin, router]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.key_ingredients && p.key_ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: 'Fancy Store',
      category_id: categories[0]?.id || 1,
      price: '',
      stock_quantity: 50,
      volume_or_weight: '30ml / Regular',
      target_skin_type: 'All Skin Types',
      image_url: '',
      benefits: '',
      key_ingredients: ''
    });
    setFormSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      brand: prod.brand,
      category_id: prod.category_id,
      price: String(prod.price),
      stock_quantity: prod.stock_quantity,
      volume_or_weight: prod.volume_or_weight,
      target_skin_type: prod.target_skin_type,
      image_url: prod.image_url || '',
      benefits: prod.benefits || '',
      key_ingredients: prod.key_ingredients || ''
    });
    setFormSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleLocalImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingImage(true);
    const result = await uploadProductImage(token, file);
    setUploadingImage(false);

    if (result.success && result.url) {
      setFormData((prev) => ({ ...prev, image_url: result.url! }));
    } else {
      alert(result.message || 'Failed to upload photo from your machine.');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    if (!token) return;

    const res = await deleteProduct(token, id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      loadData();
    } else {
      alert(res.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormSubmitting(true);

    const payload = {
      ...formData,
      category_id: Number(formData.category_id),
      price: Number(formData.price),
      stock_quantity: Number(formData.stock_quantity)
    };

    let res;
    if (editingProduct) {
      res = await updateProduct(token, editingProduct.id, payload);
    } else {
      res = await createProduct(token, payload);
    }

    setFormSubmitting(false);

    if (res.success) {
      setFormSuccessMessage(editingProduct ? 'Product updated successfully!' : 'New product created!');
      setTimeout(() => {
        setIsModalOpen(false);
        loadData();
      }, 700);
    } else {
      alert(res.message || 'Operation failed');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased">
      {/* Header */}
      <header className="bg-[#142A20] text-white border-b border-[#274B3B] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B382B] border border-[#C5A059]/40 flex items-center justify-center text-[#EFE3C3] shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <span className="font-serif font-extrabold text-lg block leading-none">
                Fancy Store <span className="text-[#C5A059]">Control Center</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-mono">
                Staff: {user?.name} (Administrator)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> View Storefront
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-900/60 hover:bg-rose-900 text-xs font-semibold text-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">Total Orders</span>
            <span className="text-3xl font-serif font-extrabold text-[#161D1A] mt-1 block">
              {stats?.total_orders || 0}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EFE6] text-[#C5A059] flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">Total Billed</span>
            <span className="text-2xl font-serif font-extrabold text-[#1B382B] mt-1 block">
              LKR {Number(stats?.total_revenue || 0).toFixed(2)}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-3">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">Live Inventory SKUs</span>
            <span className="text-3xl font-serif font-extrabold text-[#161D1A] mt-1 block">
              {products.length}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">Low Stock (&lt;15)</span>
            <span className="text-3xl font-serif font-extrabold text-rose-700 mt-1 block">
              {stats?.low_stock_count || 0}
            </span>
          </div>
        </div>

        {/* Tab Controls & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8EFE9] mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#1B382B] text-white shadow-md'
                  : 'bg-white text-stone-600 border border-[#E8EFE9] hover:bg-stone-50'
              }`}
            >
              Inventory Management ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#1B382B] text-white shadow-md'
                  : 'bg-white text-stone-600 border border-[#E8EFE9] hover:bg-stone-50'
              }`}
            >
              Recent Customer Orders
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                title="Refresh Inventory"
                className="p-3 bg-white border border-[#E8EFE9] hover:bg-stone-100 rounded-2xl text-stone-600 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div>
            <div className="bg-white p-4 rounded-3xl border border-[#E8EFE9] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, brand, or active..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 text-xs rounded-xl border border-[#E8EFE9] focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-stone-400 font-semibold whitespace-nowrap">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-stone-50 text-xs rounded-xl border border-[#E8EFE9] font-medium text-stone-700 focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8EFE9] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF9F5] border-b border-[#E8EFE9] text-stone-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Price (LKR)</th>
                      <th className="py-4 px-4">Stock</th>
                      <th className="py-4 px-4">Target Skin</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F6F4]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          No products found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const img = getProductImage(p);
                        const isLowStock = p.stock_quantity < 15;
                        return (
                          <tr key={p.id} className="hover:bg-[#FBF9F5]/60 transition">
                            <td className="py-3 px-6 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-[#E8EFE9] shrink-0">
                                <img src={img} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-[#C5A059] uppercase block tracking-wider">
                                  {p.brand}
                                </span>
                                <h4 className="font-bold text-stone-800 truncate max-w-xs">{p.name}</h4>
                                <span className="text-[11px] text-stone-400">{p.volume_or_weight}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-stone-600 font-medium">
                              {p.category_name || 'Standard Care'}
                            </td>

                            <td className="py-3 px-4 font-serif font-extrabold text-[#1B382B] text-sm">
                              {Number(p.price).toFixed(2)}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  isLowStock
                                    ? 'bg-rose-100 text-rose-800 animate-pulse'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {p.stock_quantity} units
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="bg-[#E8EFE9] text-[#1B382B] font-semibold text-[10px] px-2 py-0.5 rounded-md">
                                {p.target_skin_type}
                              </span>
                            </td>

                            <td className="py-3 px-6 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-[#1B382B] hover:text-white text-stone-600 transition cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Order Stream */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-[#E8EFE9] p-6 shadow-xs">
            <h2 className="text-xl font-serif font-bold text-[#161D1A] mb-4">Customer Order Stream</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8EFE9] text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-4">Reference</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Payment Method</th>
                    <th className="pb-3 px-4">Amount</th>
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F6F4]">
                  {stats?.recent_orders?.map((ord: any) => (
                    <tr key={ord.id} className="py-3 hover:bg-[#FBF9F5]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1B382B]">#{ord.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold block text-stone-800">{ord.customer_name}</span>
                        <span className="text-stone-400 text-[11px]">{ord.customer_email}</span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-stone-600 font-medium">
                        {ord.payment_method?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-stone-900">
                        LKR {Number(ord.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Add / Edit Product Modal with Local File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FBF9F5] border border-[#E8EFE9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-[#161D1A] p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center border border-[#C4D7C8]">
                <Sparkles className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-extrabold text-[#161D1A]">
                  {editingProduct ? 'Edit Botanical Product' : 'Add New Skincare Product'}
                </h3>
                <p className="text-xs text-stone-500">
                  Update inventory, pricing, local photo upload, and dermatological attributes
                </p>
              </div>
            </div>

            {formSuccessMessage && (
              <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {formSuccessMessage}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Marine Peptide Hydrogel Eye Treatment"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Fancy Aura / Körmesic"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EFE9] bg-white font-medium text-stone-700 focus:outline-[#1B382B]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2450.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              {/* Photo Upload from Local Machine or URL */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Product Photo Asset (Upload Local File or Paste URL)
                </label>

                {/* Hidden Local File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLocalImageSelect}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Upload file below or paste image URL..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                    />
                  </div>

                  {/* Local Machine Upload Trigger Button */}
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#E8EFE9] hover:bg-[#dce7de] text-[#1B382B] font-bold inline-flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer shrink-0 border border-[#C4D7C8]"
                  >
                    <UploadCloud className="w-4 h-4 text-[#C5A059]" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload from PC'}</span>
                  </button>

                  {/* Thumbnail Live Preview */}
                  <div className="w-11 h-11 rounded-xl bg-stone-100 border border-[#E8EFE9] overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <FileImage className="w-4 h-4 text-stone-300" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Click <strong>Upload from PC</strong> to choose an image from your computer, or paste a URL directly.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Volume / Packaging
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 60 Patches (30 Pairs)"
                    value={formData.volume_or_weight}
                    onChange={(e) => setFormData({ ...formData, volume_or_weight: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Target Skin Profile
                  </label>
                  <select
                    value={formData.target_skin_type}
                    onChange={(e) => setFormData({ ...formData, target_skin_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EFE9] bg-white font-medium text-stone-700 focus:outline-[#1B382B]"
                  >
                    <option value="All Skin Types">All Skin Types</option>
                    <option value="Sensitive">Sensitive</option>
                    <option value="Dry">Dry</option>
                    <option value="Oily">Oily</option>
                    <option value="Aging">Aging / Mature</option>
                    <option value="Dehydrated">Dehydrated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Primary Benefits & Dermatological Claims
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Alleviates tired orbital shadows, boosts elasticity, and restores moisture equilibrium."
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Active Ingredients Breakdown
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Hydrolyzed Collagen, Centella Asiatica, Bio-Peptide Matrix"
                  value={formData.key_ingredients}
                  onChange={(e) => setFormData({ ...formData, key_ingredients: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-white border border-[#E8EFE9] hover:bg-stone-50 text-stone-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="px-6 py-3 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update Product'
                    : 'Save & Publish Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}