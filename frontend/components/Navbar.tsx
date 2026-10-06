'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  ShoppingBag, 
  Menu, 
  X, 
  Layers, 
  Info, 
  Mail, 
  Home
} from 'lucide-react';

interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenQuiz?: () => void;
}

export default function Navbar({ cartCount = 0, onOpenCart, onOpenQuiz }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4 mr-1.5" /> },
    { name: 'Catalog', href: '/catalog', icon: <Layers className="w-4 h-4 mr-1.5" /> },
    { name: 'About Us', href: '/about', icon: <Info className="w-4 h-4 mr-1.5" /> },
    { name: 'Contact Us', href: '/contact', icon: <Mail className="w-4 h-4 mr-1.5" /> },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#142A20] text-emerald-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-emerald-900/40">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>Complimentary Skin Regimen Analysis & Islandwide Climate-Controlled Delivery</span>
      </div>

      {/* Main Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#E8EFE9] shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1B382B] flex items-center justify-center text-white shadow-md shadow-[#1B382B]/20 group-hover:scale-105 transition-transform border border-[#C5A059]/30">
              <span className="font-serif font-black text-xl tracking-tighter text-[#EFE3C3]">F</span>
            </div>
            <div>
              <span className="text-2xl font-serif font-extrabold tracking-tight text-[#161D1A] block leading-none">
                Fancy Store
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-[#C5A059]">
                Botanical Science Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3F6F4] p-1.5 rounded-full border border-[#E3ECE5]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-white text-[#1B382B] shadow-xs' 
                      : 'text-stone-600 hover:text-[#1B382B] hover:bg-white/60'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#1B382B] border border-[#C4D7C8] hover:bg-[#dce7de] transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
                Find My Routine
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-[#F3F6F4] hover:bg-[#E8EFE9] text-[#161D1A] transition cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#1B382B]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C5A059] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8EFE9] bg-white px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-[#E8EFE9] text-[#1B382B] font-bold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
            {onOpenQuiz && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuiz();
                }}
                className="w-full mt-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-semibold bg-[#1B382B] text-white shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#C5A059]" />
                Skin Diagnostic Quiz
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}