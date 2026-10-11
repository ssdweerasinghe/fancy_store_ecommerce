'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  Phone, 
  Calendar 
} from 'lucide-react';
import { trackOrder } from '@/services/api';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    const res = await trackOrder(query.trim());
    setLoading(false);

    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setErrorMsg(res.message || 'No active shipment found with this ID or phone number.');
    }
  };

  const statusSteps = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-3 border border-[#C4D7C8]">
            <Truck className="w-6 h-6 text-[#C5A059]" />
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#161D1A]">
            Islandwide Dispatch Tracker
          </h1>
          <p className="text-xs text-stone-500 mt-2">
            Enter your Order ID (e.g., <strong>#1</strong>) or registered phone number to track your climate-controlled delivery.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Order Reference ID or Phone number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8EFE9] bg-white text-xs focus:outline-[#1B382B]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer shrink-0"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <p className="mt-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 py-2.5 px-4 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-3xl border border-[#E8EFE9] p-6 sm:p-8 shadow-xl animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8EFE9] gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block">
                  Official Shipment Reference
                </span>
                <h3 className="text-xl font-serif font-bold text-[#161D1A]">
                  Order #{order.id} • {order.customer_name}
                </h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-stone-400 block">Total Dispatched</span>
                <span className="text-lg font-serif font-extrabold text-[#1B382B]">
                  LKR {Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Stepper Progress */}
            {order.status === 'cancelled' ? (
              <div className="my-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>This order was cancelled. Please contact customer support for further assistance.</span>
              </div>
            ) : (
              <div className="my-10">
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {statusSteps.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            isDone
                              ? 'bg-[#1B382B] text-white shadow-md'
                              : 'bg-stone-100 text-stone-400 border border-stone-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`capitalize text-xs font-semibold ${
                            isCurrent ? 'text-[#1B382B] font-extrabold underline decoration-[#C5A059]' : 'text-stone-500'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item Breakdown */}
            {order.items && order.items.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#E8EFE9]">
                <h4 className="font-serif font-bold text-sm text-[#161D1A] mb-3">
                  Enclosed Formulations ({order.items.length})
                </h4>
                <div className="divide-y divide-[#F3F6F4]">
                  {order.items.map((it: any) => (
                    <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C5A059] block">
                          {it.brand}
                        </span>
                        <span className="font-bold text-stone-800">{it.product_name}</span>
                        <span className="text-stone-400 text-[11px] block">Qty: {it.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-stone-900">
                        LKR {Number(it.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}