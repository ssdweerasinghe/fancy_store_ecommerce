'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Truck, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Banknote,
  ArrowRight,
  FileDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { placeOrder } from '@/services/api';

interface CheckoutItem {
  id: number;
  name: string;
  brand: string;
  price: number | string;
  quantity: number;
  image_url: string | null;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  isFromCart?: boolean;
}

interface OrderConfirmation {
  order_id: number;
  tracking_number?: string | null;
  customer_name: string;
  total_amount: number | string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  isFromCart = false
}: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer' | 'card'>('cash_on_delivery');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      // Prefill editable checkout fields from the signed-in account.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);

      const addressParts = [
        user.address_line1,
        user.town,
        user.district,
        user.province,
        user.postal_code ? `(${user.postal_code})` : null
      ].filter(Boolean);

      if (addressParts.length > 0) {
        setShippingAddress(addressParts.join(', '));
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const orderPayload = {
      user_id: user?.id || null,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim(),
      shipping_address: shippingAddress.trim(),
      payment_method: paymentMethod,
      items: items.map((it) => ({
        product_id: it.id,
        quantity: it.quantity,
        price: Number(it.price)
      }))
    };

    const res = await placeOrder(orderPayload);
    setLoading(false);

    if (res.success && res.data) {
      setOrderSuccess(res.data);
      if (isFromCart) {
        clearCart();
      }
    } else {
      setErrorMsg(res.message || 'Unable to place order. Please check all details.');
    }
  };

  const handleDownloadPDF = (orderId: number) => {
    window.open(`${BASE_URL}/orders/${orderId}/invoice`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#E8EFE9] rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#161D1A] p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderSuccess ? (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center border border-[#C4D7C8]">
                <Truck className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-extrabold text-[#161D1A]">
                  Secure Checkout
                </h3>
                <p className="text-xs text-stone-500">
                  Climate-controlled islandwide botanical delivery
                </p>
              </div>
            </div>

            {user && (
              <div className="mb-5 p-3 rounded-2xl bg-[#E8EFE9]/80 border border-[#C4D7C8] flex items-center justify-between text-xs text-[#1B382B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Auto-filled from account: <strong>{user.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                  Verified Account
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarodye Weerasinghe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Contact Phone (For Courier Call) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="077 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address (For Invoice & Dispatch Tracking) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Delivery Destination Address (Sri Lanka) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={2}
                    placeholder="No, Street, Town, District, Province (Postal Code)"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] font-bold shadow-2xs'
                        : 'border-[#E8EFE9] bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-[#C5A059]" />
                    <span className="block text-[11px] leading-tight">Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] font-bold shadow-2xs'
                        : 'border-[#E8EFE9] bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    <span className="block text-[11px] leading-tight">Bank Deposit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] font-bold shadow-2xs'
                        : 'border-[#E8EFE9] bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#1B382B]" />
                    <span className="block text-[11px] leading-tight">Card / PayHere</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E8EFE9] space-y-2">
                <div className="flex items-center justify-between text-stone-500 text-[11px]">
                  <span>Items Enclosed ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>LKR {totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-500 text-[11px]">
                  <span>Climate-Controlled Delivery</span>
                  <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
                </div>
                <div className="pt-2 border-t border-[#F3F6F4] flex items-center justify-between text-sm">
                  <span className="font-bold text-stone-800">Grand Total</span>
                  <span className="font-serif font-extrabold text-[#1B382B] text-lg">
                    LKR {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Processing Dispatch...' : 'Confirm & Place Order'}
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>

            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-4 border border-[#C4D7C8]">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] block mb-1">
              Order Confirmed
            </span>
            <h3 className="text-2xl font-serif font-extrabold text-[#161D1A]">
              Thank You, {orderSuccess.customer_name}!
            </h3>
            <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              Your botanical order is placed. Your official live tracking number is below:
            </p>

            {/* Date-Time Tracking Number Banner */}
            <div className="my-5 p-4 rounded-2xl bg-[#E8EFE9] border border-[#C4D7C8] max-w-md mx-auto text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Official Tracking Number
              </span>
              <span className="text-2xl font-mono font-extrabold text-[#1B382B] tracking-wider block mt-1">
                {orderSuccess.tracking_number || orderSuccess.order_id}
              </span>
              <span className="text-[11px] text-stone-400 block mt-1">
                Order ID: #{orderSuccess.order_id} • Total: LKR {Number(orderSuccess.total_amount).toFixed(2)}
              </span>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleDownloadPDF(orderSuccess.order_id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Order Receipt & Protocol (PDF)</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/track`);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1B382B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#142A20] transition cursor-pointer"
              >
                Go to Tracker
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-[#E8EFE9] text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 transition cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}