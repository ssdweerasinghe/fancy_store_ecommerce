'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Droplets, 
  AlertCircle
} from 'lucide-react';
import { fetchProductById, fetchProducts, Product } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/app/catalog/page';
import CheckoutModal from '@/components/CheckoutModal';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  // Safely extract the raw param ID across Next.js versions
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'regimen'>('benefits');
  const [isInstantCheckoutOpen, setIsInstantCheckoutOpen] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    setLoading(true);

    const loadProductData = async () => {
      try {
        const data = await fetchProductById(productId);

        if (!isMounted) return;

        if (data) {
          setProduct(data);
          const allProducts = await fetchProducts(data.category_slug || undefined, data.target_skin_type);
          if (isMounted) {
            setSimilarProducts(
              allProducts.filter((p) => String(p.id) !== String(data.id)).slice(0, 4)
            );
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between text-[#161D1A]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="w-10 h-10 border-3 border-[#1B382B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest font-semibold text-stone-500">
            Retrieving Botanical Formulation...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between text-[#161D1A]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-12 h-12 text-[#C5A059] mx-auto mb-3" />
          <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Item #{productId} could not be retrieved from the catalog.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#1B382B] text-white text-xs font-semibold uppercase tracking-wider"
          >
            Return to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productImage = getProductImage(product);
  const totalPrice = Number(product.price) * quantity;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased selection:bg-[#E8EFE9] selection:text-[#1B382B]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-1 hover:text-[#1B382B] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#1B382B]">Catalog</Link>
          <span>/</span>
          <span className="text-[#161D1A] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Visual Showcase Card */}
          <div className="sticky top-28">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#E8EFE9] shadow-xl">
              <img 
                src={productImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#1B382B] px-3 py-1.5 rounded-full shadow-xs border border-white/60">
                  {product.brand}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-xs font-medium bg-[#142A20]/85 backdrop-blur-md text-[#EFE3C3] px-3 py-1.5 rounded-full shadow-xs">
                  {product.volume_or_weight}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="p-3 bg-white rounded-2xl border border-[#E8EFE9]">
                <Leaf className="w-4 h-4 text-[#1B382B] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">Derm Tested</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#E8EFE9]">
                <Droplets className="w-4 h-4 text-[#C5A059] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">{product.target_skin_type}</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#E8EFE9]">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-stone-700 block">Pure Bio-Active</span>
              </div>
            </div>
          </div>

          {/* Pricing & Control Panel */}
          <div>
            <div className="border-b border-[#E8EFE9] pb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] block mb-2">
                {product.category_name || 'Botanical Formula'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#161D1A] leading-tight">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-baseline gap-4">
                <span className="text-3xl font-serif font-extrabold text-[#1B382B]">
                  LKR {Number(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-stone-400 font-medium">Islandwide taxes included</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#E8EFE9] text-[#1B382B] rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Target Skin: <span className="capitalize">{product.target_skin_type}</span>
              </div>
            </div>

            {/* Interactive Tab Navigation */}
            <div className="mt-6">
              <div className="flex border-b border-[#E8EFE9] gap-6 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-3 transition-colors cursor-pointer ${
                    activeTab === 'benefits'
                      ? 'border-b-2 border-[#1B382B] text-[#1B382B]'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Benefits & Profile
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-3 transition-colors cursor-pointer ${
                    activeTab === 'ingredients'
                      ? 'border-b-2 border-[#1B382B] text-[#1B382B]'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Key Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('regimen')}
                  className={`pb-3 transition-colors cursor-pointer ${
                    activeTab === 'regimen'
                      ? 'border-b-2 border-[#1B382B] text-[#1B382B]'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Application Regimen
                </button>
              </div>

              <div className="py-5 text-xs text-stone-600 leading-relaxed">
                {activeTab === 'benefits' && (
                  <div>
                    <p>{product.benefits}</p>
                    <p className="mt-2 text-stone-500">
                      Formulated to restore lipid hydration, soothe environmental oxidative damage, and maintain pH equilibrium.
                    </p>
                  </div>
                )}
                {activeTab === 'ingredients' && (
                  <div>
                    <span className="font-bold text-stone-800 block mb-1 text-xs">Active Composition:</span>
                    <p className="bg-white p-3 rounded-xl border border-[#E8EFE9] text-stone-700 font-mono text-[11px]">
                      {product.key_ingredients || 'Plant-Derived Bio-Actives, Hyaluronic Matrix, Botanical Extracts'}
                    </p>
                  </div>
                )}
                {activeTab === 'regimen' && (
                  <div className="space-y-2">
                    <p>• <strong>Morning:</strong> Cleanse skin, apply before daily SPF moisturizer.</p>
                    <p>• <strong>Evening:</strong> Use after toning as an active serum or overnight sealing treatment.</p>
                    <p>• <strong>Tip:</strong> Keep refrigerated for optimal depuffing and cooling efficacy.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="mt-6 p-6 bg-white rounded-3xl border border-[#E8EFE9] shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Select Quantity
                  </span>
                  <div className="flex items-center bg-[#F3F6F4] border border-[#E8EFE9] rounded-2xl p-1">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-stone-600 hover:text-[#1B382B] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#161D1A] w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-stone-600 hover:text-[#1B382B] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Subtotal</span>
                  <span className="text-2xl font-serif font-extrabold text-[#1B382B]">
                    LKR {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl bg-[#E8EFE9] hover:bg-[#dce7de] text-[#1B382B] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A059]" /> Add to Basket
                </button>

                <button
                  onClick={() => setIsInstantCheckoutOpen(true)}
                  className="w-full py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059]" /> Instant Checkout
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-3 border-t border-[#F3F6F4] text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" /> Direct Islandwide Courier
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Authenticity Verified
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Similar Suggestions */}
        {similarProducts.length > 0 && (
          <section className="mt-24 pt-12 border-t border-[#E8EFE9]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] block mb-1">
                  Complementary Regimen
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#161D1A]">
                  Formulations You May Also Like
                </h3>
              </div>
              <Link 
                href="/catalog" 
                className="text-xs font-bold uppercase tracking-wider text-[#1B382B] hover:text-[#C5A059] transition hidden sm:block"
              >
                View Full Catalog
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map((simProduct) => {
                const simPhoto = getProductImage(simProduct);
                return (
                  <Link
                    key={simProduct.id}
                    href={`/product/${simProduct.id}`}
                    className="group bg-white rounded-3xl border border-[#E8EFE9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F3F6F4]">
                        <img 
                          src={simPhoto} 
                          alt={simProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[9px] font-extrabold uppercase bg-white/90 px-2 py-0.5 rounded-full text-[#1B382B]">
                            {simProduct.brand}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-serif font-bold text-xs text-[#161D1A] group-hover:text-[#1B382B] transition truncate">
                          {simProduct.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                          {simProduct.benefits}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-2 border-t border-[#F3F6F4] flex justify-between items-center">
                        <span className="text-xs font-bold font-serif text-[#1B382B]">
                          LKR {Number(simProduct.price).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#C5A059] group-hover:underline">
                          View details
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Instant Checkout Slide-in / Modal */}
      {product && (
        <CheckoutModal
          isOpen={isInstantCheckoutOpen}
          onClose={() => setIsInstantCheckoutOpen(false)}
          items={[
            {
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              quantity: quantity,
              image_url: productImage
            }
          ]}
          isFromCart={false}
        />
      )}

      <Footer />
    </div>
  );
}