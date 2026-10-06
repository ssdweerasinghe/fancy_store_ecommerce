import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#142A20] text-emerald-100/70 text-xs pt-16 pb-12 border-t border-[#1B382B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <span className="text-xl font-serif font-extrabold text-white block mb-2">Fancy Store</span>
          <p className="text-emerald-100/60 leading-relaxed text-xs">
            A specialized skincare destination offering hydrogel eye gels, lip care treatments, targeted sheet masks, and botanical hand creams formulated for radiant skin.
          </p>
        </div>

        <div>
          <h4 className="text-[#C5A059] font-semibold text-xs uppercase tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2.5">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/catalog" className="hover:text-white transition">Catalog & Formulations</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About Our Science</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#C5A059] font-semibold text-xs uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2.5">
            <li><Link href="/catalog?category=eye-care" className="hover:text-white transition">Marine Collagen Eye Gels</Link></li>
            <li><Link href="/catalog?category=lip-care" className="hover:text-white transition">Lip Hydration Patches</Link></li>
            <li><Link href="/catalog?category=sheet-masks" className="hover:text-white transition">Fancy Aura Sheet Treatments</Link></li>
            <li><Link href="/catalog?category=sleeping-masks" className="hover:text-white transition">Freeze-Dried Night Pods</Link></li>
            <li><Link href="/catalog?category=hand-creams" className="hover:text-white transition">Botanical Hand Creams</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[#C5A059] font-semibold text-xs uppercase tracking-wider mb-4">Botanical Bulletin</h4>
          <p className="text-emerald-100/60 mb-3">Join to receive custom routine advice and new batch alerts.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-[#1A3428] border border-[#274B3B] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C5A059] w-full"
            />
            <button className="bg-[#C5A059] hover:bg-[#b08e4c] text-[#142A20] px-3 py-2 rounded-xl font-bold cursor-pointer transition">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-[#1F3D2F] text-center text-emerald-200/40">
        <p>© 2026 Fancy Store Botanical Care. All rights reserved.</p>
      </div>
    </footer>
  );
}