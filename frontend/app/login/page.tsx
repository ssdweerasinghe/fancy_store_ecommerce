'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Home, 
  KeyRound,
  RotateCcw,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SRI_LANKA_REGIONS } from '@/utils/sriLankaData';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign-Up Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address_line1: '',
    province: 'Western Province',
    district: 'Colombo',
    town: 'Colombo 03 - Kollupitiya',
    postal_code: '00300'
  });

  // Phone OTP Verification States
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180); // 3 minutes

  // Forgot Password Modal States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPhoneOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPhoneOtpSent, otpTimer]);

  // Sri Lanka Cascading selections
  const currentProvince = SRI_LANKA_REGIONS.find((p) => p.name === formData.province) || SRI_LANKA_REGIONS[0];
  const currentDistrict = currentProvince.districts.find((d) => d.name === formData.district) || currentProvince.districts[0];

  const handleProvinceChange = (provName: string) => {
    const p = SRI_LANKA_REGIONS.find((item) => item.name === provName) || SRI_LANKA_REGIONS[0];
    const firstDist = p.districts[0];
    const firstTown = firstDist.towns[0];
    setFormData({
      ...formData,
      province: p.name,
      district: firstDist.name,
      town: firstTown.name,
      postal_code: firstTown.postalCode
    });
  };

  const handleDistrictChange = (distName: string) => {
    const d = currentProvince.districts.find((item) => item.name === distName) || currentProvince.districts[0];
    const firstTown = d.towns[0];
    setFormData({
      ...formData,
      district: d.name,
      town: firstTown.name,
      postal_code: firstTown.postalCode
    });
  };

  const handleTownChange = (townName: string) => {
    const t = currentDistrict.towns.find((item) => item.name === townName) || currentDistrict.towns[0];
    setFormData({
      ...formData,
      town: t.name,
      postal_code: t.postalCode
    });
  };

  // Dispatch Phone OTP
  const handleSendPhoneOtp = async () => {
    if (!formData.phone || formData.phone.length < 9) {
      setErrorMsg('Please enter a valid 9-10 digit Sri Lankan mobile number');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: formData.phone, purpose: 'phone_verify' })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setIsPhoneOtpSent(true);
        setOtpTimer(180);
        setSuccessMsg(data.demo_code ? `Verification code sent! (Dev Demo OTP: ${data.demo_code})` : 'Verification code dispatched to mobile phone.');
      } else {
        setErrorMsg(data.message);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Could not send OTP');
    }
  };

  // Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 6) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: formData.phone, otp: phoneOtp, purpose: 'phone_verify' })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setIsPhoneVerified(true);
        setSuccessMsg('Phone number verified successfully!');
      } else {
        setErrorMsg(data.message || 'Invalid verification code');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Verification failed');
    }
  };

  // Google Sign-In Simulation
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');

    // Pre-filled Google member data
    const mockGoogleProfile = {
      google_id: 'google_oauth_' + Math.random().toString(36).substring(2, 11),
      email: 'user.google@gmail.com',
      name: 'Google Verified Member',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };

    try {
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGoogleProfile)
      });
      const json = await res.json();
      setLoading(false);

      if (json.success) {
        login(json.data.user, json.data.token);
        router.push('/catalog');
      } else {
        setErrorMsg(json.message);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Google Sign-In failed');
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        login(data.data.user, data.data.token);
        router.push('/catalog');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Authentication error');
    }
  };

  // Submit Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone_verified: isPhoneVerified
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        login(data.data.user, data.data.token);
        router.push('/catalog');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  // Send Forgot Password OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: forgotTarget, purpose: 'forgot_password' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Could not send the password reset code.');
        return;
      }

      setForgotStep(2);
      setSuccessMsg(data.demo_code ? `Reset code sent! (Dev Demo code: ${data.demo_code})` : 'Password reset code dispatched.');
    } catch (error) {
      console.error('Forgot password code request failed:', error);
      setErrorMsg('Could not connect to the password reset service. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Reset Password Execution
  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: forgotTarget,
          otp: forgotOtp,
          new_password: forgotNewPassword
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Could not update your password.');
        return;
      }

      setSuccessMsg('Password updated successfully. Please sign in with your new password.');
      setIsForgotModalOpen(false);
      setForgotStep(1);
      setMode('login');
    } catch (error) {
      console.error('Password reset request failed:', error);
      setErrorMsg('Could not connect to the password reset service. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#E8EFE9] p-6 sm:p-10 shadow-xl shadow-[#1B382B]/5">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-3 border border-[#C4D7C8]">
              <Sparkles className="w-6 h-6 text-[#C5A059]" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-[#161D1A]">
              {mode === 'signup' ? 'Create Botanical Account' : 'Welcome to Fancy Store'}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Curated clinical skincare, marine collagen eye gels, and algorithmic routine consultation.
            </p>
          </div>

          {/* Social Auth Option: Google One-Tap */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-[#E8EFE9] hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center justify-center gap-3 shadow-2xs cursor-pointer mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-5 text-[11px] text-stone-400 uppercase tracking-widest font-semibold">
            <div className="flex-1 border-t border-[#E8EFE9]" />
            <span className="px-3">or continue with email & phone</span>
            <div className="flex-1 border-t border-[#E8EFE9]" />
          </div>

          {!isForgotModalOpen && errorMsg && (
            <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          {!isForgotModalOpen && successMsg && (
            <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================= */}
          {/* LOGIN FORM */}
          {/* ======================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email or Sri Lanka Mobile Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="user@domain.com or 07X XXX XXXX"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setForgotStep(1);
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-[#C5A059] font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </form>
          )}

          {/* ======================================= */}
          {/* SIGN UP FORM WITH SRI LANKA LOCALIZATION */}
          {/* ======================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Sarodye Weerasinghe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                </div>
              </div>

              {/* Sri Lanka Phone + SMS OTP Verification */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Sri Lankan Phone Number (For Courier Tracking & OTP) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="077 123 4567"
                      value={formData.phone}
                      disabled={isPhoneVerified}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                  {!isPhoneVerified && (
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl bg-[#E8EFE9] hover:bg-[#dce7de] text-[#1B382B] font-bold whitespace-nowrap cursor-pointer transition border border-[#C4D7C8]"
                    >
                      {isPhoneOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                  {isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>

                {isPhoneOtpSent && !isPhoneVerified && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                      <span>Enter 6-Digit SMS Verification Code:</span>
                      <span>Expires in {Math.floor(otpTimer / 60)}:{('0' + (otpTimer % 60)).slice(-2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="w-32 px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-center tracking-widest text-sm focus:outline-[#1B382B]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneOtp.length !== 6}
                        className="px-4 py-1.5 rounded-xl bg-[#1B382B] text-white font-bold cursor-pointer"
                      >
                        Confirm Code
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sri Lanka Delivery Address Breakdown */}
              <div className="pt-2 border-t border-[#F3F6F4] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block tracking-wider">
                  Direct Delivery Address Details (Sri Lanka)
                </span>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Street Address / House No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="No. 45/2, Temple Road"
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Province *
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white font-medium"
                    >
                      {SRI_LANKA_REGIONS.map((prov) => (
                        <option key={prov.name} value={prov.name}>{prov.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      District *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white font-medium"
                    >
                      {currentProvince.districts.map((dist) => (
                        <option key={dist.name} value={dist.name}>{dist.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Town / City *
                    </label>
                    <select
                      value={formData.town}
                      onChange={(e) => handleTownChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white font-medium"
                    >
                      {currentDistrict.towns.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Postal Code / ZipCode *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-stone-100 font-mono font-bold text-stone-800"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </form>
          )}

          {/* Switch Mode Toggle */}
          <div className="mt-6 text-center text-xs text-stone-500 pt-4 border-t border-[#F3F6F4]">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-[#1B382B] hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                New to Fancy Store?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-[#1B382B] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>

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

      {/* ======================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ======================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#FBF9F5] border border-[#E8EFE9] rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsForgotModalOpen(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="absolute top-5 right-5 text-stone-400 hover:text-[#161D1A] p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-2 border border-[#C4D7C8]">
                <KeyRound className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-serif font-extrabold text-[#161D1A]">
                Reset Your Password
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {forgotStep === 1
                  ? 'Enter your registered email or phone to receive a reset code'
                  : 'Enter the 6-digit code and choose a new password'}
              </p>
            </div>

            {errorMsg && (
              <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {successMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="user@domain.com or 07X XXX XXXX"
                    value={forgotTarget}
                    onChange={(e) => setForgotTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-2xl bg-[#1B382B] text-white font-bold uppercase tracking-wider cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white font-mono text-center tracking-widest text-sm focus:outline-[#1B382B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white focus:outline-[#1B382B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-2xl bg-[#1B382B] text-white font-bold uppercase tracking-wider cursor-pointer"
                >
                  {forgotLoading ? 'Updating Password...' : 'Save New Password & Log In'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}