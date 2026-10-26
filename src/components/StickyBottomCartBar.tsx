import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice, formatQuantity } from '../utils/formatters.ts';

export const StickyBottomCartBar: React.FC = () => {
  const { calculation, lang, setIsCheckoutOpen, setIsCartOpen } = useApp();

  if (!calculation || calculation.totalPaidBottles === 0) {
    return null;
  }

  const { totalPaidBottles, totalFreeBottles, totalBottles, total } = calculation;

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#16120F]/95 backdrop-blur-md border-t border-[#C9A25A]/40 p-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Summary */}
        <div
          onClick={() => setIsCartOpen(true)}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-manrope font-bold text-xs text-[#F3EBDD]">
              {formatQuantity(totalBottles, lang)} {lang === 'bn' ? 'বোতল' : 'bottles'}
            </span>
            {totalFreeBottles > 0 && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                ({formatQuantity(totalFreeBottles, lang)} {lang === 'bn' ? 'ফ্রি' : 'free'})
              </span>
            )}
            <span className="text-[#C9A25A]">·</span>
            <span className="font-manrope font-extrabold text-sm text-[#E6C98A]">
              {formatPrice(total, lang)}
            </span>
          </div>

          <span className="text-[10px] text-[#A89A86] block truncate">
            {calculation.freeDeliveryEarned
              ? lang === 'bn'
                ? 'ডেলিভারি ফ্রি পেয়েছেন 🎉'
                : 'Free delivery applied 🎉'
              : lang === 'bn'
              ? 'ক্যাশ অন ডেলিভারি'
              : 'Cash on delivery'}
          </span>
        </div>

        {/* Right: Checkout CTA */}
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="py-2.5 px-4 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
        >
          <ShoppingBag size={14} />
          <span>{lang === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
