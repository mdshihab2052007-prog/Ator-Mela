import React, { useState } from 'react';
import { X, Sparkles, Wand2, ShoppingBag, Heart, Check, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice } from '../utils/formatters.ts';
import { StarOrnament } from './BrandVisuals.tsx';

export const AiScentSommelierModal: React.FC = () => {
  const {
    isAiAdvisorOpen,
    setIsAiAdvisorOpen,
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    lang,
    setSelectedProduct,
  } = useApp();

  const [preferenceText, setPreferenceText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>('jumuah');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    recommended_product_id: string;
    match_score: number;
    headline_bn: string;
    reasoning_bn: string;
    notes_highlight_bn: string;
    application_tip_bn: string;
  } | null>(null);

  if (!isAiAdvisorOpen) return null;

  const presets = [
    { id: 'jumuah', label_bn: '🕌 জুমার নামায ও আভিজাত্য', label_en: '🕌 Jumuah & Sunnah' },
    { id: 'evening', label_bn: '🌙 বিশেষ মেহমানদারি ও উৎসব', label_en: '🌙 Special Evenings' },
    { id: 'office', label_bn: '💼 প্রফেশনাল ও দৈনন্দিন ব্যবহার', label_en: '💼 Office & Professional' },
    { id: 'gift', label_bn: '🌸 উপহার ও বিয়ে-শাদী', label_en: '🌸 Gifts & Wedding' },
    { id: 'sweet', label_bn: '🍇 মিষ্টি ও ফলমূলের সুবাস', label_en: '🍇 Sweet & Fruity' },
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const activeTagObj = presets.find((p) => p.id === selectedTag);
    const tagText = activeTagObj ? activeTagObj.label_bn : '';

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/scent-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preference: preferenceText,
          mood: tagText,
          occasion: tagText,
        }),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setResult(data.recommendation);
      }
    } catch {
      // Fallback recommendation
      const fallback = products[0] || { id: 'prod-ehsas' };
      setResult({
        recommended_product_id: fallback.id,
        match_score: 98,
        headline_bn: `আপনার পছন্দের সাথে রাজকীয়ভাবে মানানসই: ${fallback.name_bn}`,
        reasoning_bn: `গোলাপ, তিউনিসিয়ান আম্বার ও চন্দন কাঠের উষ্ণ ও গম্ভীর মিশ্রণ আপনার ব্যক্তিত্বকে প্রকাশ করবে অসাধারণ এক আভিজাত্যে।`,
        notes_highlight_bn: 'জাফরান, তায়েফ গোলাপ, নরম কস্তূরী ও আম্বার',
        application_tip_bn: 'কব্জি ও গলায় হালকা ড্যাব করে ব্যবহার করুন। কাপড়ে ৩-৪ ফোঁটা লাগালে সুবাস দীর্ঘস্থায়ী হয়।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const matchedProduct = result ? products.find((p) => p.id === result.recommended_product_id) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300">
      <div
        className="w-full max-w-xl bg-[#120E0B] border border-[#C9A25A]/60 rounded-2xl shadow-2xl overflow-hidden relative my-auto flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="AI Scent Consultant"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E1814] via-[#2A2016] to-[#1E1814] border-b border-[#C9A25A]/40 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#967431] to-[#E6C98A] flex items-center justify-center text-[#120E0B] shadow-md">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="font-cormorant text-xl sm:text-2xl font-bold text-[#F3EBDD] flex items-center gap-2">
                <span>{lang === 'bn' ? 'AI সুবাস কনসালট্যান্ট' : 'AI Scent Sommelier'}</span>
                <Sparkles size={16} className="text-[#E6C98A] animate-pulse" />
              </h2>
              <p className="text-[11px] text-[#A89A86]">
                {lang === 'bn'
                  ? 'আপনার পছন্দ ও মেজাজ অনুযায়ী সেরা আতর খুঁজে নিন'
                  : 'Personalized fragrance matching based on your mood & occasion'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiAdvisorOpen(false)}
            className="p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#120E0B] transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#F3EBDD] mb-2">
              {lang === 'bn' ? '১. আপনার উপলক্ষ বা পছন্দ বেছে নিন:' : '1. Choose your occasion or preference:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedTag(preset.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    selectedTag === preset.id
                      ? 'bg-[#C9A25A] text-[#120E0B] border-[#C9A25A] font-bold shadow-md'
                      : 'bg-[#1E1814] text-[#A89A86] border-[#C9A25A]/30 hover:border-[#C9A25A]/60 hover:text-[#F3EBDD]'
                  }`}
                >
                  {lang === 'bn' ? preset.label_bn : preset.label_en}
                </button>
              ))}
            </div>
          </div>

          {/* Custom text input */}
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5">
                {lang === 'bn'
                  ? '২. সংক্ষেপে বলুন আপনি কেমন ঘ্রাণ চান (ঐচ্ছিক):'
                  : '2. Describe your preferred scent profile (optional):'}
              </label>
              <textarea
                rows={2}
                value={preferenceText}
                onChange={(e) => setPreferenceText(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'যেমন: মিষ্টি ও জুঁই ফুলের একটা স্নিগ্ধ সুবাস চাই যা মাথায় চাপ ফেলবে না...'
                    : 'e.g., A warm rose and amber blend that feels dignified...'
                }
                className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl p-3 text-xs text-[#F3EBDD] placeholder-[#A89A86]/50 focus:outline-hidden transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#967431] via-[#C9A25A] to-[#E6C98A] hover:brightness-110 text-[#120E0B] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#120E0B]" />
                  <span>{lang === 'bn' ? 'AI বিশ্লেষণ করছে...' : 'AI Analysing Fragrance Notes...'}</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>{lang === 'bn' ? 'AI সুবাস ম্যাচিং করুন' : 'Find My AI Match'}</span>
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {matchedProduct && result && (
            <div className="mt-5 bg-[#1E1814] border-2 border-[#C9A25A] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300 relative shadow-xl">
              {/* Match Score Badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/50 text-emerald-400 font-manrope font-extrabold text-xs">
                  <Sparkles size={14} className="text-[#E6C98A]" />
                  <span>{result.match_score}% AI ম্যাচিং</span>
                </div>

                <button
                  onClick={() => toggleWishlist(matchedProduct.id)}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                    isInWishlist(matchedProduct.id)
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-500'
                      : 'bg-[#120E0B] border-[#C9A25A]/30 text-[#A89A86] hover:text-rose-400'
                  }`}
                  title={lang === 'bn' ? 'পছন্দের তালিকায় রাখুন' : 'Add to Wishlist'}
                >
                  <Heart size={16} className={isInWishlist(matchedProduct.id) ? 'fill-rose-500' : ''} />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex gap-4 items-center">
                <img
                  src={matchedProduct.images[0]}
                  alt={matchedProduct.name_bn}
                  className="w-20 h-20 object-cover rounded-xl border border-[#C9A25A]/40 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setSelectedProduct(matchedProduct);
                    setIsAiAdvisorOpen(false);
                  }}
                />

                <div className="space-y-1 min-w-0">
                  <h3
                    onClick={() => {
                      setSelectedProduct(matchedProduct);
                      setIsAiAdvisorOpen(false);
                    }}
                    className="font-cormorant text-xl font-bold text-[#F3EBDD] hover:text-[#E6C98A] cursor-pointer transition-colors truncate"
                  >
                    {lang === 'bn' ? matchedProduct.name_bn : matchedProduct.name_en}
                  </h3>
                  <p className="text-xs text-[#E6C98A] font-medium">
                    {result.headline_bn}
                  </p>
                  <p className="font-manrope font-extrabold text-sm text-[#F3EBDD]">
                    {formatPrice(matchedProduct.price_per_ml * matchedProduct.bottle_ml, lang)}
                  </p>
                </div>
              </div>

              {/* AI Reasoning Text */}
              <div className="p-3 bg-[#120E0B] border border-[#C9A25A]/25 rounded-xl text-xs text-[#A89A86] leading-relaxed">
                <p className="text-[#F3EBDD] font-medium mb-1">
                  💡 {lang === 'bn' ? 'কেন আপনার জন্য উপযুক্ত:' : 'Why it suits you:'}
                </p>
                <p>{result.reasoning_bn}</p>

                <div className="mt-2 pt-2 border-t border-[#C9A25A]/15 text-[11px]">
                  <span className="text-[#E6C98A] font-semibold">
                    {lang === 'bn' ? 'কী নোটস: ' : 'Key Notes: '}
                  </span>
                  <span>{result.notes_highlight_bn}</span>
                </div>
              </div>

              {/* Application Tip */}
              <div className="p-2.5 bg-[#C9A25A]/10 border border-[#C9A25A]/30 rounded-lg text-[11px] text-[#E6C98A]">
                <span className="font-bold">✨ {lang === 'bn' ? 'পরামর্শ: ' : 'Tip: '}</span>
                <span>{result.application_tip_bn}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    addToCart(matchedProduct.id, 1);
                    setIsAiAdvisorOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>{lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(matchedProduct);
                    setIsAiAdvisorOpen(false);
                  }}
                  className="py-2.5 px-4 bg-[#120E0B] hover:bg-[#1E1814] text-[#E6C98A] border border-[#C9A25A]/40 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
