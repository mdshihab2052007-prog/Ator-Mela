import React from 'react';

// Eight-point Arabic star ornament
export const StarOrnament: React.FC<{ className?: string; size?: number; color?: string }> = ({
  className = '',
  size = 18,
  color = '#C9A25A',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M12 0L14.5 8.5L23 6L17.5 12.5L24 16.5L15.5 17L14 24L10 17.5L2 19L5.5 12L0 8.5L8.5 8L12 0Z"
        fill={color}
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="2.5" fill="#120E0B" />
      <circle cx="12" cy="12" r="1.2" fill={color} />
    </svg>
  );
};

// Section separator with star
export const StarDivider: React.FC<{ className?: string }> = ({ className = 'my-12' }) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#C9A25A]/40 to-[#C9A25A]/80" />
      <StarOrnament size={16} />
      <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#C9A25A]/40 to-[#C9A25A]/80" />
    </div>
  );
};

// Elegant Brand Logo with Uploaded Profile Icon
export const BrandLogo: React.FC<{
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', onClick, showSubtitle = true, size = 'md' }) => {
  const [imgError, setImgError] = React.useState(false);
  const logoUrl = 'https://i.ibb.co.com/pjJv4V55/ator-mela-profile-icon.png';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-11 h-11',
  }[size];

  const titleSizes = {
    sm: 'text-lg sm:text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Uploaded Brand Profile Icon with brass border */}
      <div className={`relative shrink-0 ${iconSizes} rounded-full overflow-hidden border border-[#C9A25A]/60 shadow-md group-hover:border-[#E6C98A] group-hover:scale-105 transition-all bg-[#120E0B]`}>
        {!imgError ? (
          <img
            src={logoUrl}
            alt="Ator Mela"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1E1814] text-[#C9A25A]">
            <StarOrnament size={14} />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-cormorant ${titleSizes} font-semibold tracking-wider text-[#F3EBDD] group-hover:text-[#E6C98A] transition-colors leading-none`}>
            Ator Mela
          </span>
          <StarOrnament size={11} className="text-[#C9A25A]" />
        </div>
        {showSubtitle && (
          <span className="font-tiro text-xs sm:text-sm tracking-widest text-[#C9A25A] font-medium leading-tight mt-0.5">
            আতর মেলা
          </span>
        )}
      </div>
    </div>
  );
};

// Luxury 3 mL Perfume Bottle Visual
export const LuxuryBottle: React.FC<{
  accentHex: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  glow?: boolean;
}> = ({ accentHex, name, size = 'md', className = '', glow = true }) => {
  const sizeMap = {
    sm: 'w-16 h-28',
    md: 'w-24 h-44',
    lg: 'w-36 h-64',
    hero: 'w-44 h-76 sm:w-52 sm:h-88',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Soft radial glow in product accent */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundColor: accentHex }}
        />
      )}

      {/* SVG Bottle Rendering */}
      <svg
        viewBox="0 0 160 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl relative z-10 transition-transform duration-500 hover:scale-105"
      >
        <defs>
          <linearGradient id={`liquid-${accentHex.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentHex} stopOpacity="0.95" />
            <stop offset="70%" stopColor={accentHex} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0B0907" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="gold-cap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A6724" />
            <stop offset="30%" stopColor="#E6C98A" />
            <stop offset="60%" stopColor="#C9A25A" />
            <stop offset="100%" stopColor="#6C4E14" />
          </linearGradient>

          <linearGradient id="glass-glare" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Cap finial (traditional octagonal attar flacon topper) */}
        <path
          d="M80 8L88 22H72L80 8Z"
          fill="url(#gold-cap)"
          stroke="#E6C98A"
          strokeWidth="0.8"
        />
        {/* Cap main cylinder */}
        <rect
          x="62"
          y="22"
          width="36"
          height="42"
          rx="3"
          fill="url(#gold-cap)"
          stroke="#5C4212"
          strokeWidth="1"
        />
        {/* Cap ribbed detail lines */}
        <line x1="63" y1="32" x2="97" y2="32" stroke="#46310C" strokeWidth="1.2" />
        <line x1="63" y1="42" x2="97" y2="42" stroke="#46310C" strokeWidth="1.2" />
        <line x1="63" y1="52" x2="97" y2="52" stroke="#46310C" strokeWidth="1.2" />

        {/* Neck ring */}
        <rect
          x="58"
          y="64"
          width="44"
          height="8"
          rx="2"
          fill="url(#gold-cap)"
        />

        {/* Glass Bottle Body (3 mL flacon with chamfered edges) */}
        <path
          d="M44 76 H116 L128 100 V252 C128 260 120 268 110 268 H50 C40 268 32 260 32 252 V100 L44 76 Z"
          fill="#1A1512"
          stroke="#C9A25A"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Attar Perfume Oil Inside */}
        <path
          d="M40 102 H120 V248 C120 255 114 260 106 260 H54 C46 260 40 255 40 248 V102 Z"
          fill={`url(#liquid-${accentHex.replace('#', '')})`}
        />

        {/* Dip rod inside attar */}
        <rect
          x="78"
          y="70"
          width="4"
          height="160"
          rx="2"
          fill="#FFFFFF"
          fillOpacity="0.25"
        />

        {/* Glass reflection / glare highlight */}
        <path
          d="M42 100 H118 L114 256 H46 L42 100 Z"
          fill="url(#glass-glare)"
        />
        <rect
          x="44"
          y="110"
          width="8"
          height="136"
          rx="4"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />

        {/* Label plate in brass and deep charcoal */}
        <rect
          x="48"
          y="135"
          width="64"
          height="75"
          rx="4"
          fill="#120E0B"
          stroke="#C9A25A"
          strokeWidth="1"
        />
        <rect
          x="51"
          y="138"
          width="58"
          height="69"
          rx="2"
          fill="none"
          stroke="#C9A25A"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Label Star */}
        <circle cx="80" cy="150" r="3" fill="#C9A25A" />
        <path d="M80 144 L81.5 150 L87 150 L82.5 153 L84 159 L80 155 L76 159 L77.5 153 L73 150 L78.5 150 Z" fill="#E6C98A" />

        {/* Label Text */}
        <text
          x="80"
          y="172"
          textAnchor="middle"
          fill="#F3EBDD"
          fontSize="9"
          fontFamily="'Cormorant Garamond', serif"
          fontWeight="700"
          letterSpacing="0.8"
        >
          {name.length > 12 ? name.substring(0, 10) + '..' : name}
        </text>
        <text
          x="80"
          y="184"
          textAnchor="middle"
          fill="#C9A25A"
          fontSize="7"
          fontFamily="'Manrope', sans-serif"
          fontWeight="600"
          letterSpacing="0.5"
        >
          3 mL · ৳129
        </text>
        <text
          x="80"
          y="198"
          textAnchor="middle"
          fill="#A89A86"
          fontSize="5"
          fontFamily="'Manrope', sans-serif"
          letterSpacing="1"
        >
          ATOR MELA
        </text>
      </svg>
    </div>
  );
};
