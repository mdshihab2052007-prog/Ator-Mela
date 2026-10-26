import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  User,
  Phone,
  MapPin,
  FileText,
  Loader2,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatPrice, formatQuantity } from '../utils/formatters.ts';

// Helper to convert Bengali numerals typed in phone field to English digits
const normalizePhoneDigits = (input: string): string => {
  const bnToEn: { [key: string]: string } = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return input.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
};

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    calculation,
    clearCart,
    setLastCreatedOrder,
    setIsOrderSuccessOpen,
    deliverySettings,
    lang,
    setIsChatbotOpen,
    settings,
  } = useApp();

  const { user, userProfile, saveOrderToProfile, openAuthModal } = useAuth();

  // Load saved customer info from userProfile or localStorage
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Rajshahi');
  const [areaUpazila, setAreaUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setName(userProfile.displayName);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.district) setDistrict(userProfile.district);
      if (userProfile.areaUpazila) setAreaUpazila(userProfile.areaUpazila);
      if (userProfile.fullAddress) setFullAddress(userProfile.fullAddress);
    } else {
      const savedName = localStorage.getItem('ator_mela_customer_name');
      const savedPhone = localStorage.getItem('ator_mela_customer_phone');
      const savedDistrict = localStorage.getItem('ator_mela_district');
      const savedUpazila = localStorage.getItem('ator_mela_upazila');
      const savedAddress = localStorage.getItem('ator_mela_address');

      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedDistrict) setDistrict(savedDistrict);
      if (savedUpazila) setAreaUpazila(savedUpazila);
      if (savedAddress) setFullAddress(savedAddress);
    }
  }, [userProfile, isCheckoutOpen]);

  // Keep localStorage in sync so accidental modal closing doesn't wipe progress
  useEffect(() => {
    if (name) localStorage.setItem('ator_mela_customer_name', name);
  }, [name]);

  useEffect(() => {
    if (phone) localStorage.setItem('ator_mela_customer_phone', phone);
  }, [phone]);

  useEffect(() => {
    if (district) localStorage.setItem('ator_mela_district', district);
  }, [district]);

  useEffect(() => {
    if (areaUpazila) localStorage.setItem('ator_mela_upazila', areaUpazila);
  }, [areaUpazila]);

  useEffect(() => {
    if (fullAddress) localStorage.setItem('ator_mela_address', fullAddress);
  }, [fullAddress]);

  if (!isCheckoutOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const normalized = normalizePhoneDigits(rawVal);
    setPhone(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Clean and validate phone: 11 digits starting with 01
    const cleanPhone = normalizePhoneDigits(phone).replace(/\s+/g, '').replace(/^\+88/, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)'
          : 'Please enter a valid 11-digit mobile number (e.g. 01712345678)'
      );
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }

    if (!fullAddress.trim() || fullAddress.trim().length < 5) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা দিন'
          : 'Please enter your detailed delivery address'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: name.trim(),
        customer_phone: cleanPhone,
        district,
        area_upazila: areaUpazila.trim(),
        full_address: fullAddress.trim(),
        note: note.trim() || undefined,
        cart,
        website_hp: honeypot, // honeypot spam protection
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error || (lang === 'bn' ? 'অর্ডার করতে সমস্যা হয়েছে' : 'Failed to place order')
        );
        setIsSubmitting(false);
        return;
      }

      // If user is logged in, save the order into user's Firestore orders subcollection
      if (user && data.order) {
        try {
          await saveOrderToProfile({
            id: data.order.id,
            customerName: name.trim(),
            customerPhone: cleanPhone,
            district,
            areaUpazila: areaUpazila.trim(),
            fullAddress: fullAddress.trim(),
            note: note.trim() || undefined,
            items: data.order.items || [],
            paidBottlesTotal: data.order.paid_bottles_total,
            freeBottlesTotal: data.order.free_bottles_total,
            totalPaidMl: data.order.total_paid_ml,
            subtotal: data.order.subtotal,
            deliveryFee: data.order.delivery_fee,
            total: data.order.total,
            paymentMethod: data.order.payment_method,
            status: data.order.status || 'new',
            createdAt: data.order.created_at || new Date().toISOString(),
          });
        } catch (err) {
          console.error('Failed to save order to user Firestore profile:', err);
        }
      }

      // Order success!
      setLastCreatedOrder(data.order);
      setIsOrderSuccessOpen(true);
      clearCart();
      setIsCheckoutOpen(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#C9A25A', '#E6C98A', '#F3EBDD', '#B8741A'],
        });
      } catch {
        // Safe fallback
      }
    } catch {
      setErrorMsg(
        lang === 'bn'
          ? 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Unable to connect to server. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = settings?.whatsapp || '01643249148';
  const cleanWaNumber = whatsappNumber.replace(/^0/, '880');
  const waHelpUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    lang === 'bn'
      ? 'আসসালামু আলাইকুম! আতর মেলায় অর্ডার করতে সহায়তা প্রয়োজন।'
      : 'Assalamu alaikum! I need help with placing my order at Ator Mela.'
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#120E0B] border border-[#C9A25A]/40 rounded-2xl shadow-2xl overflow-hidden relative my-auto max-h-[94vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >
        {/* Header */}
        <div className="bg-[#1E1814] border-b border-[#C9A25A]/30 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-cormorant text-2xl font-bold tracking-wide text-[#F3EBDD]">
              {lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Confirm Your Order'}
            </h2>
            <p className="text-xs text-[#A89A86] mt-0.5">
              {lang === 'bn'
                ? 'ক্যাশ অন ডেলিভারি · পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন'
                : 'Cash on Delivery · Pay after receiving parcel'}
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#120E0B] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form Side (7 cols) */}
          <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-950/70 border border-red-500/60 rounded-xl text-xs text-red-200 font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {/* Hidden honeypot for bot detection */}
            <input
              type="text"
              name="website_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Customer Name Field */}
            <div>
              <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-[#C9A25A]" />
                <span>{lang === 'bn' ? 'আপনার নাম (Customer Name) *' : 'Your Full Name *'}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ ফয়সাল' : 'e.g. Faysal Ahmad'}
                className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3.5 py-2.5 text-sm text-[#F3EBDD] placeholder-[#A89A86]/50 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 flex items-center gap-1.5 font-hind">
                <Phone size={13} className="text-[#C9A25A]" />
                <span>
                  {lang === 'bn'
                    ? 'মোবাইল নম্বর (১১ ডিজিট) *'
                    : 'Mobile Number (11 digits) *'}
                </span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="01XXXXXXXXX"
                className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3.5 py-2.5 text-sm text-[#F3EBDD] placeholder-[#A89A86]/50 font-manrope focus:outline-hidden transition-colors"
              />
              <span className="text-[11px] text-[#A89A86] mt-1 block font-hind">
                {lang === 'bn'
                  ? 'আমরা এই নম্বরে কল করে অর্ডার কনফার্ম করব।'
                  : 'We will call this number to confirm your order.'}
              </span>
            </div>

            {/* District & Area Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 flex items-center gap-1.5 font-hind">
                  <MapPin size={13} className="text-[#C9A25A]" />
                  <span>{lang === 'bn' ? 'জেলা *' : 'District *'}</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3 py-2.5 text-sm text-[#F3EBDD] focus:outline-hidden cursor-pointer font-hind"
                >
                  <option value="Rajshahi">
                    {lang === 'bn' ? 'রাজশাহী (১–২ দিন)' : 'Rajshahi (1-2 days)'}
                  </option>
                  <option value="Chapai Nawabganj">
                    {lang === 'bn' ? 'চাঁপাইনবাবগঞ্জ (১–২ দিন)' : 'Chapai Nawabganj (1-2 days)'}
                  </option>
                  {deliverySettings?.allow_other_districts && (
                    <option value="Other">
                      {lang === 'bn' ? 'অন্যান্য জেলা (২–৩ দিন)' : 'Other Districts (2-3 days)'}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 font-hind">
                  {lang === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                </label>
                <input
                  type="text"
                  value={areaUpazila}
                  onChange={(e) => setAreaUpazila(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: বোয়ালিয়া / সদর' : 'e.g. Boalia / Sadar'}
                  className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3.5 py-2.5 text-sm text-[#F3EBDD] placeholder-[#A89A86]/50 focus:outline-hidden font-hind"
                />
              </div>
            </div>

            {/* Detailed Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 font-hind">
                {lang === 'bn'
                  ? 'সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা) *'
                  : 'Detailed Delivery Address *'}
              </label>
              <textarea
                required
                rows={2}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'যেমন: বাড়ি #১২, সাগরপাড়া মোড়, বোয়ালিয়া, রাজশাহী'
                    : 'e.g. House #12, Sagorpara, Boalia, Rajshahi'
                }
                className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3.5 py-2 text-sm text-[#F3EBDD] placeholder-[#A89A86]/50 focus:outline-hidden resize-none font-hind"
              />
            </div>

            {/* Special Instructions Note */}
            <div>
              <label className="block text-xs font-semibold text-[#F3EBDD] mb-1.5 flex items-center gap-1.5">
                <FileText size={13} className="text-[#A89A86]" />
                <span>{lang === 'bn' ? 'বিশেষ নির্দেশনা (ঐচ্ছিক)' : 'Order Note (Optional)'}</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'যেমন: উপহার হিসেবে পাঠাবো / বিকেলে ডেলিভারি দিন'
                    : 'e.g. Gift order / Deliver in evening'
                }
                className="w-full bg-[#1E1814] border border-[#C9A25A]/35 focus:border-[#C9A25A] rounded-xl px-3.5 py-2 text-sm text-[#F3EBDD] placeholder-[#A89A86]/50 focus:outline-hidden"
              />
            </div>

            {/* Confirm Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !calculation || calculation.totalPaidBottles === 0}
              className="w-full py-3.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-base rounded-xl transition-all shadow-lg hover:shadow-[#C9A25A]/30 flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{lang === 'bn' ? 'অর্ডার গ্রহণ করা হচ্ছে...' : 'Processing Order...'}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} />
                    <span>
                      {lang === 'bn'
                        ? `অর্ডার কনফার্ম করুন (${formatPrice(calculation?.total || 0, 'bn')})`
                        : `Confirm Order (${formatPrice(calculation?.total || 0, 'en')})`}
                    </span>
                  </div>
                  {name.trim() && (
                    <span className="text-[11px] font-medium text-[#120E0B]/80 truncate max-w-[280px]">
                      {lang === 'bn' ? `প্রাপক: ${name.trim()}` : `Recipient: ${name.trim()}`}
                    </span>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Order Summary Side (5 cols) */}
          <div className="md:col-span-5 bg-[#1A1410] border border-[#C9A25A]/30 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#C9A25A]/25">
                <h3 className="font-cormorant text-lg font-bold text-[#F3EBDD]">
                  {lang === 'bn' ? 'অর্ডার বিবরণী' : 'Order Summary'}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#C9A25A]/20 text-[#E6C98A] font-semibold">
                  {formatQuantity(calculation?.totalBottles || 0, lang)}{' '}
                  {lang === 'bn' ? 'বোতল' : 'bottles'}
                </span>
              </div>

              {/* Customer Name Preview Badge */}
              <div className="mt-3 p-2.5 rounded-lg bg-[#120E0B] border border-[#C9A25A]/25 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <User size={14} className="text-[#C9A25A] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#A89A86] block">
                      {lang === 'bn' ? 'অর্ডারকারী / গ্রাহক' : 'Customer Name'}
                    </span>
                    <span className="font-semibold text-[#F3EBDD] block truncate">
                      {name.trim()
                        ? name.trim()
                        : lang === 'bn'
                        ? '(বামে আপনার নাম লিখুন)'
                        : '(Enter name on left)'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#A89A86] shrink-0">
                  {district === 'Rajshahi'
                    ? lang === 'bn'
                      ? 'রাজশাহী'
                      : 'Rajshahi'
                    : district === 'Chapai Nawabganj'
                    ? lang === 'bn'
                      ? 'চাঁপাইনবাবগঞ্জ'
                      : 'Chapai'
                    : lang === 'bn'
                    ? 'অন্যান্য'
                    : 'Other'}
                </span>
              </div>

              {/* Items List */}
              {calculation && calculation.items.length > 0 ? (
                <div className="mt-3 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {calculation.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="text-xs space-y-1 p-2 rounded-lg bg-[#120E0B]/60 border border-[#C9A25A]/15"
                    >
                      <div className="flex justify-between items-start text-[#F3EBDD] gap-2">
                        <div className="min-w-0">
                          <span className="font-semibold block truncate">
                            {lang === 'bn' ? item.product.name_bn : item.product.name_en}
                          </span>
                          <span className="text-[11px] text-[#A89A86]">
                            {item.product.bottle_ml} mL ×{' '}
                            {formatQuantity(item.paidBottles, lang)}{' '}
                            {lang === 'bn' ? 'বোতল' : 'bottles'}
                          </span>
                        </div>
                        <span className="font-manrope font-bold text-[#F3EBDD] shrink-0">
                          {formatPrice(item.subtotal, lang)}
                        </span>
                      </div>

                      {item.freeBottles > 0 && (
                        <div className="flex justify-between items-center text-[#E6C98A] text-[11px] pt-1 border-t border-[#C9A25A]/20">
                          <span className="flex items-center gap-1 font-semibold">
                            <Sparkles size={11} className="text-[#C9A25A]" />
                            <span>
                              + {formatQuantity(item.freeBottles, lang)}{' '}
                              {lang === 'bn' ? 'বোতল ফ্রি' : 'Free bottle'}
                            </span>
                          </span>
                          <span className="line-through opacity-70 text-[10px]">
                            {formatPrice(
                              item.freeBottles * item.product.price_per_ml * item.product.bottle_ml,
                              lang
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 text-center bg-[#120E0B] rounded-xl border border-[#C9A25A]/20 space-y-2">
                  <ShoppingBag size={24} className="mx-auto text-[#A89A86]" />
                  <p className="text-xs text-[#A89A86]">
                    {lang === 'bn' ? 'ব্যাগ খালি' : 'Cart is empty'}
                  </p>
                </div>
              )}

              {/* Total Calculation */}
              {calculation && (
                <div className="mt-4 pt-3 border-t border-[#C9A25A]/25 space-y-2 text-xs text-[#A89A86]">
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'মোট বোতল' : 'Total Bottles'}:</span>
                    <span className="font-manrope font-semibold text-[#F3EBDD]">
                      {formatQuantity(calculation.totalBottles, lang)}{' '}
                      {calculation.totalFreeBottles > 0 &&
                        `(${formatQuantity(calculation.totalPaidBottles, lang)} + ${formatQuantity(calculation.totalFreeBottles, lang)} ফ্রি)`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'আতরের দাম' : 'Subtotal'}:</span>
                    <span className="font-manrope font-semibold text-[#F3EBDD]">
                      {formatPrice(calculation.subtotal, lang)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}:</span>
                    <span className="font-manrope font-bold">
                      {calculation.freeDeliveryEarned ? (
                        <span className="text-emerald-400 uppercase tracking-wider font-bold">
                          {lang === 'bn' ? 'ফ্রি' : 'FREE'}
                        </span>
                      ) : (
                        <span className="text-[#F3EBDD]">
                          {formatPrice(calculation.deliveryFee, lang)}
                        </span>
                      )}
                    </span>
                  </div>

                  {calculation.savings > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>{lang === 'bn' ? 'মোট সাশ্রয়' : 'Total Savings'}:</span>
                      <span className="font-manrope font-bold">
                        {formatPrice(calculation.savings, lang)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t border-[#C9A25A]/35">
                    <span className="text-sm font-bold text-[#F3EBDD]">
                      {lang === 'bn' ? 'মোট মূল্য' : 'Total'}:
                    </span>
                    <span className="text-2xl font-extrabold text-[#E6C98A] font-manrope">
                      {formatPrice(calculation.total, lang)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Guarantee & Help */}
            <div className="pt-3 border-t border-[#C9A25A]/20 space-y-2 text-xs text-[#A89A86] font-hind">
              <div className="flex items-center gap-2 text-emerald-400">
                <Truck size={15} />
                <span>
                  {district === 'Chapai Nawabganj'
                    ? lang === 'bn'
                      ? 'চাঁপাইনবাবগঞ্জে ১–২ দিনে পৌঁছে দেওয়া হয়'
                      : 'Delivery in Chapai Nawabganj within 1-2 days'
                    : district === 'Other'
                    ? lang === 'bn'
                      ? 'অন্যান্য জেলায় ২–৩ দিনে পৌঁছে দেওয়া হয়'
                      : 'Delivery in 2-3 days'
                    : lang === 'bn'
                    ? 'রাজশাহীতে ১–২ দিনে পৌঁছে দেওয়া হয়'
                    : 'Delivery in Rajshahi within 1-2 days'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsChatbotOpen(true, 'delivery_payment')}
                  className="text-[#C9A25A] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <HelpCircle size={12} />
                  <span>
                    {lang === 'bn'
                      ? 'ডেলিভারি নিয়ে কোনো প্রশ্ন আছে?'
                      : 'Questions about delivery?'}
                  </span>
                </button>

                <a
                  href={waHelpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <MessageCircle size={12} />
                  <span>{lang === 'bn' ? 'সহায়তা' : 'WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
