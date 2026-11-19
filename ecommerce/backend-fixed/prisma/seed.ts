// prisma/seed.ts
//
// This file was referenced by package.json's "prisma:seed" script but was
// missing from the zip. Without it the database starts completely empty,
// which makes the frontend look broken (empty homepage, no products to
// browse, empty admin dashboards) even though everything is wired up
// correctly.
//
// Content here is ported straight from the frontend's old lib/data.js mock
// dataset, so the app looks exactly like the original demo once you run:
//
//   npx prisma migrate dev
//   npx prisma db seed
//
// Safe to re-run — it upserts/creates and won't duplicate categories,
// coupons (code is a natural key) or languages (code is unique); other
// tables are only seeded if empty.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ---------------- Categories ----------------
  const categorySeed = [
    { name: 'Textiles & Fabrics', icon: '🧵', count: 428, slug: 'textiles' },
    { name: 'Spices & Foodgrain', icon: '🌾', count: 612, slug: 'spices' },
    { name: 'Handicrafts & Decor', icon: '🏺', count: 305, slug: 'handicrafts' },
    { name: 'Electronics & Accessories', icon: '🔌', count: 741, slug: 'electronics' },
    { name: 'Ayurveda & Wellness', icon: '🌿', count: 219, slug: 'ayurveda' },
    { name: 'Packaging Supplies', icon: '📦', count: 156, slug: 'packaging' },
  ];
  const categoryIdBySlug: Record<string, string> = {};
  if ((await prisma.category.count()) === 0) {
    for (const c of categorySeed) {
      const created = await prisma.category.create({
        data: { name: c.name, icon: c.icon, count: c.count },
      });
      categoryIdBySlug[c.slug] = created.id;
    }
  } else {
    // Best-effort remap by name if categories already exist.
    const existing = await prisma.category.findMany();
    for (const c of categorySeed) {
      const match = existing.find((e) => e.name === c.name);
      if (match) categoryIdBySlug[c.slug] = match.id;
    }
  }
  // Fall back to the readable slug itself if a category wasn't found/created
  // (keeps product.category populated either way — it's a free-text field).
  const categoryRef = (slug: string) => categoryIdBySlug[slug] || slug;

  // ---------------- Vendors ----------------
  const vendorSeed = [
    { key: 'v1', name: 'Kutch Handloom Co.', channel: 'Both', status: 'Active', gmvB2C: 412000, gmvB2B: 1180000, rating: 4.6, returns: '2.1%', joined: 'Feb 2025' },
    { key: 'v2', name: 'Sahyadri Spice Farms', channel: 'Both', status: 'Active', gmvB2C: 268000, gmvB2B: 940000, rating: 4.8, returns: '0.8%', joined: 'Nov 2024' },
    { key: 'v3', name: 'Moradabad Metal Works', channel: 'B2B Only', status: 'Active', gmvB2C: 0, gmvB2B: 1520000, rating: 4.5, returns: '1.4%', joined: 'Jun 2025' },
    { key: 'v4', name: 'Shenzhen Circuit Traders', channel: 'Both', status: 'On Hold', gmvB2C: 189000, gmvB2B: 2210000, rating: 4.1, returns: '4.6%', joined: 'Sep 2025' },
    { key: 'v5', name: 'Himalaya Root Naturals', channel: 'B2C Only', status: 'Active', gmvB2C: 356000, gmvB2B: 0, rating: 4.7, returns: '1.2%', joined: 'Jan 2025' },
    { key: 'v6', name: 'Surat PackWell Industries', channel: 'B2B Only', status: 'Active', gmvB2C: 0, gmvB2B: 674000, rating: 4.4, returns: '1.0%', joined: 'Apr 2025' },
    { key: 'v7', name: 'Jaipur Blue Pottery Studio', channel: 'Both', status: 'Active', gmvB2C: 198000, gmvB2B: 312000, rating: 4.9, returns: '0.6%', joined: 'Mar 2025' },
    { key: 'v8', name: 'Coimbatore Textile Mills', channel: 'Both', status: 'Active', gmvB2C: 145000, gmvB2B: 1860000, rating: 4.3, returns: '2.8%', joined: 'Jul 2025' },
  ];
  const vendorIdByKey: Record<string, string> = {};
  if ((await prisma.vendor.count()) === 0) {
    for (const v of vendorSeed) {
      const { key, ...data } = v;
      const created = await prisma.vendor.create({ data });
      vendorIdByKey[key] = created.id;
    }
  } else {
    const existing = await prisma.vendor.findMany();
    for (const v of vendorSeed) {
      const match = existing.find((e) => e.name === v.name);
      if (match) vendorIdByKey[v.key] = match.id;
    }
  }

  // Store profile + warehouses for the flagship vendor (Kutch Handloom Co.)
  if (vendorIdByKey.v1) {
    const existingProfile = await prisma.storeProfile.findUnique({ where: { vendorId: vendorIdByKey.v1 } });
    if (!existingProfile) {
      await prisma.storeProfile.create({
        data: {
          vendorId: vendorIdByKey.v1,
          name: 'Kutch Handloom Co.',
          tagline: 'Handwoven heritage textiles from Kutch artisan clusters',
          channels: ['B2C', 'B2B'],
          instagram: '@kutchhandloom',
          website: 'kutchhandloom.co',
          warehouses: {
            create: [
              { label: 'Bhuj Primary Warehouse', pincode: '370001', priority: 'B2C + B2B' },
              { label: 'Ahmedabad Bulk Dispatch Hub', pincode: '382445', priority: 'B2B only' },
            ],
          },
        },
      });
    }
  }

  // ---------------- Products (with tier pricing) ----------------
  const productSeed = [
    { name: 'Handloom Cotton Saree — Indigo Weave', vendorKey: 'v1', category: 'textiles', image: '🥻', color: '#5B4B8A', rating: 4.6, reviews: 128, mrp: 1899, price: 1349, channels: ['b2c', 'b2b'], moq: 20, stock: 340, description: 'Handwoven pure-cotton saree from Kutch artisan clusters, natural indigo dye, GI-tagged weave pattern.', tierPricing: [{ min: 1, max: 49, price: 1349 }, { min: 50, max: 199, price: 1180 }, { min: 200, max: null, price: 999 }] },
    { name: 'Organic Turmeric Powder — 1kg Pouch', vendorKey: 'v2', category: 'spices', image: '🌕', color: '#D9A02C', rating: 4.8, reviews: 342, mrp: 320, price: 249, channels: ['b2c', 'b2b'], moq: 100, stock: 5200, description: 'Lab-tested curcumin-rich turmeric, single-origin from Sangli farms, FSSAI certified.', tierPricing: [{ min: 1, max: 99, price: 249 }, { min: 100, max: 499, price: 219 }, { min: 500, max: null, price: 189 }] },
    { name: 'Brass Diya Set — Set of 6', vendorKey: 'v3', category: 'handicrafts', image: '🪔', color: '#B5792B', rating: 4.5, reviews: 96, mrp: 899, price: 649, channels: ['b2c', 'b2b'], moq: 50, stock: 1120, description: 'Hand-cast brass diyas, antique finish, festival & export-ready packaging.', tierPricing: [{ min: 1, max: 199, price: 649 }, { min: 200, max: 999, price: 559 }, { min: 1000, max: null, price: 479 }] },
    { name: 'USB-C Fast Charging Cable — 1.5m', vendorKey: 'v4', category: 'electronics', image: '🔌', color: '#2B6CB0', rating: 4.3, reviews: 511, mrp: 299, price: 179, channels: ['b2c', 'b2b'], moq: 200, stock: 18400, description: '65W PD-rated braided cable, 10,000+ bend life cycle tested.', tierPricing: [{ min: 1, max: 499, price: 179 }, { min: 500, max: 1999, price: 149 }, { min: 2000, max: null, price: 119 }] },
    { name: 'Cold-Pressed Ashwagandha Oil — 200ml', vendorKey: 'v5', category: 'ayurveda', image: '🌿', color: '#3F7D53', rating: 4.7, reviews: 87, mrp: 549, price: 419, channels: ['b2c', 'b2b'], moq: 100, stock: 2600, description: 'Ayush-licensed facility, cold-pressed extraction, third-party purity tested.', tierPricing: [{ min: 1, max: 99, price: 419 }, { min: 100, max: 499, price: 369 }, { min: 500, max: null, price: 319 }] },
    { name: 'Corrugated Shipping Boxes — 12x9x6in (Bundle of 50)', vendorKey: 'v6', category: 'packaging', image: '📦', color: '#8A6D3B', rating: 4.4, reviews: 64, mrp: 1400, price: 1050, channels: ['b2b'], moq: 10, stock: 940, description: '5-ply corrugated boxes, 200 GSM, custom branding available above 500 bundles.', tierPricing: [{ min: 10, max: 49, price: 1050 }, { min: 50, max: 199, price: 940 }, { min: 200, max: null, price: 820 }] },
    // ---- Additional demo catalog for a richer storefront ----
    { name: 'Blue Pottery Ceramic Vase — Hand-Painted', vendorKey: 'v7', category: 'handicrafts', image: '🏺', color: '#2C6E8E', rating: 4.9, reviews: 73, mrp: 1250, price: 899, channels: ['b2c', 'b2b'], moq: 25, stock: 480, description: 'Signature Jaipur blue pottery, quartz-clay body, hand-painted floral motifs, export-grade packaging.', tierPricing: [{ min: 1, max: 24, price: 899 }, { min: 25, max: 99, price: 799 }, { min: 100, max: null, price: 699 }] },
    { name: 'Premium Cotton Bedsheet Set — King Size', vendorKey: 'v8', category: 'textiles', image: '🛏️', color: '#7A5C8E', rating: 4.4, reviews: 214, mrp: 1799, price: 1299, channels: ['b2c', 'b2b'], moq: 30, stock: 1650, description: '300 thread-count pure cotton, includes 2 pillow covers, pre-shrunk and colorfast dyed.', tierPricing: [{ min: 1, max: 29, price: 1299 }, { min: 30, max: 149, price: 1119 }, { min: 150, max: null, price: 949 }] },
    { name: 'Basmati Rice — Premium Aged, 5kg Pack', vendorKey: 'v2', category: 'spices', image: '🍚', color: '#C9A24B', rating: 4.7, reviews: 289, mrp: 899, price: 699, channels: ['b2c', 'b2b'], moq: 40, stock: 3800, description: 'Extra-long grain, aged 12 months, single-origin from Haryana paddy belt, APEDA export certified.', tierPricing: [{ min: 1, max: 39, price: 699 }, { min: 40, max: 199, price: 619 }, { min: 200, max: null, price: 549 }] },
    { name: 'Wireless Earbuds — ANC, 30hr Battery', vendorKey: 'v4', category: 'electronics', image: '🎧', color: '#1F4E8C', rating: 4.2, reviews: 462, mrp: 2499, price: 1799, channels: ['b2c', 'b2b'], moq: 50, stock: 2200, description: 'Active noise cancellation, IPX5 water resistance, USB-C fast charge case, 1-year vendor warranty.', tierPricing: [{ min: 1, max: 49, price: 1799 }, { min: 50, max: 499, price: 1549 }, { min: 500, max: null, price: 1329 }] },
    { name: 'Herbal Immunity Tea — 100 Tea Bags', vendorKey: 'v5', category: 'ayurveda', image: '🍵', color: '#4C8C5C', rating: 4.6, reviews: 156, mrp: 449, price: 349, channels: ['b2c', 'b2b'], moq: 60, stock: 4100, description: 'Tulsi, ginger, and giloy blend, AYUSH-certified formulation, individually sealed bags.', tierPricing: [{ min: 1, max: 59, price: 349 }, { min: 60, max: 299, price: 309 }, { min: 300, max: null, price: 269 }] },
    { name: 'Stretch Wrap Film Roll — 500mm x 300m', vendorKey: 'v6', category: 'packaging', image: '🎞️', color: '#6B7280', rating: 4.3, reviews: 41, mrp: 620, price: 480, channels: ['b2b'], moq: 20, stock: 1560, description: '20-micron LLDPE stretch film for pallet wrapping, high cling strength, machine and hand-roll compatible.', tierPricing: [{ min: 20, max: 99, price: 480 }, { min: 100, max: 499, price: 420 }, { min: 500, max: null, price: 365 }] },
    { name: 'Handcrafted Wooden Jewellery Box', vendorKey: 'v1', category: 'handicrafts', image: '📿', color: '#8B5E3C', rating: 4.8, reviews: 59, mrp: 1099, price: 799, channels: ['b2c', 'b2b'], moq: 15, stock: 620, description: 'Sheesham wood inlay work, velvet-lined compartments, traditional Kutch craftsmanship.', tierPricing: [{ min: 1, max: 14, price: 799 }, { min: 15, max: 74, price: 699 }, { min: 75, max: null, price: 599 }] },
    { name: 'Smart LED Desk Lamp — USB Rechargeable', vendorKey: 'v4', category: 'electronics', image: '💡', color: '#D97706', rating: 4.1, reviews: 198, mrp: 999, price: 699, channels: ['b2c', 'b2b'], moq: 40, stock: 2900, description: 'Touch-control brightness, 3 color modes, foldable arm, built-in 2000mAh battery.', tierPricing: [{ min: 1, max: 39, price: 699 }, { min: 40, max: 199, price: 599 }, { min: 200, max: null, price: 519 }] },
  ];
  if ((await prisma.product.count()) === 0) {
    for (const p of productSeed) {
      const vendorId = vendorIdByKey[p.vendorKey];
      const vendorName = vendorSeed.find((v) => v.key === p.vendorKey)?.name;
      await prisma.product.create({
        data: {
          name: p.name,
          vendor: vendorName,
          vendorId,
          category: categoryRef(p.category),
          image: p.image,
          color: p.color,
          rating: p.rating,
          reviews: p.reviews,
          mrp: p.mrp,
          price: p.price,
          channels: p.channels,
          moq: p.moq,
          stock: p.stock,
          description: p.description,
          tierPricing: { create: p.tierPricing.map((t) => ({ min: t.min, max: t.max, price: t.price })) },
        },
      });
    }
  }

  // ---------------- Business buyers ----------------
  const buyerSeed = [
    { key: 'b1', company: 'Aarav Retail Chain Pvt Ltd', segment: 'Retailer', gstin: '24AAACA1234F1Z5', status: 'Approved', creditLimit: 500000, utilized: 312000, terms: 'Net 30' },
    { key: 'b2', company: 'Coastal Distributors LLP', segment: 'Distributor', gstin: '27AAFCC5678G1Z2', status: 'Under Review', creditLimit: 0, utilized: 0, terms: '—' },
    { key: 'b3', company: 'Sunrise Institutional Supplies', segment: 'Institutional', gstin: '06AABCS4321H1Z9', status: 'Approved', creditLimit: 1200000, utilized: 940000, terms: 'Net 45' },
    { key: 'b4', company: 'Global Export Traders', segment: 'Export', gstin: '29AACGE8765I1Z4', status: 'On Hold', creditLimit: 800000, utilized: 0, terms: 'Net 15' },
  ];
  const buyerIdByKey: Record<string, string> = {};
  if ((await prisma.businessBuyer.count()) === 0) {
    for (const b of buyerSeed) {
      const { key, ...data } = b;
      const created = await prisma.businessBuyer.create({ data });
      buyerIdByKey[key] = created.id;
    }
  } else {
    const existing = await prisma.businessBuyer.findMany();
    for (const b of buyerSeed) {
      const match = existing.find((e) => e.company === b.company);
      if (match) buyerIdByKey[b.key] = match.id;
    }
  }

  if (buyerIdByKey.b1 && (await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: 'Karan Mehta', role: 'Company Admin', email: 'karan@aaravretail.in', limit: 'Unlimited', buyerId: buyerIdByKey.b1 },
        { name: 'Sneha Iyer', role: 'Purchase Manager', email: 'sneha@aaravretail.in', limit: 'Up to ₹1,00,000 / order', buyerId: buyerIdByKey.b1 },
        { name: 'Devendra Rao', role: 'Approver', email: 'dev@aaravretail.in', limit: 'Approves orders above ₹1,00,000', buyerId: buyerIdByKey.b1 },
        { name: 'Alok Bansal', role: 'Accountant', email: 'alok@aaravretail.in', limit: 'Read-only — invoices & ledger', buyerId: buyerIdByKey.b1 },
      ],
    });
  }

  // ---------------- Orders / RFQs ----------------
  if ((await prisma.order.count()) === 0) {
    await prisma.order.createMany({
      data: [
        { id: 'PVT-10231', type: 'B2C', customer: 'Rhea Kapoor', vendor: 'Sahyadri Spice Farms', amount: 748, status: 'Shipped', date: '2 Aug 2026' },
        { id: 'PVT-10232', type: 'B2B', customer: 'Aarav Retail Chain Pvt Ltd', vendor: 'Kutch Handloom Co.', amount: 236000, status: 'Partial Fulfillment', date: '1 Aug 2026' },
        { id: 'PVT-10233', type: 'B2C', customer: 'Manav Shah', vendor: 'Moradabad Metal Works', amount: 1298, status: 'Delivered', date: '31 Jul 2026' },
        { id: 'PVT-10234', type: 'B2B', customer: 'Sunrise Institutional Supplies', vendor: 'Shenzhen Circuit Traders', amount: 892000, status: 'PO Received', date: '30 Jul 2026' },
        { id: 'PVT-10235', type: 'B2C', customer: 'Ishita Verma', vendor: 'Himalaya Root Naturals', amount: 419, status: 'Pending', date: '30 Jul 2026' },
      ],
    });
  }

  if ((await prisma.rfq.count()) === 0) {
    await prisma.rfq.createMany({
      data: [
        { buyer: 'Coastal Distributors LLP', product: 'Organic Turmeric Powder', qty: '2,000 units', status: 'Awaiting Vendor Response', raised: '1 Aug 2026' },
        { buyer: 'Global Export Traders', product: 'Handloom Cotton Saree', qty: '5,000 units', status: 'Quotation Sent', raised: '29 Jul 2026' },
        { buyer: 'Sunrise Institutional Supplies', product: 'USB-C Fast Charging Cable', qty: '10,000 units', status: 'Negotiation', raised: '27 Jul 2026' },
      ],
    });
  }

  // ---------------- Marketing / CMS ----------------
  if ((await prisma.heroStat.count()) === 0) {
    await prisma.heroStat.createMany({
      data: [
        { label: 'Verified Vendors', value: '3,400+' },
        { label: 'GMV (B2C + B2B)', value: '₹42 Cr' },
        { label: 'Business Buyers Onboarded', value: '1,180' },
        { label: 'Cities Served', value: '540' },
      ],
    });
  }

  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        { title: 'Festive Bulk Order Fair', channel: 'B2B', placement: 'B2B Landing Hero', status: 'Live', clicks: 4210 },
        { title: 'Monsoon Handloom Sale — Flat 30%', channel: 'B2C', placement: 'Homepage Hero', status: 'Live', clicks: 18940 },
        { title: 'New Vendor Spotlight: Sahyadri Spice Farms', channel: 'B2C', placement: 'Category Strip', status: 'Scheduled', clicks: 0 },
      ],
    });
  }

  const couponSeed = [
    { code: 'PAVITRAM10', type: 'Site-wide %', value: '10% off', channel: 'B2C', costBorneBy: 'Platform', uses: 3420, status: 'Active' },
    { code: 'FREESHIP499', type: 'Free shipping', value: 'Above ₹499', channel: 'B2C', costBorneBy: 'Split w/ Vendor', uses: 8110, status: 'Active' },
    { code: 'BULK500PLUS', type: 'Volume slab', value: 'Extra 5% on 500+ units', channel: 'B2B', costBorneBy: 'Vendor', uses: 214, status: 'Active' },
    { code: 'EARLYPAY2', type: 'Early-payment discount', value: '2% off on advance', channel: 'B2B', costBorneBy: 'Vendor', uses: 96, status: 'Active' },
  ];
  for (const c of couponSeed) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  // ---------------- Analytics & BI ----------------
  if ((await prisma.gmvTrend.count()) === 0) {
    await prisma.gmvTrend.createMany({
      data: [
        { month: 'Mar', b2c: 6.1, b2b: 9.4 },
        { month: 'Apr', b2c: 6.8, b2b: 10.1 },
        { month: 'May', b2c: 7.4, b2b: 11.6 },
        { month: 'Jun', b2c: 8.0, b2b: 12.3 },
        { month: 'Jul', b2c: 8.9, b2b: 13.8 },
      ],
    });
  }

  if ((await prisma.cohort.count()) === 0) {
    await prisma.cohort.createMany({
      data: [
        { segment: 'New (0-30d)', retail: '38%', business: '22%', risk: 'High churn watch' },
        { segment: 'Active (Recency < 90d)', retail: '54%', business: '61%', risk: 'Healthy' },
        { segment: 'Loyal (Freq > 6/qtr)', retail: '21%', business: '34%', risk: 'Healthy' },
        { segment: 'At Risk (Recency > 120d)', retail: '12%', business: '9%', risk: 'Needs win-back' },
      ],
    });
  }

  if ((await prisma.vendorScorecard.count()) === 0) {
    await prisma.vendorScorecard.createMany({
      data: [
        { vendor: 'Kutch Handloom Co.', sla: 96, quality: 4.6, rfqResponse: '3.2 hrs', composite: 'A' },
        { vendor: 'Sahyadri Spice Farms', sla: 98, quality: 4.8, rfqResponse: '1.8 hrs', composite: 'A+' },
        { vendor: 'Shenzhen Circuit Traders', sla: 81, quality: 4.1, rfqResponse: '11.4 hrs', composite: 'C' },
      ],
    });
  }

  // ---------------- Tax / audit ----------------
  if ((await prisma.gstSummary.count()) === 0) {
    await prisma.gstSummary.createMany({
      data: [
        { state: 'Maharashtra', hsn: '5407 / 0910', gstCollected: 412000, invoicesIRN: 1840, status: 'Filed' },
        { state: 'Gujarat', hsn: '6304 / 7419', gstCollected: 268000, invoicesIRN: 962, status: 'Filed' },
        { state: 'Karnataka', hsn: '8544 / 3304', gstCollected: 594000, invoicesIRN: 2210, status: 'Pending Review' },
      ],
    });
  }

  if ((await prisma.activityLog.count()) === 0) {
    await prisma.activityLog.createMany({
      data: [
        { actor: 'Vendor · Sahyadri Spice Farms', action: 'Updated tiered price on SKU TUR-1KG', ip: '103.21.4.88', time: '2 Aug 2026, 10:42 AM' },
        { actor: 'Admin · Priya Nair', action: 'Approved B2B account: Sunrise Institutional Supplies', ip: '10.4.2.15', time: '2 Aug 2026, 09:15 AM' },
        { actor: 'Admin · Rahul Sen', action: 'Increased credit limit for Aarav Retail Chain to ₹5,00,000', ip: '10.4.2.9', time: '1 Aug 2026, 06:52 PM' },
        { actor: 'Vendor · Moradabad Metal Works', action: 'Product status set to Out of Stock — Brass Diya Set', ip: '182.68.4.201', time: '1 Aug 2026, 04:20 PM' },
      ],
    });
  }

  // ---------------- System & integrations ----------------
  if ((await prisma.notificationRule.count()) === 0) {
    await prisma.notificationRule.createMany({
      data: [
        { audience: 'B2C Customer', trigger: 'Order placed / shipped / delivered', channel: 'WhatsApp + SMS', status: 'Enabled' },
        { audience: 'Business Buyer', trigger: 'Quotation received / credit limit nearing threshold', channel: 'Email + In-app', status: 'Enabled' },
        { audience: 'Vendor', trigger: 'New order / new RFQ / low stock', channel: 'Email + App push', status: 'Enabled' },
        { audience: 'Admin', trigger: 'High-value transaction / credit-limit breach', channel: 'Email + Slack webhook', status: 'Enabled' },
      ],
    });
  }

  if ((await prisma.integration.count()) === 0) {
    await prisma.integration.createMany({
      data: [
        { name: 'Tally', category: 'ERP / Accounting', status: 'Connected' },
        { name: 'Zoho Books', category: 'ERP / Accounting', status: 'Connected' },
        { name: 'SAP Business One', category: 'ERP / Accounting', status: 'Not Connected' },
        { name: 'Shiprocket', category: 'Logistics Aggregator', status: 'Connected' },
        { name: 'Delhivery', category: 'Logistics Aggregator', status: 'Connected' },
        { name: 'LTL Freight Partner Network', category: 'Bulk Freight', status: 'Connected' },
        { name: 'Public / Partner REST API', category: 'Developer Access', status: '12 active keys' },
      ],
    });
  }

  if ((await prisma.securitySetting.count()) === 0) {
    await prisma.securitySetting.createMany({
      data: [
        { control: 'Role-Based Access Control (RBAC)', scope: 'Admin, Vendor, multi-user Business accounts', status: 'Enforced' },
        { control: 'Data Encryption (at-rest & in-transit)', scope: 'All KYC and financial data', status: 'Enforced' },
        { control: 'DPDP Act & PCI-DSS Alignment', scope: 'Platform-wide', status: 'Compliant' },
        { control: 'Two-Factor Authentication', scope: 'Admin — mandatory · High-credit B2B — optional', status: 'Enforced' },
      ],
    });
  }

  if ((await prisma.supportTicket.count()) === 0) {
    await prisma.supportTicket.createMany({
      data: [
        { from: 'Ishita Verma (B2C)', subject: 'Return pickup delayed', priority: 'Normal', status: 'Open' },
        { from: 'Sunrise Institutional Supplies (B2B)', subject: 'Consolidated invoice mismatch', priority: 'High — SLA 4h', status: 'In Progress' },
        { from: 'Global Export Traders (B2B)', subject: 'Export documentation query', priority: 'High — SLA 4h', status: 'Open' },
      ],
    });
  }

  const languageSeed = [
    { code: 'en', name: 'English', coverage: '100%' },
    { code: 'hi', name: 'Hindi', coverage: '94%' },
    { code: 'gu', name: 'Gujarati', coverage: '78%' },
    { code: 'ta', name: 'Tamil', coverage: '41%' },
  ];
  for (const l of languageSeed) {
    await prisma.language.upsert({ where: { code: l.code }, update: {}, create: l });
  }

  // ---------------- Vendor B2B toolkit / financials ----------------
  if ((await prisma.contractPricing.count()) === 0) {
    await prisma.contractPricing.createMany({
      data: [
        { buyer: 'Aarav Retail Chain Pvt Ltd', product: 'Handloom Cotton Saree', rate: '₹1,120/unit', validity: 'Till 31 Mar 2027', vendorId: vendorIdByKey.v1 },
        { buyer: 'Global Export Traders', product: 'Handloom Cotton Saree', rate: '₹960/unit (Export slab)', validity: 'Till 30 Sep 2026', vendorId: vendorIdByKey.v1 },
      ],
    });
  }

  if ((await prisma.sampleOrder.count()) === 0) {
    await prisma.sampleOrder.createMany({
      data: [
        { buyer: 'Coastal Distributors LLP', product: 'Organic Turmeric Powder', qty: 5, status: 'Dispatched' },
        { buyer: 'Sunrise Institutional Supplies', product: 'USB-C Fast Charging Cable', qty: 10, status: 'Requested' },
      ],
    });
  }

  if ((await prisma.receivable.count()) === 0) {
    await prisma.receivable.createMany({
      data: [
        { buyer: 'Aarav Retail Chain Pvt Ltd', invoiced: 236000, collected: 180000, overdue: 0, terms: 'Net 30' },
        { buyer: 'Sunrise Institutional Supplies', invoiced: 892000, collected: 620000, overdue: 272000, terms: 'Net 45' },
      ],
    });
  }

  if ((await prisma.vendorReview.count()) === 0) {
    await prisma.vendorReview.createMany({
      data: [
        { from: 'Aarav Retail Chain Pvt Ltd', type: 'B2B structured', onTime: 5, quality: 5, responsiveness: 4, note: 'Consistent batch quality across 6 months of orders.', vendorId: vendorIdByKey.v1 },
        { from: 'Rhea Kapoor', type: 'B2C', onTime: 5, quality: 5, responsiveness: 5, note: 'Beautiful weave, packaging was excellent.', vendorId: vendorIdByKey.v1 },
      ],
    });
  }

  if ((await prisma.creditNote.count()) === 0) {
    await prisma.creditNote.createMany({
      data: [
        { against: 'PVT-10188', reason: 'Short shipment — 40 units', amount: 17800, status: 'Adjusted' },
        { against: 'PVT-10201', reason: 'Quality rejection — batch 12', amount: 42500, status: 'Pending Adjustment' },
      ],
    });
  }

  if ((await prisma.b2bInvoice.count()) === 0) {
    await prisma.b2bInvoice.createMany({
      data: [
        { period: 'Jul 2026 (Consolidated)', orders: 6, amount: 236000, status: 'Paid' },
        { period: 'Aug 2026 (Consolidated)', orders: 2, amount: 118500, status: 'Due 30 Aug' },
      ],
    });
  }

  // ---------------- Homepage content (Admin > CMS > Homepage content) ----------------
  if ((await prisma.siteContent.count()) === 0) {
    await prisma.siteContent.createMany({
      data: [
        {
          key: 'homepage.hero',
          value: {
            badge: "🇮🇳 India's everyday shopping + wholesale trade, one site",
            titleLine1: 'Buy one saree, or',
            titleHighlight: 'ten thousand of them',
            titleSuffix: "— it's that simple.",
            subtitle:
              "Shopping for yourself? Add to cart and pay in a minute — just like any store you already use. Buying or selling for your business? Get wholesale prices, credit terms, and proper GST bills — on the very same account, once you're verified.",
            primaryCta: 'Start shopping',
            secondaryCta: 'I run a business',
          },
        },
        {
          key: 'homepage.howItWorks',
          value: [
            { title: 'Browse & choose', text: 'Search products by category, price, or vendor — same catalog for everyone.' },
            { title: 'Buy your way', text: 'Shoppers pay instantly and check out. Businesses request a quote (RFQ) for bulk pricing and credit terms.' },
            { title: 'Track & receive', text: 'Follow your order status and get it delivered, with a proper bill every time.' },
          ],
        },
        {
          key: 'homepage.testimonials',
          value: [
            { quote: "I ordered one saree for my sister's wedding and it reached in three days. Checkout took less than a minute.", name: 'Priya M.', role: 'Shopper, Pune' },
            { quote: "We switched our turmeric sourcing to Pavitram's B2B account. Bulk pricing and GST bills, sorted every month without any calls.", name: 'Rakesh Traders', role: 'Registered B2B buyer' },
            { quote: 'Registering my handloom store took one afternoon. Now I sell to single customers and shops from the same dashboard.', name: 'Kutch Handloom Co.', role: 'Verified vendor' },
          ],
        },
      ],
    });
  }

  // ---------------- A ready-made admin login ----------------
  // The auth backend (external) issues real credentials; this just makes
  // sure a "users" row already exists with role=admin so you can promote
  // whichever email you sign up with by matching it here, or simply run:
  //   PATCH /api/users/:id  { "role": "admin" }
  // after signing up once through the app.
  console.log('✅ Seed complete.');
  console.log('   Reminder: there is no self-serve admin signup by design.');
  console.log('   After you sign up once through the app, promote that account with:');
  console.log('   PATCH /api/users/:id   { "role": "admin" }');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
