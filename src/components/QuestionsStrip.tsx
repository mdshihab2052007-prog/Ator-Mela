import React from 'react';
import { HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StarOrnament } from './BrandVisuals.tsx';

export const QuestionsStrip: React.FC = () => {
  const { lang, setIsChatbotOpen, settings } = useApp();
  const fbUrl = settings?.fb_page_url || 'https://www.facebook.com/share/1F2jSKW9VL/';
  const whatsapp = settings?.whatsapp || '01643249148';
  const cleanWa = whatsapp.replace(/^0/, '880');

  return (
    <section className="py-8 px-4 max-w-4xl mx-auto space-y-3">
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1E1814] via-[#2A2016] to-[#1E1814] border border-[#C9A25A] hover:border-[#E6C98A] text-left transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group shadow-lg cursor-pointer"
        aria-label="Open FAQ Assistant"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/50 flex items-center justify-center text-[#E6C98A] shrink-0 group-hover:scale-110 transition-transform">
            <HelpCircle size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-[#F3EBDD] group-hover:text-[#E6C98A] transition-colors">
                {lang === 'bn' ? 'প্রশ্ন আছে? ট্যাপ করুন, সাথে সাথে উত্তর' : 'Have Questions? Tap for Instant Answers'}
              </span>
              <StarOrnament size={12} className="hidden sm:inline" />
            </div>
            <p className="text-xs text-[#A89A86] mt-0.5">
              {lang === 'bn'
                ? 'দাম, অফার, ডেলিভারি বা সুবাস সম্পর্কে যেকোনো কিছু জেনে নিন'
                : 'Get quick guidance on price, offer, delivery, or scent longevity'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#E6C98A] group-hover:translate-x-1 transition-transform shrink-0 pl-2">
          <span className="hidden sm:inline">{lang === 'bn' ? 'উত্তর দেখুন' : 'Explore'}</span>
          <ArrowRight size={16} />
        </div>
      </button>

      {/* Direct Social Pathways: Facebook Page & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-xl bg-[#1E1814]/80 hover:bg-[#1877F2]/15 border border-[#1877F2]/40 hover:border-[#1877F2] text-[#F3EBDD] flex items-center justify-center gap-2.5 text-xs font-semibold transition-all shadow-md group cursor-pointer"
        >
          <svg className="w-4 h-4 fill-[#1877F2] group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="group-hover:text-[#1877F2] transition-colors">
            {lang === 'bn' ? 'ফেসবুক পেজে যোগাযোগ করুন' : 'Connect on Facebook Page'}
          </span>
        </a>

        <a
          href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('আসসালামু আলাইকুম! আতর মেলা সম্পর্কে কিছু জানতে চাই।')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-xl bg-[#1E1814]/80 hover:bg-[#25D366]/15 border border-[#25D366]/40 hover:border-[#25D366] text-[#F3EBDD] flex items-center justify-center gap-2.5 text-xs font-semibold transition-all shadow-md group cursor-pointer"
        >
          <MessageCircle size={16} className="text-[#25D366] group-hover:scale-110 transition-transform shrink-0" />
          <span className="group-hover:text-[#25D366] transition-colors">
            {lang === 'bn' ? 'হোয়াটসঅ্যাপে মেসেজ দিন' : 'Message on WhatsApp'}
          </span>
        </a>
      </div>
    </section>
  );
};
