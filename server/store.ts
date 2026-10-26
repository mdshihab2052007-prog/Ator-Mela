import {
  Product,
  Offer,
  DeliverySettings,
  FAQItem,
  Order,
  Review,
  SiteSettings,
  UnansweredQuestion,
  CartItem,
  CartCalculation,
  OrderStatus,
} from '../src/shared/types.ts';
import {
  initialProducts,
  initialOffer,
  initialDeliverySettings,
  initialFAQs,
  initialOrders,
  initialReviews,
  initialSiteSettings,
} from './data.ts';

class Store {
  private products: Product[] = [...initialProducts];
  private offer: Offer = { ...initialOffer };
  private deliverySettings: DeliverySettings = JSON.parse(JSON.stringify(initialDeliverySettings));
  private faqs: FAQItem[] = [...initialFAQs];
  private orders: Order[] = [...initialOrders];
  private reviews: Review[] = [...initialReviews];
  private settings: SiteSettings = { ...initialSiteSettings };
  private unansweredQuestions: UnansweredQuestion[] = [];
  private orderSequence = 1;

  // Rate-limiting tracking: timestamp of recent orders by phone or IP
  private recentOrdersByPhone = new Map<string, number[]>();
  private recentOrdersByIp = new Map<string, number[]>();

  // Public getters
  getPublicProducts(): Product[] {
    return this.products.filter((p) => p.active).sort((a, b) => a.sort_order - b.sort_order);
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  getOffer(): Offer {
    return this.offer;
  }

  getDeliverySettings(): DeliverySettings {
    return this.deliverySettings;
  }

  getPublicFAQs(): FAQItem[] {
    return this.faqs.filter((f) => f.active).sort((a, b) => a.sort_order - b.sort_order);
  }

  getAllFAQs(): FAQItem[] {
    return this.faqs;
  }

  getApprovedReviews(): Review[] {
    return this.reviews.filter((r) => r.approved);
  }

  getAllReviews(): Review[] {
    return this.reviews;
  }

  getSettings(): SiteSettings {
    return this.settings;
  }

  getUnansweredQuestions(): UnansweredQuestion[] {
    return this.unansweredQuestions;
  }

  // Server-authoritative calculation
  calculateCart(cartItems: CartItem[], district?: string): CartCalculation {
    const offer = this.offer;
    const isOfferActive = offer.active && offer.claimed_count < offer.buyer_limit;

    let totalPaidBottles = 0;
    let totalFreeBottles = 0;
    let totalPaidMl = 0;
    let subtotal = 0;

    const items = cartItems.map((ci) => {
      const product = this.products.find((p) => p.id === ci.productId) || {
        id: ci.productId,
        slug: 'unknown',
        name_bn: 'অজানা আতর',
        name_en: 'Unknown Attar',
        mood_bn: '',
        mood_en: '',
        description_bn: '',
        description_en: '',
        top_notes_bn: '',
        top_notes_en: '',
        heart_notes_bn: '',
        heart_notes_en: '',
        base_notes_bn: '',
        base_notes_en: '',
        occasions_bn: '',
        occasions_en: '',
        price_per_ml: 43,
        bottle_ml: 3,
        stock_bottles: 0,
        images: [],
        accent_hex: '#C9A25A',
        active: true,
        sort_order: 99,
      };

      const paidBottles = Math.max(0, Math.floor(ci.quantity));
      let freeBottles = 0;

      if (isOfferActive && offer.type === 'buy_x_get_y_free' && offer.buy_qty > 0) {
        // e.g. Buy 2 get 1 free per attar
        const pairs = Math.floor(paidBottles / offer.buy_qty);
        freeBottles = pairs * offer.free_qty;
      }

      const unitPrice = product.price_per_ml * product.bottle_ml;
      const itemSubtotal = paidBottles * unitPrice;
      const paidMl = paidBottles * product.bottle_ml;
      const freeMl = freeBottles * product.bottle_ml;

      totalPaidBottles += paidBottles;
      totalFreeBottles += freeBottles;
      totalPaidMl += paidMl;
      subtotal += itemSubtotal;

      return {
        product,
        paidBottles,
        freeBottles,
        paidMl,
        freeMl,
        subtotal: itemSubtotal,
      };
    });

    // Delivery calculation
    // "Free delivery when customer's PAID quantity is 10 mL or more (>= 10 mL)"
    // With 3 mL bottles: 3 bottles = 9 mL (< 10 mL) -> 30 Tk fee. 4 bottles = 12 mL (>= 10 mL) -> 0 Tk fee.
    const basisMl =
      this.deliverySettings.count_basis === 'paid_plus_free'
        ? totalPaidMl + totalFreeBottles * 3
        : totalPaidMl;

    const threshold = this.deliverySettings.free_delivery_above_ml; // default 10
    const freeDeliveryEarned = basisMl >= threshold;

    const isOtherDistrict = district === 'Other' && this.deliverySettings.allow_other_districts;
    const standardFee = isOtherDistrict
      ? (this.deliverySettings.other_districts_fee || 100)
      : this.deliverySettings.delivery_fee;

    const deliveryFee = freeDeliveryEarned ? 0 : standardFee;

    // How many more 3 mL bottles needed for free delivery?
    let bottlesNeededForFreeDelivery = 0;
    if (!freeDeliveryEarned) {
      const mlDeficit = threshold - basisMl;
      bottlesNeededForFreeDelivery = Math.max(1, Math.ceil(mlDeficit / 3));
    }

    const freeBottleValue = items.reduce(
      (sum, item) => sum + item.freeBottles * item.product.price_per_ml * item.product.bottle_ml,
      0
    );
    const savings = freeBottleValue + (freeDeliveryEarned ? standardFee : 0);
    const total = subtotal + deliveryFee;

    return {
      items,
      totalPaidBottles,
      totalFreeBottles,
      totalPaidMl,
      totalBottles: totalPaidBottles + totalFreeBottles,
      subtotal,
      deliveryFee,
      freeDeliveryEarned,
      bottlesNeededForFreeDelivery,
      total,
      savings,
    };
  }

  // Create Order (Server-Authoritative)
  createOrder(params: {
    customer_name: string;
    customer_phone: string;
    district: string;
    area_upazila: string;
    full_address: string;
    note?: string;
    cart: CartItem[];
    ip?: string;
    user_agent?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    honeypot?: string;
  }): { success: boolean; order?: Order; error?: string } {
    // Check honeypot
    const honeypot_flag = Boolean(params.honeypot && params.honeypot.trim().length > 0);

    // Validate phone: BD format 01XXXXXXXXX (11 digits starting with 01)
    const cleanedPhone = params.customer_phone.replace(/\s+/g, '').replace(/^\+88/, '');
    if (!/^01[3-9]\d{8}$/.test(cleanedPhone)) {
      return {
        success: false,
        error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01643249148)',
      };
    }

    if (!params.customer_name || params.customer_name.trim().length < 2) {
      return { success: false, error: 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন' };
    }

    if (!params.full_address || params.full_address.trim().length < 5) {
      return { success: false, error: 'অনুগ্রহ করে আপনার বিস্তারিত ঠিকানা দিন' };
    }

    // Rate limiting: max 4 orders per phone per 10 minutes
    const now = Date.now();
    const phoneTimes = this.recentOrdersByPhone.get(cleanedPhone) || [];
    const recentPhoneOrders = phoneTimes.filter((t) => now - t < 10 * 60 * 1000);
    if (recentPhoneOrders.length >= 4) {
      return {
        success: false,
        error: 'অল্প সময়ের মধ্যে একাধিক অর্ডার চেষ্টা করা হয়েছে। কিছু সময় পর চেষ্টা করুন।',
      };
    }
    recentPhoneOrders.push(now);
    this.recentOrdersByPhone.set(cleanedPhone, recentPhoneOrders);

    // Calculate cart authoritative
    const calc = this.calculateCart(params.cart, params.district);
    if (calc.totalPaidBottles === 0) {
      return { success: false, error: 'কার্টে অন্তত একটি আতর যোগ করুন' };
    }

    // Generate Order ID: AM-YYMMDD-####
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(this.orderSequence++).padStart(4, '0');
    const orderId = `AM-${dateStr}-${seq}`;

    const orderItems = calc.items.map((it) => ({
      product_id: it.product.id,
      product_name_bn: it.product.name_bn,
      product_name_en: it.product.name_en,
      paid_bottles: it.paidBottles,
      free_bottles: it.freeBottles,
      unit_price: it.product.price_per_ml * it.product.bottle_ml,
      total_price: it.subtotal,
      bottle_ml: it.product.bottle_ml,
      accent_hex: it.product.accent_hex,
    }));

    const newOrder: Order = {
      id: orderId,
      created_at: new Date().toISOString(),
      customer_name: params.customer_name.trim(),
      customer_phone: cleanedPhone,
      district: params.district,
      area_upazila: params.area_upazila || '',
      full_address: params.full_address.trim(),
      note: params.note ? params.note.trim() : undefined,
      items: orderItems,
      paid_bottles_total: calc.totalPaidBottles,
      free_bottles_total: calc.totalFreeBottles,
      total_paid_ml: calc.totalPaidMl,
      subtotal: calc.subtotal,
      delivery_fee: calc.deliveryFee,
      total: calc.total,
      payment_method: 'cash_on_delivery',
      status: 'new',
      status_history: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          by: 'Customer',
        },
      ],
      honeypot_flag,
      offer_slot_claimed: false, // will be true once Confirmed by admin!
      ip: params.ip,
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
    };

