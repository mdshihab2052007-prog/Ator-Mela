import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { X, Send, MessageCircle, Phone, ShoppingBag, ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { FAQItem, FAQCategory, FAQAction } from '../shared/types.ts';
import { BrandLogo, StarOrnament } from './BrandVisuals.tsx';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  faqItem?: FAQItem;
  relatedFaqs?: FAQItem[];
  suggestedFaqs?: FAQItem[];
  showWhatsAppFallback?: boolean;
}

export const Chatbot: React.FC = () => {
  const {
    isChatbotOpen,
    setIsChatbotOpen,
    chatbotInitialCategory,
    faqs,
    lang,
    setLang,
    setIsCartOpen,
    settings,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<FAQCategory>('price_offer');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js with Bangla, English, and Banglish keywords
  const fuse = useMemo(() => {
    return new Fuse(faqs, {
      keys: [
        'question_bn',
        'question_en',
        'keywords_bn',
        'keywords_en',
        'answer_bn',
        'answer_en',
      ],
      threshold: 0.45,
      includeScore: true,
    });
  }, [faqs]);

  // Handle opening category
  useEffect(() => {
    if (chatbotInitialCategory) {
      setActiveCategory(chatbotInitialCategory);
    }
  }, [chatbotInitialCategory]);

  // Reset initial welcome bubble when opened
  useEffect(() => {
    if (isChatbotOpen && messages.length === 0) {
      const welcomeText =
        lang === 'bn'
          ? 'আসসালামু আলাইকুম! কী জানতে চান? নিচ থেকে প্রশ্ন বেছে নিন অথবা লিখুন।'
          : 'Assalamu alaikum! What would you like to know? Tap a question below or ask anything.';
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'bot',
          text: welcomeText,
        },
      ]);
    }
  }, [isChatbotOpen, lang, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isChatbotOpen) return null;

  const categories: { id: FAQCategory; label_bn: string; label_en: string }[] = [
    { id: 'price_offer', label_bn: 'দাম ও অফার', label_en: 'Price & Offer' },
    { id: 'delivery_payment', label_bn: 'ডেলিভারি ও পেমেন্ট', label_en: 'Delivery & Pay' },
    { id: 'about_attar', label_bn: 'আতর সম্পর্কে', label_en: 'About Attars' },
    { id: 'order_contact', label_bn: 'অর্ডার ও যোগাযোগ', label_en: 'Order & Help' },
  ];

  const currentCategoryFAQs = faqs
    .filter((f) => f.category === activeCategory && f.active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleSelectQuestion = (faq: FAQItem) => {
    // Record view
    fetch('/api/faqs/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faq_id: faq.id }),
    }).catch(() => {});

    const userQuestion = lang === 'bn' ? faq.question_bn : faq.question_en;
    const botAnswer = lang === 'bn' ? faq.answer_bn : faq.answer_en;

    // Add user bubble
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userQuestion,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 400ms typing delay
    setTimeout(() => {
      setIsTyping(false);
      const related = faqs.filter((f) => faq.related_ids?.includes(f.id) && f.id !== faq.id);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botAnswer,
        faqItem: faq,
        relatedFaqs: related.slice(0, 3),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    setInputText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);

      // Perform Fuse search
      const results = fuse.search(query);
      const queryLower = query.toLowerCase();
      const isVampireQuery = /vampire|ভ্যাম্পায়ার/i.test(queryLower);
      const isAroosahQuery = /aroosah|আরুসা/i.test(queryLower);
      const isEhsasQuery = /ehsas|এহসাস/i.test(queryLower);
      const isMinQtyQuery = /less than 6|6 ml|৩ মিলি|১ বোতল|এক বোতল|কম কেনা|১টি বোতল/i.test(queryLower);

      if (
        results.length > 0 &&
        results[0].score !== undefined &&
        (results[0].score <= 0.38 || isVampireQuery || isAroosahQuery || isEhsasQuery || isMinQtyQuery)
      ) {
        // Strong direct match or keyword match!
        let matchedFaq = results[0]?.item;
        if (isVampireQuery) {
          const f = faqs.find((item) => item.id === 'faq-vampire');
          if (f) matchedFaq = f;
        } else if (isAroosahQuery) {
          const f = faqs.find((item) => item.id === 'faq-aroosah');
          if (f) matchedFaq = f;
        } else if (isEhsasQuery) {
          const f = faqs.find((item) => item.id === 'faq-ehsas');
          if (f) matchedFaq = f;
        } else if (isMinQtyQuery) {
          const f = faqs.find((item) => item.id === 'faq-min-qty');
          if (f) matchedFaq = f;
        }

        if (matchedFaq) {
          fetch('/api/faqs/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ faq_id: matchedFaq.id }),
          }).catch(() => {});
        }

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: lang === 'bn' ? matchedFaq.answer_bn : matchedFaq.answer_en,
          faqItem: matchedFaq,
          relatedFaqs: faqs
            .filter((f) => matchedFaq.related_ids?.includes(f.id))
            .slice(0, 3),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Query neutral AI Assistant endpoint for freeform natural language analysis
        try {
          const res = await fetch('/api/ai/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, lang }),
          });
          const data = await res.json();

          if (data.success && data.answer) {
            const closestFaqs = results.slice(0, 2).map((r) => r.item);
            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              text: data.answer,
              relatedFaqs: closestFaqs.length > 0 ? closestFaqs : undefined,
            };
            setMessages((prev) => [...prev, botMsg]);
            return;
          }
        } catch (err) {
          console.error('AI Assistant response error:', err);
        }

        if (results.length > 0) {
          const topMatches = results.slice(0, 3).map((r) => r.item);
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text:
              lang === 'bn'
                ? 'আপনার প্রশ্নের সাথে সম্পর্কিত সবচেয়ে কাছের বিষয়গুলো:'
                : 'Here are the closest matching questions from our guides:',
            suggestedFaqs: topMatches,
          };
          setMessages((prev) => [...prev, botMsg]);
        } else {
          fetch('/api/faqs/unanswered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query, language: lang }),
          }).catch(() => {});

          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text:
              lang === 'bn'
                ? 'আমরা সরাসরি আপনার যেকোনো প্রশ্ন শুনতেও প্রস্তুত। WhatsApp বা ফোনে যোগাযোগ করতে পারেন:'
                : 'We are also happy to speak directly! Contact us via WhatsApp or Phone:',
            showWhatsAppFallback: true,
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      }
    }, 450);
  };

  const handleActionClick = (action: FAQAction) => {
    if (action === 'order') {
      setIsChatbotOpen(false);
      setIsCartOpen(true);
    } else if (action === 'whatsapp') {
      const phone = settings?.whatsapp || '01643249148';
      const cleanPhone = phone.replace(/^0/, '880');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম! আতর মেলা সম্পর্কে কিছু জানতে চাই।')}`, '_blank');
    } else if (action === 'call') {
      const phone = settings?.phone || '01643249148';
      window.location.href = `tel:+88${phone.replace(/^0/, '')}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full sm:w-[420px] h-[85vh] sm:h-[640px] max-h-[92vh] bg-[#120E0B] border border-[#C9A25A]/40 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="FAQ Assistant"
      >
        {/* Header */}
        <div className="bg-[#1E1814] border-b border-[#C9A25A]/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo showSubtitle={false} className="scale-90 origin-left" />
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A25A]/20 text-[#E6C98A] border border-[#C9A25A]/40 font-manrope">
              {lang === 'bn' ? 'প্রশ্নোত্তর সহায়ক' : 'FAQ Guide'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* BN | EN Toggle */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="text-xs px-2 py-1 rounded bg-[#120E0B] text-[#C9A25A] border border-[#C9A25A]/30 hover:border-[#C9A25A] font-manrope font-semibold transition-colors"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#120E0B] transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-[#16120F] border-b border-[#C9A25A]/20 px-2 py-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
                  isActive
                    ? 'bg-[#C9A25A] text-[#120E0B] font-semibold shadow-sm'
                    : 'bg-[#1E1814] text-[#A89A86] hover:text-[#F3EBDD] hover:bg-[#2A221C]'
                }`}
              >
                {lang === 'bn' ? cat.label_bn : cat.label_en}
              </button>
            );
          })}
        </div>

        {/* Chat History & Questions Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-noise">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#C9A25A] text-[#120E0B] font-medium rounded-br-xs'
                    : 'bg-[#1E1814] text-[#F3EBDD] border border-[#C9A25A]/30 rounded-bl-xs'
                }`}
              >
                {msg.text}

                {/* Action button if answer has one */}
                {msg.faqItem?.action && msg.faqItem.action !== 'none' && (
                  <div className="mt-3 pt-2.5 border-t border-[#C9A25A]/20">
                    {msg.faqItem.action === 'order' && (
                      <button
                        onClick={() => handleActionClick('order')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A25A] text-[#120E0B] text-xs font-semibold rounded-md hover:bg-[#E6C98A] transition-colors"
                      >
                        <ShoppingBag size={14} />
                        {lang === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                      </button>
                    )}
                    {msg.faqItem.action === 'whatsapp' && (
                      <button
                        onClick={() => handleActionClick('whatsapp')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity"
                      >
                        <MessageCircle size={14} />
                        {lang === 'bn' ? 'WhatsApp-এ জিজ্ঞেস করুন' : 'Ask on WhatsApp'}
                      </button>
                    )}
                    {msg.faqItem.action === 'call' && (
                      <button
                        onClick={() => handleActionClick('call')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A25A]/20 text-[#E6C98A] border border-[#C9A25A]/40 text-xs font-semibold rounded-md hover:bg-[#C9A25A]/30 transition-colors"
                      >
                        <Phone size={14} />
                        {lang === 'bn' ? 'কল করুন: 01643249148' : 'Call: 01643249148'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Related Questions Chips */}
              {msg.relatedFaqs && msg.relatedFaqs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  <span className="text-[11px] text-[#A89A86] w-full mb-0.5">
                    {lang === 'bn' ? 'সম্পর্কিত প্রশ্ন:' : 'Related questions:'}
                  </span>
                  {msg.relatedFaqs.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => handleSelectQuestion(rel)}
                      className="text-xs bg-[#1E1814] text-[#E6C98A] hover:bg-[#C9A25A]/20 px-2.5 py-1 rounded-full border border-[#C9A25A]/30 transition-colors flex items-center gap-1 text-left"
                    >
                      <span>•</span>
                      {lang === 'bn' ? rel.question_bn : rel.question_en}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Questions (Medium search match) */}
              {msg.suggestedFaqs && msg.suggestedFaqs.length > 0 && (
                <div className="mt-2 space-y-1.5 w-full max-w-[90%]">
                  {msg.suggestedFaqs.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => handleSelectQuestion(sug)}
                      className="w-full text-left text-xs bg-[#1E1814] hover:bg-[#2A221C] text-[#F3EBDD] p-2.5 rounded-lg border border-[#C9A25A]/30 transition-all flex items-center justify-between"
                    >
                      <span>{lang === 'bn' ? sug.question_bn : sug.question_en}</span>
                      <Sparkles size={12} className="text-[#C9A25A] shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* WhatsApp Fallback on Unmatched Question */}
              {msg.showWhatsAppFallback && (
                <div className="mt-2 p-3 bg-[#1E1814] border border-[#C9A25A]/30 rounded-xl text-xs space-y-2 max-w-[85%]">
                  <p className="text-[#A89A86]">
                    {lang === 'bn'
                      ? 'আমরা আপনার প্রশ্নটি নথিভুক্ত করেছি। দ্রুত উত্তর পেতে আমাদের হটলাইনে যোগাযোগ করুন:'
                      : 'We logged your question. For instant assistance, reach us at:'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleActionClick('whatsapp')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#25D366] text-white font-medium rounded-md text-xs hover:opacity-90"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </button>
                    <button
                      onClick={() => handleActionClick('call')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#C9A25A] text-[#120E0B] font-semibold rounded-md text-xs hover:bg-[#E6C98A]"
                    >
                      <Phone size={14} /> 01643249148
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 bg-[#1E1814] border border-[#C9A25A]/30 w-16 p-2.5 rounded-2xl rounded-bl-xs">
              <div className="w-2 h-2 rounded-full bg-[#C9A25A] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#C9A25A] animate-bounce [animation-delay:0.15s]" />
              <div className="w-2 h-2 rounded-full bg-[#C9A25A] animate-bounce [animation-delay:0.3s]" />
            </div>
          )}

          {/* Menu-First Questions List under active category */}
          <div className="pt-2 border-t border-[#C9A25A]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A89A86] font-semibold flex items-center gap-1">
                <HelpCircle size={12} className="text-[#C9A25A]" />
                {lang === 'bn' ? 'ট্যাপ করে উত্তর দেখুন' : 'Tap for instant answer'}
              </span>
            </div>

            <div className="space-y-1.5">
              {currentCategoryFAQs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleSelectQuestion(faq)}
                  className="w-full text-left text-xs sm:text-sm min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#1E1814] hover:bg-[#2A221C] border border-[#C9A25A]/25 hover:border-[#C9A25A] text-[#F3EBDD] font-medium transition-all flex items-center justify-between group active:scale-[0.99]"
                >
                  <span className="pr-2 leading-snug">
                    {lang === 'bn' ? faq.question_bn : faq.question_en}
                  </span>
                  <span className="text-[#C9A25A] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sm">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input for custom questions (Bangla / English / Banglish) */}
        <form
          onSubmit={handleSearchSubmit}
          className="p-3 bg-[#1E1814] border-t border-[#C9A25A]/30 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'আপনার প্রশ্ন লিখুন (যেমন: দাম কত, ডেলিভারি)...'
                : 'Type your question (e.g. price, delivery)...'
            }
            className="flex-1 bg-[#120E0B] text-sm text-[#F3EBDD] placeholder-[#A89A86]/60 px-3.5 py-2.5 rounded-xl border border-[#C9A25A]/30 focus:border-[#C9A25A] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send question"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
