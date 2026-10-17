'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  FileDown,
  Copy,
  Check
} from 'lucide-react';
import { trackOrder } from '@/services/api';

interface TrackedOrderItem {
  id: number;
  brand: string;
  product_name: string;
  quantity: number;
  subtotal?: number | string;
  price_at_purchase?: number | string;
  unit_price?: number | string;
}

interface TrackedOrder {
  id: number;
  tracking_number?: string | null;
  status: string;
  customer_name: string;
  total_amount: number | string;
  items: TrackedOrderItem[];
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = query.trim();
    if (!cleanInput) return;

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    // Strips leading '#' for smooth searching whether the user types '#5' or '20261018023011'
    const cleanParam = cleanInput.replace(/^[#\s]+/, '');

    const res = await trackOrder(cleanParam);
    setLoading(false);

    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setErrorMsg(res.message || 'No active shipment found with this ID or phone number.');
    }
  };

  const handleDownloadPDF = (orderId: number) => {
    window.open(`${BASE_URL}/orders/${orderId}/invoice`, '_blank');
  };

  const handleCopyTrackNo = (trackNo: string | number) => {
    navigator.clipboard.writeText(String(trackNo));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusSteps = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

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
            Enter your Date-Time Tracking Number (e.g., <strong>20261018023011</strong>), Order ID (e.g., <strong>#5</strong>), or mobile number.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tracking No (e.g. 20261018023011) or #5 or phone..."
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
                  Official Dispatch Reference
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <h3 className="text-xl font-serif font-bold text-[#161D1A]">
                    Track No: <span className="font-mono text-[#1B382B]">{order.tracking_number || order.id}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopyTrackNo(order.tracking_number || order.id)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition cursor-pointer"
                    title="Copy tracking number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {isCancelled && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                      Cancelled
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-400 block mt-0.5">
                  Order Ref: #{order.id} • Recipient: {order.customer_name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(order.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8EFE9] hover:bg-[#d8e4da] text-[#1B382B] text-xs font-bold transition cursor-pointer border border-[#C4D7C8]"
                >
                  <FileDown className="w-4 h-4 text-[#C5A059]" />
                  <span>Download PDF Receipt</span>
                </button>
                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Total Dispatched</span>
                  <span className="text-lg font-serif font-extrabold text-[#1B382B]">
                    LKR {Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Progress */}
            {isCancelled ? (
              <div className="my-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3.5 text-rose-800 text-xs">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <strong className="block font-bold">This order has been cancelled by administration.</strong>
                  <span className="text-rose-700/80">
                    The reserved inventory has been replenished back to stock.
                  </span>
                </div>
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
                  {order.items.map((it) => (
                    <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C5A059] block">
                          {it.brand}
                        </span>
                        <span className="font-bold text-stone-800">{it.product_name}</span>
                        <span className="text-stone-400 text-[11px] block">Qty: {it.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-stone-900">
                        LKR {Number(it.subtotal || it.price_at_purchase || it.unit_price || 0).toFixed(2)}
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