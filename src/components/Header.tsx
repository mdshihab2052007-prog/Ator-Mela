import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, User as UserIcon, Heart, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { BrandLogo } from './BrandVisuals.tsx';
import { toBanglaDigits } from '../utils/formatters.ts';

export const Header: React.FC = () => {
  const {
    lang,
    setLang,
    calculation,
    setIsCartOpen,
    setIsTrackingOpen,
    settings,
    wishlist,
    setIsWishlistOpen,
    setIsAiAdvisorOpen,
  } = useApp();
  const { user, userProfile, openAuthModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBounced, setBadgeBounced] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalBottles = calculation?.totalBottles || 0;

  useEffect(() => {
    if (totalBottles > 0) {
      setBadgeBounced(true);
      const timer = setTimeout(() => setBadgeBounced(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalBottles]);

  const fbUrl = settings?.fb_page_url || 'https://www.facebook.com/share/1F2jSKW9VL/';

  return (
    <header
      className={`sticky top-[34px] sm:top-[36px] z-30 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#120E0B]/95 backdrop-blur-md border-b border-[#C9A25A]/25 py-2.5 shadow-xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <BrandLogo
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="scale-95 sm:scale-100 origin-left"
        />

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Facebook Link (desktop only to prevent mobile overflow; mobile has floating FB) */}
          {fbUrl && (
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#A89A86] hover:text-[#1877F2] px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#C9A25A]/20 hover:border-[#1877F2]/50 bg-[#1E1814]/70 transition-all"
              title={lang === 'bn' ? 'ফেসবুক পেজ' : 'Facebook Page'}
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="hidden sm:inline font-medium">
                {lang === 'bn' ? 'ফেসবুক' : 'Facebook'}
              </span>
            </a>
          )}

          {/* Account / Sign In Button */}
          <button
            onClick={() => openAuthModal(user ? 'profile' : 'login')}
            className="flex items-center gap-1 text-xs text-[#A89A86] hover:text-[#E6C98A] p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#C9A25A]/20 hover:border-[#C9A25A]/50 bg-[#1E1814]/70 transition-all cursor-pointer"
            title={user ? (lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account') : (lang === 'bn' ? 'সাইন ইন / সাইন আপ' : 'Sign In / Sign Up')}
          >
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-4 h-4 rounded-full border border-amber-500/50" />
            ) : (
              <UserIcon size={15} className="text-[#C9A25A]" />
            )}
            <span className="hidden sm:inline font-medium">
              {user
                ? userProfile?.displayName?.split(' ')[0] || (lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account')
                : lang === 'bn'
                ? 'লগইন'
                : 'Sign In'}
            </span>
          </button>

          {/* Track Order button (hidden on mobile, available in footer) */}
          <button
            onClick={() => setIsTrackingOpen(true)}
            className="hidden md:flex items-center gap-1.5 text-xs text-[#A89A86] hover:text-[#E6C98A] px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#C9A25A]/30 transition-all cursor-pointer"
            title={lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
          >
            <Package size={15} className="text-[#C9A25A]" />
            <span className="font-medium">
              {lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}
            </span>
          </button>

          {/* AI Scent Consultant Button (hidden on mobile header; mobile has floating button) */}
          <button
            onClick={() => setIsAiAdvisorOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#E6C98A] hover:text-[#FFF] px-2.5 py-1.5 rounded-lg border border-[#C9A25A]/50 bg-gradient-to-r from-[#1E1814] to-[#2A2016] hover:border-[#C9A25A] shadow-sm transition-all cursor-pointer group"
            title={lang === 'bn' ? 'AI সুবাস পরামর্শী' : 'AI Scent Advisor'}
          >
            <Wand2 size={14} className="text-[#C9A25A] group-hover:rotate-12 transition-transform" />
            <span className="font-bold">
              {lang === 'bn' ? 'AI সুবাস' : 'AI Match'}
            </span>
          </button>

          {/* Wishlist Icon Button with count badge */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-1.5 sm:p-2 bg-[#1E1814] hover:bg-[#2A221C] border border-[#C9A25A]/30 hover:border-rose-400/60 rounded-xl text-[#F3EBDD] transition-all cursor-pointer group active:scale-95"
            aria-label="View Wishlist"
            title={lang === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}
          >
            <Heart size={16} className="text-rose-400 group-hover:scale-110 transition-transform sm:w-[18px] sm:h-[18px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-manrope font-extrabold text-[10px] flex items-center justify-center shadow-md">
                {lang === 'bn' ? toBanglaDigits(wishlist.length) : wishlist.length}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-[#1E1814] border border-[#C9A25A]/30 rounded-lg p-0.5">
            <button
              onClick={() => setLang('bn')}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                lang === 'bn'
                  ? 'bg-[#C9A25A] text-[#120E0B]'
                  : 'text-[#A89A86] hover:text-[#F3EBDD]'
              }`}
            >
              বাং
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#C9A25A] text-[#120E0B]'
                  : 'text-[#A89A86] hover:text-[#F3EBDD]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart Icon with bouncing count badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-[#1E1814] hover:bg-[#2A221C] border border-[#C9A25A]/35 hover:border-[#C9A25A] rounded-xl text-[#F3EBDD] transition-all cursor-pointer group active:scale-95"
            aria-label="View shopping bag"
          >
            <ShoppingBag size={20} className="group-hover:text-[#E6C98A] transition-colors" />
            {totalBottles > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C9A25A] text-[#120E0B] font-manrope font-extrabold text-[11px] flex items-center justify-center shadow-md transition-transform ${
                  badgeBounced ? 'scale-125' : 'scale-100'
                }`}
              >
                {lang === 'bn' ? toBanglaDigits(totalBottles) : totalBottles}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

