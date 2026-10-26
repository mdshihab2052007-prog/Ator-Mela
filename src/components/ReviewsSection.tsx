import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ReviewsSection: React.FC = () => {
  const { reviews, lang } = useApp();

  const approvedReviews = reviews.filter((r) => r.approved);
  if (approvedReviews.length === 0) return null;

  return (
    <section className="py-14 px-4 max-w-6xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'সম্মানিত গ্রাহকদের মতামত' : 'Customer Reviews'}
        </h2>
        <p className="text-xs text-[#A89A86]">
          {lang === 'bn'
            ? 'রাজশাহী ও চাঁপাইনবাবগঞ্জের গ্রাহকদের সরাসরি অভিজ্ঞতা'
            : 'Genuine feedback from our buyers in Rajshahi and Chapai Nawabganj'}
        </p>
      </div>

      {/* Swipeable row on mobile, grid on desktop with staggered motion */}
      <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {approvedReviews.map((rev, idx) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-[280px] sm:min-w-0 flex-1 snap-center bg-[#1E1814] border border-[#C9A25A]/25 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md"
          >
            <div>
              {/* Stars */}
              <div className="flex items-center gap-1 text-[#C9A25A] mb-3">
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} size={15} fill="#C9A25A" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#F3EBDD]/90 leading-relaxed italic">
                "{lang === 'bn' ? rev.text_bn : rev.text_en}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#C9A25A]/15 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#F3EBDD] block">{rev.customer_name}</span>
                <span className="text-[11px] text-[#A89A86] block">{rev.area}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#120E0B] text-[#E6C98A] border border-[#C9A25A]/30">
                {rev.attar_name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
