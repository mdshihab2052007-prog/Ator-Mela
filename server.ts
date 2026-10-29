import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { store } from './server/store.ts';
import { OrderStatus } from './src/shared/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security: Disable express fingerprint header
app.disable('x-powered-by');

// Security: Strict HTTP Security Headers (Anti-Clickjacking, Anti-MIME sniffing, XSS Protection)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Security: Enforce tight request payload body limits to prevent Denial-of-Service (DoS) buffer exhaustion
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// Input Sanitization Helpers
function sanitizeText(val: unknown, maxLen = 250): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>"'`]/g, '')     // Strip scripting characters
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

function sanitizePhone(val: unknown): string {
  if (typeof val !== 'string') return '';
  const bnToEn: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  const normalized = val.replace(/[০-৯]/g, (d) => bnToEn[d] || d);
  return normalized.replace(/\s+/g, '').replace(/^\+88/, '').trim();
}

// In-Memory Sliding-Window Rate Limiter
interface RateLimitRecord {
  timestamps: number[];
}

function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically purge stale records every 5 minutes to avoid memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (interval.unref) interval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const clientIp = rawIp.split(',')[0].trim();
    const now = Date.now();

    let record = ipStore.get(clientIp);
    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);

    if (record.timestamps.length >= options.max) {
      const retryAfterSec = Math.ceil(options.windowMs / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: options.message,
        retryAfter: retryAfterSec,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// Security Rate Limiters for critical endpoints
const orderRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6,                   // Max 6 orders per IP per 15 mins (anti-spam)
  message: 'অল্প সময়ে অতিরিক্ত অর্ডারের চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
});

const trackRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'অতিরিক্ত ট্র্যাকিং অনুসন্ধানের চেষ্টা। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।',
});

const aiRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'AI সার্ভিসের ব্যবহারসীমা অতিক্রম করেছে। অনুগ্রহ করে ১০ মিনিট পর চেষ্টা করুন।',
});

const adminLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 wrong attempts (anti-brute force)
  message: 'অতিরিক্ত ব্যর্থ এডমিন লগইন চেষ্টা। নিরাপত্তা স্বার্থে ১৫ মিনিটের জন্য ব্লক করা হয়েছে।',
});

// Admin Cryptographic Session Token Store
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AtorMela#2026@Secure';
const adminSessions = new Map<string, { email: string; expiresAt: number }>();

// Public API endpoints
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  res.json({
    products: store.getPublicProducts(),
    offer: store.getOffer(),
    deliverySettings: store.getDeliverySettings(),
    faqs: store.getPublicFAQs(),
    reviews: store.getApprovedReviews(),
    settings: store.getSettings(),
  });
});

app.post('/api/cart/calculate', (req: Request, res: Response) => {
  const { cart, district } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart format' });
  }
  const cleanDistrict = sanitizeText(district, 50);
  const calculation = store.calculateCart(cart, cleanDistrict);
  res.json(calculation);
});

