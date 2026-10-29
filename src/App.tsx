import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { AnnouncementBar } from './components/AnnouncementBar.tsx';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { OfferShowcase } from './components/OfferShowcase.tsx';
import { ScentCollection } from './components/ScentCollection.tsx';
import { ScentFinderStrip } from './components/ScentFinderStrip.tsx';
import { WhyUsSection } from './components/WhyUsSection.tsx';
import { HowToOrderSection } from './components/HowToOrderSection.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { QuestionsStrip } from './components/QuestionsStrip.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { Chatbot } from './components/Chatbot.tsx';
import { FloatingButtons } from './components/FloatingButtons.tsx';
import { StickyBottomCartBar } from './components/StickyBottomCartBar.tsx';
import { FaqDirectoryPage } from './components/FaqDirectoryPage.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { StarDivider } from './components/BrandVisuals.tsx';
import { MotionReveal } from './components/MotionReveal.tsx';
import { WishlistDrawer } from './components/WishlistDrawer.tsx';
import { AiScentSommelierModal } from './components/AiScentSommelierModal.tsx';

function MainStorefront() {
  const { isAdminView, setIsAdminView } = useApp();
  const [showFaqPage, setShowFaqPage] = useState(false);

  // If Admin View is active, render the complete Admin Panel
  if (isAdminView) {
    return <AdminPanel onClose={() => setIsAdminView(false)} />;
  }

  // If FAQ Directory Page is active, render the crawlable directory
  if (showFaqPage) {
    return <FaqDirectoryPage onBack={() => setShowFaqPage(false)} />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#120E0B] text-[#F3EBDD] flex flex-col relative selection:bg-[#C9A25A] selection:text-[#120E0B]">
      {/* Sticky top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Brand Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <HeroSection />

        {/* Launch Offer Showcase with subtle slide-up */}
        <MotionReveal yOffset={32}>
          <OfferShowcase />
        </MotionReveal>

        <StarDivider />

        {/* Scent Collection Cards */}
        <MotionReveal yOffset={30}>
          <ScentCollection />
        </MotionReveal>

        {/* Scent Finder by Mood */}
        <MotionReveal yOffset={24}>
          <ScentFinderStrip />
        </MotionReveal>

        {/* Why Ator Mela (Parchment section) */}
        <MotionReveal yOffset={32}>
          <WhyUsSection />
        </MotionReveal>

        {/* 3 Steps: How to Order */}
        <MotionReveal yOffset={28}>
          <HowToOrderSection />
        </MotionReveal>

        <StarDivider />

        {/* Customer Reviews */}
        <MotionReveal yOffset={25}>
          <ReviewsSection />
        </MotionReveal>

        {/* "Questions?" Strip that opens Chatbot */}
        <MotionReveal yOffset={20}>
          <QuestionsStrip />
        </MotionReveal>
      </main>

      {/* Footer */}
      <Footer onOpenFaqPage={() => setShowFaqPage(true)} />

      {/* Interactive Overlays & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <AiScentSommelierModal />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <ProductDetailModal />
      <Chatbot />
      <FloatingButtons />
      <StickyBottomCartBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainStorefront />
    </AppProvider>
  );
}

