'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Google Sign-In Response Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setErrorMsg('');

    if (!credentialResponse.credential) {
      setErrorMsg('No credential token received from Google.');
      setLoading(false);
      return;
    }

    const res = await loginWithGoogle(credentialResponse.credential);
    setLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setErrorMsg(res.message || 'Google authentication failed.');
    }
  };

  // Standard Email/Phone Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      login(data.data.user);
      router.push('/account');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0E1A14] text-[#161D1A] dark:text-[#EAE6DF] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md w-full mx-auto px-4 py-16">
        <div className="bg-white dark:bg-[#152B20] border border-[#E8EFE9] dark:border-[#274B3B] p-8 sm:p-10 rounded-3xl shadow-xl">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#161D1A] dark:hover:text-white transition mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] dark:bg-[#1B382B] text-[#1B382B] dark:text-[#C5A059] flex items-center justify-center mx-auto mb-3 border border-[#C4D7C8] dark:border-[#C5A059]/30 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-[#161D1A] dark:text-[#EFE3C3]">
              Welcome Back
            </h1>
            <p className="text-xs text-stone-500 dark:text-emerald-100/60 mt-1">
              Sign in to manage your formulations and live dispatches
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google login was cancelled or failed.')}
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8EFE9] dark:border-[#274B3B]" />
            </div>
            <span className="relative bg-white dark:bg-[#152B20] px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase font-bold text-stone-600 dark:text-emerald-200/80 mb-1 tracking-wider">
                Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="name@domain.com or 077..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-[#142A20] border border-[#E8EFE9] dark:border-[#274B3B] rounded-xl text-stone-800 dark:text-white focus:outline-hidden focus:border-[#1B382B]"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase font-bold text-stone-600 dark:text-emerald-200/80 mb-1 tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-[#142A20] border border-[#E8EFE9] dark:border-[#274B3B] rounded-xl text-stone-800 dark:text-white focus:outline-hidden focus:border-[#1B382B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}