app.post('/api/orders', orderRateLimiter, (req: Request, res: Response) => {
  const ip = ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '').split(',')[0].trim();
  const user_agent = (req.headers['user-agent'] || '').slice(0, 255);
  
  const {
    customer_name,
    customer_phone,
    district,
    area_upazila,
    full_address,
    note,
    cart,
    utm_source,
    utm_medium,
    utm_campaign,
    website_hp,
  } = req.body;

  // Honeypot spam bot check
  if (website_hp && typeof website_hp === 'string' && website_hp.trim().length > 0) {
    return res.status(200).json({
      success: true,
      order: {
        id: `AM-${Date.now().toString().slice(-6)}`,
        status: 'new',
        customer_name: 'Bot',
        customer_phone: '01700000000',
        total: 0,
      },
    });
  }

  // Sanitize all customer inputs
  const cleanName = sanitizeText(customer_name, 70);
  const cleanPhone = sanitizePhone(customer_phone);
  const cleanDistrict = sanitizeText(district, 50) || 'Rajshahi';
  const cleanUpazila = sanitizeText(area_upazila, 100);
  const cleanAddress = sanitizeText(full_address, 300);
  const cleanNote = sanitizeText(note, 300);

  // Validate sanitized inputs
  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ error: 'অনুগ্রহ করে আপনার সঠিক নাম লিখুন' });
  }

  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)' });
  }

  if (!cleanAddress || cleanAddress.length < 5) {
    return res.status(400).json({ error: 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা দিন' });
  }

  // Validate cart items
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'কার্ট খালি রয়েছে' });
  }

  const validCart = cart
    .filter((item: any) => item && typeof item.productId === 'string')
    .map((item: any) => ({
      productId: sanitizeText(item.productId, 50),
      quantity: Math.min(20, Math.max(1, parseInt(item.quantity, 10) || 1)),
    }));

  const result = store.createOrder({
    customer_name: cleanName,
    customer_phone: cleanPhone,
    district: cleanDistrict,
    area_upazila: cleanUpazila,
    full_address: cleanAddress,
    note: cleanNote || undefined,
    cart: validCart,
    ip,
    user_agent,
    utm_source: sanitizeText(utm_source, 100),
    utm_medium: sanitizeText(utm_medium, 100),
    utm_campaign: sanitizeText(utm_campaign, 100),
    honeypot: undefined,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    success: true,
    order: result.order,
  });
});

app.post('/api/orders/track', trackRateLimiter, (req: Request, res: Response) => {
  const { order_id, phone } = req.body;
  const cleanOrderId = sanitizeText(order_id, 30);
  const cleanPhone = sanitizePhone(phone);

  if (!cleanOrderId || !cleanPhone) {
    return res.status(400).json({ error: 'অর্ডার আইডি এবং ফোন নম্বর প্রয়োজন' });
  }

  const order = store.trackOrder(cleanOrderId, cleanPhone);
  if (!order) {
    return res.status(404).json({ error: 'এই তথ্যে কোনো অর্ডার পাওয়া যায়নি।' });
  }
  res.json({ order });
});

app.post('/api/faqs/view', (req: Request, res: Response) => {
  const { faq_id } = req.body;
  if (faq_id && typeof faq_id === 'string') {
    store.incrementFAQView(sanitizeText(faq_id, 50));
  }
  res.json({ success: true });
});

import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/faqs/unanswered', (req: Request, res: Response) => {
  const { text, language } = req.body;
  if (text) {
    store.addUnansweredQuestion(text, language || 'bn');
  }
  res.json({ success: true });
});

