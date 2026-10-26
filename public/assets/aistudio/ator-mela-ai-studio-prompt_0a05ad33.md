# ROLE
You are a world-class product designer and senior full-stack engineer. Build a visually stunning, production-ready, mobile-first e-commerce web app for "Ator Mela" (আতর মেলা), an attar (perfume oil) brand in Bangladesh. It must feel like a luxury perfume house, yet make the price, the offer and the delivery terms impossible to miss. Buyers are mainly in Rajshahi and Chapai Nawabganj, browse on mid-range Android phones over mobile data, read Bangla first, and pay Cash on Delivery.

# BRAND
- Name: Ator Mela / আতর মেলা
- Tagline: "Pure scent, honest price" / "খাঁটি ঘ্রাণ, সাশ্রয়ী দামে"
- Phone and WhatsApp: 01643249148 (tel:+8801643249148, https://wa.me/8801643249148)
- Facebook page: [[FB_PAGE_URL]] (hide the Facebook link until set in admin)
- Admin: faysalahmad687@gmail.com
- Logo: create an elegant text logo: "Ator Mela" in Cormorant Garamond with "আতর মেলা" in Tiro Bangla beneath, separated by a small brass eight-point star. Provide it as SVG; admin can upload a replacement.

# PRODUCTS (seed data, all editable in admin)
Every attar is sold in a 3 mL bottle at 43 Tk per mL = 129 Tk per bottle. Customers choose a number of bottles.

1. Ehsas Al Arabia / এহসাস আল আরাবিয়া
   - Accent: deep amber #B8741A
   - Mood: "Royal and warm" / "রাজকীয় ও উষ্ণ"
   - Notes: top saffron, bergamot · heart Taif rose · base amber, sandalwood, soft musk
   - Best for: Jumu'ah, Eid, daily office wear / জুমা, ঈদ, প্রতিদিনের অফিস
   - Description: a classic Arabian blend of rose warmed by amber, smooth and dignified.
2. Vampire Blood / ভ্যাম্পায়ার ব্লাড
   - Accent: deep garnet #6E1423
   - Mood: "Dark and mysterious" / "গাঢ় ও রহস্যময়"
   - Notes: top red berries, dark cherry · heart night-blooming jasmine · base plum, creamy vanilla
   - Best for: evenings, parties, special occasions / সন্ধ্যা, দাওয়াত, বিশেষ মুহূর্ত
   - Description: sweet, fruity and bold, a scent people notice and ask about.
3. Aroosah / আরুসা
   - Accent: champagne gold #D9B865 (lighter than Ehsas so the two never look the same)
   - Mood: "Soft and radiant" / "কোমল ও উজ্জ্বল"
   - Notes: top pear, mandarin · heart jasmine, white florals, rose petals · base white musk, vanilla, light amber
   - Best for: weddings, gifts, daytime / বিয়ে, উপহার, দিনের বেলা
   - Description: a bright floral with a soft golden glow, named for the bride.

Product fields: name_bn/en, slug, mood_bn/en, description_bn/en, top/heart/base notes (bn/en), longevity_bn/en (optional, shown only if filled), price_per_ml (43), bottle_ml (3), stock_bottles, images[] (image 1 = main bottle shot), accent_hex, active, sort_order.

# LAUNCH OFFER (exact rule)
- "Buy 6 mL (2 bottles) of any attar, get 3 mL (1 bottle) of the same attar free." Applies per attar: 2 bottles of Vampire Blood → +1 Vampire Blood free; 2 of each of the three → +1 of each free. Repeats per pair: 4 bottles → +2 free.
- Valid only for the first 50 buyers in total across the whole shop. A buyer = a unique phone number.
- The claimed count increases only when the admin marks an order Confirmed, inside a Firestore transaction. Refused or cancelled orders release their slot.
- At 50 the offer ends automatically and every offer element disappears or switches to the next active offer.
- Display the real live number: "৩২/৫০ জন নিয়েছেন" / "32 of 50 claimed". No fake timers, no fake stock.
- Build offers as data so the admin can create future offers: type (buy X get Y free same product | percent off | fixed Tk off), products, buyer limit, per-phone limit, start/end dates, title/description bn/en, active.

# DELIVERY AND PAYMENT (final rules)
- Delivery charge: flat 30 Tk per order.
- Free delivery when the customer's PAID quantity is MORE than 10 mL. With 3 mL bottles that means 4 or more paid bottles (12 mL+). Free offer bottles do NOT count toward the 10 mL. Example: 3 paid bottles = 9 mL → delivery 30 Tk; 4 paid bottles = 12 mL → delivery free.
- Make these admin settings, not hard-coded: delivery_fee (30), free_delivery_above_ml (10, strictly greater than), count_basis ("paid" default | "paid_plus_free"), delivery zones (name_bn/en, districts, fee, delivery time bn/en, active). Seed zones Rajshahi and Chapai Nawabganj with fee 30 and delivery time "১–২ দিন" / "1–2 days". Other districts: admin on/off switch, default off.
- Cart nudge: when paid quantity is 10 mL or less, show a brass strip "আর ১টি বোতল নিলে ডেলিভারি ফ্রি" (compute how many more bottles are needed) with a one-tap "+১" button. When reached, show "ডেলিভারি ফ্রি পেয়েছেন".
- Payment: Cash on Delivery only. Total to pay = bottles + delivery fee (if any).
- Totals examples: 1 bottle = ৳১২৯ + ৳৩০ = ৳১৫৯. 2 bottles of one attar (+1 free) = ৳২৫৮ + ৳৩০ = ৳২৮৮. 4 bottles of any mix (+ offer bottles if eligible) = ৳৫১৬, delivery free.

# VISUAL DESIGN SYSTEM (this is the priority)
Concept: "Midnight perfumery". A dark, rich, cinematic storefront like a high-end fragrance house: deep ink backgrounds, glowing amber light, brass details, each attar owning its colour. Never look like a generic template.
- Colours (CSS variables): ink #120E0B (main background), smoke #1E1814 (cards), parchment #F3EBDD (text and light sections), brass #C9A25A (accents, borders, buttons), brass-light #E6C98A (hover/glow), muted #A89A86 (secondary text), plus each product's accent.
- Typography (Google Fonts): English display Cormorant Garamond 600; English body Manrope 400/600; Bangla display Tiro Bangla; Bangla body Hind Siliguri 400/600. Prices in Manrope 700, oversized. Never use Inter.
- Details: 1px brass hairline dividers, an eight-point Arabic star ornament (SVG) between sections, subtle film grain over dark sections (CSS noise), a soft radial glow in each product's accent colour behind its bottle, 6px corners, thin brass outline buttons and a solid brass primary button.
- Motion (light, CSS/Framer Motion): staggered fade-up on scroll, bottles drift 8px slowly, glow pulse behind the hero bottles, colour cross-fade when switching products, cart badge bounce on add. Respect prefers-reduced-motion; keep 60fps on mid-range phones.
- Layout: asymmetric editorial composition, large imagery, generous spacing. Design 360px wide first, then scale beautifully to desktop.

# PAGE-BY-PAGE VISUAL SPEC
1. Announcement bar (sticky top, brass background, ink text): "২টি কিনলে ১টি ফ্রি · প্রথম ৫০ জন · ৩২/৫০ নেওয়া হয়েছে · ১০ মিলির বেশি নিলে ডেলিভারি ফ্রি". Tap scrolls to the offer.
2. Header: logo left, BN | EN toggle, cart icon with count. Transparent over the hero, solid ink on scroll.
3. Hero (full viewport on mobile): the three bottles in a staggered trio on dark wood with amber glow (hero image, 16:9 desktop and 4:5 mobile crop). Display headline "আতরের মেলা, এক জায়গায়" / "A fair of fine attars", tagline, price line "৩ মিলি মাত্র ৳১২৯ · ডেলিভারি মাত্র ৳৩০", buttons "এখনই অর্ডার করুন" (solid brass) and "ঘ্রাণগুলো দেখুন" (outline).
4. Offer showcase: a bold dark card framed in brass with the formula drawn visually: [bottle] + [bottle] = [bottle FREE], then "৳২৫৮ দিয়ে পান ৯ মিলি". A second small line: "১০ মিলির বেশি নিলে ডেলিভারি চার্জ নেই". Live progress bar of claimed slots out of 50 (brass fill). Clear rule text below.
5. Scent collection: three tall product cards, horizontal snap-scroll on mobile, grid on desktop. Each card: accent-colour gradient wash at the bottom, bottle image, name in both scripts, mood line, notes as three chips, price ৳১২৯, "+১টি ফ্রি" badge while the offer runs, quantity stepper + add button on the card.
6. Scent finder strip: three mood tiles (Royal and warm / Dark and mysterious / Soft and radiant) that jump to the matching attar.
7. Why Ator Mela (parchment section, brass line icons): "৩ মিলি মাত্র ৳১২৯" (honest price) · "ডেলিভারি মাত্র ৳৩০, ১০ মিলির বেশি নিলে ফ্রি" · "পণ্য হাতে পেয়ে টাকা দিন" (Cash on Delivery). Admin can edit these.
8. How to order: three numbered steps (choose scent → order with your phone number → pay when it arrives), linked by a brass line.
9. Reviews: admin-approved reviews with photo, name, area, stars, in a swipeable row. Hidden when there are none.
10. "Questions?" strip (replaces any FAQ section on the page): a slim brass-outlined banner "প্রশ্ন আছে? ট্যাপ করুন, সাথে সাথে উত্তর" that opens the chatbot. All FAQs live inside the chatbot (see below).
11. Footer: ink, logo, phone/WhatsApp, Facebook (if set), policy links, "Cash on Delivery" badge, small link to /faq (a plain, crawlable list of the same FAQs with FAQPage structured data, for SEO).
12. Floating buttons: chatbot button (brass ring, label "প্রশ্ন আছে?") and WhatsApp, bottom-right, never covering the cart bar.
13. Sticky bottom cart bar on mobile once the cart has items: "৩টি বোতল (১টি ফ্রি) · ৳২৮৮ · অর্ডার করুন".

Other pages, same design language:
- Product page: swipe gallery, accent-coloured glow, notes as a three-layer pyramid graphic, occasions, quantity stepper with live price and free bottles as you tap, sticky "Add to cart" on mobile, "other scents" row.
- Cart drawer: items with thumbnails, free bottles as separate "FREE" lines in brass, delivery line (৳৩০ or "ফ্রি"), the free-delivery nudge strip, total, saving in Tk highlighted.
- Checkout (one page, no login): name, mobile (validate 01XXXXXXXXX), district dropdown (only enabled districts), area/upazila, full address, note, coupon field, payment shown as Cash on Delivery, summary card (bottles, free bottles, delivery, total), big "অর্ডার কনফার্ম করুন" button. Hidden honeypot field. Inline errors in the current language.
- Order success: elegant brass check animation, order ID AM-YYMMDD-####, summary, "আমরা কল করে অর্ডার কনফার্ম করব", WhatsApp button with a prefilled message including the order ID.
- Track order (order ID + phone → status timeline), policy pages (delivery, exchange, privacy, terms — editable), About, Contact, a styled 404.
- Empty states and loading skeletons in the same style.

# IMAGES (URL or upload)
- Every image field in admin (products, hero, offer image, OG image, logo, review photos) accepts EITHER a file upload OR a pasted direct image URL (https), with a live preview. If a URL fails to load, show a tasteful dark placeholder, never a broken icon.
- Slots: hero (16:9 + 4:5 crop), one main image per product (4:5) plus up to 4 gallery images, offer image (1:1), og-image (1200×630).
- Until images are set, show elegant dark placeholders with a bottle silhouette in the product's accent colour.
- Uploaded images are stored in Firebase Storage and served as WebP with srcset; pasted URLs are used as given with lazy loading and explicit width/height to avoid layout shift.

# LANGUAGE (Bangla + English)
- Bangla by default; BN | EN toggle switches every string, including chatbot, errors and admin.
- All UI text in bn.json / en.json; content fields have _bn and _en.
- Bangla mode uses Bangla digits (৳১২৯); English mode uses Western digits (Tk 129).
- Routes /bn and /en with hreflang; remember the choice.

# FAQ CHATBOT (tap to get an answer; replies only with the owner's answers)
The chatbot is the whole FAQ experience. It is menu-first: a visitor should get any answer in two taps without typing.
- Opens as a bottom sheet (about 80% height) on mobile and a 380px floating card on desktop, in the site's style: ink background, brass header with the logo, BN | EN toggle, close button.
- Welcome bubble: "আসসালামু আলাইকুম! কী জানতে চান? নিচ থেকে ট্যাপ করুন।" / "Assalamu alaikum! What would you like to know? Tap below."
- Four category tabs: "দাম ও অফার", "ডেলিভারি ও পেমেন্ট", "আতর সম্পর্কে", "অর্ডার ও যোগাযোগ". Under the active tab show its questions as full-width tappable pill buttons (44px+ tall).
- Tapping a question: it appears as the user's bubble, typing dots for about 400 ms, then the answer in a bot bubble. Under the answer show 2–3 related-question chips, a "← সব প্রশ্ন" back button, and an optional action button set per answer ("এখনই অর্ডার করুন", "WhatsApp-এ জিজ্ঞেস করুন", "কল করুন").
- A text box "আপনার প্রশ্ন লিখুন…" is also available. Match with normalised text + Fuse.js across both languages including Banglish ("dam koto", "delivery charge koto", "kivabe order dibo"). Strong match → the answer; medium match → show the top 3 matching questions as tappable chips; no match → "এই প্রশ্নের উত্তর এখনো নেই। WhatsApp-এ জিজ্ঞেস করুন: 01643249148" with a WhatsApp button, and save the text to an "unanswered" collection.
- The bot never writes its own text, prices or promises; it only shows stored answers.
- On the checkout page, the chatbot opens with the delivery, payment and order questions first.
- Count every question tap (views) so the admin can see which questions matter.
- FAQ collection fields: category, question_bn/en, answer_bn/en, keywords_bn[], keywords_en[], related_ids[], action (none | order | whatsapp | call), sort_order, views, active. Editable in admin.

Seed FAQs (Bangla / English). Seed ALL of them; none may be left empty.

Category 1 — দাম ও অফার / Price and offer
1. দাম কত? / What is the price? → প্রতিটি ৩ মিলি বোতল ৳১২৯ (৳৪৩ প্রতি মিলি)। ডেলিভারি চার্জ ৳৩০। ১০ মিলির বেশি (৪টি বা তার বেশি বোতল) নিলে ডেলিভারি ফ্রি। / Each 3 mL bottle is Tk 129 (Tk 43 per mL). Delivery is Tk 30; free if you take more than 10 mL (4 or more bottles). [action: order]
2. অফারটা কী? / What is the offer? → যেকোনো আতরের ২টি বোতল (৬ মিলি) নিলে একই আতরের ১টি বোতল (৩ মিলি) ফ্রি। শুধু প্রথম ৫০ জন ক্রেতার জন্য। / Buy 2 bottles (6 mL) of any attar and get 1 bottle (3 mL) of the same attar free. For the first 50 buyers only. [action: order]
3. একাধিক আতরে অফার পাবো? / Does the offer work on several attars? → হ্যাঁ, প্রতিটি আতরের ২টি বোতলে ১টি ফ্রি। তিনটির ২টি করে নিলে ৩টি ফ্রি। / Yes, every 2 bottles of an attar get 1 of it free. 2 of each of the three = 3 free.
4. অফার কি সবসময় থাকবে? / Will the offer last? → না, শুধু প্রথম ৫০ জন ক্রেতা পাবেন। সাইটে কতজন নিয়েছেন দেখা যায়। / No, only the first 50 buyers get it. The site shows how many have claimed it.
5. ফ্রি বোতল কি ডেলিভারি ফ্রি হিসাবে ধরা হয়? / Do free bottles count toward free delivery? → না। আপনার কেনা বোতল ১০ মিলির বেশি (৪টি বা তার বেশি) হলে ডেলিভারি ফ্রি। অফারের ফ্রি বোতল গণনায় ধরা হয় না। / No. Delivery is free when the bottles you buy total more than 10 mL (4 or more). Offer bottles are not counted.

Category 2 — ডেলিভারি ও পেমেন্ট / Delivery and payment
6. ডেলিভারি চার্জ কত? / What is the delivery charge? → ৳৩০। ১০ মিলির বেশি (৪টি বা তার বেশি বোতল) নিলে ফ্রি। / Tk 30. Free if you buy more than 10 mL (4 or more bottles).
7. কোথায় কোথায় ডেলিভারি দেন? / Where do you deliver? → বর্তমানে রাজশাহী ও চাঁপাইনবাবগঞ্জে। / Currently Rajshahi and Chapai Nawabganj.
8. কতদিনে পাবো? / How long does delivery take? → অর্ডার কনফার্মের পর সাধারণত ১–২ দিনের মধ্যে। কল করে সময় জানিয়ে দেওয়া হবে। / Usually within 1–2 days after confirmation. We will call you with the time.
9. টাকা কীভাবে দেবো? / How do I pay? → ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে টাকা দিন (ডেলিভারি চার্জ থাকলে সেটাসহ)। কোনো অগ্রিম লাগবে না। / Cash on Delivery. Pay when you receive it (including the delivery charge, if any). No advance needed.
10. অর্ডারের পর কী হবে? / What happens after I order? → আমরা আপনাকে কল করে অর্ডার কনফার্ম করব, তারপর পাঠিয়ে দেব। / We call you to confirm, then dispatch.

Category 3 — আতর সম্পর্কে / About the attars
11. কোন আতরটা আমার জন্য ভালো? / Which attar should I choose? → উষ্ণ ও রাজকীয় ঘ্রাণ চাইলে এহসাস আল আরাবিয়া, মিষ্টি ও গাঢ় চাইলে ভ্যাম্পায়ার ব্লাড, কোমল ফুলেল চাইলে আরুসা। / Warm and royal: Ehsas Al Arabia. Sweet and bold: Vampire Blood. Soft and floral: Aroosah.
12. ঘ্রাণ কতক্ষণ থাকে? / How long does it last? → এটি ত্বক ও আবহাওয়ার ওপর নির্ভর করে। আতর তেল-ভিত্তিক হওয়ায় সাধারণত স্প্রের চেয়ে বেশি সময় থাকে। কব্জি ও গলার মতো পালস পয়েন্টে লাগালে ঘ্রাণ আরও ভালো থাকে। / It depends on skin and weather. Being oil-based, it usually lasts longer than a spray. Applying on pulse points like wrists and neck helps.
13. এতে কি অ্যালকোহল আছে? / Does it contain alcohol? → আমাদের আতরগুলো তেল-ভিত্তিক পারফিউম অয়েল, স্প্রের মতো অ্যালকোহল-ভিত্তিক নয়। / Our attars are oil-based perfume oils, not alcohol-based like sprays.
14. ছেলে না মেয়ে, কারা ব্যবহার করতে পারবে? / Is it for men or women? → তিনটিই ছেলে-মেয়ে সবার জন্য। ভ্যাম্পায়ার ব্লাড ও আরুসা মেয়েদের মধ্যেও খুব জনপ্রিয়। / All three are unisex. Vampire Blood and Aroosah are especially popular with women too.
15. কীভাবে ব্যবহার করবো? / How do I apply it? → কব্জি, কানের পেছনে ও গলায় অল্প করে লাগান। ঘষবেন না, এতে ঘ্রাণ বেশিক্ষণ থাকে। কাপড়ে লাগালে আগে ছোট জায়গায় পরীক্ষা করুন। / Dab a little on wrists, behind the ears and neck. Don't rub. Test on a small patch before applying to clothes.
16. বড় বোতল পাওয়া যাবে? / Do you have bigger bottles? → এখন ৩ মিলি বোতল। বেশি চাইলে একাধিক বোতল নিন; ১০ মিলির বেশি নিলে ডেলিভারি ফ্রি। / Currently 3 mL bottles. Order several; more than 10 mL gets free delivery.

Category 4 — অর্ডার ও যোগাযোগ / Orders and contact
17. কীভাবে অর্ডার করবো? / How do I order? → আতর বেছে নিন, কার্টে যোগ করুন, নাম-ফোন-ঠিকানা দিয়ে অর্ডার কনফার্ম করুন। আমরা কল করে কনফার্ম করব। WhatsApp-এও অর্ডার করতে পারেন: 01643249148। / Pick an attar, add to cart, enter name, phone and address and confirm. We will call to confirm. You can also order on WhatsApp: 01643249148. [action: order]
18. পছন্দ না হলে বা সমস্যা হলে কী করবো? / What if there is a problem? → ডেলিভারির সময় ভুল আতর বা ভাঙা বোতল পেলে ডেলিভারিম্যানের সামনেই জানান, আমরা বদলে দেব। খোলা ও ব্যবহৃত বোতল ফেরত নেওয়া হয় না। / If you get the wrong attar or a broken bottle, tell the delivery person right away and we will replace it. Opened and used bottles are not returned. [action: whatsapp]
19. অর্ডার বাতিল করা যাবে? / Can I cancel? → পাঠানোর আগে কল বা WhatsApp করে জানালে বাতিল করা যাবে। / Yes, call or WhatsApp us before it is dispatched. [action: call]
20. উপহার হিসেবে পাঠানো যাবে? / Can I send it as a gift? → হ্যাঁ, চেকআউটে প্রাপকের নাম-ঠিকানা দিন এবং নোটে "উপহার" লিখুন। / Yes, enter the recipient's details and write "gift" in the note.
21. যোগাযোগ করবো কীভাবে? / How can I contact you? → কল বা WhatsApp: 01643249148। / Call or WhatsApp 01643249148. [action: whatsapp, call]

# ADMIN PANEL (/admin)
- Clean, fast light-theme dashboard, fully usable on a phone.
- Google sign-in; only emails in the "admins" collection get in (seed: faysalahmad687@gmail.com), checked on the server too. Admin can add more admins.
- Dashboard cards: new orders today, waiting for confirmation, confirmed, shipped, delivered, refused/cancelled, revenue from delivered orders, delivery fees collected, bottles sold per attar, free bottles given, offer slots used (x/50), orders by source.
- Orders list: newest first, status chips, filters (status, date, district, product), search by phone or order ID, real-time updates, sound + browser notification on a new order.
- Order detail: customer, items with free bottles, delivery fee, totals, note, source, status history (who/when).
- Status flow: New → Confirmed → Packed → Shipped (courier name + tracking ID) → Delivered, or Cancelled / Refused / Returned (reason required). Confirming claims an offer slot; cancelling or refusing releases it.
- One-tap actions: Call, WhatsApp (prefilled Bangla confirmation message with order details and total), Confirm, Print invoice / packing slip.
- Warning badges (never auto-reject): same phone ordered in last 24 h, phone with a previous refusal, honeypot filled.
- Editors: products (image upload or URL), offers, delivery settings (fee, free-delivery threshold, count basis, zones), FAQ editor (category, bn/en, keywords, related questions, action button, order, active; shows tap counts), unanswered questions inbox with "add as FAQ", reviews (approve/hide), coupons, policy pages, "Why us" points, site settings (contacts, Facebook URL, announcement text bn/en, Meta Pixel ID, GA4 ID, maintenance mode).
- Customers list: phone, name, orders, delivered, refused, last order. Stock per attar in bottles, reduced on Confirm (paid + free bottles), low-stock warning.
- CSV export of orders and customers.

# TRACKING AND SEO
- Meta Pixel + GA4 events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase (BDT value). Also track ChatbotOpen and FaqTap (question id). IDs from settings.
- Save utm_source/medium/campaign from the first visit on each order.
- Titles and descriptions in bn/en (e.g. "আতর মেলা — ৳১২৯-এ প্রিমিয়াম আতর, ১০ মিলির বেশি নিলে ফ্রি ডেলিভারি"), Open Graph image, Product and FAQPage structured data, sitemap.xml, robots.txt.

# TECH, SECURITY, PERFORMANCE
- React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Framer Motion; Node/Express server; Firestore + Firebase Auth + Firebase Storage; deploy to Cloud Run.
- Orders are created only through the server, which recalculates prices, free bottles, offer eligibility, delivery fee and total from the database; ignore any price sent by the browser.
- Firestore rules: public read only for active products, offers, FAQs, approved reviews, delivery settings and public settings. No public read or write on orders, customers, admins or unanswered questions. Only admins can write to Storage.
- Rate-limit orders per IP and per phone; validate and sanitise inputs; no secrets in front-end code.
- Hero under 200 KB, subset Bangla fonts, no heavy libraries on public pages (lazy-load Fuse.js and the chatbot). Tap targets ≥ 44px, strong contrast, alt text in both languages.

# BUILD ORDER
1. Design system + full public storefront with seed data, language toggle, cart with the delivery nudge.
2. Server order creation with offer, delivery and pricing logic; Firestore + Auth + Storage.
3. Admin panel: orders first, then editors.
4. FAQ chatbot with all 21 seeded FAQs.
5. Tracking, SEO, animation polish.
After each step, list what was built and what remains.

# ACCEPTANCE CHECKS
- 1 bottle: total ৳১৫৯ (৳১২৯ + ৳৩০ delivery). 2 bottles of one attar: +1 free, total ৳২৮৮. 3 different bottles: delivery ৳৩০ and the nudge says add 1 more bottle for free delivery.
- 4 bottles: delivery ৳০. 2 bottles of each of two attars: 4 paid + 2 free, delivery ৳০, total ৳৫১৬.
- Changing the admin threshold or fee changes the cart immediately, with no code change.
- A 51st unique buyer gets no free bottle, and the offer UI is gone.
- Cancelling a confirmed order frees its slot.
- Editing a price or delivery fee in browser dev tools does not change the saved order total.
- A logged-out visitor cannot read any order.
- Test orders in Bangla and English appear in admin instantly with a sound alert.
- Opening the chatbot and tapping "দাম কত?" shows the answer in two taps; typing "dam koto", "দাম কত" and "price?" returns the same answer; an unknown question is logged.
- Pasting an image URL in admin shows a preview, and a dead URL shows the placeholder.
- The home page looks premium and fully usable at 360px wide.
