import React from 'react';
import { HelpCircle, MessageCircle, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const FloatingButtons: React.FC = () => {
  const { lang, setIsChatbotOpen, settings, calculation, setIsAiAdvisorOpen } = useApp();

  const phone = settings?.whatsapp || '01643249148';
  const cleanPhone = phone.replace(/^0/, '880');
  const hasCartItems = calculation && calculation.totalPaidBottles > 0;

  const fbUrl = settings?.fb_page_url || 'https://www.facebook.com/share/1F2jSKW9VL/';

  return (
    <div
      className={`fixed right-4 z-30 flex flex-col items-end gap-2.5 transition-all duration-300 ${
        hasCartItems ? 'bottom-20 sm:bottom-6' : 'bottom-6'
      }`}
    >
      {/* AI Scent Match Button */}
      <button
        onClick={() => setIsAiAdvisorOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-[#967431] via-[#C9A25A] to-[#E6C98A] text-[#120E0B] shadow-xl hover:scale-110 transition-all active:scale-95 cursor-pointer font-bold text-xs"
        aria-label="AI Scent Matcher"
        title={lang === 'bn' ? 'AI সুবাস ম্যাচিং' : 'AI Scent Match'}
      >
        <Wand2 size={15} className="animate-spin-slow shrink-0" />
        <span className="hidden sm:inline font-extrabold">{lang === 'bn' ? 'AI সুবাস' : 'AI Match'}</span>
      </button>

      {/* Facebook Page Button */}
      {fbUrl && (
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
          aria-label="Facebook Page"
          title={lang === 'bn' ? 'ফেসবুক পেজে যান' : 'Facebook Page'}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      )}

      {/* WhatsApp Quick Chat */}
      <a
        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! আতর মেলা সম্পর্কে কিছু জানতে চাই।')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
        aria-label="WhatsApp Helpline"
        title="WhatsApp: 01643249148"
      >
        <MessageCircle size={22} />
      </a>

      {/* Chatbot Button with Brass Ring and "প্রশ্ন আছে?" label */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#1E1814] hover:bg-[#2A221C] text-[#E6C98A] border-2 border-[#C9A25A] shadow-xl hover:shadow-[#C9A25A]/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Open FAQ Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-[#C9A25A] text-[#120E0B] flex items-center justify-center shrink-0 font-bold group-hover:rotate-12 transition-transform">
          <HelpCircle size={15} />
        </div>
        <span className="text-xs font-bold tracking-wide pr-1">
          {lang === 'bn' ? 'প্রশ্ন আছে?' : 'Questions?'}
        </span>
      </button>
    </div>
  );
};
