import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Sparkles, Clock, HeartHandshake, Layers, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../shared/types.ts';
import { formatPrice, formatQuantity } from '../utils/formatters.ts';
import { LuxuryBottle, StarOrnament } from './BrandVisuals.tsx';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    lang,
    products,
    offer,
    toggleWishlist,
    isInWishlist,
  } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const isOfferActive = offer && offer.active && offer.claimed_count < offer.buyer_limit;

  // Compute free bottles if offer active (Buy 2 get 1 free)
  const freeBottles = isOfferActive ? Math.floor(quantity / 2) : 0;
  const unitPrice = product.price_per_ml * product.bottle_ml;
  const totalPrice = quantity * unitPrice;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    setSelectedProduct(null);
  };

  const otherProducts = products.filter((p) => p.id !== product.id && p.active);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-[#120E0B] border border-[#C9A25A]/40 rounded-2xl shadow-2xl overflow-hidden relative my-auto"
        role="dialog"
        aria-modal="true"
        aria-label={product.name_en}
      >
        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-4 right-14 z-20 p-2 rounded-full border transition-all cursor-pointer ${
            isInWishlist(product.id)
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-500'
              : 'bg-[#1E1814]/80 text-[#A89A86] hover:text-rose-400 border-[#C9A25A]/20'
          }`}
          aria-label="Toggle Wishlist"
          title={isInWishlist(product.id) ? (lang === 'bn' ? 'পছন্দ থেকে সরান' : 'Remove from Wishlist') : (lang === 'bn' ? 'পছন্দের তালিকায় যোগ করুন' : 'Add to Wishlist')}
        >
          <Heart size={20} className={isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-[#1E1814]/80 text-[#A89A86] hover:text-[#F3EBDD] rounded-full border border-[#C9A25A]/20 transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Visual Showcase Side (5 cols) */}
          <div
            className="md:col-span-5 p-6 flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${product.accent_hex}33 0%, #120E0B 75%)`,
            }}
          >
            {/* Ambient liquid glow */}
            <div
              className="absolute w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: product.accent_hex }}
            />

            <LuxuryBottle
              accentHex={product.accent_hex}
              name={product.name_en}
              size="lg"
              className="my-auto drop-shadow-2xl"
            />

            {/* Launch Offer Badge */}
            {isOfferActive && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/50 text-[#E6C98A] text-xs font-semibold font-hind">
                <Sparkles size={13} className="text-[#C9A25A]" />
                <span>{lang === 'bn' ? '৬ মিলি কিনলে ৩ মিলি ফ্রি অফার' : 'Buy 6 mL Get 3 mL Free Offer'}</span>
              </div>
            )}
          </div>

          {/* Details Side (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-[#1A1410] border-t md:border-t-0 md:border-l border-[#C9A25A]/25">
            <div className="space-y-4">
              {/* Scent Mood & Title */}
              <div>
                <span
                  className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full inline-block border font-hind"
                  style={{
                    color: product.accent_hex,
                    borderColor: `${product.accent_hex}55`,
                    backgroundColor: `${product.accent_hex}15`,
                  }}
                >
                  {lang === 'bn' ? product.mood_bn : product.mood_en}
                </span>

                <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#F3EBDD] mt-1.5">
                  {lang === 'bn' ? product.name_bn : product.name_en}
                </h1>
                <p className="font-hind text-sm text-[#C9A25A]">
                  {lang === 'bn' ? product.name_en : product.name_bn}
                </p>
              </div>

              {/* Price & Bottle info with 50 -> crossed -> 43 psychology */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#C9A25A]/20">
                <div className="flex items-baseline gap-2.5 font-hind">
                  <span className="text-base sm:text-lg text-[#A89A86] line-through decoration-rose-400 decoration-[1.5px] opacity-75">
                    {formatPrice(150, lang)}
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#E6C98A] tracking-tight">
                    {formatPrice(unitPrice, lang)}
                  </span>
                  <span className="text-xs text-[#A89A86]">
                    ({formatQuantity(product.bottle_ml, lang)} {lang === 'bn' ? 'মিলি বোতল' : 'mL bottle'})
                  </span>
                </div>

                {/* Per-mL Price Tag with Strikethrough 50 to 43 */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#120E0B] border border-[#C9A25A]/35 text-xs shadow-xs font-hind">
                  <span className="text-[#A89A86] text-[11px]">{lang === 'bn' ? 'প্রতি মিলি:' : 'Per mL:'}</span>
                  <span className="line-through decoration-rose-400 decoration-[1.5px] text-[#A89A86] font-medium text-xs">
                    {formatPrice(50, lang)}
                  </span>
                  <span className="font-extrabold text-sm text-[#E6C98A]">
                    {formatPrice(43, lang)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-400 font-bold border border-emerald-500/30">
                    {lang === 'bn' ? 'সাশ্রয়ী মূল্য' : '14% OFF'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#F3EBDD]/90 leading-relaxed font-normal">
                {lang === 'bn' ? product.description_bn : product.description_en}
              </p>

              {/* Fragrance Notes Pyramid Graphic */}
              <div className="bg-[#120E0B] p-4 rounded-xl border border-[#C9A25A]/25 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-[#C9A25A] font-semibold uppercase tracking-wider mb-2">
                  <Layers size={14} />
                  <span>{lang === 'bn' ? 'ঘ্রাণের সুর ও নোটস (Notes)' : 'Fragrance Notes Pyramid'}</span>
                </div>

                {/* Top Note */}
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-16 text-[#A89A86] shrink-0 font-medium">
                    {lang === 'bn' ? 'টপ নোট:' : 'Top Notes:'}
                  </span>
                  <span className="text-[#F3EBDD]">
                    {lang === 'bn' ? product.top_notes_bn : product.top_notes_en}
                  </span>
                </div>

                {/* Heart Note */}
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-16 text-[#A89A86] shrink-0 font-medium">
                    {lang === 'bn' ? 'হার্ট নোট:' : 'Heart Notes:'}
                  </span>
                  <span className="text-[#F3EBDD] font-medium">
                    {lang === 'bn' ? product.heart_notes_bn : product.heart_notes_en}
                  </span>
                </div>

                {/* Base Note */}
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-16 text-[#A89A86] shrink-0 font-medium">
                    {lang === 'bn' ? 'বেস নোট:' : 'Base Notes:'}
                  </span>
                  <span className="text-[#F3EBDD]">
                    {lang === 'bn' ? product.base_notes_bn : product.base_notes_en}
                  </span>
                </div>
              </div>

              {/* Longevity & Occasions */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.longevity_bn && (
                  <div className="p-2.5 bg-[#120E0B]/80 rounded-lg border border-[#C9A25A]/15 flex items-center gap-2 text-[#A89A86]">
                    <Clock size={15} className="text-[#C9A25A] shrink-0" />
                    <span>
                      {lang === 'bn' ? 'স্থায়িত্ব: ' : 'Longevity: '}
                      <strong className="text-[#F3EBDD] font-normal">
                        {lang === 'bn' ? product.longevity_bn : product.longevity_en}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="p-2.5 bg-[#120E0B]/80 rounded-lg border border-[#C9A25A]/15 flex items-center gap-2 text-[#A89A86]">
                  <HeartHandshake size={15} className="text-[#C9A25A] shrink-0" />
                  <span className="truncate">
                    {lang === 'bn' ? product.occasions_bn : product.occasions_en}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper with Live Calculation and Free Bottles Notice */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 bg-[#120E0B] rounded-xl border border-[#C9A25A]/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#A89A86]">
                      {lang === 'bn' ? 'বোতলের সংখ্যা:' : 'Quantity:'}
                    </span>
                    <div className="flex items-center border border-[#C9A25A]/40 rounded-lg overflow-hidden bg-[#1E1814]">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1.5 text-[#A89A86] hover:text-[#F3EBDD]"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 font-manrope font-bold text-sm text-[#F3EBDD]">
                        {formatQuantity(quantity, lang)}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-2.5 py-1.5 text-[#A89A86] hover:text-[#F3EBDD]"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#E6C98A] font-manrope block">
                      {formatPrice(totalPrice, lang)}
                    </span>
                    {freeBottles > 0 && (
                      <span className="text-[11px] text-emerald-400 font-semibold block">
                        + {formatQuantity(freeBottles, lang)}{' '}
                        {lang === 'bn' ? 'টি ফ্রি বোতল' : 'Free Bottle'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag size={18} />
                <span>
                  {lang === 'bn'
                    ? `কার্টে যোগ করুন (${formatPrice(totalPrice, 'bn')})`
                    : `Add to Cart (${formatPrice(totalPrice, 'en')})`}
                </span>
              </button>

              {/* Other Scents Row */}
              {otherProducts.length > 0 && (
                <div className="pt-3 border-t border-[#C9A25A]/20">
                  <span className="text-xs text-[#A89A86] mb-2 block font-medium">
                    {lang === 'bn' ? 'অন্যান্য ঘ্রাণ দেখুন:' : 'Explore other scents:'}
                  </span>
                  <div className="flex gap-2">
                    {otherProducts.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => {
                          setSelectedProduct(op);
                          setQuantity(1);
                        }}
                        className="flex-1 p-2 bg-[#120E0B] hover:bg-[#1E1814] border border-[#C9A25A]/25 rounded-lg text-left transition-colors flex items-center gap-2 group"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: op.accent_hex }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#F3EBDD] block truncate group-hover:text-[#E6C98A]">
                            {lang === 'bn' ? op.name_bn : op.name_en}
                          </span>
                          <span className="text-[10px] text-[#A89A86] block">৳129</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
