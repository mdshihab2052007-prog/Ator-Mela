import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Eye, ShoppingBag, RotateCw, Hand } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../shared/types.ts';
import { LuxuryBottle, StarOrnament } from './BrandVisuals.tsx';
import { formatPrice } from '../utils/formatters.ts';

interface WhirlingStageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (productId: string, quantity?: number) => void;
}

export const WhirlingStage: React.FC<WhirlingStageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
}) => {
  const { lang } = useApp();
  const stageRef = useRef<HTMLDivElement>(null);

  // Rotation angle in radians
  const [angle, setAngle] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const dragStartX = useRef<number>(0);
  const dragStartAngle = useRef<number>(0);
  const lastX = useRef<number>(0);
  const velocity = useRef<number>(0);
  const animFrameId = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const autoRotateSpeed = useRef<number>(0.0035); // Gentle ambient whirl

  // We have the 3 signature attars:
  // 0: Ehsas Al Arabia (Amber)
  // 1: Vampire Blood (Garnet)
  // 2: Aroosah (Champagne)
  const items = products.slice(0, 3);

  // Whirling animation loop with momentum inertia
  useEffect(() => {
    const loop = () => {
      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 0.0002) {
          // Momentum spin
          setAngle((prev) => prev + velocity.current);
          velocity.current *= 0.94; // Smooth friction decay
        } else {
          // Ambient slow whirl
          setAngle((prev) => prev + autoRotateSpeed.current);
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId.current);
  }, []);

  // Determine which scent is closest to the front (cos(theta) is highest)
  const getClosestItemIndex = useCallback(() => {
    if (items.length === 0) return 0;
    const step = (2 * Math.PI) / items.length;
    let closestIdx = 0;
    let maxCos = -2;

    items.forEach((_, idx) => {
      const itemAngle = angle + idx * step;
      const cosVal = Math.cos(itemAngle);
      if (cosVal > maxCos) {
        maxCos = cosVal;
        closestIdx = idx;
      }
    });

    return closestIdx;
  }, [angle, items]);

  const activeIdx = getClosestItemIndex();
  const activeProduct = items[activeIdx] || items[0];

  // Touch and drag handlers for whirling
  const startDrag = (clientX: number) => {
    isDragging.current = true;
    setIsInteracting(true);
    setHasUserInteracted(true);
    dragStartX.current = clientX;
    dragStartAngle.current = angle;
    lastX.current = clientX;
    velocity.current = 0;
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging.current) return;
    const deltaX = clientX - dragStartX.current;
    const stepDelta = clientX - lastX.current;

    // Convert horizontal pixel drag to angle in radians (responsive, natural 1:1 feel)
    const angleDelta = (deltaX / 140) * 1.6;
    setAngle(dragStartAngle.current + angleDelta);

    velocity.current = (stepDelta / 140) * 0.9;
    lastX.current = clientX;
  };

  const endDrag = () => {
    isDragging.current = false;
    setIsInteracting(false);
  };

  // Jump smoothly to a specific scent
  const rotateToProduct = (targetIdx: number) => {
    if (items.length === 0) return;
    setHasUserInteracted(true);
    const step = (2 * Math.PI) / items.length;
    const targetAngle = -targetIdx * step;
    const diff = targetAngle - (angle % (2 * Math.PI));
    const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
    velocity.current = normalizedDiff * 0.12;
  };

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-[360px] sm:max-w-[420px] mx-auto flex flex-col items-center select-none relative">
      {/* Whirling Stage Box */}
      <div
        ref={stageRef}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        className={`relative w-full h-[280px] sm:h-[310px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible`}
        style={{ touchAction: 'pan-y' }}
        aria-label="3D Whirling Attar Display"
      >
        {/* Glowing Platform / Base Pedestal */}
        <div className="absolute bottom-5 w-60 sm:w-72 h-14 rounded-full bg-gradient-to-t from-black via-[#1E1814] to-transparent border-b-2 border-[#C9A25A]/50 shadow-2xl flex items-center justify-center pointer-events-none">
          <div className="w-44 h-9 rounded-full border border-[#C9A25A]/30 flex items-center justify-center">
            <StarOrnament size={12} color="#C9A25A" className="opacity-50" />
          </div>
        </div>

        {/* Ambient radial scent backlight */}
        {activeProduct && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 h-48 sm:h-56 rounded-full blur-3xl opacity-30 transition-colors duration-700 pointer-events-none"
            style={{ backgroundColor: activeProduct.accent_hex }}
          />
        )}

        {/* 3D Cylindrical Orbit of the 3 Attars */}
        {items.map((prod, idx) => {
          const step = (2 * Math.PI) / items.length;
          const itemAngle = angle + idx * step;

          // Orbit geometry:
          // radiusX: 84px on small mobile (ensures all 3 bottles fit comfortably inside 360px screen with full visibility)
          // radiusX: 104px on sm+
          const radiusX = typeof window !== 'undefined' && window.innerWidth >= 640 ? 104 : 84;
          const x = Math.sin(itemAngle) * radiusX;
          const z = Math.cos(itemAngle); // -1 (back) to +1 (front)

          // Smooth depth scaling:
          // Front bottle (z=1): scale 1.04, opacity 1.0, full prominence
          // Flanked bottles (z=-0.5): scale 0.78, opacity 0.82, 100% visible
          const scale = 0.78 + 0.26 * ((z + 1) / 2);
          const opacity = 0.75 + 0.25 * ((z + 1) / 2);
          const zIndex = Math.round(100 + z * 50);
          const isFront = activeIdx === idx;

          return (
            <div
              key={prod.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!isFront) {
                  rotateToProduct(idx);
                } else {
                  onSelectProduct(prod);
                }
              }}
              className="absolute top-2 sm:top-3 transition-transform duration-75 flex flex-col items-center cursor-pointer group"
              style={{
                transform: `translate3d(${x}px, ${-(z * 8)}px, 0px) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <div className="relative">
                {/* Bottle with uniform, well-proportioned flacon sizing */}
                <LuxuryBottle
                  accentHex={prod.accent_hex}
                  name={prod.name_en}
                  size="md"
                  glow={isFront}
                  className="transition-transform duration-300 group-hover:scale-105"
                />

                {/* Spotlight Name Tag on the front bottle */}
                {isFront && (
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-black shadow-lg border border-[#E6C98A] flex items-center gap-1 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
                    style={{ backgroundColor: prod.accent_hex }}
                  >
                    <Sparkles size={10} />
                    <span>{lang === 'bn' ? prod.name_bn : prod.name_en}</span>
                  </div>
                )}
              </div>

              {/* Reflection on pedestal */}
              <div
                className="w-14 h-2 rounded-full blur-xs mt-1 transition-opacity duration-300"
                style={{
                  backgroundColor: prod.accent_hex,
                  opacity: isFront ? 0.6 : 0.2,
                }}
              />
            </div>
          );
        })}

        {/* Whirl Hint Banner */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#120E0B]/90 border border-[#C9A25A]/45 text-[#E6C98A] text-[11px] font-medium shadow-md flex items-center gap-1.5 pointer-events-none">
          <RotateCw size={12} className={`text-[#C9A25A] ${isInteracting ? 'rotate-90' : 'animate-spin [animation-duration:8s]'}`} />
          <span>{lang === 'bn' ? 'স্পর্শ করে ঘোরান (Whirl)' : 'Touch & drag to whirl'}</span>
        </div>
      </div>

      {/* Controller & Active Scent Details Card */}
      <div className="w-full mt-2 bg-[#1A1410] border border-[#C9A25A]/35 rounded-2xl p-3 shadow-xl">
        {/* 3 Nav Tabs: Ehsas · Vampire Blood · Aroosah */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {items.map((prod, idx) => {
            const isSelected = activeIdx === idx;
            return (
              <button
                key={prod.id}
                onClick={() => rotateToProduct(idx)}
                className={`py-1.5 px-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#120E0B] text-[#E6C98A] shadow-xs'
                    : 'bg-transparent text-[#A89A86] border-transparent hover:text-[#F3EBDD] hover:bg-[#120E0B]/40'
                }`}
                style={{
                  borderColor: isSelected ? prod.accent_hex : 'transparent',
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 transition-transform ${
                    isSelected ? 'scale-125' : 'opacity-60'
                  }`}
                  style={{ backgroundColor: prod.accent_hex }}
                />
                <span className="truncate text-[11px] font-bold">
                  {lang === 'bn' ? prod.name_bn : prod.name_en}
                </span>
              </button>
            );
          })}
        </div>

        {/* Front Active Bottle Quick Buy Strip with anchor price 50 -> 43 and 150 -> 129 */}
        {activeProduct && (
          <div className="pt-2 border-t border-[#C9A25A]/20 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: activeProduct.accent_hex }}
                />
                <h4 className="font-cormorant font-bold text-sm sm:text-base text-[#F3EBDD] truncate">
                  {lang === 'bn' ? activeProduct.name_bn : activeProduct.name_en}
                </h4>
              </div>

              {/* Price display with 50 crossed to 43 */}
              <div className="flex items-baseline gap-1.5 mt-0.5 font-hind">
                <span className="text-[10px] text-[#A89A86] line-through decoration-rose-400">
                  {formatPrice(150, lang)}
                </span>
                <span className="text-xs font-extrabold text-[#E6C98A]">
                  {formatPrice(129, lang)}
                </span>
                <span className="text-[9px] text-[#A89A86]">
                  (মিলি: <s className="decoration-rose-400">{formatPrice(50, lang)}</s> {formatPrice(43, lang)})
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onSelectProduct(activeProduct)}
                className="px-2.5 py-1.5 bg-[#120E0B] hover:bg-[#1E1814] text-[#E6C98A] border border-[#C9A25A]/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye size={12} />
                <span>{lang === 'bn' ? 'নোটস' : 'Notes'}</span>
              </button>

              <button
                onClick={() => onAddToCart(activeProduct.id, 2)}
                className="px-3 py-1.5 bg-[#C9A25A] hover:bg-[#E6C98A] text-[#120E0B] font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={12} />
                <span>{lang === 'bn' ? '+ ৬ মিলি নিন' : '+ Add 6 mL'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
