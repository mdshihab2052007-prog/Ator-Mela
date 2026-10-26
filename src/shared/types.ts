export type Language = 'bn' | 'en';

export interface Product {
  id: string;
  slug: string;
  name_bn: string;
  name_en: string;
  mood_bn: string;
  mood_en: string;
  description_bn: string;
  description_en: string;
  top_notes_bn: string;
  top_notes_en: string;
  heart_notes_bn: string;
  heart_notes_en: string;
  base_notes_bn: string;
  base_notes_en: string;
  longevity_bn?: string;
  longevity_en?: string;
  occasions_bn: string;
  occasions_en: string;
  price_per_ml: number;
  bottle_ml: number;
  stock_bottles: number;
  images: string[];
  accent_hex: string;
  active: boolean;
  sort_order: number;
}

export interface Offer {
  id: string;
  type: 'buy_x_get_y_free' | 'percent_off' | 'fixed_off';
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  buy_qty: number;
  free_qty: number;
  buyer_limit: number;
  claimed_count: number;
  per_phone_limit: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface DeliveryZone {
  id: string;
  name_bn: string;
  name_en: string;
  districts: string[];
  fee: number;
  delivery_time_bn: string;
  delivery_time_en: string;
  active: boolean;
}

export interface DeliverySettings {
  delivery_fee: number;
  free_delivery_above_ml: number;
  count_basis: 'paid' | 'paid_plus_free';
  zones: DeliveryZone[];
  allow_other_districts: boolean;
  other_districts_fee: number;
  other_districts_time_bn: string;
  other_districts_time_en: string;
}

export type FAQCategory = 'price_offer' | 'delivery_payment' | 'about_attar' | 'order_contact';
export type FAQAction = 'none' | 'order' | 'whatsapp' | 'call';

export interface FAQItem {
  id: string;
  category: FAQCategory;
  question_bn: string;
  question_en: string;
  answer_bn: string;
  answer_en: string;
  keywords_bn: string[];
  keywords_en: string[];
  related_ids: string[];
  action: FAQAction;
  sort_order: number;
  views: number;
  active: boolean;
}

export interface OrderItem {
  product_id: string;
  product_name_bn: string;
  product_name_en: string;
  paid_bottles: number;
  free_bottles: number;
  unit_price: number;
  total_price: number;
  bottle_ml: number;
  accent_hex: string;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refused'
  | 'returned';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  by: string;
  note?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  district: string;
  area_upazila: string;
  full_address: string;
  note?: string;
  items: OrderItem[];
  paid_bottles_total: number;
  free_bottles_total: number;
  total_paid_ml: number;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: 'cash_on_delivery';
  status: OrderStatus;
  courier_name?: string;
  tracking_id?: string;
  cancellation_reason?: string;
  status_history: StatusHistoryEntry[];
  honeypot_flag?: boolean;
  offer_slot_claimed?: boolean;
  ip?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface Review {
  id: string;
  customer_name: string;
  area: string;
  rating: number;
  text_bn: string;
  text_en: string;
  attar_name: string;
  photo_url?: string;
  approved: boolean;
  created_at: string;
}

export interface SiteSettings {
  brand_name_bn: string;
  brand_name_en: string;
  tagline_bn: string;
  tagline_en: string;
  phone: string;
  whatsapp: string;
  fb_page_url: string;
  admin_emails: string[];
  announcement_bn: string;
  announcement_en: string;
  meta_pixel_id: string;
  ga4_id: string;
  maintenance_mode: boolean;
  why_us_points: Array<{
    title_bn: string;
    title_en: string;
    desc_bn: string;
    desc_en: string;
    icon: string;
  }>;
}

export interface UnansweredQuestion {
  id: string;
  text: string;
  created_at: string;
  user_language: string;
  resolved: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartCalculation {
  items: Array<{
    product: Product;
    paidBottles: number;
    freeBottles: number;
    paidMl: number;
    freeMl: number;
    subtotal: number;
  }>;
  totalPaidBottles: number;
  totalFreeBottles: number;
  totalPaidMl: number;
  totalBottles: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryEarned: boolean;
  bottlesNeededForFreeDelivery: number;
  total: number;
  savings: number;
}
