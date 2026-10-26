import React from 'react';
import { X, Check, MessageCircle, Phone, ArrowRight, Package } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice, formatQuantity, formatDate } from '../utils/formatters.ts';
import { StarOrnament } from './BrandVisuals.tsx';

export const OrderSuccessModal: React.FC = () => {
  const {
    lastCreatedOrder,
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    lang,
    setIsTrackingOpen,
    settings,
  } = useApp();

  if (!isOrderSuccessOpen || !lastCreatedOrder) return null;

  const order = lastCreatedOrder;
  const whatsappNumber = settings?.whatsapp || '01643249148';
  const cleanWaNumber = whatsappNumber.replace(/^0/, '880');

  const waMessage =
    lang === 'bn'
      ? `আসসালামু আলাইকুম! আতর মেলায় আমার অর্ডার আইডি: ${order.id}। মোট মূল্য: ${order.total} টাকা। বিস্তারিত কনফার্ম করতে চাই।`
      : `Assalamu alaikum! My Ator Mela order ID is ${order.id}. Total amount: Tk ${order.total}.`;

  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="w-full max-w-lg bg-[#120E0B] border border-[#C9A25A]/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-center"
        role="dialog"
        aria-modal="true"
        aria-label="Order Placed Successfully"
      >
        <button
          onClick={() => setIsOrderSuccessOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#1E1814] cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Elegant Brass Checkmark Animation Icon */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#C9A25A]/20 animate-ping opacity-30" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#967431] to-[#E6C98A] flex items-center justify-center text-[#120E0B] shadow-lg shadow-[#C9A25A]/30">
            <Check size={34} strokeWidth={3} />
          </div>
          <div className="absolute -top-1 -right-1">
            <StarOrnament size={14} />
          </div>
        </div>

        <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'ধন্যবাদ! আপনার অর্ডার গৃহীত হয়েছে' : 'Thank You! Order Received'}
        </h2>

        {/* Order ID Tag */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E1814] border border-[#C9A25A]/40 rounded-full text-xs sm:text-sm font-manrope font-bold text-[#E6C98A]">
          <span>{lang === 'bn' ? 'অর্ডার আইডি:' : 'Order ID:'}</span>
          <span className="tracking-wider">{order.id}</span>
        </div>

        {/* Confirmation promise notice */}
        <div className="mt-4 p-3 bg-[#1E1814]/80 border border-[#C9A25A]/20 rounded-xl text-xs text-[#F3EBDD]">
          <p className="font-medium text-[#E6C98A]">
            {lang === 'bn'
              ? 'আমরা কল করে আপনার অর্ডার কনফার্ম করব'
              : 'We will call you shortly to confirm your order'}
          </p>
          <p className="text-[11px] text-[#A89A86] mt-0.5">
            {lang === 'bn'
              ? `${order.customer_phone} নম্বরে খুব শীঘ্রই আমাদের প্রতিনিধি কল করবেন।`
              : `Our team will contact you at ${order.customer_phone}.`}
          </p>
        </div>

        {/* Order Brief Summary */}
        <div className="mt-5 text-left bg-[#1A1410] border border-[#C9A25A]/20 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-[#A89A86]">
            <span>{lang === 'bn' ? 'প্রাপক:' : 'Recipient:'}</span>
            <span className="text-[#F3EBDD] font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-[#A89A86]">
            <span>{lang === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
            <span className="text-[#F3EBDD] font-medium text-right max-w-[200px] truncate">
              {order.full_address}
            </span>
          </div>
          <div className="flex justify-between text-[#A89A86]">
            <span>{lang === 'bn' ? 'আইটেম:' : 'Items:'}</span>
            <span className="text-[#F3EBDD] font-medium">
              {formatQuantity(order.paid_bottles_total, lang)} {lang === 'bn' ? 'বোতল' : 'bottles'}
              {order.free_bottles_total > 0 && ` (+${formatQuantity(order.free_bottles_total, lang)} ফ্রি)`}
            </span>
          </div>
          <div className="flex justify-between text-[#A89A86] pt-1 border-t border-[#C9A25A]/15">
            <span>{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
            <span className="text-emerald-400 font-semibold">
              {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে দিন)' : 'Cash on Delivery'}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[#C9A25A]/25">
            <span className="font-bold text-[#F3EBDD] text-sm">
              {lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Total Amount:'}
            </span>
            <span className="font-manrope font-extrabold text-lg text-[#E6C98A]">
              {formatPrice(order.total, lang)}
            </span>
          </div>
        </div>

        {/* CTAs: Order Tracking Button FRONT AND CENTER */}
        <div className="mt-6 space-y-3">
          {/* Primary Action Button: Order Tracking */}
          <button
            onClick={() => {
              setIsOrderSuccessOpen(false);
              setIsTrackingOpen(true);
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#B8741A] via-[#C9A25A] to-[#E6C98A] hover:brightness-110 text-[#120E0B] font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-xl shadow-[#C9A25A]/30 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.01] active:scale-[0.98]"
          >
            <Package size={20} className="shrink-0 stroke-[2.5]" />
            <span>
              {lang === 'bn'
                ? `অর্ডার ট্র্যাক করুন (বর্তমান অবস্থা দেখুন)`
                : `Track Order Status Now`}
            </span>
            <ArrowRight size={18} className="shrink-0" />
          </button>

          {/* Secondary Action: WhatsApp message */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#1E1814] hover:bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/40 hover:border-[#25D366] font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>{lang === 'bn' ? 'WhatsApp-এ তথ্য পাঠান / আপডেট পান' : 'Send Info via WhatsApp'}</span>
          </a>

          {/* Tertiary Action: Continue Shopping */}
          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="w-full py-2.5 text-[#A89A86] hover:text-[#F3EBDD] font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{lang === 'bn' ? 'কেনাকাটা চালিয়ে যান (হোমপেজ)' : 'Continue Shopping'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
