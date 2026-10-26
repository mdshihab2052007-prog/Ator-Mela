import React from 'react';
import { Sparkles, Gift, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice, formatQuantity, toBanglaDigits } from '../utils/formatters.ts';
import { StarOrnament, LuxuryBottle } from './BrandVisuals.tsx';

export const OfferShowcase: React.FC = () => {
  const { offer, lang, addToCart, products, setIsCartOpen } = useApp();

  if (!offer || !offer.active || offer.claimed_count >= offer.buyer_limit) {
    return null; // Offer ended automatically at 50 claimed!
  }

  const claimed = offer.claimed_count;
  const limit = offer.buyer_limit;
  const percentage = Math.min(100, Math.round((claimed / limit) * 100));

  const handleClaimOffer = () => {
    // Add 2 bottles of Ehsas (or first product) to immediately trigger the free bottle
    const targetProduct = products[0] || { id: 'prod-ehsas' };
    addToCart(targetProduct.id, 2);
    setIsCartOpen(true);
  };

  return (
    <section id="launch-offer-section" className="py-12 px-4 max-w-4xl mx-auto scroll-mt-20">
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1E1814] to-[#120E0B] border-2 border-[#C9A25A] p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Decorative corner stars */}
        <div className="absolute top-3 left-3 text-[#C9A25A]/40">
          <StarOrnament size={16} />
        </div>
        <div className="absolute top-3 right-3 text-[#C9A25A]/40">
          <StarOrnament size={16} />
        </div>
        <div className="absolute bottom-3 left-3 text-[#C9A25A]/40">
          <StarOrnament size={16} />
        </div>
        <div className="absolute bottom-3 right-3 text-[#C9A25A]/40">
          <StarOrnament size={16} />
        </div>

        {/* Ambient glow behind card */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C9A25A]/15 blur-3xl pointer-events-none" />

        <div className="text-center space-y-4 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/50 text-xs text-[#E6C98A] font-bold uppercase tracking-wider">
            <Gift size={14} className="text-[#C9A25A]" />
            <span>
              {lang === 'bn' ? 'সীমিত সময়ের উদ্বোধনী অফার' : 'Limited Launch Special'}
            </span>
          </div>

          <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F3EBDD]">
            {lang === 'bn' ? '৬ মিলি কিনলে ৩ মিলি ফ্রি' : 'Buy 6 mL Get 3 mL Free'}
          </h2>

          <p className="text-sm sm:text-base text-[#A89A86] max-w-lg mx-auto font-hind">
            {lang === 'bn'
              ? 'যেকোনো আতরের ৬ মিলি (২টি বোতল) কিনলে ৩ মিলি (১টি বোতল) সম্পূর্ণ ফ্রি! (প্রতি ৬ মিলিতে প্রযোজ্য)'
              : 'Buy 6 mL (2 bottles) of any attar, get 3 mL (1 bottle) of the same attar free.'}
          </p>

          {/* VISUAL FORMULA: [Bottle] + [Bottle] = [Bottle FREE] */}
          <div className="py-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-2">
            {/* Bottle 1 */}
            <div className="flex flex-col items-center bg-[#120E0B] p-3 rounded-2xl border border-[#C9A25A]/30 w-24 sm:w-28 shadow-md">
              <LuxuryBottle accentHex="#B8741A" name="Ehsas" size="sm" glow={false} />
              <span className="text-[11px] font-semibold text-[#F3EBDD] mt-2 font-hind">
                {lang === 'bn' ? 'বোতল ১' : 'Bottle 1'}
              </span>
              <span className="text-[10px] text-[#A89A86] font-hind">3 mL ({formatPrice(129, lang)})</span>
            </div>

            <span className="text-2xl sm:text-3xl font-extrabold text-[#C9A25A]">+</span>

            {/* Bottle 2 */}
            <div className="flex flex-col items-center bg-[#120E0B] p-3 rounded-2xl border border-[#C9A25A]/30 w-24 sm:w-28 shadow-md">
              <LuxuryBottle accentHex="#B8741A" name="Ehsas" size="sm" glow={false} />
              <span className="text-[11px] font-semibold text-[#F3EBDD] mt-2 font-hind">
                {lang === 'bn' ? 'বোতল ২' : 'Bottle 2'}
              </span>
              <span className="text-[10px] text-[#A89A86] font-hind">3 mL ({formatPrice(129, lang)})</span>
            </div>

            <span className="text-2xl sm:text-3xl font-extrabold text-[#C9A25A]">=</span>

            {/* Bottle 3: FREE! */}
            <div className="flex flex-col items-center bg-gradient-to-b from-[#2A2016] to-[#16120F] p-3 rounded-2xl border-2 border-[#E6C98A] w-28 sm:w-32 shadow-xl relative scale-105">
              <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-[#C9A25A] text-[#120E0B] text-[10px] font-extrabold tracking-wider">
                100% FREE
              </div>
              <LuxuryBottle accentHex="#B8741A" name="Ehsas" size="sm" glow={true} />
              <span className="text-xs font-bold text-[#E6C98A] mt-2 font-hind">
                {lang === 'bn' ? 'বোতল ৩ (ফ্রি!)' : 'Bottle 3 (Free!)'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-hind">3 mL ({formatPrice(0, lang)})</span>
            </div>
          </div>

          {/* Formula summary statement */}
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-extrabold text-[#E6C98A] font-hind">
              {lang === 'bn' ? '৳২৫৮ দিয়ে পান ৯ মিলি আতর' : 'Get 9 mL for only Tk 258'}
            </p>
            <p className="text-xs sm:text-sm text-emerald-400 font-medium font-hind">
              {lang === 'bn'
                ? '★ ১০ মিলি বা তার বেশি (৪টি বোতল) নিলে ডেলিভারি চার্জ নেই (সম্পূর্ণ ফ্রি)'
                : '★ No delivery fee on 10 mL or more (4+ bottles)'}
            </p>
          </div>

          {/* Live Progress Bar of Claimed Slots */}
          <div className="pt-4 max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-[#A89A86] font-medium font-hind">
                {lang === 'bn' ? 'অফার বুকিং প্রগ্রেস:' : 'Offer Claim Progress:'}
              </span>
              <span className="font-hind font-extrabold text-[#E6C98A]">
                {lang === 'bn'
                  ? `${toBanglaDigits(claimed)}/${toBanglaDigits(limit)} জন নিয়েছেন`
                  : `${claimed}/${limit} claimed`}
              </span>
            </div>

            {/* Brass Fill Progress Bar */}
            <div className="h-3 w-full bg-[#120E0B] border border-[#C9A25A]/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#967431] via-[#C9A25A] to-[#E6C98A] rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-[#A89A86] font-hind">
              {lang === 'bn'
                ? `মাত্র ${toBanglaDigits(limit - claimed)}টি স্লট বাকি আছে। ৫০ জন পূর্ণ হলে অফারটি শেষ হবে।`
                : `Only ${limit - claimed} slots remaining. Ends automatically at 50 buyers.`}
            </p>
          </div>

          {/* CTA */}
          <div className="pt-3">
            <button
              onClick={handleClaimOffer}
              className="px-8 py-3.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-xl hover:shadow-[#C9A25A]/30 active:scale-95 cursor-pointer"
            >
              {lang === 'bn' ? 'অফারটি উপভোগ করুন (২টি বোতল যোগ করুন)' : 'Claim 2+1 Offer (Add 2 Bottles)'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
