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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserOrders } from '@/services/api';

export default function AccountPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

            {/* Address Details */}
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
                {orders.map((ord) => (
                  <div key={ord.id} className="py-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#1B382B]">#{ord.id}</span>
                      <span className="text-stone-400 text-[11px] block mt-0.5">
                        {new Date(ord.created_at).toLocaleDateString()} • {ord.items_count} item(s)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-bold text-[#161D1A] block">
                        LKR {Number(ord.total_amount).toFixed(2)}
                      </span>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-[#E8EFE9] text-[#1B382B]">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}