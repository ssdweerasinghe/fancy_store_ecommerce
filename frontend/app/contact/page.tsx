'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h1 className="text-4xl font-serif font-extrabold text-stone-950 tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-2 text-stone-600 text-sm">
            Have questions about product ingredients, shipping, or need skin routine advice? Our team is here to assist[cite: 1, 2].
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Contact Information Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Email Us</h3>
              <p className="text-xs text-stone-500 mt-1">support@fancystore.lk</p>
              <p className="text-xs text-stone-400">Response within 24 hours</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Call / WhatsApp</h3>
              <p className="text-xs text-stone-500 mt-1">+94 77 123 4567</p>
              <p className="text-xs text-stone-400">Mon - Sat: 9:00 AM - 6:00 PM</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-stone-900">Store Location</h3>
              <p className="text-xs text-stone-500 mt-1">Fancy Store HQ, Colombo, Sri Lanka</p>
              <p className="text-xs text-stone-400">Islandwide Courier Dispatch</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-xl font-serif font-bold text-stone-950">Message Received</h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto">
                  Thank you for reaching out to Fancy Store. A skincare specialist will review your inquiry and follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-stone-950 text-white text-xs font-semibold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarodye Weerasinghe"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-rose-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-rose-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Subject / Concern
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Question about Collagen Eye Mask ingredients"
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-rose-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write your questions or order details here..."
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-rose-600 transition"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-stone-950 hover:bg-rose-900 text-white font-semibold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}