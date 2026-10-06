'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { placeOrder } from '@/services/api';
import { useCart } from '@/context/CartContext';

export interface CheckoutItem {
  id: number;
  name: string;
  brand?: string;
  price: number | string;
  quantity: number;
  image_url?: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  isFromCart?: boolean;
}

export default function CheckoutModal({ isOpen, onClose, items, isFromCart = false }: CheckoutModalProps) {
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Colombo',
    paymentMethod: 'cash_on_delivery'
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const isFreeDelivery = subtotal >= 7500;
  const shippingFee = isFreeDelivery ? 0 : 450;
  const grandTotal = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      shipping_address: `${formData.address}, ${formData.city}`,
      payment_method: formData.paymentMethod,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    };

    const res = await placeOrder(payload);
    setLoading(false);

    if (res.success) {
      setOrderComplete(res.data);
      if (isFromCart) {
        clearCart();
      }
    } else {
      alert(res.message || 'Payment processing error. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setOrderComplete(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#E8EFE9] rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#161D1A] p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderComplete ? (
          <div>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-2 border border-[#C4D7C8]">
                <Sparkles className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-2xl font-serif font-extrabold text-[#161D1A]">
                {isFromCart ? 'Complete Cart Order' : 'Instant Order Checkout'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Direct dispatch from Fancy Store Botanical Warehouse
              </p>
            </div>

            {/* Order Items Preview */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8EFE9] mb-5 max-h-44 overflow-y-auto divide-y divide-[#F3F6F4]">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="pr-3">
                    <span className="text-[10px] font-bold uppercase text-[#C5A059] block">
                      {item.brand || 'Fancy Botanical'}
                    </span>
                    <h5 className="font-bold text-stone-800 line-clamp-1">{item.name}</h5>
                    <span className="text-stone-400 text-[11px]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-serif font-bold text-[#1B382B] shrink-0">
                    LKR {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown Card */}
            <div className="bg-[#E8EFE9]/50 rounded-2xl p-3.5 mb-5 text-xs space-y-1.5 border border-[#C4D7C8]/60">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Islandwide Courier Fee</span>
                <span className={isFreeDelivery ? 'font-bold text-emerald-700' : ''}>
                  {isFreeDelivery ? 'FREE (Orders over 7,500)' : `LKR ${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#C4D7C8] flex justify-between font-bold text-[#161D1A] text-sm">
                <span>Payable Amount</span>
                <span className="font-serif text-[#1B382B] text-base">
                  LKR {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarodye Weerasinghe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:bg-white focus:outline-[#1B382B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 7X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="No. 12, Lotus Grove Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Colombo / Galle"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cash_on_delivery' })}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                      formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] shadow-2xs'
                        : 'border-[#E8EFE9] bg-white text-stone-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#1B382B]" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                      formData.paymentMethod === 'card'
                        ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] shadow-2xs'
                        : 'border-[#E8EFE9] bg-white text-stone-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#C5A059]" />
                    <span>Credit / Debit Card</span>
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order • LKR {grandTotal.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-stone-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" /> Islandwide Tracking
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Receipt View */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-emerald-800 flex items-center justify-center mx-auto mb-4 border border-[#C4D7C8]">
              <PackageCheck className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
              Order Confirmed & Logged
            </span>
            <h3 className="text-2xl font-serif font-extrabold text-[#161D1A]">
              Thank You, {orderComplete.customer_name}!
            </h3>
            
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              We have dispatched your invoice and packaging tracking confirmation to{' '}
              <strong className="text-stone-700">{orderComplete.customer_email}</strong>.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-white border border-[#E8EFE9] text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-400">Order Reference</span>
                <span className="font-mono font-bold text-[#1B382B]">#{orderComplete.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Selection</span>
                <span className="capitalize font-semibold text-stone-700">
                  {orderComplete.payment_method.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Total Billed</span>
                <span className="font-serif font-extrabold text-[#1B382B]">
                  LKR {Number(orderComplete.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Dispatch Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for courier
                </span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
            >
              Continue Exploring Products
            </button>
          </div>
        )}

      </div>
    </div>
  );
}