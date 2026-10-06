'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const router = useRouter();
  const { login } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const endpoint = isSignUp ? `${BASE_URL}/auth/register` : `${BASE_URL}/auth/login`;
    const payload = isSignUp ? formData : { email: formData.email, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.data.user, data.data.token);
      router.push('/catalog');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl border border-[#E8EFE9] p-8 sm:p-10 shadow-xl shadow-[#1B382B]/5">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-3 border border-[#C4D7C8]">
              <Sparkles className="w-6 h-6 text-[#C5A059]" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-[#161D1A]">
              {isSignUp ? 'Create Botanical Profile' : 'Welcome to Fancy Store'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              {isSignUp 
                ? 'Save your clinical routine & track direct orders' 
                : 'Sign in to access your customized skin regimens'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Sarodye Weerasinghe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+94 7X XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>
          </form>

          {/* Toggle View */}
          <div className="mt-6 text-center text-xs text-stone-500 pt-4 border-t border-[#F3F6F4]">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-bold text-[#1B382B] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                New to Fancy Store?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-bold text-[#1B382B] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>

          {/* Admin link footnote */}
          <div className="mt-4 text-center">
            <Link
              href="/admin/login"
              className="text-[11px] text-stone-400 hover:text-[#C5A059] transition inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Administrator Portal
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}