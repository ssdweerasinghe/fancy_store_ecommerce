'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, ShieldCheck, Award, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#1B382B] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#C4D7C8]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> Our Heritage
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-[#161D1A] tracking-tight">
            Consultative Beauty with Transparency
          </h1>
          <p className="mt-4 text-stone-600 text-base leading-relaxed">
            Fancy Store was established to eliminate guesswork from online skincare shopping. By understanding how active ingredients interact with individual skin biology, we empower customers to make informed, clinically backed choices.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mb-2">Targeted Formulations</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every item in our collection—from marine collagen hydrogels to freeze-dried active sachets—is curated for noticeable dermatological efficacy and skin barrier reinforcement.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#C5A059] flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mb-2">Ingredient Safety</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              We declare active profiles openly, avoiding incompatible active combinations and ensuring sensitive complexions remain calm and resilient.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mb-2">Algorithmic Regimens</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Our skin routine engine suggests day and night steps tailored to each customer’s skin type, environmental climate, and specific concerns.
            </p>
          </div>
        </div>

        {/* Mission Statement Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#142A20] to-[#1B382B] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#C5A059]/30">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">Our Commitment</h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed max-w-3xl">
            "Skincare is never one-size-fits-all. Fancy Store delivers consultative beauty directly to your doorstep, combining high-grade hydrogels, pure fruit essences, and verified daily regimens."
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}