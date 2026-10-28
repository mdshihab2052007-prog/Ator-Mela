import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPrice, formatQuantity } from '../utils/formatters.ts';
import { LuxuryBottle } from './BrandVisuals.tsx';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    calculation,
    cart,
    updateQuantity,
    removeFromCart,
    addOneMoreBottleForFreeDelivery,
    setIsCheckoutOpen,
    lang,
    offer,
  } = useApp();

  if (!isCartOpen) return null;

  const isOfferActive = offer && offer.active && offer.claimed_count < offer.buyer_limit;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#120E0B] border-l border-[#C9A25A]/30 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#1E1814] border-b border-[#C9A25A]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-cormorant text-2xl font-bold tracking-wide text-[#F3EBDD]">
              {lang === 'bn' ? 'আপনার ব্যাগ' : 'Your Cart'}
            </h2>
            {calculation && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A25A]/20 text-[#E6C98A] font-manrope font-semibold">
                {formatQuantity(calculation.totalBottles, lang)}{' '}
                {lang === 'bn' ? 'বোতল' : 'bottles'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#120E0B] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Delivery Charge Free Nudge Strip */}
        {calculation && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#2A2016] to-[#1E1814] border-b border-[#C9A25A]/30 flex items-center justify-between text-xs sm:text-sm">
            {calculation.freeDeliveryEarned ? (
              <div className="flex items-center gap-2 text-[#E6C98A] font-medium w-full">
                <CheckCircle2 size={16} className="text-[#C9A25A] shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'অভিনন্দন! আপনার ডেলিভারি চার্জ সম্পূর্ণ ফ্রি 🎉'
                    : 'Congratulations! Your delivery charge is free 🎉'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5 text-[#F3EBDD]">
                  <Sparkles size={15} className="text-[#C9A25A] shrink-0" />
                  <span>
                    {lang === 'bn' ? (
                      <>
                        আর{' '}
                        <strong className="text-[#E6C98A]">
                          {formatQuantity(calculation.bottlesNeededForFreeDelivery, 'bn')}টি
                        </strong>{' '}
                        বোতল নিলে ডেলিভারি চার্জ ফ্রি
                      </>
                    ) : (
                      <>
                        Add{' '}
                        <strong className="text-[#E6C98A]">
                          {calculation.bottlesNeededForFreeDelivery} more
                        </strong>{' '}
                        bottle for free delivery charge
                      </>
                    )}
                  </span>
                </div>
                <button
                  onClick={addOneMoreBottleForFreeDelivery}
                  className="px-2.5 py-1 bg-[#C9A25A] text-[#120E0B] font-bold text-xs rounded-md hover:bg-[#E6C98A] transition-colors shadow-xs active:scale-95 shrink-0 font-hind cursor-pointer"
                >
                  {lang === 'bn' ? '+১ বোতল' : '+1 bottle'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!calculation || calculation.items.length === 0 || cart.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1E1814] border border-[#C9A25A]/20 flex items-center justify-center text-[#C9A25A]">
                <Sparkles size={28} />
              </div>
              <p className="text-base text-[#F3EBDD] font-medium">
                {lang === 'bn' ? 'আপনার ব্যাগ খালি' : 'Your cart is empty'}
              </p>
              <p className="text-xs text-[#A89A86] max-w-xs">
                {lang === 'bn'
                  ? 'আমাদের ৩টি প্রিমিয়াম সুবাস থেকে আপনার পছন্দের আতর বেছে নিন।'
                  : 'Choose your signature scent from our collection of pure attars.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calculation.items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-[#1E1814] border border-[#C9A25A]/25 rounded-xl flex gap-3 relative overflow-hidden"
                >
                  {/* Accent line on left */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: item.product.accent_hex }}
                  />

                  {/* Thumbnail / Visual Bottle */}
                  <div className="w-14 h-20 bg-[#120E0B] rounded-lg border border-[#C9A25A]/20 flex items-center justify-center shrink-0">
                    <LuxuryBottle
                      accentHex={item.product.accent_hex}
                      name={item.product.name_en}
                      size="sm"
                      glow={false}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-semibold text-sm text-[#F3EBDD] truncate">
                          {lang === 'bn' ? item.product.name_bn : item.product.name_en}
                        </h4>
                        <p className="text-xs text-[#A89A86]">
                          {lang === 'bn' ? item.product.mood_bn : item.product.mood_en} ·{' '}
                          {formatQuantity(item.product.bottle_ml, lang)}{' '}
                          {lang === 'bn' ? 'মিলি' : 'mL'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[#A89A86] hover:text-red-400 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Paid Item Stepper and Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#C9A25A]/30 rounded-lg bg-[#120E0B] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.paidBottles - 1)}
                          className="px-2 py-1 text-[#A89A86] hover:text-[#F3EBDD] hover:bg-[#1E1814]"
                          aria-label="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-bold text-[#F3EBDD] font-manrope">
                          {formatQuantity(item.paidBottles, lang)}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.paidBottles + 1)}
                          className="px-2 py-1 text-[#A89A86] hover:text-[#F3EBDD] hover:bg-[#1E1814]"
                          aria-label="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-manrope font-bold text-sm text-[#F3EBDD]">
                          {formatPrice(item.subtotal, lang)}
                        </span>
                      </div>
                    </div>

                    {/* Separate 'FREE' line in brass if offer qualified */}
                    {item.freeBottles > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#C9A25A]/20 flex items-center justify-between bg-[#C9A25A]/10 -mx-3 -mb-3 p-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#E6C98A] font-semibold">
                          <span className="px-1.5 py-0.5 rounded bg-[#C9A25A] text-[#120E0B] font-bold text-[10px]">
                            FREE
                          </span>
                          <span>
                            +
                            {lang === 'bn'
                              ? `${formatQuantity(item.freeBottles, 'bn')}টি ফ্রি বোতল (অফার)`
                              : `${item.freeBottles} Free Bottle (Launch Offer)`}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#E6C98A] font-manrope line-through opacity-75">
                          {formatPrice(
                            item.freeBottles * item.product.price_per_ml * item.product.bottle_ml,
                            lang
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Calculation & Checkout CTA */}
        {calculation && calculation.totalPaidBottles > 0 && (
          <div className="p-4 bg-[#1E1814] border-t border-[#C9A25A]/30 space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-[#A89A86]">
              <div className="flex justify-between">
                <span>
                  {lang === 'bn' ? 'আতরের মূল্য' : 'Subtotal'} ({formatQuantity(calculation.totalPaidBottles, lang)}{' '}
                  {lang === 'bn' ? 'বোতল' : 'bottles'}):
                </span>
                <span className="font-manrope font-semibold text-[#F3EBDD]">
                  {formatPrice(calculation.subtotal, lang)}
                </span>
              </div>

              {calculation.totalFreeBottles > 0 && (
                <div className="flex justify-between text-[#E6C98A]">
                  <span>
                    {lang === 'bn' ? 'ফ্রি বোতল' : 'Free Bottles'} (
                    {formatQuantity(calculation.totalFreeBottles, lang)}{' '}
                    {lang === 'bn' ? 'বোতল' : 'bottles'}):
                  </span>
                  <span className="font-bold">
                    {lang === 'bn' ? '০ টাকা (ফ্রি)' : 'FREE'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}:</span>
                <span className="font-manrope font-semibold">
                  {calculation.freeDeliveryEarned ? (
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">
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
                <div className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-[#C9A25A]/15">
                  <span>{lang === 'bn' ? 'আপনার মোট সাশ্রয়' : 'Total Savings'}:</span>
                  <span className="font-manrope font-bold">
                    {formatPrice(calculation.savings, lang)}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-2 border-t border-[#C9A25A]/30">
              <span className="text-sm font-semibold text-[#F3EBDD]">
                {lang === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Amount'}:
              </span>
              <span className="text-2xl font-extrabold text-[#E6C98A] font-manrope">
                {formatPrice(calculation.total, lang)}
              </span>
            </div>

            {/* Minimum 6 mL Warning */}
            {calculation.totalPaidBottles < 2 && (
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs text-center font-medium">
                {lang === 'bn'
                  ? '⚠️ সর্বনিম্ন অর্ডার ৬ মিলি (২টি বোতল)। অনুগ্রহ করে অন্তত ৬ মিলি নির্বাচন করুন।'
                  : '⚠️ Minimum order is 6 mL (2 bottles). Please select at least 6 mL.'}
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (calculation.totalPaidBottles < 2) return;
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              disabled={calculation.totalPaidBottles < 2}
              className={`w-full py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-bold text-base ${
                calculation.totalPaidBottles < 2
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] hover:shadow-[#C9A25A]/20 cursor-pointer active:scale-[0.99]'
              }`}
            >
              <span>
                {calculation.totalPaidBottles < 2
                  ? (lang === 'bn' ? 'সর্বনিম্ন অর্ডার ৬ মিলি প্রয়োজন' : 'Minimum 6 mL Order Required')
                  : (lang === 'bn' ? 'অর্ডার করতে এগিয়ে যান' : 'Proceed to Checkout')}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
