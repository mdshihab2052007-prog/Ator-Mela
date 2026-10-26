import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Sparkles, Eye, Info, Heart, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../shared/types.ts';
import { formatPrice, formatQuantity } from '../utils/formatters.ts';
import { LuxuryBottle, StarDivider } from './BrandVisuals.tsx';

export const ScentCollection: React.FC = () => {
  const {
    products,
    lang,
    addToCart,
    setSelectedProduct,
    offer,
    toggleWishlist,
    isInWishlist,
    setIsAiAdvisorOpen,
  } = useApp();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const isOfferActive = offer && offer.active && offer.claimed_count < offer.buyer_limit;

  const getQty = (productId: string) => quantities[productId] || 1;

  const setQty = (productId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, val) }));
  };

  const handleQuickAdd = (product: Product) => {
    const qty = getQty(product.id);
    addToCart(product.id, qty);
  };

  return (
    <section id="scents-collection-section" className="py-16 px-4 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center space-y-3 mb-8">
        <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'আমাদের আতর সংগ্রহ' : 'Our Signature Scents'}
        </h2>
        <p className="text-xs sm:text-sm text-[#A89A86] max-w-md mx-auto">
          {lang === 'bn'
            ? 'প্রতিটি আতর ৩ মিলি বোতলে খাঁটি তেল হিসেবে পরিবেশিত। কোনো অ্যালকোহল বা ভেজাল নেই।'
            : 'Each attar presented in a 3 mL flacon of pure concentrated perfume oil. 100% alcohol-free.'}
        </p>

        {/* AI Fragrance Sommelier Banner */}
        <div className="pt-2">
          <button
            onClick={() => setIsAiAdvisorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#1E1814] via-[#2A2016] to-[#1E1814] border border-[#C9A25A]/60 hover:border-[#E6C98A] text-[#E6C98A] text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <Wand2 size={14} className="text-[#C9A25A] group-hover:rotate-12 transition-transform" />
            <span>
              {lang === 'bn'
                ? '✨ নিশ্চিত নন কোনটি নেবেন? AI সুবাস পরামর্শীর সাহায্য নিন'
                : '✨ Not sure which to pick? Ask our AI Scent Sommelier'}
            </span>
          </button>
        </div>
      </div>

      {/* Horizontal snap scroll on mobile, 3-col grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-3 gap-6 overflow-x-auto sm:overflow-visible no-scrollbar snap-x snap-mandatory pb-4">
        {products.map((product, idx) => {
          const qty = getQty(product.id);
          const unitPrice = product.price_per_ml * product.bottle_ml;
          const freeBottlesEarned = isOfferActive ? Math.floor(qty / 2) : 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-[280px] sm:min-w-0 flex-1 snap-center bg-[#1E1814] border border-[#C9A25A]/30 hover:border-[#C9A25A] rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9A25A]/10 group relative"
            >
              {/* Accent gradient wash at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
                style={{
                  background: `linear-gradient(to top, ${product.accent_hex}, transparent)`,
                }}
              />

              {/* Card Header & Bottle Visual */}
              <div className="p-6 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#16120F] to-transparent">
                {/* Wishlist Heart Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className={`absolute top-3 left-3 z-20 p-2 rounded-full border transition-all active:scale-125 cursor-pointer ${
                    isInWishlist(product.id)
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-500 scale-110 shadow-md shadow-rose-500/20'
                      : 'bg-[#120E0B]/80 border-[#C9A25A]/30 text-[#A89A86] hover:text-rose-400 hover:border-rose-400/50'
                  }`}
                  aria-label="Toggle Wishlist"
                  title={isInWishlist(product.id) ? (lang === 'bn' ? 'পছন্দ থেকে সরান' : 'Remove from Wishlist') : (lang === 'bn' ? 'পছন্দের তালিকায় যোগ করুন' : 'Add to Wishlist')}
                >
                  <Heart size={16} className={isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''} />
                </button>

                {/* Offer badge on card */}
                {isOfferActive && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#C9A25A] text-[#120E0B] text-[10px] font-extrabold flex items-center gap-1 shadow-md font-hind">
                    <Sparkles size={11} />
                    <span>{lang === 'bn' ? '৬ মিলিতে ৩ মিলি ফ্রি' : 'Buy 6 mL Get 3 mL FREE'}</span>
                  </div>
                )}

                {/* Mood Tag */}
                <div
                  className="self-start mb-2 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: product.accent_hex,
                      borderColor: `${product.accent_hex}60`,
                      backgroundColor: `${product.accent_hex}15`,
                    }}
                  >
                    {lang === 'bn' ? product.mood_bn : product.mood_en}
                  </span>
                </div>

                {/* Bottle Visual with Ambient Glow */}
                <div
                  className="my-3 py-2 cursor-pointer group-hover:-translate-y-2 transition-transform duration-300"
                  onClick={() => setSelectedProduct(product)}
                >
                  <LuxuryBottle
                    accentHex={product.accent_hex}
                    name={product.name_en}
                    size="md"
                    glow={true}
                  />
                </div>

                {/* Name in both scripts */}
                <div className="text-center mt-2">
                  <h3 className="font-cormorant text-2xl font-bold text-[#F3EBDD] group-hover:text-[#E6C98A] transition-colors">
                    {lang === 'bn' ? product.name_bn : product.name_en}
                  </h3>
                  <p className="font-hind text-xs text-[#A89A86] mt-0.5">
                    {lang === 'bn' ? product.name_en : product.name_bn}
                  </p>
                </div>
              </div>

              {/* Card Body & Notes Chips */}
              <div className="px-5 pb-5 space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#A89A86] line-clamp-2 leading-relaxed font-hind">
                    {lang === 'bn' ? product.description_bn : product.description_en}
                  </p>

                  {/* Notes as 3 chips (Top · Heart · Base) */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#120E0B] border border-[#C9A25A]/20 text-[#F3EBDD] font-hind">
                      {lang === 'bn' ? product.top_notes_bn : product.top_notes_en}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#120E0B] border border-[#C9A25A]/20 text-[#E6C98A] font-hind">
                      {lang === 'bn' ? product.heart_notes_bn : product.heart_notes_en}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#120E0B] border border-[#C9A25A]/20 text-[#A89A86] font-hind">
                      {lang === 'bn' ? product.base_notes_bn : product.base_notes_en}
                    </span>
                  </div>
                </div>

                {/* Price, Stepper & Quick Add with 50 -> crossed -> 43 psychology */}
                <div className="pt-3 border-t border-[#C9A25A]/20 space-y-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      {/* Bottle Price */}
                      <div className="flex items-baseline gap-2 font-hind">
                        <span className="text-xs text-[#A89A86] line-through decoration-rose-400 decoration-[1.5px] opacity-75">
                          {formatPrice(150, lang)}
                        </span>
                        <span className="font-extrabold text-2xl text-[#E6C98A] tracking-tight">
                          {formatPrice(unitPrice, lang)}
                        </span>
                        <span className="text-[10px] text-[#A89A86]">
                          ({formatQuantity(product.bottle_ml, lang)} {lang === 'bn' ? 'মিলি' : 'mL'})
                        </span>
                      </div>

                      {/* Per-mL Psychology: 50 -> crossed -> 43 */}
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs font-hind">
                        <span className="text-[11px] text-[#A89A86]">{lang === 'bn' ? 'প্রতি মিলি:' : 'Per mL:'}</span>
                        <span className="text-[11px] line-through decoration-rose-400 decoration-[1.5px] text-[#A89A86] font-medium">
                          {formatPrice(50, lang)}
                        </span>
                        <span className="font-extrabold text-xs text-[#E6C98A]">
                          {formatPrice(43, lang)}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-500/25">
                          {lang === 'bn' ? 'সাশ্রয়ী' : 'SAVE'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-xs text-[#C9A25A] hover:text-[#E6C98A] flex items-center gap-1 font-medium mt-1 shrink-0"
                    >
                      <Eye size={13} />
                      <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                    </button>
                  </div>

                  {/* Stepper + Add CTA */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#C9A25A]/40 rounded-xl bg-[#120E0B] overflow-hidden">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="px-2.5 py-2 text-[#A89A86] hover:text-[#F3EBDD] hover:bg-[#1E1814]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2 font-manrope font-bold text-xs text-[#F3EBDD]">
                        {formatQuantity(qty, lang)}
                      </span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="px-2.5 py-2 text-[#A89A86] hover:text-[#F3EBDD] hover:bg-[#1E1814]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex-1 py-2.5 px-3 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>
                        {lang === 'bn' ? 'ব্যাগে নিন' : 'Add to Bag'}
                        {freeBottlesEarned > 0 && ` (+${formatQuantity(freeBottlesEarned, lang)} ফ্রি)`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
