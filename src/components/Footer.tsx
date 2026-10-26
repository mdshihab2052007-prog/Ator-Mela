import React, { useState } from 'react';
import { Phone, MessageCircle, ShieldCheck, Heart, ExternalLink, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { BrandLogo, StarOrnament } from './BrandVisuals.tsx';

export const Footer: React.FC<{ onOpenFaqPage: () => void }> = ({ onOpenFaqPage }) => {
  const { lang, settings, setIsAdminView } = useApp();
  const [showPolicyModal, setShowPolicyModal] = useState<string | null>(null);

  const phone = settings?.phone || '01643249148';
  const whatsapp = settings?.whatsapp || '01643249148';
  const cleanWa = whatsapp.replace(/^0/, '880');
  const fbUrl = settings?.fb_page_url;

  return (
    <footer className="bg-[#0D0A08] border-t border-[#C9A25A]/25 pt-12 pb-24 sm:pb-12 px-4 text-xs text-[#A89A86]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#C9A25A]/15">
        {/* Brand Col (5 cols) */}
        <div className="md:col-span-5 space-y-4 text-center md:text-left">
          <BrandLogo className="origin-left" />
          <p className="max-w-sm text-[#A89A86] leading-relaxed mx-auto md:mx-0">
            {lang === 'bn'
              ? 'খাঁটি পারফিউম অয়েল (আতর), সাশ্রয়ী দামে। কোনো ভেজাল বা অতিরিক্ত দাম নেই। ক্যাশ অন ডেলিভারি সুবিধা সহ।'
              : 'Pure concentrated attar perfume oils at honest prices. 100% alcohol-free with Cash on Delivery.'}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E1814] border border-[#C9A25A]/30 text-emerald-400 font-medium">
            <ShieldCheck size={16} />
            <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে দিন)' : 'Cash on Delivery Available'}</span>
          </div>
        </div>

        {/* Contact info (4 cols) */}
        <div className="md:col-span-4 space-y-3 text-center md:text-left">
          <h4 className="font-cormorant text-lg font-bold text-[#F3EBDD]">
            {lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Contact & Helpline'}
          </h4>

          <div className="space-y-2">
            <a
              href={`tel:+88${phone.replace(/^0/, '')}`}
              className="flex items-center justify-center md:justify-start gap-2 text-[#F3EBDD] hover:text-[#E6C98A] transition-colors"
            >
              <Phone size={14} className="text-[#C9A25A]" />
              <span>{phone}</span>
            </a>

            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center md:justify-start gap-2 text-[#F3EBDD] hover:text-[#25D366] transition-colors"
            >
              <MessageCircle size={14} className="text-[#25D366]" />
              <span>WhatsApp: {whatsapp}</span>
            </a>

            {/* Facebook link */}
            <a
              href={fbUrl || 'https://www.facebook.com/share/1F2jSKW9VL/'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center md:justify-start gap-2 text-[#F3EBDD] hover:text-[#1877F2] transition-colors"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{lang === 'bn' ? 'ফেসবুক পেজ ভিজিট করুন' : 'Visit Facebook Page'}</span>
            </a>

            <p className="text-[11px] text-[#A89A86] pt-1">
              {lang === 'bn'
                ? 'ডেলিভারি এলাকা: রাজশাহী ও চাঁপাইনবাবগঞ্জ'
                : 'Delivery: Rajshahi & Chapai Nawabganj'}
            </p>
          </div>
        </div>

        {/* Quick Links & Policies (3 cols) */}
        <div className="md:col-span-3 space-y-3 text-center md:text-left">
          <h4 className="font-cormorant text-lg font-bold text-[#F3EBDD]">
            {lang === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
          </h4>

          <ul className="space-y-1.5">
            <li>
              <button
                onClick={onOpenFaqPage}
                className="hover:text-[#E6C98A] transition-colors underline cursor-pointer"
              >
                {lang === 'bn' ? 'সকল সচরাচর জিজ্ঞাসা (FAQ Page)' : 'All FAQs (Directory)'}
              </button>
            </li>
            <li>
              <button
                onClick={() => setShowPolicyModal('delivery')}
                className="hover:text-[#E6C98A] transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ডেলিভারি নীতিমালা' : 'Delivery Policy'}
              </button>
            </li>
            <li>
              <button
                onClick={() => setShowPolicyModal('return')}
                className="hover:text-[#E6C98A] transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'রিপ্লেসমেন্ট ও ফেরত' : 'Replacement & Return'}
              </button>
            </li>
            <li>
              <button
                onClick={() => setIsAdminView(true)}
                className="inline-flex items-center gap-1 text-[#A89A86] hover:text-[#C9A25A] pt-2 transition-colors cursor-pointer"
              >
                <Lock size={12} />
                <span>{lang === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Panel'}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright row */}
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
        <p>© {new Date().getFullYear()} Ator Mela (আতর মেলা). সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="flex items-center gap-1">
          <span>Made with pure scent in Bangladesh</span>
          <StarOrnament size={10} />
        </p>
      </div>

      {/* Simple Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1E1814] border border-[#C9A25A]/40 rounded-2xl p-6 max-w-md w-full space-y-3 text-left">
            <h3 className="font-cormorant text-xl font-bold text-[#F3EBDD]">
              {showPolicyModal === 'delivery'
                ? lang === 'bn'
                  ? 'ডেলিভারি নীতিমালা'
                  : 'Delivery Policy'
                : lang === 'bn'
                ? 'রিপ্লেসমেন্ট ও ফেরত নীতি'
                : 'Replacement & Return Policy'}
            </h3>
            <p className="text-xs text-[#A89A86] leading-relaxed">
              {showPolicyModal === 'delivery'
                ? lang === 'bn'
                  ? 'ডেলিভারি চার্জ ফ্ল্যাট ৩০ টাকা। ১০ মিলি বা তার বেশি (৪টি বা তার বেশি বোতল) নিলে ডেলিভারি সম্পূর্ণ ফ্রি। রাজশাহী ও চাঁপাইনবাবগঞ্জে অর্ডার কনফার্মের পর ১–২ কার্যদিবসে ডেলিভারি সম্পন্ন করা হয়।'
                  : 'Flat delivery fee is Tk 30. Free delivery on orders over 10 mL (4+ bottles). Deliveries in Rajshahi and Chapai Nawabganj take 1-2 business days after phone confirmation.'
                : lang === 'bn'
                ? 'ডেলিভারিম্যানের সামনে পার্সেল চেক করে গ্রহণ করুন। ভাঙা বোতল বা ভুল আতর পেলে সাথে সাথে ডেলিভারিম্যানকে জানান, আমরা বিনামূল্যে রিপ্লেস করে দেব। খোলা ও ব্যবহৃত আতর ফেরতযোগ্য নয়।'
                : 'Inspect your parcel upon delivery. If you receive a wrong scent or damaged bottle, notify the courier on the spot for a free replacement. Opened and used bottles cannot be returned.'}
            </p>
            <button
              onClick={() => setShowPolicyModal(null)}
              className="w-full py-2 bg-[#C9A25A] text-[#120E0B] font-bold text-xs rounded-xl mt-2"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
