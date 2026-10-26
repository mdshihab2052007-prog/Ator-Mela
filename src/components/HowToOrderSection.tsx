import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext.tsx';
import { Sparkles, PhoneCall, HandCoins } from 'lucide-react';

export const HowToOrderSection: React.FC = () => {
  const { lang } = useApp();

  const steps = [
    {
      num: 1,
      num_bn: '১',
      title_bn: 'আতর বেছে নিন',
      title_en: 'Choose Your Scent',
      desc_bn: 'আপনার পছন্দের সুবাস বেছে নিয়ে কার্টে যোগ করুন। ৬ মিলি কিনলে ৩ মিলি ফ্রি পাবেন।',
      desc_en: 'Select your favourite scent and add to cart. Buy 6 mL to get 3 mL free.',
      icon: Sparkles,
    },
    {
      num: 2,
      num_bn: '২',
      title_bn: 'ফোন ও ঠিকানা দিন',
      title_en: 'Order with Mobile',
      desc_bn: 'কোনো লগইন ছাড়া শুধু নাম, ১১ ডিজিটের মোবাইল ও ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।',
      desc_en: 'No account needed. Just your name, 11-digit phone and address.',
      icon: PhoneCall,
    },
    {
      num: 3,
      num_bn: '৩',
      title_bn: 'পণ্য হাতে পেয়ে টাকা দিন',
      title_en: 'Pay on Arrival',
      desc_bn: 'আমরা কল করে ১–২ দিনে পৌঁছে দেব। ডেলিভারিম্যান থেকে বুঝে নিয়ে মূল্য পরিশোধ করুন।',
      desc_en: 'Delivered in 1-2 days. Inspect your attars and pay with Cash on Delivery.',
      icon: HandCoins,
    },
  ];

  return (
    <section className="py-14 px-4 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-12">
        <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'অর্ডার করার সহজ ৩টি ধাপ' : 'How to Order in 3 Simple Steps'}
        </h2>
        <p className="text-xs text-[#A89A86] font-hind">
          {lang === 'bn'
            ? 'ঝামেলামুক্ত দ্রুত ক্যাশ অন ডেলিভারি অভিজ্ঞতা'
            : 'Frictionless Cash on Delivery shopping'}
        </p>
      </div>

      {/* 3 Numbered Steps Linked by Brass Line */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Brass connector line on desktop */}
        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#C9A25A]/20 via-[#C9A25A]/60 to-[#C9A25A]/20 -translate-y-6 pointer-events-none" />

        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={st.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: idx * 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#1E1814] border border-[#C9A25A]/30 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 shadow-lg z-10 font-hind"
            >
              {/* Step number badge */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#967431] to-[#E6C98A] text-[#120E0B] font-hind font-extrabold text-lg flex items-center justify-center shadow-md">
                {lang === 'bn' ? st.num_bn : st.num}
              </div>

              <div className="pt-1">
                <h3 className="font-cormorant text-xl font-bold text-[#F3EBDD]">
                  {lang === 'bn' ? st.title_bn : st.title_en}
                </h3>
                <p className="text-xs text-[#A89A86] mt-2 leading-relaxed">
                  {lang === 'bn' ? st.desc_bn : st.desc_en}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
