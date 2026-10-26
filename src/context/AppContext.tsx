import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  Product,
  Offer,
  DeliverySettings,
  FAQItem,
  Review,
  SiteSettings,
  CartItem,
  CartCalculation,
  Order,
  FAQCategory,
} from '../shared/types.ts';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  products: Product[];
  offer: Offer | null;
  deliverySettings: DeliverySettings | null;
  faqs: FAQItem[];
  reviews: Review[];
  settings: SiteSettings | null;
  cart: CartItem[];
  calculation: CartCalculation | null;
  isLoading: boolean;

  // Cart actions
  addToCart: (productId: string, qty?: number) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addOneMoreBottleForFreeDelivery: () => void;

  // UI Drawer / Modal states
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean, category?: FAQCategory) => void;
  chatbotInitialCategory: FAQCategory | null;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
  isOrderSuccessOpen: boolean;
  setIsOrderSuccessOpen: (open: boolean) => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // AI Scent Advisor
  isAiAdvisorOpen: boolean;
  setIsAiAdvisorOpen: (open: boolean) => void;

  isAdminView: boolean;
  setIsAdminView: (view: boolean) => void;

  // Refresh
  refetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ator_mela_lang');
    return saved === 'en' ? 'en' : 'bn';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cart state stored in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ator_mela_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [calculation, setCalculation] = useState<CartCalculation | null>(null);

  // Modals / Overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpenState] = useState(false);
  const [chatbotInitialCategory, setChatbotInitialCategory] = useState<FAQCategory | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ator_mela_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ator_mela_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Admin routing check
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin');
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('ator_mela_lang', newLang);
    document.documentElement.lang = newLang;
  };

  const setIsChatbotOpen = (open: boolean, category?: FAQCategory) => {
    setIsChatbotOpenState(open);
    if (category) {
      setChatbotInitialCategory(category);
    } else {
      setChatbotInitialCategory(null);
    }
  };

  const refetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setOffer(data.offer || null);
        setDeliverySettings(data.deliverySettings || null);
        setFaqs(data.faqs || []);
        setReviews(data.reviews || []);
        setSettings(data.settings || null);
      }
    } catch (err) {
      console.error('Failed to load bootstrap data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Recalculate cart authoritatively from server whenever cart changes
  useEffect(() => {
    localStorage.setItem('ator_mela_cart', JSON.stringify(cart));

    if (cart.length === 0) {
      setCalculation(null);
      return;
    }

    const calcCart = async () => {
      try {
        const res = await fetch('/api/cart/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart }),
        });
        if (res.ok) {
          const calcData = await res.json();
          setCalculation(calcData);
        }
      } catch (err) {
        console.error('Cart calculation error:', err);
      }
    };

    calcCart();
  }, [cart, offer, deliverySettings]);

  const addToCart = (productId: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // One-tap "+১" button on the delivery nudge strip
  const addOneMoreBottleForFreeDelivery = () => {
    // Pick the first item in cart or first product
    const targetProductId = cart.length > 0 ? cart[0].productId : (products[0]?.id || 'prod-ehsas');
    addToCart(targetProductId, 1);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        products,
        offer,
        deliverySettings,
        faqs,
        reviews,
        settings,
        cart,
        calculation,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        addOneMoreBottleForFreeDelivery,
        isCartOpen,
        setIsCartOpen,
        isChatbotOpen,
        setIsChatbotOpen,
        chatbotInitialCategory,
        isCheckoutOpen,
        setIsCheckoutOpen,
        selectedProduct,
        setSelectedProduct,
        isTrackingOpen,
        setIsTrackingOpen,
        lastCreatedOrder,
        setLastCreatedOrder,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        isAiAdvisorOpen,
        setIsAiAdvisorOpen,
        isAdminView,
        setIsAdminView,
        refetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