    this.orders.unshift(newOrder);
    return { success: true, order: newOrder };
  }

  // Admin order update with slot transaction & stock decrement
  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminEmail: string,
    meta?: {
      courier_name?: string;
      tracking_id?: string;
      cancellation_reason?: string;
    }
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const previousStatus = order.status;
    order.status = newStatus;

    if (meta?.courier_name) order.courier_name = meta.courier_name;
    if (meta?.tracking_id) order.tracking_id = meta.tracking_id;
    if (meta?.cancellation_reason) order.cancellation_reason = meta.cancellation_reason;

    // Transactional Offer Claiming:
    // "The claimed count increases only when the admin marks an order Confirmed... Refused or cancelled orders release their slot."
    // Check if this order qualified for offer free bottles
    const hasOfferBottles = order.free_bottles_total > 0;

    if (newStatus === 'confirmed' && !order.offer_slot_claimed && hasOfferBottles) {
      // Check if phone already claimed or if limit reached
      if (this.offer.claimed_count < this.offer.buyer_limit) {
        this.offer.claimed_count += 1;
        order.offer_slot_claimed = true;
      }
      // Decrement stock for confirmed items
      order.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.product_id);
        if (prod) {
          prod.stock_bottles = Math.max(0, prod.stock_bottles - (item.paid_bottles + item.free_bottles));
        }
      });
    } else if (
      (newStatus === 'cancelled' || newStatus === 'refused' || newStatus === 'returned') &&
      order.offer_slot_claimed
    ) {
      // Release slot!
      this.offer.claimed_count = Math.max(0, this.offer.claimed_count - 1);
      order.offer_slot_claimed = false;

      // Re-increment stock if it was previously confirmed
      if (previousStatus === 'confirmed' || previousStatus === 'packed' || previousStatus === 'shipped') {
        order.items.forEach((item) => {
          const prod = this.products.find((p) => p.id === item.product_id);
          if (prod) {
            prod.stock_bottles += item.paid_bottles + item.free_bottles;
          }
        });
      }
    }

    order.status_history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      by: adminEmail,
      note: meta?.cancellation_reason || (meta?.courier_name ? `Courier: ${meta.courier_name}` : undefined),
    });

    return { success: true, order };
  }

  trackOrder(orderId: string, phone: string): Order | null {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+88/, '');
    const cleanId = orderId.trim().toUpperCase();
    const found = this.orders.find(
      (o) => o.id.toUpperCase() === cleanId && o.customer_phone.endsWith(cleanPhone.slice(-10))
    );
    return found || null;
  }

  // Admin getters and mutations
  getAllOrders(): Order[] {
    return this.orders;
  }

  updateProduct(product: Product): boolean {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      this.products[idx] = product;
      return true;
    }
    this.products.push(product);
    return true;
  }

  updateOffer(offer: Offer): void {
    this.offer = offer;
  }

  updateDeliverySettings(settings: DeliverySettings): void {
    this.deliverySettings = settings;
  }

  incrementFAQView(faqId: string): void {
    const faq = this.faqs.find((f) => f.id === faqId);
    if (faq) {
      faq.views = (faq.views || 0) + 1;
    }
  }

  updateFAQ(faq: FAQItem): boolean {
    const idx = this.faqs.findIndex((f) => f.id === faq.id);
    if (idx !== -1) {
      this.faqs[idx] = faq;
      return true;
    }
    this.faqs.push(faq);
    return true;
  }

  addUnansweredQuestion(text: string, lang: string): void {
    this.unansweredQuestions.unshift({
      id: `uq-${Date.now()}`,
      text: text.trim(),
      created_at: new Date().toISOString(),
      user_language: lang,
      resolved: false,
    });
  }

  updateReviewStatus(id: string, approved: boolean): boolean {
    const rev = this.reviews.find((r) => r.id === id);
    if (rev) {
      rev.approved = approved;
      return true;
    }
    return false;
  }

  updateSettings(settings: SiteSettings): void {
    this.settings = settings;
  }
}

export const store = new Store();
