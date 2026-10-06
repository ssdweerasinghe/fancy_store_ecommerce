'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CheckoutModal from '@/components/CheckoutModal';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    totalCartCount, 
    cartSubtotal 
  } = useCart();

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 7500;
  const progressPercent = Math.min((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - cartSubtotal, 0);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-[#142A20]/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col justify-between border-l border-[#E8EFE9] animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#E8EFE9]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#161D1A]">
                      Botanical Cart
                    </h3>
                    <span className="text-xs text-[#C5A059] font-medium tracking-wide">
                      {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} selected
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full text-stone-400 hover:text-[#161D1A] hover:bg-[#F3F6F4] transition cursor-pointer"
                  aria-label="Close Cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="mt-4 pt-4 border-t border-[#F3F6F4]">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                    {amountToFreeShipping === 0 
                      ? 'Free islandwide shipping unlocked!' 
                      : `Add LKR ${amountToFreeShipping.toFixed(2)} for free delivery`}
                  </span>
                  <span className="text-[#1B382B] font-bold text-[11px]">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-[#E8EFE9] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#1B382B] to-[#C5A059] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cart Item List */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-[#E8EFE9]">
              {cart.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 opacity-70" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#161D1A]">Your cart is empty</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Discover marine collagen patches, freeze-dried night pods, and botanical formulas ready to ship.
                  </p>
                  <Link
                    href="/catalog"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-[#1B382B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#142A20] transition shadow-md"
                  >
                    Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-4.5 flex gap-4 items-center">
                    <div className="w-18 h-18 rounded-2xl overflow-hidden bg-[#F3F6F4] border border-[#E8EFE9] shrink-0">
                      <img 
                        src={item.image_url || '/assets/hero/hero-2.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block mb-0.5">
                        {item.brand}
                      </span>
                      <h5 className="font-bold text-xs text-[#161D1A] truncate">{item.name}</h5>
                      <span className="text-xs font-serif font-bold text-[#1B382B] block mt-1">
                        LKR {Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center bg-white border border-[#E8EFE9] rounded-xl shadow-2xs">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 text-stone-600 hover:text-[#1B382B] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#161D1A] w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 text-stone-600 hover:text-[#1B382B] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Checkout Call-to-Action */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-[#E8EFE9] shadow-lg">
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#161D1A]">LKR {cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Estimated Delivery</span>
                    <span className="font-medium text-emerald-700">
                      {amountToFreeShipping === 0 ? 'FREE' : 'LKR 450.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#F3F6F4] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#161D1A]">Estimated Total</span>
                    <span className="text-2xl font-serif font-extrabold text-[#1B382B]">
                      LKR {(cartSubtotal + (amountToFreeShipping === 0 ? 0 : 450)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-semibold text-xs tracking-wider uppercase transition shadow-xl shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> Safe Payment
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Islandwide Dispatch
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Cart Multi-Item Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={cart}
        isFromCart={true}
      />
    </>
  );
}