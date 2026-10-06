'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Sparkles 
} from 'lucide-react';
import { fetchCategories, fetchProducts, Product, Category } from '@/services/api';
import { useCart } from '@/context/CartContext';

export const getProductImage = (product: Product): string => {
  if (product.image_url) return product.image_url;
  const name = product.name.toLowerCase();
  const slug = (product.category_slug || '').toLowerCase();

  if (slug === 'eye-care' || name.includes('eye')) {
    return '/assets/hero/hero-2.jpg';
  }
  if (slug === 'lip-care' || name.includes('lip')) {
    return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80';
  }
  if (slug === 'sleeping-masks' || name.includes('sleeping') || name.includes('night')) {
    return '/assets/hero/hero-4.jpg';
  }
  if (slug === 'sheet-masks' || name.includes('mask')) {
    return '/assets/hero/hero-3.jpg';
  }
  if (slug === 'hand-creams' || name.includes('hand') || name.includes('cream')) {
    return '/assets/hero/hero-5.jpg';
  }
  return '/assets/hero/hero-1.jpg';
};

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkinType, setSelectedSkinType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const { addToCart } = useCart();

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
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased selection:bg-[#E8EFE9] selection:text-[#1B382B]">
      <Navbar />

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

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-stone-500">Loading catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-[#E8EFE9]">
            <p className="text-xs text-stone-500">No items match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const photoUrl = getProductImage(product);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-[#E8EFE9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/product/${product.id}`} className="block flex-1 cursor-pointer">
                    {/* Visual Product Image Container */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F3F6F4]">
                      <img
                        src={photoUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#1B382B] px-2.5 py-1 rounded-full shadow-xs border border-white/60">
                          {product.brand}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-medium bg-[#142A20]/80 backdrop-blur-xs text-[#EFE3C3] px-2.5 py-1 rounded-full shadow-xs">
                          {product.volume_or_weight}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-5">
                      <h3 className="font-serif font-bold text-[#161D1A] text-base leading-snug group-hover:text-[#1B382B] transition-colors line-clamp-2">
                        {product.name}
                      </h3>

                      <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
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

                      <div className="mt-3">
                        <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#1B382B]">
                          {product.target_skin_type}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Pricing & Add Button Footer */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-[#F3F6F4] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stone-400 block">Price</span>
                        <span className="text-base font-extrabold text-[#161D1A] font-serif">
                          LKR {Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-semibold transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}