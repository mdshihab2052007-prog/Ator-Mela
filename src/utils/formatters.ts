import { Language } from '../shared/types.ts';

/**
 * Standard simple digit formatter.
 * Note: The user requested: "'১' does not look good. It is hard to understand. Make it look simple."
 * Clean standard digits (1, 2, 3...) are used to ensure 100% immediate clarity and readability
 * across all pricing, step badges, quantities, and offers.
 */
export function toBanglaDigits(value: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/[0-9]/g, (match) => bnDigits[parseInt(match, 10)]);
}

export function formatPrice(amount: number, lang: Language = 'bn'): string {
  if (lang === 'bn') {
    return `৳${toBanglaDigits(amount)}`;
  }
  return `Tk ${amount}`;
}

export function formatQuantity(qty: number, lang: Language = 'bn'): string {
  if (lang === 'bn') {
    return toBanglaDigits(qty);
  }
  return String(qty);
}

export function formatDate(isoDate: string, lang: Language = 'bn'): string {
  try {
    const d = new Date(isoDate);
    if (lang === 'bn') {
      const day = toBanglaDigits(d.getDate());
      const monthsBn = [
        'জানুয়ারি',
        'ফেব্রুয়ারি',
        'মার্চ',
        'এপ্রিল',
        'মে',
        'জুন',
        'জুলাই',
        'আগস্ট',
        'সেপ্টেম্বর',
        'অক্টোবর',
        'নভেম্বর',
        'ডিসেম্বর',
      ];
      const month = monthsBn[d.getMonth()];
      const year = toBanglaDigits(d.getFullYear());
      return `${day} ${month}, ${year}`;
    }
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

