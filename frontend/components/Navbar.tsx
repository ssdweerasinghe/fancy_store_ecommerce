'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Truck, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  Home, 
  Layers, 
  Info, 
  Mail 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ThemeToggle from '@/components/ThemeToggle';

interface NavbarProps {
  onOpenQuiz?: () => void;
}

export default function Navbar({ onOpenQuiz }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { totalCartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/catalog', label: 'Catalog', icon: Layers },
    { href: '/track', label: 'Track Order', icon: Truck },
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/contact', label: 'Contact Us', icon: Mail },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Botanical Announcement Bar */}
      <div className="bg-[#142A20] text-[#EFE3C3] text-[11px] font-medium tracking-wider uppercase py-2 px-4 text-center border-b border-[#274B3B] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>Complimentary Skin Regimen Analysis & Islandwide Climate-Controlled Delivery</span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 dark:bg-[#0E1A14]/90 backdrop-blur-md border-b border-[#E8EFE9] dark:border-[#1E3628] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-[#142A20] text-[#EFE3C3] flex items-center justify-center font-serif font-black text-xl shadow-md border border-[#C5A059]/40 group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <span className="font-serif font-extrabold text-xl tracking-tight text-[#161D1A] dark:text-[#FBF9F5] block leading-none">
                Fancy Store
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">
                Botanical Science Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E8EFE9] dark:bg-[#1B382B] text-[#1B382B] dark:text-[#EFE3C3] shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-[#161D1A] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#152B20]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Theme Toggle (Light / Dark Mode Switcher) */}
            <ThemeToggle />

            {onOpenQuiz && (
              <button
                type="button"
                onClick={onOpenQuiz}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#C5A059]/50 text-[#1B382B] dark:text-[#EFE3C3] text-xs font-bold hover:bg-[#E8EFE9] dark:hover:bg-[#152B20] transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                Find My Routine
              </button>
            )}

            {/* Admin Dashboard Quick Access (Visible only to Admin Staff) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B382B] text-[#EFE3C3] text-[11px] font-bold uppercase tracking-wider border border-[#C5A059]/50 hover:bg-[#142A20] transition shadow-xs"
                title="Store Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account / Login Button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#1B382B] border border-[#E8EFE9] dark:border-[#274B3B] p-1 rounded-full pl-3 shadow-2xs">
                <Link
                  href="/account"
                  className="text-xs font-bold text-stone-800 dark:text-[#EFE3C3] hover:text-[#1B382B] dark:hover:text-white transition flex items-center gap-1.5"
                  title="My Account & Dispatches"
                >
                  <User className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{user.name?.split(' ')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/60 text-stone-400 hover:text-rose-700 dark:hover:text-rose-300 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8EFE9] dark:border-[#274B3B] bg-white dark:bg-[#1B382B] text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-[#1B382B] dark:hover:border-[#C5A059] transition shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1B382B] dark:bg-[#1E3E30] hover:bg-[#142A20] text-white text-xs font-bold tracking-wider transition shadow-md shadow-[#1B382B]/20 cursor-pointer"
              aria-label="Open Botanical Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C5A059] text-[#142A20] text-[10px] font-black flex items-center justify-center animate-in zoom-in-75">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-2xl border border-[#E8EFE9] dark:border-[#274B3B] bg-white dark:bg-[#1B382B] text-stone-700 dark:text-stone-200 hover:bg-stone-50 transition cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FBF9F5] dark:bg-[#0E1A14] border-b border-[#E8EFE9] dark:border-[#1E3628] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
            {onOpenQuiz && (
              <button
                type="button"
                onClick={() => {
                  onOpenQuiz();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#E8EFE9] dark:bg-[#1B382B] text-[#1B382B] dark:text-[#EFE3C3] text-xs font-bold cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Find My Routine
              </button>
            )}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#E8EFE9] dark:bg-[#1B382B] text-[#1B382B] dark:text-[#EFE3C3]'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#152B20]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A059]' : 'text-stone-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {isAdmin && (
              <div className="pt-2 border-t border-[#E8EFE9] dark:border-[#1E3628]">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1B382B] text-[#EFE3C3] text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059]" /> Store Control Center (Admin)
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider bg-[#C5A059] text-[#142A20] px-2 py-0.5 rounded-full font-black">
                    Staff
                  </span>
                </Link>
              </div>
            )}

            {user ? (
              <div className="pt-2 border-t border-[#E8EFE9] dark:border-[#1E3628] space-y-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1B382B] border border-[#E8EFE9] dark:border-[#274B3B] text-xs font-bold text-stone-800 dark:text-[#EFE3C3]"
                >
                  <User className="w-4 h-4 text-[#C5A059]" /> My Account ({user.name})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#E8EFE9] dark:border-[#1E3628]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#1B382B] text-white text-xs font-bold"
                >
                  <User className="w-4 h-4 text-[#C5A059]" /> Sign In / Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}