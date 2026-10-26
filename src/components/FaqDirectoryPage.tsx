import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, HelpCircle, Phone, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { FAQCategory } from '../shared/types.ts';
import { BrandLogo, StarOrnament } from './BrandVisuals.tsx';

export const FaqDirectoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { faqs, lang, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories: { id: string; label_bn: string; label_en: string }[] = [
    { id: 'all', label_bn: 'সকল প্রশ্নোত্তর', label_en: 'All Questions' },
    { id: 'price_offer', label_bn: 'দাম ও অফার', label_en: 'Price & Offer' },
    { id: 'delivery_payment', label_bn: 'ডেলিভারি ও পেমেন্ট', label_en: 'Delivery & Payment' },
    { id: 'about_attar', label_bn: 'আতর সম্পর্কে', label_en: 'About Attars' },
    { id: 'order_contact', label_bn: 'অর্ডার ও যোগাযোগ', label_en: 'Orders & Help' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (!faq.active) return false;
    if (selectedCat !== 'all' && faq.category !== selectedCat) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const qBn = faq.question_bn.toLowerCase();
    const qEn = faq.question_en.toLowerCase();
    const aBn = faq.answer_bn.toLowerCase();
    const aEn = faq.answer_en.toLowerCase();
    const kwBn = faq.keywords_bn?.join(' ').toLowerCase() || '';
    const kwEn = faq.keywords_en?.join(' ').toLowerCase() || '';

    return (
      qBn.includes(term) ||
      qEn.includes(term) ||
      aBn.includes(term) ||
      aEn.includes(term) ||
      kwBn.includes(term) ||
      kwEn.includes(term)
    );
  });

  // Inject FAQPage Schema.org JSON-LD
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question_bn,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer_bn,
        },
      })),
    };
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [faqs]);

  return (
    <div className="min-h-screen bg-[#120E0B] text-[#F3EBDD] py-8 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#C9A25A]/25 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-[#E6C98A] hover:text-[#F3EBDD] py-1.5 px-3 rounded-lg bg-[#1E1814] border border-[#C9A25A]/30 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{lang === 'bn' ? 'দোকানে ফিরে যান' : 'Back to Store'}</span>
        </button>

        <BrandLogo showSubtitle={false} className="scale-90" />
      </div>

      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2">
          <StarOrnament size={14} />
          <span className="text-xs uppercase tracking-widest text-[#C9A25A] font-bold">
            {lang === 'bn' ? 'সচরাচর জিজ্ঞাসা' : 'Knowledge Base'}
          </span>
          <StarOrnament size={14} />
        </div>
        <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'আতর মেলা প্রশ্নোত্তর ডিরেক্টরি' : 'Ator Mela Frequently Asked Questions'}
        </h1>
        <p className="text-xs sm:text-sm text-[#A89A86] max-w-md mx-auto">
          {lang === 'bn'
            ? 'আমাদের আতর, অফার, ডেলিভারি ও পেমেন্ট সম্পর্কিত সকল প্রশ্নের বিস্তারিত উত্তর।'
            : 'Complete directory of all 21 questions and answers for our customers.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto mb-6">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A25A]"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            lang === 'bn'
              ? 'যেকোনো প্রশ্ন বা বিষয় খুঁজুন (যেমন: দাম, ডেলিভারি, অ্যালকোহল)...'
              : 'Search questions (e.g. price, delivery, alcohol)...'
          }
          className="w-full pl-10 pr-4 py-3 bg-[#1E1814] border border-[#C9A25A]/30 focus:border-[#C9A25A] rounded-xl text-sm text-[#F3EBDD] focus:outline-hidden"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCat === c.id
                ? 'bg-[#C9A25A] text-[#120E0B]'
                : 'bg-[#1E1814] text-[#A89A86] hover:text-[#F3EBDD] border border-[#C9A25A]/20'
            }`}
          >
            {lang === 'bn' ? c.label_bn : c.label_en}
          </button>
        ))}
      </div>

      {/* Crawlable List of FAQs */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <article
            key={faq.id}
            className="p-5 bg-[#1E1814] border border-[#C9A25A]/25 rounded-2xl space-y-2.5 transition-all hover:border-[#C9A25A]/60"
          >
            <h2 className="font-semibold text-base sm:text-lg text-[#E6C98A] flex items-start gap-2">
              <span className="text-[#C9A25A] mt-0.5">•</span>
              <span>{lang === 'bn' ? faq.question_bn : faq.question_en}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F3EBDD]/90 pl-4 leading-relaxed border-l-2 border-[#C9A25A]/30">
              {lang === 'bn' ? faq.answer_bn : faq.answer_en}
            </p>
          </article>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="p-8 text-center text-[#A89A86] bg-[#1E1814] rounded-2xl border border-[#C9A25A]/20">
            <HelpCircle size={32} className="mx-auto text-[#C9A25A] mb-2" />
            <p className="text-sm">
              {lang === 'bn' ? 'কোনো প্রশ্নোত্তর মেলেনি।' : 'No matching questions found.'}
            </p>
          </div>
        )}
      </div>

      {/* Direct helpline footer */}
      <div className="mt-12 p-6 bg-[#1A1410] border border-[#C9A25A]/30 rounded-2xl text-center space-y-3">
        <h3 className="font-cormorant text-xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'আপনার প্রশ্নের উত্তর পাননি?' : 'Still have questions?'}
        </h3>
        <p className="text-xs text-[#A89A86]">
          {lang === 'bn'
            ? 'সরাসরি আমাদের ফোন করুন বা WhatsApp-এ লিখুন:'
            : 'Reach out to our customer care directly on Phone or WhatsApp:'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            href="tel:+8801643249148"
            className="px-4 py-2 bg-[#C9A25A] text-[#120E0B] rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <Phone size={14} />
            <span>01643249148</span>
          </a>
          <a
            href="https://wa.me/8801643249148"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#25D366] text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
