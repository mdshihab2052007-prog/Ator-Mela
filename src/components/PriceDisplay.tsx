import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { toBanglaDigits, formatPrice } from '../utils/formatters.ts';

interface PriceDisplayProps {
  bottlePrice?: number; // default 129
  pricePerMl?: number; // default 43
  regularPricePerMl?: number; // default 50
  regularBottlePrice?: number; // default 150
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showPerMl?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  bottlePrice = 129,
  pricePerMl = 43,
  regularPricePerMl = 50,
  regularBottlePrice = 150,
  size = 'md',
  showPerMl = true,
  className = '',
  layout = 'horizontal',
}) => {
  const { lang } = useApp();

  const formattedRegularMl = lang === 'bn' ? `৳${toBanglaDigits(regularPricePerMl)}` : `Tk ${regularPricePerMl}`;
  const formattedSaleMl = lang === 'bn' ? `৳${toBanglaDigits(pricePerMl)}` : `Tk ${pricePerMl}`;
  const formattedRegularBottle = lang === 'bn' ? `৳${toBanglaDigits(regularBottlePrice)}` : `Tk ${regularBottlePrice}`;
  const formattedSaleBottle = lang === 'bn' ? `৳${toBanglaDigits(bottlePrice)}` : `Tk ${bottlePrice}`;

  const sizeClasses = {
    sm: {
      bottlePrice: 'text-lg font-bold',
      strikethrough: 'text-xs',
      perMl: 'text-[11px]',
    },
    md: {
      bottlePrice: 'text-2xl font-extrabold',
      strikethrough: 'text-sm',
      perMl: 'text-xs',
    },
    lg: {
      bottlePrice: 'text-3xl sm:text-4xl font-extrabold',
      strikethrough: 'text-base sm:text-lg',
      perMl: 'text-xs sm:text-sm',
    },
    hero: {
      bottlePrice: 'text-3xl sm:text-5xl font-extrabold',
      strikethrough: 'text-base sm:text-xl',
      perMl: 'text-xs sm:text-sm',
    },
  }[size];

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col items-start gap-1' : 'flex-wrap items-baseline gap-2'} ${className}`}>
      {/* Bottle Price with Strikethrough Anchor */}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-manrope ${sizeClasses.strikethrough} text-[#A89A86] line-through decoration-rose-400 decoration-[1.5px] opacity-85 select-none`}
          title={lang === 'bn' ? 'নিয়মিত মূল্য' : 'Regular price'}
        >
          {formattedRegularBottle}
        </span>
        <span
          className={`font-manrope ${sizeClasses.bottlePrice} text-[#E6C98A] tracking-tight drop-shadow-xs`}
        >
          {formattedSaleBottle}
        </span>
      </div>

      {/* Per mL Psychology: 50 -> crossed -> 43 */}
      {showPerMl && (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#120E0B]/80 border border-[#C9A25A]/30 text-[#A89A86] shadow-xs">
          <span className="text-[10px] text-[#A89A86]">
            {lang === 'bn' ? 'প্রতি মিলি:' : 'Per mL:'}
          </span>
          <span className="font-manrope text-[11px] line-through decoration-rose-400 decoration-[1.5px] text-[#A89A86] font-medium">
            {formattedRegularMl}
          </span>
          <span className="font-manrope font-bold text-xs text-[#E6C98A]">
            {formattedSaleMl}
          </span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-500/25">
            {lang === 'bn' ? '-14%' : 'SAVE'}
          </span>
        </div>
      )}
    </div>
  );
};

// Compact inline Per-mL Price Tag: <s>50</s> 43 /mL
export const PerMlPriceTag: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang } = useApp();
  return (
    <span className={`inline-flex items-baseline gap-1 font-hind ${className}`}>
      <span className="line-through decoration-rose-400 decoration-[1.5px] text-[#A89A86] text-xs">
        {formatPrice(50, lang)}
      </span>
      <span className="text-[#E6C98A] font-extrabold text-sm">
        {formatPrice(43, lang)}
      </span>
      <span className="text-[10px] text-[#A89A86]">
        /{lang === 'bn' ? 'মিলি' : 'mL'}
      </span>
    </span>
  );
};
