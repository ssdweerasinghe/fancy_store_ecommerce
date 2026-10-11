'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoutineQuizModal from '@/components/RoutineQuizModal';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Droplets, 
  HeartHandshake, 
  Layers 
} from 'lucide-react';

export default function HomePage() {
  const [quizOpen, setQuizOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased selection:bg-[#E8EFE9] selection:text-[#1B382B]">
      {/* Navbar with Quiz Trigger */}
      <Navbar onOpenQuiz={() => setQuizOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] text-[#1B382B] text-xs font-semibold border border-[#C4D7C8]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Curated Clinical & Botanical Dermatology
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-[#161D1A] leading-[1.1]">
                Botanical Precision <br />
                <span className="italic font-normal text-[#1B382B]">Meets Cellular Science.</span>
              </h1>

              <p className="text-stone-600 text-sm sm:text-base max-w-xl leading-relaxed">
                Experience marine collagen peptide hydrogel eye gels, freeze-dried nocturnal jelly pods, 
                and bio-cellulose sheet treatments formulated for restorative barrier resilience.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/catalog"
                  className="px-8 py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-xl shadow-[#1B382B]/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setQuizOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 text-[#1B382B] border border-[#E8EFE9] font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Find My Routine</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8EFE9] text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Islandwide Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#1B382B] shrink-0" />
                  <span>Botanical Bio-Actives</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 w-full rounded-3xl overflow-hidden shadow-2xl border border-[#E8EFE9]">
                <img
                  src="/assets/hero/hero-2.jpg"
                  alt="Marine Collagen Eye Gel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142A20]/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EFE3C3]">
                    Featured Active
                  </span>
                  <h3 className="text-xl font-serif font-bold">Marine Collagen Eye Gels</h3>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    60 Patches • Hydrogel Matrix with Acetyl Hexapeptide
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Routine Banner CTA */}
      <section className="bg-[#142A20] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059] block">
            Custom Consultation
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#EFE3C3]">
            Uncertain which formulation matches your dermal barrier?
          </h2>
          <p className="text-xs text-emerald-100/70 max-w-xl mx-auto">
            Take our 60-second botanical consultation to diagnose your skin equilibrium and receive a clinical 3-step routine.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setQuizOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] font-bold text-xs uppercase tracking-wider transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Start Routine Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Consultation Modal */}
      <RoutineQuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />

      <Footer />
    </div>
  );
}