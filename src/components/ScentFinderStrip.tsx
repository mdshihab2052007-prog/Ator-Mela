import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ScentFinderStrip: React.FC = () => {
  const { lang, products, setSelectedProduct } = useApp();

  const moods = [
    {
      productId: 'prod-ehsas',
      title_bn: 'রাজকীয় ও উষ্ণ',
      title_en: 'Royal & Warm',
      desc_bn: 'এহসাস আল আরাবিয়া',
      desc_en: 'Ehsas Al Arabia',
      accent: '#B8741A',
    },
    {
      productId: 'prod-vampire',
      title_bn: 'গাঢ় ও রহস্যময়',
      title_en: 'Dark & Mysterious',
      desc_bn: 'ভ্যাম্পায়ার ব্লাড',
      desc_en: 'Vampire Blood',
      accent: '#6E1423',
    },
    {
      productId: 'prod-aroosah',
      title_bn: 'কোমল ও উজ্জ্বল',
      title_en: 'Soft & Radiant',
      desc_bn: 'আরুসা',
      desc_en: 'Aroosah',
      accent: '#D9B865',
    },
  ];

  const handleSelectMood = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setSelectedProduct(prod);
    }
  };

  return (
    <section className="py-8 px-4 max-w-5xl mx-auto">
      <div className="bg-[#1A1410] border border-[#C9A25A]/25 rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[#C9A25A]" />
            <h3 className="font-cormorant text-xl font-bold text-[#F3EBDD]">
              {lang === 'bn' ? 'মুড অনুযায়ী সুবাস খুঁজুন' : 'Find by Mood'}
            </h3>
          </div>
          <span className="text-[11px] text-[#A89A86]">
            {lang === 'bn' ? 'ট্যাপ করে দেখুন' : 'Tap to explore'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {moods.map((m) => (
            <button
              key={m.productId}
              onClick={() => handleSelectMood(m.productId)}
              className="p-3.5 rounded-xl border border-[#C9A25A]/20 hover:border-[#C9A25A] bg-[#120E0B] text-left transition-all duration-300 hover:scale-[1.02] flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10 group-hover:scale-110 transition-transform shrink-0"
                  style={{ backgroundColor: m.accent }}
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#F3EBDD] group-hover:text-[#E6C98A] block">
                    {lang === 'bn' ? m.title_bn : m.title_en}
                  </span>
                  <span className="text-[11px] text-[#A89A86] block">
                    {lang === 'bn' ? m.desc_bn : m.desc_en}
                  </span>
                </div>
              </div>
              <Sparkles size={14} className="text-[#C9A25A] opacity-40 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
