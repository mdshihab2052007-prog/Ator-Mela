import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, PackageCheck, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Order, OrderStatus } from '../shared/types.ts';
import { formatPrice, formatQuantity, formatDate } from '../utils/formatters.ts';

export const OrderTrackingModal: React.FC = () => {
  const { isTrackingOpen, setIsTrackingOpen, lang, lastCreatedOrder } = useApp();

  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentOrders, setRecentOrders] = useState<{ id: string; phone: string; total?: number }[]>([]);

  useEffect(() => {
    if (isTrackingOpen) {
      if (lastCreatedOrder) {
        setOrderId(lastCreatedOrder.id);
        setPhone(lastCreatedOrder.customer_phone);
        setOrder(lastCreatedOrder);
      } else {
        const savedPhone = localStorage.getItem('ator_mela_customer_phone') || '';
        if (savedPhone) setPhone(savedPhone);
      }

      try {
        const stored = JSON.parse(localStorage.getItem('ator_mela_my_orders') || '[]');
        if (Array.isArray(stored)) {
          setRecentOrders(stored);
        }
      } catch {
        // safe fallback
      }
    }
  }, [isTrackingOpen, lastCreatedOrder]);

  if (!isTrackingOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOrder(null);

    if (!orderId.trim() || !phone.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে অর্ডার আইডি এবং ফোন নম্বর দিন'
          : 'Please enter order ID and phone number'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.order) {
        setErrorMsg(
          lang === 'bn'
            ? 'এই তথ্যে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে যাচাই করে আবার দিন।'
            : 'No order found with these credentials. Please check and try again.'
        );
      } else {
        setOrder(data.order);
      }
    } catch {
      setErrorMsg(lang === 'bn' ? 'সার্ভার সংযোগে ত্রুটি' : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { key: OrderStatus; label_bn: string; label_en: string }[] = [
    { key: 'new', label_bn: 'অর্ডার গৃহীত', label_en: 'Order Received' },
    { key: 'confirmed', label_bn: 'কনফার্ম করা হয়েছে', label_en: 'Confirmed' },
    { key: 'packed', label_bn: 'প্যাকেট প্রস্তুত', label_en: 'Packed' },
    { key: 'shipped', label_bn: 'ডেলিভারিতে রয়েছে', label_en: 'Shipped' },
    { key: 'delivered', label_bn: 'ডেলিভারি সম্পন্ন', label_en: 'Delivered' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    const statusOrder: OrderStatus[] = ['new', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (order.status === 'cancelled' || order.status === 'refused' || order.status === 'returned') {
      return stepIdx === 0 ? 'completed' : 'cancelled';
    }

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#120E0B] border border-[#C9A25A]/40 rounded-2xl p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-label="Track Your Order"
      >
        <button
          onClick={() => setIsTrackingOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-[#A89A86] hover:text-[#F3EBDD] rounded-full hover:bg-[#1E1814]"
        >
          <X size={20} />
        </button>

        <h2 className="font-cormorant text-2xl font-bold text-[#F3EBDD]">
          {lang === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
        </h2>
        <p className="text-xs text-[#A89A86] mt-1">
          {lang === 'bn'
            ? 'আপনার অর্ডার আইডি এবং মোবাইল নম্বর দিয়ে বর্তমান অবস্থা দেখুন'
            : 'Enter your order ID and mobile phone to view delivery status'}
        </p>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="AM-YYMMDD-####"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-[#1E1814] border border-[#C9A25A]/30 focus:border-[#C9A25A] rounded-xl px-3 py-2 text-sm text-[#F3EBDD] uppercase font-manrope focus:outline-hidden"
            />
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#1E1814] border border-[#C9A25A]/30 focus:border-[#C9A25A] rounded-xl px-3 py-2 text-sm text-[#F3EBDD] font-manrope focus:outline-hidden"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>{lang === 'bn' ? 'অবস্থা দেখুন' : 'Track Status'}</span>
          </button>
        </form>

        {/* Recent orders quick chips */}
        {recentOrders.length > 0 && !order && (
          <div className="mt-3.5 pt-3 border-t border-[#C9A25A]/15 text-xs text-left">
            <span className="text-[#A89A86] text-[11px] block mb-1.5 font-medium">
              {lang === 'bn' ? 'সম্প্রতি দেওয়া অর্ডারসমূহ (১-ট্যাপে চেক করুন):' : 'Recent orders on this device:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentOrders.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOrderId(item.id);
                    if (item.phone) setPhone(item.phone);
                  }}
                  className="px-2.5 py-1 bg-[#1E1814] hover:bg-[#2A2016] border border-[#C9A25A]/30 hover:border-[#C9A25A] text-[#E6C98A] rounded-lg text-xs font-manrope font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{item.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Details & Timeline if found */}
        {order && (
          <div className="mt-6 pt-5 border-t border-[#C9A25A]/25 space-y-4">
            <div className="bg-[#1E1814] p-3.5 rounded-xl border border-[#C9A25A]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#A89A86] block">
                  {lang === 'bn' ? 'অর্ডার তারিখ' : 'Date'}: {formatDate(order.created_at, lang)}
                </span>
                <span className="font-semibold text-sm text-[#F3EBDD]">
                  {order.customer_name} ({order.district})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#E6C98A] font-manrope block">
                  {formatPrice(order.total, lang)}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>

            {/* Courier Info if shipped */}
            {order.courier_name && (
              <div className="p-2.5 bg-[#16120F] border border-[#C9A25A]/20 rounded-lg text-xs flex items-center gap-2 text-[#E6C98A]">
                <Truck size={16} />
                <span>
                  {order.courier_name}{' '}
                  {order.tracking_id ? `(ট্র্যাকিং আইডি: ${order.tracking_id})` : ''}
                </span>
              </div>
            )}

            {/* Timeline Graphic */}
            <div className="py-2">
              <h4 className="text-xs font-semibold text-[#A89A86] mb-3 uppercase tracking-wider">
                {lang === 'bn' ? 'ডেলিভারি অগ্রগতি' : 'Delivery Timeline'}
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#C9A25A]/30">
                {steps.map((step) => {
                  const state = getStepStatus(step.key);
                  const isDone = state === 'completed';
                  const isCurrent = state === 'current';

                  return (
                    <div key={step.key} className="relative flex items-start gap-3 text-xs">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isDone
                            ? 'bg-emerald-500 text-black'
                            : isCurrent
                            ? 'bg-[#C9A25A] text-black font-bold ring-4 ring-[#C9A25A]/20'
                            : 'bg-[#1E1814] border border-[#C9A25A]/40 text-[#A89A86]'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={13} /> : '•'}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`font-medium block ${
                            isCurrent
                              ? 'text-[#E6C98A] font-bold'
                              : isDone
                              ? 'text-[#F3EBDD]'
                              : 'text-[#A89A86]'
                          }`}
                        >
                          {lang === 'bn' ? step.label_bn : step.label_en}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
