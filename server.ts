import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from './server/store.ts';
import { OrderStatus } from './src/shared/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

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
  const calculation = store.calculateCart(cart, district);
  res.json(calculation);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'];
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

  const result = store.createOrder({
    customer_name,
    customer_phone,
    district,
    area_upazila,
    full_address,
    note,
    cart: cart || [],
    ip,
    user_agent,
    utm_source,
    utm_medium,
    utm_campaign,
    honeypot: website_hp,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    success: true,
    order: result.order,
  });
});

app.post('/api/orders/track', (req: Request, res: Response) => {
  const { order_id, phone } = req.body;
  if (!order_id || !phone) {
    return res.status(400).json({ error: 'Order ID and phone number required' });
  }
  const order = store.trackOrder(order_id, phone);
  if (!order) {
    return res.status(404).json({ error: 'Order not found with provided ID and phone' });
  }
  res.json({ order });
});

app.post('/api/faqs/view', (req: Request, res: Response) => {
  const { faq_id } = req.body;
  if (faq_id) {
    store.incrementFAQView(faq_id);
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
app.post('/api/ai/scent-advisor', async (req: Request, res: Response) => {
  const { preference, mood, occasion } = req.body;

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
app.post('/api/ai/chatbot', async (req: Request, res: Response) => {
  const { query, lang } = req.body;
  if (!query || typeof query !== 'string') {
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
Language: "${lang === 'en' ? 'en' : 'bn'}"

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

// Admin Auth Middleware
const checkAdminAuth = (req: Request, res: Response, next: () => void) => {
  const adminEmail = (req.headers['x-admin-email'] as string) || '';
  const settings = store.getSettings();
  if (!adminEmail || !settings.admin_emails.includes(adminEmail.toLowerCase().trim())) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  next();
};

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const settings = store.getSettings();
  if (email && settings.admin_emails.includes(email.toLowerCase().trim())) {
    res.json({ success: true, email: email.toLowerCase().trim() });
  } else {
    res.status(401).json({ error: 'Email not authorized as administrator' });
  }
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

