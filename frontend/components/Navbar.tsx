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
  Home,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenQuiz?: () => void;
}

export default function Navbar({ onOpenQuiz }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalCartCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-6">
          
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
          <div className="flex items-center gap-2.5 sm:gap-3">
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#1B382B] border border-[#C4D7C8] hover:bg-[#dce7de] transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#C5A059]" />
                Find My Routine
              </button>
            )}

            {/* Account Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#142A20] text-[#EFE3C3] text-xs font-bold border border-[#C5A059]/40"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> Admin
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-stone-700 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                )}
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-full text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-stone-700 hover:text-[#1B382B] hover:bg-[#F3F6F4] transition"
              >
                <User className="w-4 h-4 text-[#1B382B]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Modern Curved "Cart" Pill Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-[#1B382B] hover:bg-[#142A20] text-white border border-[#C5A059]/40 transition shadow-md hover:shadow-lg shadow-[#1B382B]/10 active:scale-95 cursor-pointer group"
              aria-label="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#EFE3C3] group-hover:scale-110 transition-transform" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#C5A059] text-[#142A20] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wide text-white">Cart</span>
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
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                <User className="w-4 h-4 mr-2" /> Sign In / Register
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
}