// Helper for precise semantic fragrance matching across Ator Mela's signature collection
function analyzeFragrancePreference(preference: string = '', mood: string = '', occasion: string = '') {
  const text = `${preference} ${mood} ${occasion}`.toLowerCase();

  let scoreVampire = 0;
  let scoreAroosah = 0;
  let scoreEhsas = 0;

  // Vampire Blood: Sweet, Fruity, Dark, Evening, Cherry, Berry, Vanilla, Alluring
  if (/মিষ্টি|ফল|ফলের|বেরি|চেরি|ভ্যানিলা|ভ্যাম্পায়ার|পার্টি|রাতের|রাত্রে|আকর্ষণ|গাঢ়|মেয়ে|নারী|স্পেশাল|রহস্যময়|sweet|fruit|fruity|berry|cherry|vanilla|vampire|evening|party|dark|alluring/i.test(text)) {
    scoreVampire += 10;
  }

  // Aroosah: Soft, Gentle, Floral, Jasmine, White Flowers, Bridal, Wedding, Gift, Light
  if (/কোমল|স্নিগ্ধ|হালকা|ফুল|ফুলেল|জুঁই|বেলি|বিয়ে|নতুন বধূ|বধূ|গিফট|উপহার|আরুসা|শান্ত|মাথা ধরা ছাড়া|soft|radiant|gentle|floral|jasmine|flower|wedding|bridal|gift|aroosah|light/i.test(text)) {
    scoreAroosah += 10;
  }

  // Ehsas Al Arabia: Royal, Warm, Amber, Saffron, Rose, Jumuah, Eid, Office, Professional, Sunnah
  if (/রাজকীয়|উষ্ণ|আম্বার|জাফরান|গোলাপ|চন্দন|জুমা|জুম্মা|নামাজ|ঈদ|অফিস|প্রফেশনাল|গম্ভীর|এহসাস|আরাবিয়া|পুরুষ|ছেলে|সুন্নাহ|অফিসে|royal|warm|amber|saffron|rose|jumuah|eid|office|ehsas|dignified/i.test(text)) {
    scoreEhsas += 10;
  }

  // Determine highest matching score
  if (scoreVampire > scoreAroosah && scoreVampire > scoreEhsas) {
    return {
      recommended_product_id: 'prod-vampire',
      match_score: 98,
      headline_bn: 'আপনার মিষ্টি ও মোহময় পছন্দের সাথে ১০০% মানানসই: ভ্যাম্পায়ার ব্লাড',
      reasoning_bn: 'মিষ্টি ডার্ক চেরি, লাল বেরি, রাতজাগা জুঁই ও ক্রিমি ভ্যানিলার মোহময় গাঢ় মিশ্রণ — যা আপনার উপস্থিতিকে চারপাশের মানুষের মাঝে অনন্য ও স্মরণীয় করে তুলবে।',
      notes_highlight_bn: 'লাল বেরি, ডার্ক চেরি, রাতজাগা জুঁই ও ক্রিমি ভ্যানিলা',
      application_tip_bn: 'কব্জি ও জামায় হালকাভাবে ড্যাব করুন। সান্ধ্যকালীন অনুষ্ঠান বা বিশেষ মুহূর্তে ব্যবহারের জন্য পারফেক্ট।',
    };
  }

  if (scoreAroosah > scoreVampire && scoreAroosah > scoreEhsas) {
    return {
      recommended_product_id: 'prod-aroosah',
      match_score: 97,
      headline_bn: 'আপনার কোমল ও স্নিগ্ধ পছন্দের চমৎকার মিল: আরুসা',
      reasoning_bn: 'নাশপাতি ও প্রস্ফুটিত জুঁই ফুলের শান্ত, দ্যুতিময় ছোঁয়া — যা মাথায় কোনো চাপ সৃষ্টি করে না এবং সারাদিন এক স্নিগ্ধ আমেজ বজায় রাখে।',
      notes_highlight_bn: 'নাশপাতি, সাদা ফুল, জুঁই ও হোয়াইট মাস্ক',
      application_tip_bn: 'কানের পেছনে ও গলার পালস পয়েন্টে লাগান। নতুন বধূ, উপহার বা দিনের বেলা ব্যবহারের জন্য সেরা।',
    };
  }

  return {
    recommended_product_id: 'prod-ehsas',
    match_score: 96,
    headline_bn: 'আপনার রাজকীয় ও গম্ভীর রুচির সেরা পছন্দ: এহসাস আল আরাবিয়া',
    reasoning_bn: 'জাফরান, তিউনিসিয়ান আম্বার ও তায়েফ গোলাপের উষ্ণ ধ্রুপদী অ্যারাবিয়ান ব্লেন্ড — যা মার্জিত গাম্ভীর্য ও আভিজাত্য ফুটিয়ে তোলে।',
    notes_highlight_bn: 'জাফরান, তায়েফ গোলাপ, চন্দন কাঠ ও নরম কস্তূরী',
    application_tip_bn: 'কব্জি ও কাপড়ে কয়েক ফোঁটা লাগান। জুমার নামাজ, ঈদ ও প্রফেশনাল পরিবেশে সর্বোচ্চস্থায়ী সুবাস।',
  };
}

