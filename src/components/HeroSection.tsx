import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { LuxuryBottle, StarOrnament } from './BrandVisuals.tsx';
import { WhirlingStage } from './WhirlingStage.tsx';

export const HeroSection: React.FC = () => {
  const { lang, setIsCartOpen, setSelectedProduct, products, addToCart } = useApp();

  const scrollToProducts = () => {
    const el = document.getElementById('scents-collection-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToOffer = () => {
    const el = document.getElementById('launch-offer-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] sm:min-h-[85vh] flex flex-col justify-center overflow-hidden pt-4 pb-12 px-4">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-[#B8741A]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] rounded-full bg-[#6E1423]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] rounded-full bg-[#D9B865]/15 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left / Top: Copy and CTAs (7 cols) with subtle reveal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 text-center lg:text-left space-y-5"
        >
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1814] border border-[#C9A25A]/40 text-xs text-[#E6C98A] shadow-xs">
            <StarOrnament size={12} />
            <span className="font-tiro font-semibold">
              {lang === 'bn' ? 'খাঁটি ঘ্রাণ, সাশ্রয়ী দামে' : 'Pure scent, honest price'}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F3EBDD] leading-[1.15]">
            {lang === 'bn' ? (
              <>
                আতরের মেলা, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6C98A] via-[#C9A25A] to-[#B8741A]">
                  এক জায়গায়
                </span>
              </>
            ) : (
              <>
                A Fair of <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6C98A] via-[#C9A25A] to-[#B8741A]">
                  Fine Arabian Attars
                </span>
              </>
            )}
          </h1>

          {/* Subtitle / Promise */}
          <p className="text-sm sm:text-base text-[#A89A86] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            {lang === 'bn'
              ? 'রাজকীয় এহসাস আল আরাবিয়া, মোহময় ভ্যাম্পায়ার ব্লাড ও স্নিগ্ধ আরুসা — প্রিমিয়াম খাঁটি পারফিউম অয়েল যা সারাদিন আপনার সঙ্গ দেবে।'
              : 'Ehsas Al Arabia, Vampire Blood and Aroosah — crafted pure perfume oils that linger with dignity, without luxury markups.'}
          </p>

          {/* Price Line Callout with Anchor Price Psychology: 50 -> crossed -> 43 */}
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs sm:text-sm text-[#F3EBDD] bg-[#1E1814]/95 border border-[#C9A25A]/40 rounded-xl px-4 py-2.5 shadow-lg">
            <div className="flex items-baseline gap-1.5 font-manrope">
              <span className="text-xs text-[#A89A86] line-through decoration-rose-400 decoration-[1.5px] opacity-80" title={lang === 'bn' ? 'নিয়মিত মূল্য' : 'Regular price'}>
                {lang === 'bn' ? '৳150' : 'Tk 150'}
              </span>
              <span className="font-extrabold text-base text-[#E6C98A]">
                {lang === 'bn' ? '3 মিলি ৳129' : '3 mL Tk 129'}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#120E0B] border border-[#C9A25A]/30 text-xs">
              <span className="text-[#A89A86] text-[11px]">{lang === 'bn' ? 'মিলি:' : 'mL:'}</span>
              <span className="font-manrope line-through decoration-rose-400 decoration-[1.5px] text-[#A89A86] font-medium text-[11px]">
                {lang === 'bn' ? '৳50' : 'Tk 50'}
              </span>
              <span className="font-manrope font-extrabold text-[#E6C98A] text-xs">
                {lang === 'bn' ? '৳43' : 'Tk 43'}
              </span>
              <span className="text-[10px] px-1 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/20">
                {lang === 'bn' ? 'সাশ্রয়ী' : 'SAVE'}
              </span>
            </div>

            <span className="text-[#C9A25A]">·</span>
            <span className="text-[#A89A86]">
              {lang === 'bn' ? 'ডেলিভারি ৳30' : 'Delivery Tk 30'}
            </span>
            <span className="text-[#C9A25A]">·</span>
            <span className="text-emerald-400 font-medium">
              {lang === 'bn' ? '10 মিলির বেশি নিলে ডেলিভারি ফ্রি' : 'Free above 10 mL'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={scrollToOffer}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-bold text-sm sm:text-base rounded-xl transition-all shadow-xl hover:shadow-[#C9A25A]/25 flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
            >
              <ShoppingBag size={18} />
              <span>{lang === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#120E0B]/20 text-[#120E0B]">
                {lang === 'bn' ? '2+1 ফ্রি অফার' : '2+1 Offer'}
              </span>
            </button>

            <button
              onClick={scrollToProducts}
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-[#1E1814] text-[#E6C98A] hover:text-[#F3EBDD] border border-[#C9A25A]/50 hover:border-[#C9A25A] font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{lang === 'bn' ? 'ঘ্রাণগুলো দেখুন' : 'Explore Scents'}</span>
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2 text-[11px] text-[#A89A86]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#C9A25A]" />
              {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
            </span>
            <span>•</span>
            <span>{lang === 'bn' ? '100% অ্যালকোহল মুক্ত' : '100% Alcohol-Free'}</span>
            <span>•</span>
            <span>{lang === 'bn' ? 'রাজশাহী ও চাঁপাইনবাবগঞ্জ' : 'Rajshahi & Chapai'}</span>
          </div>
        </motion.div>

        {/* Right: Interactive 3D Whirling Perfume Stage with subtle fade-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex items-center justify-center relative py-2 sm:py-6 w-full"
        >
          <WhirlingStage
            products={products}
            onSelectProduct={setSelectedProduct}
            onAddToCart={addToCart}
          />
        </motion.div>
      </div>
    </section>
  );
};
