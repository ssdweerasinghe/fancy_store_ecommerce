'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag 
} from 'lucide-react';
import { getRoutineRecommendation, Product } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { getProductImage } from '@/app/catalog/page';

interface RoutineQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RoutineStep {
  step_number: number;
  step_name: string;
  product: Product;
}

interface RoutineRecommendation {
  steps: RoutineStep[];
  total_price: number | string;
}

export default function RoutineQuizModal({ isOpen, onClose }: RoutineQuizModalProps) {
  const { addToCart, setIsCartOpen } = useCart();

  const [step, setStep] = useState<number>(1);
  const [skinType, setSkinType] = useState<string>('dry');
  const [concern, setConcern] = useState<string>('dehydration');
  const [texturePreference, setTexturePreference] = useState<string>('gel');

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<RoutineRecommendation | null>(null);

  if (!isOpen) return null;

  const handleFetchRoutine = async () => {
    setLoading(true);
    const res = await getRoutineRecommendation(skinType, concern);
    setLoading(false);

    if (res.success && res.data) {
      setRecommendation(res.data);
      setStep(4);
    } else {
      alert(res.message || 'Unable to build routine. Please try again.');
    }
  };

  const handleAddAllToCart = () => {
    if (!recommendation?.steps) return;
    recommendation.steps.forEach((st: { product: Product }) => {
      addToCart(st.product);
    });
    onClose();
    setIsCartOpen(true);
  };

  const handleReset = () => {
    setStep(1);
    setRecommendation(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142A20]/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FBF9F5] border border-[#E8EFE9] rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-[#161D1A] p-1 rounded-full hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step < 4 ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-2 border border-[#C4D7C8]">
                <Sparkles className="w-6 h-6 text-[#C5A059]" />
              </div>
              <h3 className="text-2xl font-serif font-extrabold text-[#161D1A]">
                Algorithmic Routine Consultation
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Step {step} of 3 • Custom formulation protocol tailored to your dermal profile
              </p>
            </div>

            {/* Stepper Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dot === step ? 'w-8 bg-[#1B382B]' : 'w-2 bg-stone-300'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Skin Profile */}
            {step === 1 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select your primary skin condition:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dry', title: 'Dry & Flaky', desc: 'Tightness, rough patches, requires lipid repair' },
                    { id: 'oily', title: 'Oily & Congested', desc: 'Excess sebum, enlarged pores, prone to shine' },
                    { id: 'sensitive', title: 'Sensitive & Reactive', desc: 'Redness, flushing, easily irritated' },
                    { id: 'aging', title: 'Aging & Fine Lines', desc: 'Loss of elasticity, orbital crow’s feet' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSkinType(item.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        skinType === item.id
                          ? 'border-[#1B382B] bg-[#E8EFE9] shadow-xs'
                          : 'border-[#E8EFE9] bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="font-serif font-bold text-xs text-[#161D1A] block">{item.title}</span>
                      <span className="text-[10px] text-stone-500 mt-1 block leading-tight">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Primary Focus / Concern */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Select your top cosmetic concern:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'dark circles', title: 'Orbital Fatigue', desc: 'Under-eye hollows, dark shadows & puffiness' },
                    { id: 'dehydration', title: 'Deep Dehydration', desc: 'Dull texture, compromised skin barrier' },
                    { id: 'redness', title: 'Facial Redness', desc: 'Stinging sensation, environmental stress' },
                    { id: 'dry lips', title: 'Chapped Cuticles', desc: 'Cracked lip barrier, peeling flakes' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setConcern(item.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        concern === item.id
                          ? 'border-[#1B382B] bg-[#E8EFE9] shadow-xs'
                          : 'border-[#E8EFE9] bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="font-serif font-bold text-xs text-[#161D1A] block">{item.title}</span>
                      <span className="text-[10px] text-stone-500 mt-1 block leading-tight">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Texture Preference */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Preferred active texture & absorption rate:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'gel', title: 'Cooling Hydrogel', desc: 'Instant orbital depuffing, water-burst finish' },
                    { id: 'cream', title: 'Nourishing Balm', desc: 'Rich lipid-sealing barrier, overnight restoration' },
                    { id: 'sheet', title: 'Bio-Cellulose Matrix', desc: 'High-adhesion serum saturation' },
                    { id: 'jelly', title: 'Freeze-Dried Jelly', desc: 'Lightweight overnight sleeping pod' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTexturePreference(item.id)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        texturePreference === item.id
                          ? 'border-[#1B382B] bg-[#E8EFE9] shadow-xs'
                          : 'border-[#E8EFE9] bg-white hover:border-stone-300'
                      }`}
                    >
                      <span className="font-serif font-bold text-xs text-[#161D1A] block">{item.title}</span>
                      <span className="text-[10px] text-stone-500 mt-1 block leading-tight">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#E8EFE9]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E8EFE9] bg-white text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1B382B] hover:bg-[#142A20] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFetchRoutine}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                >
                  {loading ? 'Formulating Regimen...' : 'Calculate Regimen'}
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Step 4: Regimen Consultation Results View */
          <div>
            <div className="text-center mb-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A059] block mb-1">
                Precision Protocol Generated
              </span>
              <h3 className="text-2xl font-serif font-extrabold text-[#161D1A]">
                Your 3-Step Botanical Routine
              </h3>
              <p className="text-xs text-stone-500 mt-1 capitalize">
                Profile: {skinType} Skin • Focus: {concern}
              </p>
            </div>

            {/* Routine Steps List */}
            <div className="space-y-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
              {recommendation?.steps?.map((st) => {
                const img = getProductImage(st.product);
                return (
                  <div
                    key={st.step_number}
                    className="p-3.5 rounded-2xl bg-white border border-[#E8EFE9] flex items-center gap-3 shadow-2xs"
                  >
                    <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-[#E8EFE9]">
                      <img src={img} alt={st.product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block leading-none mb-1">
                        Step 0{st.step_number} • {st.step_name}
                      </span>
                      <h4 className="font-bold text-stone-900 truncate">{st.product.name}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{st.product.benefits}</p>
                    </div>

                    <span className="font-serif font-extrabold text-[#1B382B] text-xs shrink-0">
                      LKR {Number(st.product.price).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total & Action */}
            <div className="p-4 rounded-2xl bg-[#E8EFE9] border border-[#C4D7C8] mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-600 block">Complete Protocol Price</span>
                <span className="text-[10px] text-emerald-800 font-semibold">Includes Free Islandwide Shipping</span>
              </div>
              <span className="text-xl font-serif font-extrabold text-[#1B382B]">
                LKR {Number(recommendation?.total_price || 0).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-3 rounded-2xl bg-white border border-[#E8EFE9] text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
              >
                Retake Quiz
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="py-3 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A059]" /> Add All to Basket
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}