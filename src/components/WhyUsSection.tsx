import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StarOrnament } from './BrandVisuals.tsx';

export const WhyUsSection: React.FC = () => {
  const { lang, settings } = useApp();

  const points = settings?.why_us_points || [
    {
      title_bn: '৩ মিলি মাত্র ৳১২৯',
      title_en: '3 mL only Tk 129',
      desc_bn: 'নিয়মিত ৳৫০-এর পরিবর্তে প্রতি মিলি মাত্র ৳৪৩ (৩ মিলি বোতল ৳১৫০-এর বদলে ৳১২৯)। কোনো লাক্সারি মার্কআপ নেই, খাঁটি সুবাস সাশ্রয়ী দামে সবার জন্য।',
      desc_en: 'Regular Tk 50 now just Tk 43 per mL (Tk 150 bottle for Tk 129). Honest pricing for everyone.',
      icon: 'sparkles',
    },
    {
      title_bn: 'ডেলিভারি মাত্র ৳৩০, ১০ মিলি বা তার বেশি নিলে ডেলিভারি চার্জ ফ্রি',
      title_en: 'Delivery Tk 30, Delivery charge free on 10 mL or more',
      desc_bn: '১০ মিলি বা তার বেশি (৪টি বোতল = ১২ মিলি) নিলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।',
      desc_en: 'Order 10 mL or more (4 bottles = 12 mL) and delivery charge is completely free.',
      icon: 'truck',
    },
    {
      title_bn: 'পণ্য হাতে পেয়ে টাকা দিন',
      title_en: 'Cash on Delivery',
      desc_bn: 'কোনো অগ্রিম টাকা দিতে হবে না। ডেলিভারিম্যান থেকে আতর হাতে বুঝে নিয়ে তারপর মূল্য পরিশোধ করুন।',
      desc_en: 'No advance payment needed. Inspect the parcel and pay when you receive it.',
      icon: 'shield-check',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'sparkles':
        return <Sparkles size={24} className="text-[#C9A25A]" />;
      case 'truck':
        return <Truck size={24} className="text-[#C9A25A]" />;
      case 'shield-check':
        return <ShieldCheck size={24} className="text-[#C9A25A]" />;
      default:
        return <CheckCircle2 size={24} className="text-[#C9A25A]" />;
    }
  };

  return (
    <section className="py-16 bg-[#F3EBDD] text-[#120E0B] relative my-12 w-full max-w-full overflow-hidden">
      {/* Decorative hairline brass border on top & bottom */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A25A] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A25A] to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 mb-1">
            <StarOrnament size={14} color="#967431" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#967431]">
              {lang === 'bn' ? 'আমাদের অঙ্গীকার' : 'Our Promise'}
            </span>
            <StarOrnament size={14} color="#967431" />
          </div>

          <h2 className="font-cormorant text-3xl sm:text-4xl font-bold tracking-tight text-[#120E0B]">
            {lang === 'bn' ? 'কেন আতর মেলা বেছে নেবেন?' : 'Why Choose Ator Mela?'}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D3E] max-w-lg mx-auto">
            {lang === 'bn'
              ? 'খাঁটি আতর কেনা হোক সহজ, নির্ভরযোগ্য এবং সাধ্যের মধ্যে।'
              : 'Pure attar shopping crafted to be authentic, straightforward, and affordable.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/80 p-6 rounded-2xl border border-[#C9A25A]/30 shadow-xs flex flex-col items-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#1E1814] flex items-center justify-center shadow-md">
                {getIcon(pt.icon)}
              </div>

              <h3 className="font-cormorant text-xl font-bold text-[#120E0B]">
                {lang === 'bn' ? pt.title_bn : pt.title_en}
              </h3>

              <p className="text-xs text-[#5C4D3E] leading-relaxed">
                {lang === 'bn' ? pt.desc_bn : pt.desc_en}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
