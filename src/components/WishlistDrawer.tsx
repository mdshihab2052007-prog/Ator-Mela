import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice } from '../utils/formatters.ts';
import { StarOrnament } from './BrandVisuals.tsx';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    products,
    addToCart,
    lang,
    setSelectedProduct,
  } = useApp();

  if (!isWishlistOpen) return null;

  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishedProducts.forEach((prod) => {
      addToCart(prod.id, 1);
    });
    setIsWishlistOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
      <div
        className="w-full max-w-md bg-[#120E0B] border-l border-[#C9A25A]/40 h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist Drawer"
      >
        {/* Header */}
        <div className="bg-[#1E1814] border-b border-[#C9A25A]/30 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Heart size={18} className="fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-bold text-[#F3EBDD] flex items-center gap-2">
                <span>{lang === 'bn' ? 'আমার পছন্দের তালিকা' : 'My Wishlist'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A25A]/20 text-[#E6C98A] font-manrope font-bold">
                  {wishedProducts.length}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#120E0B] transition-colors cursor-pointer"
            aria-label="Close Wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishedProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1E1814] border border-[#C9A25A]/30 flex items-center justify-center text-[#A89A86] mx-auto">
                <Heart size={28} />
              </div>
              <h3 className="font-cormorant text-xl font-bold text-[#F3EBDD]">
                {lang === 'bn' ? 'পছন্দের তালিকা খালি' : 'Your Wishlist is Empty'}
              </h3>
              <p className="text-xs text-[#A89A86] max-w-xs mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার প্রিয় আতরগুলো হৃদযন্ত্র আইকনে চাপ দিয়ে সংরক্ষণ করে রাখুন।'
                  : 'Tap the heart icon on any attar card to save it here for later.'}
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="mt-2 px-5 py-2.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'সংগ্রহ দেখুন' : 'Explore Collection'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wishedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1E1814] border border-[#C9A25A]/25 hover:border-[#C9A25A]/60 rounded-xl p-3.5 flex gap-3.5 items-center transition-all group relative"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name_bn}
                    className="w-16 h-16 object-cover rounded-lg border border-[#C9A25A]/30 shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsWishlistOpen(false);
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsWishlistOpen(false);
                      }}
                      className="font-cormorant text-base font-bold text-[#F3EBDD] hover:text-[#E6C98A] truncate cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? product.name_bn : product.name_en}
                    </h4>
                    <p className="text-[11px] text-[#A89A86] truncate mt-0.5">
                      {lang === 'bn' ? product.mood_bn : product.mood_en}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-manrope font-extrabold text-sm text-[#E6C98A]">
                        {formatPrice(product.price_per_ml * product.bottle_ml, lang)}
                      </span>

                      <button
                        onClick={() => addToCart(product.id, 1)}
                        className="px-3 py-1 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag size={12} />
                        <span>{lang === 'bn' ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-1 text-[#A89A86] hover:text-rose-400 rounded-full transition-colors cursor-pointer"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {wishedProducts.length > 0 && (
          <div className="p-4 bg-[#18120E] border-t border-[#C9A25A]/30 space-y-2 shrink-0">
            <button
              onClick={handleAddAllToCart}
              className="w-full py-3 bg-gradient-to-r from-[#B8741A] via-[#C9A25A] to-[#E6C98A] hover:brightness-110 text-[#120E0B] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>
                {lang === 'bn'
                  ? `সবকটি (${wishedProducts.length}টি) কার্টে যোগ করুন`
                  : `Add All (${wishedProducts.length}) to Cart`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