// AI Fragrance Sommelier / Scent Advisor
app.post('/api/ai/scent-advisor', aiRateLimiter, async (req: Request, res: Response) => {
  const preference = sanitizeText(req.body.preference, 200);
  const mood = sanitizeText(req.body.mood, 100);
  const occasion = sanitizeText(req.body.occasion, 100);

  try {
    const prompt = `You are a Bangladeshi Attar & Perfume Sommelier at "Ator Mela" (আতর মেলা).
Analyze the user's fragrance query and strictly match it to ONE of the 3 signature attars below based on these rules:

CRITICAL SELECTION RULES:
1. If user wants sweet, fruity, berries, dark cherry, vanilla, evening, party, alluring, or Vampire Blood -> MUST select "prod-vampire".
2. If user wants soft, gentle, floral, white flowers, jasmine, bridal, wedding, gift, or Aroosah -> MUST select "prod-aroosah".
3. If user wants royal, warm, amber, rose, saffron, Jumuah, Eid, office, professional, or Ehsas Al Arabia -> MUST select "prod-ehsas".

User Input:
- Preference: "${preference || 'Any'}"
- Mood Tag: "${mood || 'Any'}"
- Occasion: "${occasion || 'Any'}"

Available Attars:
1. "prod-vampire" (ভ্যাম্পায়ার ব্লাড): Sweet, fruity, dark cherry, red berries, night jasmine, vanilla.
2. "prod-aroosah" (আরুসা): Soft, gentle, radiant floral, pear, white flowers, jasmine, white musk.
3. "prod-ehsas" (এহসাস আল আরাবিয়া): Royal, warm, amber, taif rose, saffron, sandalwood.

Output JSON strictly matching response schema with recommended_product_id set to "prod-vampire", "prod-aroosah", or "prod-ehsas".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommended_product_id: {
              type: Type.STRING,
              description: 'The exact product ID chosen (prod-ehsas, prod-vampire, or prod-aroosah)',
            },
            match_score: {
              type: Type.INTEGER,
              description: 'Compatibility percentage (e.g., 94, 98)',
            },
            headline_bn: {
              type: Type.STRING,
              description: 'Catchy headline in Bengali',
            },
            reasoning_bn: {
              type: Type.STRING,
              description: 'Poetic, elegant explanation in Bengali why this scent fits their choice',
            },
            notes_highlight_bn: {
              type: Type.STRING,
              description: 'Key notes highlight in Bengali',
            },
            application_tip_bn: {
              type: Type.STRING,
              description: 'A helpful tip on how to wear this attar for maximum longevity',
            },
          },
          required: [
            'recommended_product_id',
            'match_score',
            'headline_bn',
            'reasoning_bn',
            'notes_highlight_bn',
            'application_tip_bn',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const recommendation = JSON.parse(jsonText);

    if (recommendation && recommendation.recommended_product_id) {
      return res.json({ success: true, recommendation });
    }
  } catch (err) {
    console.error('AI Scent Advisor API notice:', err);
  }

  // Fallback to intelligent multi-keyword semantic analysis
  const fallbackRec = analyzeFragrancePreference(preference, mood, occasion);
  res.json({ success: true, recommendation: fallbackRec });
});

// Neutral AI Chatbot Assistant endpoint
app.post('/api/ai/chatbot', aiRateLimiter, async (req: Request, res: Response) => {
  const query = sanitizeText(req.body.query, 300);
  const lang = req.body.lang === 'en' ? 'en' : 'bn';

  if (!query) {
    return res.status(400).json({ error: 'Query text is required' });
  }

  try {
    const prompt = `You are an impartial, accurate, and neutral customer assistant for "Ator Mela" (আতর মেলা).
Store Knowledge:
- Signature Attars:
  1. Ehsas Al Arabia (এহসাস আল আরাবিয়া): Royal, warm, amber, Taif rose, saffron, sandalwood. Best for Jumu'ah, Eid, daily office wear.
  2. Vampire Blood (ভ্যাম্পায়ার ব্লাড): Sweet, fruity, dark cherry, red berries, night-blooming jasmine, creamy vanilla. Best for evening, parties, alluring sweet scent lovers.
  3. Aroosah (আরুসা): Soft, gentle, radiant floral, pear, white florals, jasmine, white musk. Best for weddings, gifts, soft daytime scent.
- Minimum order policy: Minimum order quantity is 2 bottles (6 mL). Buying less than 6 mL (such as 1 bottle / 3 mL) is strictly NOT possible.
- Current offer: Buy 6 mL (2 bottles) of any attar, get 3 mL (1 bottle) of the same attar FREE.
- Delivery: 30 BDT flat delivery charge (FREE delivery on 10 mL or more). Currently delivering in Rajshahi and Chapai Nawabganj. Payment is Cash on Delivery.

User Inquiry: "${query}"
Language: "${lang}"

Guidelines:
1. Provide a completely neutral, objective, and factual response in the requested language.
2. NEVER favor "Ehsas Al Arabia" by default. Match recommendations strictly to user preferences (Vampire Blood for sweet/fruity, Aroosah for soft/floral, Ehsas Al Arabia for royal/amber).
3. If asked whether it is possible to buy less than 6 mL, state clearly that it is NOT possible, and minimum order is 2 bottles (6 mL).
4. Keep the answer clear, helpful, and concise (2-4 sentences max).

Respond strictly with JSON matching this structure:
{
  "answer": "Your detailed neutral answer string",
  "recommended_product_id": "prod-vampire" or "prod-aroosah" or "prod-ehsas" or null
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            recommended_product_id: { type: Type.STRING },
          },
          required: ['answer'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json({
      success: true,
      answer: parsed.answer,
      recommended_product_id: parsed.recommended_product_id || null,
    });
  } catch (err) {
    console.error('AI Chatbot error:', err);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Admin Auth Middleware with Cryptographic Session Token Verification
const checkAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token =
    (req.headers['x-admin-token'] as string) ||
    (req.query.token as string) ||
    (req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : '');

  if (!token) {
    return res.status(401).json({ error: 'নিরাপত্তা টোকেন অনুপস্থিত (Unauthorized)' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ error: 'এডমিন সেশন মেয়াদোত্তীর্ণ বা অবৈধ। দয়া করে পুনরায় লগইন করুন।' });
  }

  // Refresh expiration on activity (sliding 12 hours)
  session.expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  (req as any).adminEmail = session.email;
  next();
};

app.post('/api/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body;
  const settings = store.getSettings();
  const cleanEmail = sanitizeText(email, 100).toLowerCase().trim();
  const cleanPass = typeof password === 'string' ? password.trim() : '';

  if (!cleanEmail || !settings.admin_emails.includes(cleanEmail)) {
    return res.status(401).json({ error: 'অননুমোদিত এডমিন ইমেইল' });
  }

  if (cleanPass !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'ভুল সিক্রেট পাসওয়ার্ড / পিন' });
  }

  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, {
    email: cleanEmail,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    email: cleanEmail,
    token,
  });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || '';
  if (token) adminSessions.delete(token);
  res.json({ success: true });
});

