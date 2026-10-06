'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Eye, 
  Smile, 
  Moon, 
  Layers, 
  HeartHandshake, 
  Sparkles,
  ShoppingBag,
  Minus,
  Trash2,
  X
} from 'lucide-react';
import { fetchCategories, fetchProducts, Product, Category } from '@/services/api';

interface CartItem extends Product {
  quantity: number;
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Cart Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory, selectedSkinType).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [selectedCategory, selectedSkinType]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.key_ingredients && p.key_ingredients.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => 
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0), [cart]);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'eye-care': return <Eye className="w-3.5 h-3.5 mr-1 text-[#C5A059]" />;
      case 'lip-care': return <Smile className="w-3.5 h-3.5 mr-1 text-[#C5A059]" />;
      case 'sleeping-masks': return <Moon className="w-3.5 h-3.5 mr-1 text-[#1B382B]" />;
      case 'sheet-masks': return <Layers className="w-3.5 h-3.5 mr-1 text-[#C5A059]" />;
      case 'hand-creams': return <HeartHandshake className="w-3.5 h-3.5 mr-1 text-[#1B382B]" />;
      default: return <Sparkles className="w-3.5 h-3.5 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans">
      <Navbar cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8EFE9]">
          <div>
            <h1 className="text-3xl font-serif font-extrabold text-[#161D1A]">Skincare Catalog</h1>
            <p className="text-xs text-stone-500 mt-1">Browse all {filtered.length} products with complete active breakdowns.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search botanical active or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-xs rounded-full border border-[#E8EFE9] focus:outline-hidden focus:border-[#1B382B]"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1B382B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-[#E8EFE9] hover:border-[#1B382B]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-[#1B382B] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-[#E8EFE9] hover:border-[#C4D7C8]'
              }`}
            >
              {getCategoryIcon(cat.slug)}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Skin Type Sub-filters */}
        <div className="flex items-center gap-2 py-2 mb-8 text-xs flex-wrap">
          <span className="text-stone-400 font-semibold inline-flex items-center mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" /> Skin Target:
          </span>
          {['all', 'sensitive', 'dry', 'oily', 'aging', 'dehydrated'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedSkinType(type)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                selectedSkinType === type
                  ? 'bg-[#1B382B] text-white'
                  : 'bg-[#E8EFE9] hover:bg-[#dce7de] text-[#1B382B]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="py-24 text-center text-xs text-stone-500">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#E8EFE9]">
            <p className="text-xs text-stone-500">No items match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-[#E8EFE9] p-5 shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                    <span className="text-[#1B382B] font-semibold tracking-wider uppercase bg-[#E8EFE9] px-2.5 py-0.5 rounded-md">
                      {product.brand}
                    </span>
                    <span className="text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-100">
                      {product.volume_or_weight}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-[#161D1A] text-base leading-snug mt-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                    {product.benefits}
                  </p>

                  {product.key_ingredients && (
                    <div className="mt-3 pt-3 border-t border-[#F3F6F4]">
                      <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-0.5">
                        Active Profile
                      </span>
                      <p className="text-[11px] font-medium text-stone-700 line-clamp-1">
                        {product.key_ingredients}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3F6F4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">Price</span>
                    <span className="text-base font-extrabold text-[#161D1A] font-serif">
                      LKR {Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  <button 
                    onClick={() => addToCart(product)}
                    className="inline-flex items-center px-3.5 py-2 rounded-xl bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-[#142A20]/60 backdrop-blur-xs transition-opacity" 
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              <div className="p-6 border-b border-[#E8EFE9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#1B382B]" />
                  <h3 className="font-serif font-bold text-lg text-[#161D1A]">
                    Shopping Basket ({totalCartCount})
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 divide-y divide-[#F3F6F4]">
                {cart.length === 0 ? (
                  <div className="py-20 text-center text-stone-500">
                    <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm font-medium">Your basket is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-center justify-between">
                      <div className="flex-1">
                        <span className="text-[10px] font-semibold text-[#1B382B] uppercase tracking-wider block">
                          {item.brand}
                        </span>
                        <h4 className="font-bold text-[#161D1A] text-xs line-clamp-1">{item.name}</h4>
                        <span className="text-xs text-stone-500 font-medium">
                          LKR {Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-[#F3F6F4] px-2 py-1 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-stone-600 hover:text-stone-950 p-1 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#161D1A] w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-stone-600 hover:text-stone-950 p-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-[#FBF9F5] border-t border-[#E8EFE9]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium text-stone-500">Estimated Subtotal</span>
                    <span className="text-xl font-bold font-serif text-[#161D1A]">
                      LKR {cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => alert(`Order dispatch initialized for LKR ${cartSubtotal.toFixed(2)}`)}
                    className="w-full py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg cursor-pointer"
                  >
                    Proceed to Delivery & Checkout
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}