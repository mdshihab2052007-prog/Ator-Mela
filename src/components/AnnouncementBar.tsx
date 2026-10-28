import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Sparkles } from 'lucide-react';
import { toBanglaDigits } from '../utils/formatters.ts';

export const AnnouncementBar: React.FC = () => {
  const { offer, lang, settings } = useApp();

  const claimed = offer?.claimed_count ?? 32;
  const limit = offer?.buyer_limit ?? 50;

  const scrollToOffer = () => {
    const el = document.getElementById('launch-offer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const textBn = settings?.announcement_bn || `৬ মিলি কিনলে ৩ মিলি ফ্রি · প্রথম ৫০ জন · ${toBanglaDigits(claimed)}/${toBanglaDigits(limit)} নেওয়া হয়েছে · ১০ মিলি বা তার বেশি নিলে ডেলিভারি চার্জ ফ্রি`;
  const textEn = settings?.announcement_en || `You will get 3 mL free if you buy 6 mL · First 50 Buyers · ${claimed}/${limit} Claimed · Delivery charge free on 10 mL or more`;

  return (
    <aside
      onClick={scrollToOffer}
      aria-label="Promotion Announcement"
      className="w-full max-w-full overflow-hidden bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] text-xs sm:text-sm font-semibold tracking-wide py-2 px-3 text-center cursor-pointer transition-colors sticky top-0 z-40 shadow-xs flex items-center justify-center gap-2 group select-none"
    >
      <Sparkles size={14} className="shrink-0 group-hover:rotate-12 transition-transform" />
      <span className="truncate max-w-full">
        {lang === 'bn' ? textBn : textEn}
      </span>
      <span className="text-[11px] font-bold underline ml-1 hidden sm:inline opacity-80 group-hover:opacity-100">
        {lang === 'bn' ? 'অফার দেখুন →' : 'View Offer →'}
      </span>
    </aside>
  );
};
