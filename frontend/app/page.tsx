'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  Droplets, 
  Sun, 
  Moon, 
  Eye, 
  Smile, 
  CheckCircle2, 
  Star, 
  X
} from 'lucide-react';
import { getRoutineRecommendation } from '@/services/api';

export default function FancyStoreHomePage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizSkinType, setQuizSkinType] = useState('combination');
  const [quizConcern, setQuizConcern] = useState('hydration');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const [activeIngredient, setActiveIngredient] = useState(0);

  // Local 4K Hero Photos from public/assets/hero/
  const heroImages = [
    '/assets/hero/hero-1.jpg',
    '/assets/hero/hero-2.jpg',
    '/assets/hero/hero-3.jpg',
    '/assets/hero/hero-4.jpg',
    '/assets/hero/hero-5.jpg'
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero photos every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const ingredientsList = [
    {
      name: 'Marine Collagen',
      origin: 'Hydro-Extracted Marine Peptides',
      benefit: 'Restores structural elasticity, smooths fine lines, and firms fatigued under-eye zones.',
      tags: ['Elasticity', 'Depuffing', 'Firming'],
      image: '/assets/hero/hero-5.jpg'
    },
    {
      name: 'Centella Asiatica (Cica)',
      origin: 'Pure Madagascar Botanical Extract',
      benefit: 'Instantly quenches inflammation, accelerates barrier recovery, and alleviates surface redness.',
      tags: ['Barrier Repair', 'Soothing', 'Acne Defense'],
      image: '/assets/hero/hero-3.jpg'
    },
    {
      name: 'Multi-Molecular Hyaluronic Acid',
      origin: 'Bio-Fermented Moisture Matrix',
      benefit: 'Penetrates across epidermis strata to attract up to 1,000x its weight in water, eliminating tightness.',
      tags: ['Deep Hydration', 'Plumping', 'Barrier Support'],
      image: '/assets/hero/hero-4.jpg'
    },
    {
      name: 'Active Retinol Complex',
      origin: 'Encapsulated Vitamin A Derivative',
      benefit: 'Spurs nightly cellular turnover, accelerates collagen production, and refines texture.',
      tags: ['Anti-Aging', 'Skin Smoothing', 'Cellular Turnover'],
      image: '/assets/hero/hero-1.jpg'
    }
  ];

  const handleRunQuiz = async () => {
    setQuizLoading(true);
    const result = await getRoutineRecommendation(quizSkinType, quizConcern);
    if (result.success) {
      setQuizResult(result.data);
    }
    setQuizLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased selection:bg-[#E8EFE9] selection:text-[#1B382B]">
      
      {/* Global Navbar */}
      <Navbar onOpenQuiz={() => { setQuizResult(null); setIsQuizOpen(true); }} />

      {/* 1. Cinematic Hero Section with Failsafe Background & Overlays */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#142A20]">
        
        {/* Layered Background Images with Smooth Transition */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}

          {/* Guaranteed High-Contrast Dark Gradient Overlay */}
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(20,42,32,0.85) 0%, rgba(20,42,32,0.70) 50%, rgba(20,42,32,0.95) 100%)'
            }}
          />
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white relative z-20">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#EFE3C3] text-xs font-semibold tracking-wider uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            Dermatological Routine Synthesis
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-lg">
            Beauty Backed by <br />
            <span className="italic font-normal text-[#EFE3C3]">Botanical Precision</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-stone-200 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            Eliminate skincare guesswork. Discover marine collagen eye patches, active freeze-dried sleeping masks, and tailored botanical routines designed for your biological skin type.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { setQuizResult(null); setIsQuizOpen(true); }}
              className="px-8 py-4 rounded-full bg-[#C5A059] hover:bg-[#b59247] text-[#142A20] font-bold text-xs tracking-wider uppercase transition-all shadow-2xl flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-[#142A20]" /> Start Skin Diagnostic Quiz
            </button>

            <Link
              href="/catalog"
              className="px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg"
            >
              Explore 50+ Treatments <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
          </div>

          {/* Micro Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-white/20 text-xs text-stone-200">
            <div className="flex items-center justify-center gap-2 backdrop-blur-xs py-1">
              <Leaf className="w-4 h-4 text-[#C4D7C8]" /> Bio-Extracts
            </div>
            <div className="flex items-center justify-center gap-2 backdrop-blur-xs py-1">
              <Droplets className="w-4 h-4 text-[#EFE3C3]" /> Active Peptides
            </div>
            <div className="flex items-center justify-center gap-2 backdrop-blur-xs py-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> Safe & Tested
            </div>
            <div className="flex items-center justify-center gap-2 backdrop-blur-xs py-1">
              <Sparkles className="w-4 h-4 text-[#C5A059]" /> Regimen Match
            </div>
          </div>

          {/* 5-Slide Indicator Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentHeroIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentHeroIndex 
                    ? 'w-8 bg-[#C5A059]' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 2. Interactive 4-Step Regimen Architecture */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#1B382B] text-xs font-bold uppercase tracking-widest block mb-2">
            Clinical Regimen Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#161D1A]">
            Your Daily 4-Step Protocol
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Layering products correctly maximizes bioavailability and reinforces your natural lipid barrier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-8 border border-[#E8EFE9] shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold text-[#1B382B] uppercase tracking-widest">Step 01 • Morning</span>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mt-1 mb-2">Targeted Sheet Mask</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Infuse concentrated essence into deep epidermal layers with Fancy Aura botanical sheets (Centella, Vitamin C, Hyaluronic Acid).
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8EFE9] shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#C5A059] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold text-[#C5A059] uppercase tracking-widest">Step 02 • Awaken</span>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mt-1 mb-2">Hydrogel Eye Patches</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Target orbital fatigue, depuff lymph fluid, and fade dark circles with Körmesic Marine Collagen & Gold hydrogels.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8EFE9] shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smile className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold text-[#1B382B] uppercase tracking-widest">Step 03 • Plump</span>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mt-1 mb-2">Honey Lip Care</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Condition dry cuticles and plump lips with nutrient-dense Aloe Vera and pure Honey moisturizing patches.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8EFE9] shadow-xs hover:shadow-xl hover:border-[#C4D7C8] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-[#142A20] text-[#EFE3C3] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Moon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-extrabold text-[#1B382B] uppercase tracking-widest">Step 04 • Night</span>
            <h3 className="font-serif font-bold text-lg text-[#161D1A] mt-1 mb-2">Freeze-Dried Sachet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Seal all previous steps with 24K Gold Peptides or Rose freeze-dried sleeping jelly to prompt deep cell renewal overnight.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Visual Spotlight Categories */}
      <section className="py-20 bg-[#F3F6F4] border-y border-[#E8EFE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-[#1B382B] text-xs font-bold uppercase tracking-widest block mb-2">
                Signature Formulations
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#161D1A]">
                Explore Core Treatments
              </h2>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#1B382B] hover:text-[#C5A059] transition"
            >
              Browse Full Catalog <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Spotlight Card 1 */}
            <Link 
              href="/catalog?category=eye-care"
              className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-[#142A20] shadow-lg cursor-pointer"
            >
              <img
                src="/assets/hero/hero-2.jpg"
                alt="Eye Care Hydrogel Gels"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142A20] via-[#142A20]/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-8 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EFE3C3] block mb-1">
                  Marine Peptides • 5 Formulations
                </span>
                <h3 className="text-2xl font-serif font-bold">Collagen Eye Gels</h3>
                <p className="text-xs text-stone-300 mt-2 line-clamp-2">
                  Pearl Blue, Coral Pink, Lilac Purple, and 24K Gold treatments tailored for fatigued eyes.
                </p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-[#C5A059] group-hover:text-white transition">
                  Shop Category <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Spotlight Card 2 */}
            <Link 
              href="/catalog?category=sheet-masks"
              className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-[#142A20] shadow-lg cursor-pointer"
            >
              <img
                src="/assets/hero/hero-3.jpg"
                alt="Fancy Aura Sheet Masks"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142A20] via-[#142A20]/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-8 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EFE3C3] block mb-1">
                  Fancy Aura Collection • 24 Actives
                </span>
                <h3 className="text-2xl font-serif font-bold">Botanical Essence Sheets</h3>
                <p className="text-xs text-stone-300 mt-2 line-clamp-2">
                  Single-sheet concentrated serums including Centella, Snail Mucin, Retinol, and Vitamin C.
                </p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-[#C5A059] group-hover:text-white transition">
                  Shop Category <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

            {/* Spotlight Card 3 */}
            <Link 
              href="/catalog?category=sleeping-masks"
              className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-[#142A20] shadow-lg cursor-pointer"
            >
              <img
                src="/assets/hero/hero-4.jpg"
                alt="Sleeping Masks Freeze-Dried"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142A20] via-[#142A20]/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-8 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EFE3C3] block mb-1">
                  Overnight Jelly Sachets • 5 Blends
                </span>
                <h3 className="text-2xl font-serif font-bold">Freeze-Dried Overnight Pods</h3>
                <p className="text-xs text-stone-300 mt-2 line-clamp-2">
                  Portable night stick-packs locking moisture for continuous restoration while you sleep.
                </p>
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-[#C5A059] group-hover:text-white transition">
                  Shop Category <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 4. Interactive Ingredient Science Laboratory */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="text-[#1B382B] text-xs font-bold uppercase tracking-widest block mb-2">
              Dermatological Transparency
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#161D1A] tracking-tight leading-tight">
              Science-Driven Actives, Zero Fillers
            </h2>
            <p className="text-stone-600 text-sm mt-4 leading-relaxed">
              We eliminate ambiguity by declaring the precise function of every botanical and clinical active across our catalogue.
            </p>

            <div className="space-y-3 mt-8">
              {ingredientsList.map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => setActiveIngredient(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeIngredient === idx
                      ? 'bg-white border-[#1B382B] shadow-md ring-1 ring-[#1B382B]'
                      : 'bg-white/70 border-[#E8EFE9] hover:border-[#C4D7C8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#161D1A]">{item.name}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">{item.origin}</span>
                  </div>
                  {activeIngredient === idx && (
                    <div className="mt-2 text-xs text-stone-600 pt-2 border-t border-[#E8EFE9]">
                      <p>{item.benefit}</p>
                      <div className="flex gap-2 mt-3">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-[#E8EFE9] text-[#1B382B] font-semibold px-2.5 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-[#E8EFE9]">
            <img
              src={ingredientsList[activeIngredient].image}
              alt={ingredientsList[activeIngredient].name}
              className="w-full h-full object-cover transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142A20]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] block mb-1">
                Clinical Highlight
              </span>
              <h3 className="text-2xl font-serif font-bold">{ingredientsList[activeIngredient].name}</h3>
              <p className="text-xs text-stone-200 mt-1 max-w-sm">
                Formulated across our medical-grade masks to optimize cell receptivity.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Diagnostic Regimen Call to Action Banner */}
      <section className="py-16 bg-[#142A20] text-white relative overflow-hidden border-y border-[#1F3D2F]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-14 h-14 rounded-3xl bg-[#1B382B] border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight">
            Not Sure Which Formulations Suit You?
          </h2>
          <p className="text-emerald-100/70 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Our skin diagnostic algorithm takes less than 60 seconds to match your exact skin sensitivity and hydration needs with our inventory.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => { setQuizResult(null); setIsQuizOpen(true); }}
              className="px-8 py-4 rounded-full bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] font-bold text-xs tracking-wider uppercase transition-all shadow-xl cursor-pointer"
            >
              Launch Regimen Diagnostic
            </button>
          </div>
        </div>
      </section>

      {/* 6. Verified Customer Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[#1B382B] text-xs font-bold uppercase tracking-widest block mb-2">
            Real Experiences
          </span>
          <h2 className="text-3xl font-serif font-extrabold text-[#161D1A]">
            Results from Verified Regimens
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="flex gap-1 text-[#C5A059] mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "The Marine Collagen eye patches literally cleared my under-eye fatigue within 15 minutes of my first use. Will never switch back to ordinary cream tubs."
            </p>
            <div className="mt-6 pt-4 border-t border-[#E8EFE9] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#161D1A]">Anuki P.</h4>
                <span className="text-[10px] text-stone-400">Verified Buyer • Combination Skin</span>
              </div>
              <span className="text-[10px] font-bold text-[#1B382B] bg-[#E8EFE9] px-2 py-0.5 rounded-full">
                Verified Regimen
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="flex gap-1 text-[#C5A059] mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "The skin quiz recommended the Centella Asiatica sheet mask paired with the Rose sleeping pod. My surface redness reduced dramatically by morning."
            </p>
            <div className="mt-6 pt-4 border-t border-[#E8EFE9] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#161D1A]">Kavindu M.</h4>
                <span className="text-[10px] text-stone-400">Verified Buyer • Sensitive Skin</span>
              </div>
              <span className="text-[10px] font-bold text-[#1B382B] bg-[#E8EFE9] px-2 py-0.5 rounded-full">
                Verified Regimen
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8EFE9] shadow-xs">
            <div className="flex gap-1 text-[#C5A059] mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "Being able to review the ingredients and contraindications directly before buying gives me total peace of mind. Delivery to Kandy was super fast."
            </p>
            <div className="mt-6 pt-4 border-t border-[#E8EFE9] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#161D1A]">Dinithi S.</h4>
                <span className="text-[10px] text-stone-400">Verified Buyer • Dry Skin</span>
              </div>
              <span className="text-[10px] font-bold text-[#1B382B] bg-[#E8EFE9] px-2 py-0.5 rounded-full">
                Verified Regimen
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Routine Diagnostic Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsQuizOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!quizResult ? (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-[#E8EFE9] text-[#1B382B] rounded-2xl mb-3">
                    <Sparkles className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#161D1A]">Skin Regimen Assessment</h2>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Select your attributes to generate an algorithmic routine mapped to our active inventory.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B382B] mb-2">
                      1. Primary skin type?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['dry', 'oily', 'combination', 'sensitive', 'normal'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setQuizSkinType(st)}
                          className={`p-3 rounded-xl border text-xs capitalize text-center font-semibold transition cursor-pointer ${
                            quizSkinType === st
                              ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] shadow-xs'
                              : 'border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1B382B] mb-2">
                      2. Primary skin concern
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Deep Hydration & Barrier', value: 'hydration' },
                        { label: 'Redness & Irritation', value: 'redness' },
                        { label: 'Fine Lines & Firming', value: 'wrinkle' },
                        { label: 'Tone Brightening & Spots', value: 'brightening' }
                      ].map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setQuizConcern(c.value)}
                          className={`p-3.5 rounded-xl border text-xs text-left font-semibold transition cursor-pointer ${
                            quizConcern === c.value
                              ? 'border-[#1B382B] bg-[#E8EFE9] text-[#1B382B] shadow-xs'
                              : 'border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={quizLoading}
                    onClick={handleRunQuiz}
                    className="w-full mt-4 py-3.5 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-semibold text-xs tracking-wider uppercase transition shadow-md cursor-pointer"
                  >
                    {quizLoading ? 'Generating Program...' : 'Assemble My Regimen'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-[#E8EFE9] text-[#1B382B] rounded-2xl mb-2">
                    <CheckCircle2 className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#161D1A]">Recommended Protocol</h2>
                  <p className="text-xs text-stone-500 mt-1 capitalize font-medium">
                    Target: {quizResult.user_profile.skin_type} Skin • Focus: {quizResult.user_profile.primary_concern}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {quizResult.am_routine.step_1_treatment && (
                    <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EBE3D0]">
                      <span className="font-bold text-[#C5A059] uppercase tracking-wider text-[10px] block mb-1">
                        ☀ Morning Vitality Treatment
                      </span>
                      <p className="font-bold text-[#161D1A] text-sm">
                        {quizResult.am_routine.step_1_treatment.product}
                      </p>
                      <p className="text-stone-600 mt-1">
                        {quizResult.am_routine.step_1_treatment.instruction}
                      </p>
                    </div>
                  )}

                  {quizResult.pm_routine.step_2_repair && (
                    <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#C4D7C8]">
                      <span className="font-bold text-[#1B382B] uppercase tracking-wider text-[10px] block mb-1">
                        🌙 Night Repair & Moisture Lock
                      </span>
                      <p className="font-bold text-[#161D1A] text-sm">
                        {quizResult.pm_routine.step_2_repair.product}
                      </p>
                      <p className="text-stone-600 mt-1">
                        {quizResult.pm_routine.step_2_repair.instruction}
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/catalog"
                  className="block text-center w-full mt-6 py-3.5 rounded-2xl bg-[#1B382B] text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#142A20] transition"
                >
                  Shop In Catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />

    </div>
  );
}