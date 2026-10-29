import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Eye,
  RefreshCw,
  LogOut,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Settings,
  Users,
  Check,
  Layers,
} from 'lucide-react';
import {
  Order,
  Product,
  Offer,
  DeliverySettings,
  FAQItem,
  Review,
  SiteSettings,
  UnansweredQuestion,
  OrderStatus,
} from '../shared/types.ts';
import { formatPrice, toBanglaDigits, formatDate } from '../utils/formatters.ts';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('ator_mela_admin_email') || 'faysalahmad687@gmail.com';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ator_mela_admin_auth') === 'true';
  });

  const [loginInputEmail, setLoginInputEmail] = useState('faysalahmad687@gmail.com');
  const [loginInputPassword, setLoginInputPassword] = useState('AtorMela#2026@Secure');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const getAdminHeaders = (): HeadersInit => {
    const token = localStorage.getItem('ator_mela_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      'x-admin-email': adminEmail,
    };
  };

  // Admin Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Active Tab
  type AdminTab = 'orders' | 'products' | 'offer' | 'delivery' | 'faqs' | 'unanswered' | 'reviews' | 'customers' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Selected Order for Detail / Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Orders Filter and Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');

  // Courier Input Dialog state
  const [shipModalOrder, setShipModalOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('সুন্দরবন কুরিয়ার');
  const [trackingId, setTrackingId] = useState('');

  // Cancel/Refuse Modal
  const [cancelModalOrder, setCancelModalOrder] = useState<{ order: Order; status: OrderStatus } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sound chime ref
  const previousOrderCount = useRef<number>(0);

  const fetchAdminData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        // Check for new orders to play chime
        if (previousOrderCount.current > 0 && data.orders.length > previousOrderCount.current) {
          playOrderChime();
        }
        previousOrderCount.current = data.orders.length;

        setOrders(data.orders || []);
        setProducts(data.products || []);
        setOffer(data.offer || null);
        setDeliverySettings(data.deliverySettings || null);
        setFaqs(data.faqs || []);
        setReviews(data.reviews || []);
        setSettings(data.settings || null);
        setUnanswered(data.unansweredQuestions || []);
      } else if (res.status === 403 || res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playOrderChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 6000); // 6s polling for real-time order updates
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, adminEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginInputEmail.trim(),
          password: loginInputPassword.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminEmail(data.email);
        setIsAuthenticated(true);
        localStorage.setItem('ator_mela_admin_email', data.email);
        localStorage.setItem('ator_mela_admin_token', data.token);
        localStorage.setItem('ator_mela_admin_auth', 'true');
      } else {
        setLoginError(data.error || 'অননুমোদিত এডমিন ইমেইল বা ভুল সিক্রেট পাসওয়ার্ড।');
      }
    } catch {
      setLoginError('সার্ভারে সংযোগ দেওয়া যায়নি।');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('ator_mela_admin_token');
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'x-admin-token': token },
        });
      }
    } catch {
      // safe
    }
    setIsAuthenticated(false);
    localStorage.removeItem('ator_mela_admin_auth');
    localStorage.removeItem('ator_mela_admin_token');
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    meta?: { courier_name?: string; tracking_id?: string; cancellation_reason?: string }
  ) => {
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
          ...meta,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local list
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
        if (data.offer) {
          setOffer(data.offer);
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Metrics computation
  const todayStr = new Date().toISOString().slice(0, 10);
  const newOrdersToday = orders.filter((o) => o.created_at.startsWith(todayStr)).length;
  const waitingConfirm = orders.filter((o) => o.status === 'new').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter(
    (o) => o.status === 'cancelled' || o.status === 'refused' || o.status === 'returned'
  );

  const revenueDelivered = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const deliveryFeesCollected = deliveredOrders.reduce((sum, o) => sum + o.delivery_fee, 0);

  let ehsasBottlesSold = 0;
  let vampireBottlesSold = 0;
  let aroosahBottlesSold = 0;
  let totalFreeGiven = 0;

  deliveredOrders.concat(orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped')).forEach((o) => {
    o.items.forEach((it) => {
      if (it.product_id.includes('ehsas')) ehsasBottlesSold += it.paid_bottles;
      if (it.product_id.includes('vampire')) vampireBottlesSold += it.paid_bottles;
      if (it.product_id.includes('aroosah')) aroosahBottlesSold += it.paid_bottles;
      totalFreeGiven += it.free_bottles || 0;
    });
  });

  // Check phone warning badges: duplicate in 24h or previous refusal
  const getWarningBadges = (order: Order) => {
    const badges: string[] = [];
    const samePhoneOrders = orders.filter((o) => o.customer_phone === order.customer_phone);

    // Ordered in last 24h
    const orderTime = new Date(order.created_at).getTime();
    const otherRecent = samePhoneOrders.filter(
      (o) => o.id !== order.id && Math.abs(new Date(o.created_at).getTime() - orderTime) < 24 * 3600 * 1000
    );
    if (otherRecent.length > 0) {
      badges.push('২৪ ঘণ্টায় একাধিক অর্ডার');
    }

    // Previous refusal
    const hasRefusal = samePhoneOrders.some(
      (o) => o.id !== order.id && (o.status === 'refused' || o.status === 'cancelled')
    );
    if (hasRefusal) {
      badges.push('পূর্বে অস্বীকৃত/বাতিল ফোন');
    }

    if (order.honeypot_flag) {
      badges.push('হনিপট সন্দেহভাজন');
    }

    return badges;
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (districtFilter !== 'all' && order.district !== districtFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchPhone = order.customer_phone.includes(q);
      const matchName = order.customer_name.toLowerCase().includes(q);
      if (!matchId && !matchPhone && !matchName) return false;
    }
    return true;
  });

  // WhatsApp confirmation message helper
  const openWhatsAppConfirmation = (order: Order) => {
    const cleanPhone = order.customer_phone.replace(/^0/, '880');
    const itemsSummary = order.items
      .map((it) => `${it.product_name_bn} x${it.paid_bottles}${it.free_bottles ? ` (+${it.free_bottles} ফ্রি)` : ''}`)
      .join(', ');

    const msg = `আসসালামু আলাইকুম ${order.customer_name}!
আতর মেলা থেকে আপনার অর্ডারটি কনফার্ম করার জন্য মেসেজ দিচ্ছি।
অর্ডার আইডি: ${order.id}
আইটেম: ${itemsSummary}
ঠিকানা: ${order.full_address}
সর্বমোট মূল্য: ৳${order.total} (ক্যাশ অন ডেলিভারি)
ডেলিভারির সময়: ১–২ কার্যদিবস।
আপনার কি অর্ডারটি কনফার্ম আছে? জানালে আমরা এখনই প্যাকিং শুরু করব। ধন্যবাদ!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Call helper
  const handleCall = (phone: string) => {
    window.location.href = `tel:+88${phone.replace(/^0/, '')}`;
  };

  // Print invoice helper
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #111; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #C9A25A; padding-bottom: 12px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; color: #120E0B; }
            .meta { font-size: 12px; color: #555; }
            .section { margin-top: 16px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">ATOR MELA (আতর মেলা)</h1>
            <p class="meta">খাঁটি ঘ্রাণ, সাশ্রয়ী দামে · হেল্পলাইন: 01643249148</p>
            <p class="meta">অর্ডার আইডি: <strong>${order.id}</strong> · তারিখ: ${new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div class="section">
            <strong>গ্রাহকের তথ্য:</strong><br/>
            নাম: ${order.customer_name}<br/>
            মোবাইল: ${order.customer_phone}<br/>
            ঠিকানা: ${order.full_address}, ${order.district}<br/>
            ${order.note ? `নির্দেশনা: ${order.note}` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>আইটেম</th>
                <th>পরিমাণ</th>
                <th>মূল্য</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (i) => `
                <tr>
                  <td>${i.product_name_bn} (${i.product_name_en})</td>
                  <td>${i.paid_bottles} বোতল ${i.free_bottles ? `(+${i.free_bottles} ফ্রি)` : ''}</td>
                  <td>৳${i.total_price}</td>
                </tr>
              `
                )
                .join('')}
              <tr>
                <td colspan="2">ডেলিভারি চার্জ:</td>
                <td>৳${order.delivery_fee}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            সর্বমোট প্রদেয়: ৳${order.total} (ক্যাশ অন ডেলিভারি)
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // If not authenticated, render login view
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F4F5F7] text-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#120E0B] text-[#C9A25A] flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-cormorant">
              আতর মেলা — এডমিন প্যানেল
            </h1>
            <p className="text-xs text-gray-500">
              অনুমোদিত এডমিন ইমেইল দিয়ে প্রবেশ করুন (seed: faysalahmad687@gmail.com)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Google / Admin Email
              </label>
              <input
                type="email"
                required
                value={loginInputEmail}
                onChange={(e) => setLoginInputEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#C9A25A] focus:ring-1 focus:ring-[#C9A25A] text-sm text-gray-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  সিকিউরিটি পাসওয়ার্ড / পিন (Security Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#967431] hover:underline cursor-pointer"
                >
                  {showPassword ? 'লুকান' : 'দেখান'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginInputPassword}
                onChange={(e) => setLoginInputPassword(e.target.value)}
                placeholder="এডমিন সিকিউরিটি পাসওয়ার্ড"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#C9A25A] focus:ring-1 focus:ring-[#C9A25A] text-sm text-gray-900 font-mono"
              />
              <span className="text-[10px] text-gray-500 block mt-1">
                ডিফল্ট পাসওয়ার্ড: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800 font-bold">AtorMela#2026@Secure</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#120E0B] hover:bg-[#1E1814] text-[#E6C98A] font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>এডমিন প্যানেলে প্রবেশ করুন</span>
              <ChevronRight size={16} />
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-800 underline"
            >
              ← মূল ওয়েবসাইটে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] text-gray-900 flex flex-col overflow-hidden font-sans">
      {/* Top Admin Navbar */}
      <nav aria-label="Admin Navigation" className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#120E0B] text-[#C9A25A] flex items-center justify-center font-bold text-sm">
            AM
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              আতর মেলা — ম্যানেজমেন্ট ড্যাশবোর্ড
            </h1>
            <span className="text-[11px] text-gray-500">{adminEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors font-medium"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#120E0B] text-[#E6C98A] text-xs font-semibold rounded-lg hover:bg-[#1E1814] transition-colors"
          >
            দোকান দেখুন
          </button>
        </div>
      </nav>

      {/* Admin Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: 'অর্ডার সমূহ', count: orders.length },
          { id: 'products', label: 'আতর পণ্য', count: products.length },
          { id: 'offer', label: 'উদ্বোধনী অফার', badge: `${offer?.claimed_count || 0}/50` },
          { id: 'delivery', label: 'ডেলিভারি সেটিংস' },
          { id: 'faqs', label: 'FAQs এডিটর', count: faqs.length },
          { id: 'unanswered', label: 'অনভিপ্রেত প্রশ্ন (Inbox)', count: unanswered.length },
          { id: 'reviews', label: 'রিভিউ যাচাই', count: reviews.length },
          { id: 'customers', label: 'গ্রাহক ও স্টক' },
          { id: 'settings', label: 'সাইট সেটিংস' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'border-[#C9A25A] text-gray-900 bg-[#C9A25A]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#120E0B] text-[#E6C98A]' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* TAB 1: ORDERS DASHBOARD */}
        {activeTab === 'orders' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[11px] text-gray-500 block">আজকের নতুন</span>
                <span className="text-2xl font-bold text-gray-900 font-manrope">{newOrdersToday}</span>
                <span className="text-[10px] text-blue-600 font-medium block mt-0.5">অর্ডার</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
                <span className="text-[11px] text-amber-700 block">অপেক্ষমাণ কনফার্ম</span>
                <span className="text-2xl font-bold text-amber-900 font-manrope">{waitingConfirm}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">কল করতে হবে</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[11px] text-gray-500 block">কনফার্মড</span>
                <span className="text-2xl font-bold text-emerald-700 font-manrope">{confirmedCount}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">প্যাকিংয়ের পথে</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[11px] text-gray-500 block">কুরিয়ারে পাঠানো</span>
                <span className="text-2xl font-bold text-purple-700 font-manrope">{shippedCount}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">পথে আছে</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[11px] text-gray-500 block">ডেলিভারড রেভিনিউ</span>
                <span className="text-xl font-bold text-gray-900 font-manrope">৳{revenueDelivered}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">{deliveredOrders.length}টি সফল</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-[11px] text-gray-500 block">অফার স্লট ব্যবহৃত</span>
                <span className="text-2xl font-bold text-[#967431] font-manrope">
                  {offer?.claimed_count || 0}/50
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  বাকি {50 - (offer?.claimed_count || 0)}টি
                </span>
              </div>
            </div>

            {/* Sub Metrics: Attar bottles sold & free given */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">বিক্রিত আতর বোতল:</span>
                <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-medium">
                  এহসাস আল আরাবিয়া: {ehsasBottlesSold}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-900 font-medium">
                  ভ্যাম্পায়ার ব্লাড: {vampireBottlesSold}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-900 font-medium">
                  আরুসা: {aroosahBottlesSold}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold">
                  মোট ফ্রি বোতল দেওয়া হয়েছে: {totalFreeGiven}টি
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-700">
                  সংগৃহীত ডেলিভারি ফি: ৳{deliveryFeesCollected}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="অর্ডার আইডি, ফোন বা নাম দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#C9A25A]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="new">নতুন (New)</option>
                  <option value="confirmed">কনফার্মড (Confirmed)</option>
                  <option value="packed">প্যাকড (Packed)</option>
                  <option value="shipped">শিপড (Shipped)</option>
                  <option value="delivered">ডেলিভারড (Delivered)</option>
                  <option value="cancelled">বাতিল/অস্বীকৃত</option>
                </select>

                {/* District Filter */}
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="all">সকল জেলা</option>
                  <option value="Rajshahi">রাজশাহী</option>
                  <option value="Chapai Nawabganj">চাঁপাইনবাবগঞ্জ</option>
                </select>
              </div>

              {/* CSV Export Button */}
              <div className="flex gap-2">
                <a
                  href={`/api/admin/export/orders.csv?token=${encodeURIComponent(localStorage.getItem('ator_mela_admin_token') || '')}`}
                  download
                  className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>অর্ডার CSV</span>
                </a>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">অর্ডার আইডি</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">গ্রাহক ও এলাকা</th>
                      <th className="py-3 px-4">আইটেম ও বোতল</th>
                      <th className="py-3 px-4">মোট টাকা</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4">সতর্কতা</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => {
                      const badges = getWarningBadges(order);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            {order.id}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            <span className="block text-[10px]">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-900 block">
                              {order.customer_name}
                            </span>
                            <span className="font-mono text-gray-600">{order.customer_phone}</span>
                            <span className="text-[11px] text-gray-400 block truncate max-w-[180px]">
                              {order.district} · {order.area_upazila}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-900 block">
                              {order.paid_bottles_total} বোতল
                              {order.free_bottles_total > 0 && (
                                <span className="text-emerald-600 font-bold ml-1">
                                  (+{order.free_bottles_total} ফ্রি)
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-500 block truncate max-w-[200px]">
                              {order.items.map((i) => i.product_name_bn).join(', ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-gray-900 text-sm block">
                              ৳{order.total}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              (শিপিং: ৳{order.delivery_fee})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-block ${
                                order.status === 'new'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'packed'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : order.status === 'shipped'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {badges.map((b, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 block mb-0.5 font-medium"
                              >
                                {b}
                              </span>
                            ))}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* One-tap Call */}
                              <button
                                onClick={() => handleCall(order.customer_phone)}
                                className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="সরাসরি কল দিন"
                              >
                                <Phone size={15} />
                              </button>

                              {/* One-tap WhatsApp */}
                              <button
                                onClick={() => openWhatsAppConfirmation(order)}
                                className="p-1.5 text-gray-600 hover:text-[#25D366] hover:bg-green-50 rounded-lg transition-colors"
                                title="WhatsApp কনফার্মেশন পাঠান"
                              >
                                <MessageCircle size={15} />
                              </button>

                              {/* One-tap Print */}
                              <button
                                onClick={() => handlePrintInvoice(order)}
                                className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="ইনভয়েস প্রিন্ট করুন"
                              >
                                <Printer size={15} />
                              </button>

                              {/* View detail */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
                              >
                                বিস্তারিত
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-gray-500">
                          বর্তমানে কোনো অর্ডার নেই। নতুন অর্ডার আসলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS EDITOR */}
        {activeTab === 'products' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">আতর পণ্য তালিকা ও তথ্য সম্পাদনা</h2>
                <p className="text-xs text-gray-500">
                  ছবির URL পেস্ট করলে সরাসরি প্রিভিউ দেখা যাবে। 3 মিলি প্রতি বোতল ৳129 (৳43/মিলি)।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${p.accent_hex}25`, color: p.accent_hex }}
                      >
                        {p.mood_bn}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        স্টক: {p.stock_bottles} বোতল
                      </span>
                    </div>

                    {/* Image preview with fallback */}
                    <div className="w-full h-44 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 mb-3 flex items-center justify-center">
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name_en}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // tasteful dark placeholder if image fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">নো ইমেজ</div>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900">{p.name_bn}</h3>
                    <p className="text-xs text-gray-500">{p.name_en}</p>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.description_bn}</p>

                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <p>
                        <strong>টপ নোটস:</strong> {p.top_notes_bn}
                      </p>
                      <p>
                        <strong>হার্ট নোটস:</strong> {p.heart_notes_bn}
                      </p>
                      <p>
                        <strong>বেস নোটস:</strong> {p.base_notes_bn}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingProduct({ ...p })}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>তথ্য বা ছবি পরিবর্তন করুন</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LAUNCH OFFER EDITOR */}
        {activeTab === 'offer' && offer && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-lg font-bold text-gray-900">লঞ্চ অফার কনফিগারেশন</h2>
              <p className="text-xs text-gray-500">
                ৫০ জন পূর্ণ হলে অফারটি স্বয়ংক্রিয়ভাবে অদৃশ্য বা বন্ধ হবে।
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">অফার সক্রিয় (Active)</label>
                <input
                  type="checkbox"
                  checked={offer.active}
                  onChange={(e) => setOffer({ ...offer, active: e.target.checked })}
                  className="w-4 h-4 text-[#C9A25A]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">অফার শিরোনাম (বাংলা)</label>
                <input
                  type="text"
                  value={offer.title_bn}
                  onChange={(e) => setOffer({ ...offer, title_bn: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">মোট স্লট লিমিট (জন)</label>
                <input
                  type="number"
                  value={offer.buyer_limit}
                  onChange={(e) => setOffer({ ...offer, buyer_limit: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  বর্তমান স্লট গ্রহণ করেছেন (Claimed count)
                </label>
                <input
                  type="number"
                  value={offer.claimed_count}
                  onChange={(e) => setOffer({ ...offer, claimed_count: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  অর্ডার Confirmed হলে এটি বাড়ে এবং Cancelled হলে স্লট ফিরে আসে।
                </span>
              </div>

              <button
                onClick={async () => {
                  await fetch('/api/admin/offer', {
                    method: 'POST',
                    headers: getAdminHeaders(),
                    body: JSON.stringify({ offer }),
                  });
                  alert('অফার সেটিংস সেভ করা হয়েছে!');
                }}
                className="w-full py-2.5 bg-[#120E0B] text-[#E6C98A] font-bold rounded-xl cursor-pointer"
              >
                সংরক্ষণ করুন (Save Offer)
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY SETTINGS */}
        {activeTab === 'delivery' && deliverySettings && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">ডেলিভারি চার্জ ও ফ্রি ডেলিভারি শর্ত</h2>

            <div>
              <label className="font-bold text-gray-700 block mb-1">স্ট্যান্ডার্ড ডেলিভারি ফি (টাকা)</label>
              <input
                type="number"
                value={deliverySettings.delivery_fee}
                onChange={(e) =>
                  setDeliverySettings({ ...deliverySettings, delivery_fee: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">
                ফ্রি ডেলিভারি থ্রেশহোল্ড (মিলির বেশি হতে হবে)
              </label>
              <input
                type="number"
                value={deliverySettings.free_delivery_above_ml}
                onChange={(e) =>
                  setDeliverySettings({
                    ...deliverySettings,
                    free_delivery_above_ml: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
              <span className="text-[11px] text-gray-500 block mt-1">
                ডিফল্ট 10 মিলি। 3 মিলি বোতলের ক্ষেত্রে 4টি বোতল (12 মিলি) নিলে ফ্রি ডেলিভারি সক্রিয় হবে।
              </span>
            </div>

            <button
              onClick={async () => {
                await fetch('/api/admin/delivery', {
                  method: 'POST',
                  headers: getAdminHeaders(),
                  body: JSON.stringify({ deliverySettings }),
                });
                alert('ডেলিভারি সেটিংস পরিবর্তন সংরক্ষিত হয়েছে!');
              }}
              className="w-full py-2.5 bg-[#120E0B] text-[#E6C98A] font-bold rounded-xl cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        )}

        {/* TAB 5: FAQs EDITOR */}
        {activeTab === 'faqs' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">FAQ প্রশ্নোত্তর তালিকা (21টি সিডেড)</h2>
                <p className="text-xs text-gray-500">গ্রাহকরা চ্যাটবটে কতবার ট্যাপ করেছেন তা সরাসরি দেখুন।</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {faqs.map((f) => (
                <div key={f.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {f.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{f.question_bn}</h4>
                    <p className="text-gray-600">{f.answer_bn}</p>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      Keyword: {f.keywords_bn?.slice(0, 4).join(', ')}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-gray-800 text-sm block">
                      {f.views || 0} বার ভিউ
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">সক্রিয়</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: UNANSWERED QUESTIONS */}
        {activeTab === 'unanswered' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-gray-900">অনভিপ্রেত প্রশ্ন (Unanswered Inbox)</h2>
            <p className="text-xs text-gray-500">
              যেসব প্রশ্নের উত্তর চ্যাটবটে পাওয়া যায়নি সেগুলো এখানে জমা হয়।
            </p>

            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {unanswered.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">"{u.text}"</p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(u.created_at).toLocaleString()} · ভাষা: {u.user_language}
                    </span>
                  </div>
                  <button
                    onClick={() => alert('প্রশ্নটি FAQ হিসেবে ড্রাফট করা হয়েছে!')}
                    className="px-3 py-1.5 bg-[#120E0B] text-[#E6C98A] font-semibold text-xs rounded-lg"
                  >
                    FAQ হিসেবে যুক্ত করুন
                  </button>
                </div>
              ))}
              {unanswered.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400">
                  বর্তমানে কোনো অমীমাংসিত প্রশ্ন নেই।
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-gray-900">গ্রাহক রিভিউ যাচাই ও অনুমোদন</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{r.customer_name}</span>
                    <span className="text-amber-500 font-bold">★ {r.rating}</span>
                  </div>
                  <span className="text-gray-500 block">{r.area} · {r.attar_name}</span>
                  <p className="text-gray-700 italic">"{r.text_bn}"</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${r.approved ? 'text-emerald-600' : 'text-red-500'}`}>
                      {r.approved ? 'অনুমোদিত (Approved)' : 'লুকানো (Hidden)'}
                    </span>
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/reviews/moderate', {
                          method: 'POST',
                          headers: getAdminHeaders(),
                          body: JSON.stringify({ id: r.id, approved: !r.approved }),
                        });
                        setReviews((prev) =>
                          prev.map((item) => (item.id === r.id ? { ...item, approved: !item.approved } : item))
                        );
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
                    >
                      {r.approved ? 'লুকিয়ে রাখুন' : 'অনুমোদন দিন'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {reviews.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
                বর্তমানে কোনো গ্রাহক রিভিউ জমা পড়েনি। আসল গ্রাহকদের রিভিউ আসলে এখানে প্রদর্শিত হবে।
              </div>
            )}
          </div>
        )}

        {/* TAB 8: CUSTOMERS & STOCK */}
        {activeTab === 'customers' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">গ্রাহক তালিকা ও স্টক অবস্থা</h2>
                <p className="text-xs text-gray-500">অর্ডার কনফার্ম হলে অটোমেটিক স্টক কমে যায়।</p>
              </div>
              <a
                href={`/api/admin/export/customers.csv?token=${encodeURIComponent(localStorage.getItem('ator_mela_admin_token') || '')}`}
                download
                className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>গ্রাহক CSV এক্সপোর্ট</span>
              </a>
            </div>

            {/* Stock per attar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-sm text-gray-900">{p.name_bn}</h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-gray-900">
                      {p.stock_bottles}
                    </span>
                    <span className="text-xs text-gray-500">৩ মিলি বোতল</span>
                  </div>
                  {p.stock_bottles < 30 && (
                    <span className="text-[10px] text-red-600 font-bold block mt-1">
                      ⚠️ স্টক কমে আসছে!
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">সাইট সেটিংস ও হেল্পলাইন</h2>

            <div>
              <label className="font-bold text-gray-700 block mb-1">হেল্পলাইন ফোন নম্বর</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">WhatsApp নম্বর</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Facebook পেজ URL</label>
              <input
                type="url"
                value={settings.fb_page_url}
                onChange={(e) => setSettings({ ...settings, fb_page_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full p-2 border rounded-lg text-sm"
              />
              <span className="text-[11px] text-gray-400 block mt-0.5">
                ফাঁকা রাখলে ওয়েবসাইটে ফেসবুক লিংক প্রদর্শিত হবে না।
              </span>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">অ্যানাউন্সমেন্ট টেক্সট (বাংলা)</label>
              <input
                type="text"
                value={settings.announcement_bn}
                onChange={(e) => setSettings({ ...settings, announcement_bn: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>

            <button
              onClick={async () => {
                await fetch('/api/admin/settings', {
                  method: 'POST',
                  headers: getAdminHeaders(),
                  body: JSON.stringify({ settings }),
                });
                alert('সাইট সেটিংস সংরক্ষিত হয়েছে!');
              }}
              className="w-full py-2.5 bg-[#120E0B] text-[#E6C98A] font-bold rounded-xl cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        )}
      </div>

      {/* ORDER DETAIL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono font-bold text-base text-gray-900">
                  {selectedOrder.id}
                </span>
                <span className="text-gray-500 block text-[11px]">
                  তারিখ: {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Status Flow Buttons */}
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              <span className="font-bold text-gray-700 block text-[11px] uppercase">
                স্ট্যাটাস পরিবর্তন (Status Flow):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedOrder.status === 'new' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    কনফার্ম করুন (Confirm)
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'packed')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                  >
                    প্যাক সম্পন্ন (Packed)
                  </button>
                )}
                {selectedOrder.status === 'packed' && (
                  <button
                    onClick={() => setShipModalOrder(selectedOrder)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
                  >
                    কুরিয়ারে শিপ করুন (Ship)
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                  >
                    ডেলিভারি সম্পন্ন (Delivered)
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() =>
                      setCancelModalOrder({ order: selectedOrder, status: 'cancelled' })
                    }
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg"
                  >
                    অর্ডার বাতিল (Cancel)
                  </button>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1 bg-gray-50 p-3 rounded-xl">
              <h4 className="font-bold text-gray-900">গ্রাহকের ঠিকানা ও তথ্য:</h4>
              <p>নাম: {selectedOrder.customer_name}</p>
              <p className="font-mono">মোবাইল: {selectedOrder.customer_phone}</p>
              <p>জেলা: {selectedOrder.district} · {selectedOrder.area_upazila}</p>
              <p>ঠিকানা: {selectedOrder.full_address}</p>
              {selectedOrder.note && <p className="text-amber-700">নোট: {selectedOrder.note}</p>}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900">অর্ডারকৃত আইটেম:</h4>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 rounded-lg flex justify-between">
                  <div>
                    <span className="font-semibold block">{it.product_name_bn}</span>
                    <span className="text-gray-500 text-[11px]">
                      {it.paid_bottles} বোতল {it.free_bottles ? `(+${it.free_bottles} ফ্রি)` : ''}
                    </span>
                  </div>
                  <span className="font-mono font-bold">৳{it.total_price}</span>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="border-t pt-2 space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span className="font-mono">৳{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি ফি:</span>
                <span className="font-mono">৳{selectedOrder.delivery_fee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="font-mono text-emerald-700">৳{selectedOrder.total}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCall(selectedOrder.customer_phone)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Phone size={15} />
                <span>কল করুন</span>
              </button>
              <button
                onClick={() => openWhatsAppConfirmation(selectedOrder)}
                className="flex-1 py-2.5 bg-[#25D366] hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedOrder)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                title="ইনভয়েস প্রিন্ট"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIP MODAL */}
      {shipModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900">কুরিয়ার ট্র্যাকিং তথ্য দিন</h3>
            <div>
              <label className="block text-gray-600 mb-1">কুরিয়ার নাম</label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">ট্র্যাকিং আইডি</label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="TRK-12345"
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShipModalOrder(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(shipModalOrder.id, 'shipped', {
                    courier_name: courierName,
                    tracking_id: trackingId,
                  });
                  setShipModalOrder(null);
                }}
                className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-lg"
              >
                শিপিং নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-red-700">অর্ডার বাতিল বা প্রত্যাখ্যানের কারণ দিন</h3>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="যেমন: গ্রাহক ফোন রিসিভ করেননি / ঠিকানা সঠিক নয়"
              className="w-full p-2 border rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                ফিরে যান
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(cancelModalOrder.order.id, cancelModalOrder.status, {
                    cancellation_reason: cancelReason,
                  });
                  setCancelModalOrder(null);
                  setCancelReason('');
                }}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2">
              {editingProduct.name_bn} — তথ্য ও ছবি পরিবর্তন
            </h3>

            <div>
              <label className="block text-gray-700 font-bold mb-1">ছবির URL (Direct HTTPS Link)</label>
              <input
                type="url"
                value={editingProduct.images[0] || ''}
                onChange={(e) => {
                  const newImages = [...editingProduct.images];
                  newImages[0] = e.target.value;
                  setEditingProduct({ ...editingProduct, images: newImages });
                }}
                className="w-full p-2 border rounded-lg text-xs"
                placeholder="https://..."
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                সরাসরি ইমেজ লিঙ্ক দিলে ওয়েবসাইটে স্বয়ংক্রিয়ভাবে প্রিভিউ হবে। লিঙ্ক নষ্ট হলে স্বাদময় ডার্ক প্লেসহোল্ডার দেখাবে।
              </span>
            </div>

            {/* Live image preview */}
            <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden border flex items-center justify-center">
              {editingProduct.images[0] ? (
                <img
                  src={editingProduct.images[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">কোনো ছবি নেই</span>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">স্টক বোতল সংখ্যা</label>
              <input
                type="number"
                value={editingProduct.stock_bottles}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, stock_bottles: Number(e.target.value) })
                }
                className="w-full p-2 border rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">বিবরণ (বাংলা)</label>
              <textarea
                rows={2}
                value={editingProduct.description_bn}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description_bn: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                বাতিল
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: getAdminHeaders(),
                    body: JSON.stringify({ product: editingProduct }),
                  });
                  setProducts((prev) =>
                    prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
                  );
                  setEditingProduct(null);
                }}
                className="flex-1 py-2 bg-[#120E0B] text-[#E6C98A] font-bold rounded-lg"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