// Admin protected endpoints
app.get('/api/admin/data', checkAdminAuth, (_req: Request, res: Response) => {
  res.json({
    orders: store.getAllOrders(),
    products: store.getAllProducts(),
    offer: store.getOffer(),
    deliverySettings: store.getDeliverySettings(),
    faqs: store.getAllFAQs(),
    reviews: store.getAllReviews(),
    settings: store.getSettings(),
    unansweredQuestions: store.getUnansweredQuestions(),
  });
});

app.post('/api/admin/orders/status', checkAdminAuth, (req: Request, res: Response) => {
  const adminEmail = req.headers['x-admin-email'] as string;
  const { order_id, status, courier_name, tracking_id, cancellation_reason } = req.body;

  const result = store.updateOrderStatus(order_id, status as OrderStatus, adminEmail, {
    courier_name,
    tracking_id,
    cancellation_reason,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, order: result.order, offer: store.getOffer() });
});

app.post('/api/admin/products', checkAdminAuth, (req: Request, res: Response) => {
  const { product } = req.body;
  store.updateProduct(product);
  res.json({ success: true, products: store.getAllProducts() });
});

app.post('/api/admin/offer', checkAdminAuth, (req: Request, res: Response) => {
  const { offer } = req.body;
  store.updateOffer(offer);
  res.json({ success: true, offer: store.getOffer() });
});

