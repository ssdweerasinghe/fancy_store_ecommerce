'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();
  const { login } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, require_admin: true })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Administrative verification failed');
      }

      login(data.data.user, data.data.token);
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#142A20] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1B382B] border border-[#274B3B] p-8 sm:p-10 rounded-3xl shadow-2xl text-white">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-emerald-200/60 hover:text-white transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#142A20] text-[#C5A059] flex items-center justify-center mx-auto mb-3 border border-[#C5A059]/30 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif font-extrabold text-[#EFE3C3]">
            Store Control Center
          </h1>
          <p className="text-xs text-emerald-100/60 mt-1">
            Authorized administrative access only
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase font-bold text-emerald-200/80 mb-1 tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@fancystore.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#142A20] border border-[#274B3B] rounded-xl text-white placeholder-emerald-100/30 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase font-bold text-emerald-200/80 mb-1 tracking-wider">
              Secure Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#142A20] border border-[#274B3B] rounded-xl text-white placeholder-emerald-100/30 focus:outline-hidden focus:border-[#C5A059]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b59247] text-[#142A20] font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Staff...</span>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}