'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  LogOut, 
  ArrowRight,
  Truck,
  MapPin,
  FileDown,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserOrders } from '@/services/api';

interface UserOrder {
  id: number;
  tracking_number?: string | null;
  status: string;
  created_at: string;
  items_count: number;
  total_amount: number | string;
}

export default function AccountPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTrack, setCopiedTrack] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserOrders(token).then((res) => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, [token, router]);

  const handleDownloadPDF = (orderId: number) => {
    window.open(`${BASE_URL}/orders/${orderId}/invoice`, '_blank');
  };

  const handleCopyTrackNo = (trackNo: string) => {
    navigator.clipboard.writeText(trackNo);
    setCopiedTrack(trackNo);
    setTimeout(() => setCopiedTrack(null), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-[#E8EFE9] p-6 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center border border-[#C4D7C8]">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                <User className="w-8 h-8 text-[#C5A059]" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-[#161D1A]">{user.name}</h2>
              {user.email && (
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" /> {user.email}
                </p>
              )}
              {user.phone && (
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" /> {user.phone}
                </p>
              )}
            </div>

            {user.town && (
              <div className="pt-3 border-t border-[#F3F6F4] text-xs text-stone-600 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    {user.address_line1}, {user.town}, {user.district}, {user.province} ({user.postal_code})
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#F3F6F4] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Account Type</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#1B382B] font-bold text-[10px] capitalize">
                {user.role} Member
              </span>
            </div>

            <div className="pt-4 border-t border-[#F3F6F4] space-y-2">
              <Link
                href="/track"
                className="w-full py-2.5 px-4 rounded-xl bg-stone-50 hover:bg-[#E8EFE9] text-stone-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C5A059]" /> Track An Order
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </span>
              </button>
            </div>
          </div>

          {/* Orders History List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8EFE9] p-6 shadow-xs">
            <h3 className="text-lg font-serif font-bold text-[#161D1A] mb-4">
              My Orders & Dispatches ({orders.length})
            </h3>

            {loading ? (
              <div className="py-16 text-center text-xs text-stone-400">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500">You have no recorded orders yet.</p>
                <Link
                  href="/catalog"
                  className="inline-block mt-4 px-5 py-2.5 rounded-full bg-[#1B382B] text-white text-xs font-semibold"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F6F4]">
                {orders.map((ord) => {
                  const isCancelled = ord.status === 'cancelled';
                  const trackNo = ord.tracking_number || String(ord.id);
                  const isCopied = copiedTrack === trackNo;

                  return (
                    <div key={ord.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      
                      {/* Left Side: Order identifiers and date */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider">
                            Track No:
                          </span>
                          <span className="font-mono font-bold text-sm text-[#1B382B] bg-[#E8EFE9] px-2 py-0.5 rounded-md">
                            {trackNo}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTrackNo(trackNo)}
                            className="p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                            title="Copy Tracking Number"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {isCancelled && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                              Cancelled
                            </span>
                          )}
                        </div>

                        <div className="text-stone-400 text-[11px] flex items-center gap-2">
                          <span>Order Ref: #{ord.id}</span>
                          <span>•</span>
                          <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{ord.items_count} item(s)</span>
                        </div>
                      </div>

                      {/* Right Side: Pricing, Status Badge & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="font-serif font-bold text-stone-900 text-sm block">
                            LKR {Number(ord.total_amount).toFixed(2)}
                          </span>
                          <span
                            className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#E8EFE9] text-[#1B382B]'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(ord.id)}
                            className="p-2.5 rounded-xl bg-stone-100 hover:bg-[#1B382B] hover:text-white text-stone-700 transition cursor-pointer border border-stone-200"
                            title="Download PDF Receipt"
                          >
                            <FileDown className="w-4 h-4 text-[#C5A059]" />
                          </button>

                          <Link
                            href={`/track?ref=${trackNo}`}
                            className="p-2.5 rounded-xl bg-[#E8EFE9] hover:bg-[#d8e4da] text-[#1B382B] transition cursor-pointer border border-[#C4D7C8]"
                            title="Live Courier Status"
                          >
                            <Truck className="w-4 h-4" />
                          </Link>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}