app.post('/api/admin/delivery', checkAdminAuth, (req: Request, res: Response) => {
  const { deliverySettings } = req.body;
  store.updateDeliverySettings(deliverySettings);
  res.json({ success: true, deliverySettings: store.getDeliverySettings() });
});

app.post('/api/admin/faqs', checkAdminAuth, (req: Request, res: Response) => {
  const { faq } = req.body;
  store.updateFAQ(faq);
  res.json({ success: true, faqs: store.getAllFAQs() });
});

app.post('/api/admin/reviews/moderate', checkAdminAuth, (req: Request, res: Response) => {
  const { id, approved } = req.body;
  store.updateReviewStatus(id, Boolean(approved));
  res.json({ success: true, reviews: store.getAllReviews() });
});

app.post('/api/admin/settings', checkAdminAuth, (req: Request, res: Response) => {
  const { settings } = req.body;
  store.updateSettings(settings);
  res.json({ success: true, settings: store.getSettings() });
});

// CSV Export
app.get('/api/admin/export/orders.csv', checkAdminAuth, (_req: Request, res: Response) => {
  const orders = store.getAllOrders();
  const headers = [
    'Order ID',
    'Date',
    'Customer Name',
    'Phone',
    'District',
    'Address',
    'Status',
    'Items',
    'Paid Bottles',
    'Free Bottles',
    'Subtotal',
    'Delivery Fee',
    'Total',
  ];

  const rows = orders.map((o) => [
    o.id,
    o.created_at,
    `"${o.customer_name.replace(/"/g, '""')}"`,
    o.customer_phone,
    `"${o.district}"`,
    `"${o.full_address.replace(/"/g, '""')}"`,
    o.status,
    `"${o.items.map((i) => `${i.product_name_en} x${i.paid_bottles}${i.free_bottles ? ` (+${i.free_bottles} free)` : ''}`).join('; ')}"`,
    o.paid_bottles_total,
    o.free_bottles_total,
    o.subtotal,
    o.delivery_fee,
    o.total,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ator-mela-orders.csv"');
  res.send(csvContent);
});

app.get('/api/admin/export/customers.csv', checkAdminAuth, (_req: Request, res: Response) => {
  const orders = store.getAllOrders();
  const customerMap = new Map<string, { name: string; phone: string; orders: number; totalSpent: number; lastOrder: string }>();

  orders.forEach((o) => {
    const existing = customerMap.get(o.customer_phone);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += o.status === 'delivered' ? o.total : 0;
      if (new Date(o.created_at) > new Date(existing.lastOrder)) {
        existing.lastOrder = o.created_at;
      }
    } else {
      customerMap.set(o.customer_phone, {
        name: o.customer_name,
        phone: o.customer_phone,
        orders: 1,
        totalSpent: o.status === 'delivered' ? o.total : 0,
        lastOrder: o.created_at,
      });
    }
  });

  const headers = ['Phone', 'Customer Name', 'Total Orders', 'Delivered Spend (BDT)', 'Last Order Date'];
  const rows = Array.from(customerMap.values()).map((c) => [
    c.phone,
    `"${c.name.replace(/"/g, '""')}"`,
    c.orders,
    c.totalSpent,
    c.lastOrder,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ator-mela-customers.csv"');
  res.send(csvContent);
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ator Mela server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

