'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Consultation Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#161D1A] font-sans antialiased selection:bg-[#E8EFE9] selection:text-[#1B382B]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="w-12 h-12 rounded-2xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-3 border border-[#C4D7C8]">
            <Sparkles className="w-6 h-6 text-[#C5A059]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#161D1A]">
            Consult Our Botanical Specialists
          </h1>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Have questions regarding skin barrier compatibility, clinical hydrogel eye therapies, 
            or corporate bespoke orders? Our dermal advisory team is available to guide you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8EFE9] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif font-bold text-lg text-[#161D1A]">
                Fancy Store Headquarters
              </h3>

              <div className="flex items-start gap-3.5 text-xs text-stone-600">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 block">Climate-Controlled Warehouse</strong>
                  <span>Level 4, Science & Innovation Tower, Colombo 03, Sri Lanka</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-stone-600">
                <Phone className="w-4 h-4 text-[#1B382B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 block">Dermal Advisory Hotline</strong>
                  <span>+94 11 234 5678 / +94 77 123 4567</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-stone-600">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 block">Scientific Correspondence</strong>
                  <span>concierge@fancystore.lk</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-stone-600">
                <Clock className="w-4 h-4 text-[#1B382B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-800 block">Operating Hours</strong>
                  <span>Monday – Saturday: 9:00 AM – 7:00 PM (IST)</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#E8EFE9]/60 rounded-3xl border border-[#C4D7C8] flex items-center gap-3 text-xs text-[#1B382B]">
              <ShieldCheck className="w-6 h-6 text-[#1B382B] shrink-0" />
              <span>
                All inquiries are answered directly by certified cosmetic science researchers within 24 hours.
              </span>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8EFE9] p-6 sm:p-10 shadow-xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-xl font-serif font-bold text-[#161D1A] mb-2">
                  Send A Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Sarodye Weerasinghe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Subject / Concern Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B] font-medium text-stone-800"
                  >
                    <option value="Consultation Inquiry">Custom Routine & Regimen Advice</option>
                    <option value="Order Tracking">Courier & Dispatch Inquiry</option>
                    <option value="Ingredient Safety">Ingredient Profile & Allergen Safety</option>
                    <option value="Corporate Order">Wholesale / Corporate Gifting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your dermal condition, order query, or question in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8EFE9] bg-stone-50 focus:bg-white focus:outline-[#1B382B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#1B382B] hover:bg-[#142A20] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#1B382B]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#C5A059]" />
                  <span>Transmit Message</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-[#1B382B] flex items-center justify-center mx-auto mb-4 border border-[#C4D7C8]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#161D1A]">
                  Message Dispatched
                </h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto">
                  Thank you, {formData.name}. Our research team has received your message regarding <strong>{formData.subject}</strong> and will respond to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-[#1B382B] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Send Another Message
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}