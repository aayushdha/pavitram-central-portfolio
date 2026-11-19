// Mock data layer — replace these exports with real API calls once the
// backend is connected. Every field a page consumes is defined here so
// wiring up a real API later is a drop-in replacement.

export const categories = [
  { id: "textiles", name: "Textiles & Fabrics", icon: "🧵", count: 428 },
  { id: "spices", name: "Spices & Foodgrain", icon: "🌾", count: 612 },
  { id: "handicrafts", name: "Handicrafts & Decor", icon: "🏺", count: 305 },
  { id: "electronics", name: "Electronics & Accessories", icon: "🔌", count: 741 },
  { id: "ayurveda", name: "Ayurveda & Wellness", icon: "🌿", count: 219 },
  { id: "packaging", name: "Packaging Supplies", icon: "📦", count: 156 },
];

export const products = [
  {
    id: "p1",
    name: "Handloom Cotton Saree — Indigo Weave",
    vendor: "Kutch Handloom Co.",
    vendorId: "v1",
    category: "textiles",
    image: "🥻",
    color: "#5B4B8A",
    rating: 4.6,
    reviews: 128,
    mrp: 1899,
    price: 1349,
    channels: ["b2c", "b2b"],
    moq: 20,
    stock: 340,
    tierPricing: [
      { min: 1, max: 49, price: 1349 },
      { min: 50, max: 199, price: 1180 },
      { min: 200, max: null, price: 999 },
    ],
    description:
      "Handwoven pure-cotton saree from Kutch artisan clusters, natural indigo dye, GI-tagged weave pattern.",
  },
  {
    id: "p2",
    name: "Organic Turmeric Powder — 1kg Pouch",
    vendor: "Sahyadri Spice Farms",
    vendorId: "v2",
    category: "spices",
    image: "🌕",
    color: "#D9A02C",
    rating: 4.8,
    reviews: 342,
    mrp: 320,
    price: 249,
    channels: ["b2c", "b2b"],
    moq: 100,
    stock: 5200,
    tierPricing: [
      { min: 1, max: 99, price: 249 },
      { min: 100, max: 499, price: 219 },
      { min: 500, max: null, price: 189 },
    ],
    description:
      "Lab-tested curcumin-rich turmeric, single-origin from Sangli farms, FSSAI certified.",
  },
  {
    id: "p3",
    name: "Brass Diya Set — Set of 6",
    vendor: "Moradabad Metal Works",
    vendorId: "v3",
    category: "handicrafts",
    image: "🪔",
    color: "#B5792B",
    rating: 4.5,
    reviews: 96,
    mrp: 899,
    price: 649,
    channels: ["b2c", "b2b"],
    moq: 50,
    stock: 1120,
    tierPricing: [
      { min: 1, max: 199, price: 649 },
      { min: 200, max: 999, price: 559 },
      { min: 1000, max: null, price: 479 },
    ],
    description: "Hand-cast brass diyas, antique finish, festival & export-ready packaging.",
  },
  {
    id: "p4",
    name: "USB-C Fast Charging Cable — 1.5m",
    vendor: "Shenzhen Circuit Traders",
    vendorId: "v4",
    category: "electronics",
    image: "🔌",
    color: "#2B6CB0",
    rating: 4.3,
    reviews: 511,
    mrp: 299,
    price: 179,
    channels: ["b2c", "b2b"],
    moq: 200,
    stock: 18400,
    tierPricing: [
      { min: 1, max: 499, price: 179 },
      { min: 500, max: 1999, price: 149 },
      { min: 2000, max: null, price: 119 },
    ],
    description: "65W PD-rated braided cable, 10,000+ bend life cycle tested.",
  },
  {
    id: "p5",
    name: "Cold-Pressed Ashwagandha Oil — 200ml",
    vendor: "Himalaya Root Naturals",
    vendorId: "v5",
    category: "ayurveda",
    image: "🌿",
    color: "#3F7D53",
    rating: 4.7,
    reviews: 87,
    mrp: 549,
    price: 419,
    channels: ["b2c", "b2b"],
    moq: 100,
    stock: 2600,
    tierPricing: [
      { min: 1, max: 99, price: 419 },
      { min: 100, max: 499, price: 369 },
      { min: 500, max: null, price: 319 },
    ],
    description: "Ayush-licensed facility, cold-pressed extraction, third-party purity tested.",
  },
  {
    id: "p6",
    name: "Corrugated Shipping Boxes — 12x9x6in (Bundle of 50)",
    vendor: "Packwell Industries",
    vendorId: "v6",
    category: "packaging",
    image: "📦",
    color: "#8A6D3B",
    rating: 4.4,
    reviews: 64,
    mrp: 1400,
    price: 1050,
    channels: ["b2b"],
    moq: 10,
    stock: 940,
    tierPricing: [
      { min: 10, max: 49, price: 1050 },
      { min: 50, max: 199, price: 940 },
      { min: 200, max: null, price: 820 },
    ],
    description: "5-ply corrugated boxes, 200 GSM, custom branding available above 500 bundles.",
  },
];

export const vendors = [
  { id: "v1", name: "Kutch Handloom Co.", channel: "Both", status: "Active", gmvB2C: 412000, gmvB2B: 1180000, rating: 4.6, returns: "2.1%", joined: "Feb 2025" },
  { id: "v2", name: "Sahyadri Spice Farms", channel: "Both", status: "Active", gmvB2C: 268000, gmvB2B: 940000, rating: 4.8, returns: "0.8%", joined: "Nov 2024" },
  { id: "v3", name: "Moradabad Metal Works", channel: "B2B Only", status: "Active", gmvB2C: 0, gmvB2B: 1520000, rating: 4.5, returns: "1.4%", joined: "Jun 2025" },
  { id: "v4", name: "Shenzhen Circuit Traders", channel: "Both", status: "On Hold", gmvB2C: 189000, gmvB2B: 2210000, rating: 4.1, returns: "4.6%", joined: "Sep 2025" },
  { id: "v5", name: "Himalaya Root Naturals", channel: "B2C Only", status: "Active", gmvB2C: 356000, gmvB2B: 0, rating: 4.7, returns: "1.2%", joined: "Jan 2025" },
];

export const businessBuyers = [
  { id: "b1", company: "Aarav Retail Chain Pvt Ltd", segment: "Retailer", gstin: "24AAACA1234F1Z5", status: "Approved", creditLimit: 500000, utilized: 312000, terms: "Net 30" },
  { id: "b2", company: "Coastal Distributors LLP", segment: "Distributor", gstin: "27AAFCC5678G1Z2", status: "Under Review", creditLimit: 0, utilized: 0, terms: "—" },
  { id: "b3", company: "Sunrise Institutional Supplies", segment: "Institutional", gstin: "06AABCS4321H1Z9", status: "Approved", creditLimit: 1200000, utilized: 940000, terms: "Net 45" },
  { id: "b4", company: "Global Export Traders", segment: "Export", gstin: "29AACGE8765I1Z4", status: "On Hold", creditLimit: 800000, utilized: 0, terms: "Net 15" },
];

export const orders = [
  { id: "PVT-10231", type: "B2C", customer: "Rhea Kapoor", vendor: "Sahyadri Spice Farms", amount: 748, status: "Shipped", date: "2 Aug 2026" },
  { id: "PVT-10232", type: "B2B", customer: "Aarav Retail Chain Pvt Ltd", vendor: "Kutch Handloom Co.", amount: 236000, status: "Partial Fulfillment", date: "1 Aug 2026" },
  { id: "PVT-10233", type: "B2C", customer: "Manav Shah", vendor: "Moradabad Metal Works", amount: 1298, status: "Delivered", date: "31 Jul 2026" },
  { id: "PVT-10234", type: "B2B", customer: "Sunrise Institutional Supplies", vendor: "Shenzhen Circuit Traders", amount: 892000, status: "PO Received", date: "30 Jul 2026" },
  { id: "PVT-10235", type: "B2C", customer: "Ishita Verma", vendor: "Himalaya Root Naturals", amount: 419, status: "Pending", date: "30 Jul 2026" },
];

export const rfqs = [
  { id: "RFQ-3391", buyer: "Coastal Distributors LLP", product: "Organic Turmeric Powder", qty: "2,000 units", status: "Awaiting Vendor Response", raised: "1 Aug 2026" },
  { id: "RFQ-3392", buyer: "Global Export Traders", product: "Handloom Cotton Saree", qty: "5,000 units", status: "Quotation Sent", raised: "29 Jul 2026" },
  { id: "RFQ-3393", buyer: "Sunrise Institutional Supplies", product: "USB-C Fast Charging Cable", qty: "10,000 units", status: "Negotiation", raised: "27 Jul 2026" },
];

export const heroStats = [
  { label: "Verified Vendors", value: "3,400+" },
  { label: "GMV (B2C + B2B)", value: "₹42 Cr" },
  { label: "Business Buyers Onboarded", value: "1,180" },
  { label: "Cities Served", value: "540" },
];

// ---- CMS & Marketing (Admin) ----
export const banners = [
  { id: "bn1", title: "Festive Bulk Order Fair", channel: "B2B", placement: "B2B Landing Hero", status: "Live", clicks: 4210 },
  { id: "bn2", title: "Monsoon Handloom Sale — Flat 30%", channel: "B2C", placement: "Homepage Hero", status: "Live", clicks: 18940 },
  { id: "bn3", title: "New Vendor Spotlight: Sahyadri Spice Farms", channel: "B2C", placement: "Category Strip", status: "Scheduled", clicks: 0 },
];

export const coupons = [
  { code: "PAVITRAM10", type: "Site-wide %", value: "10% off", channel: "B2C", costBorneBy: "Platform", uses: 3420, status: "Active" },
  { code: "FREESHIP499", type: "Free shipping", value: "Above ₹499", channel: "B2C", costBorneBy: "Split w/ Vendor", uses: 8110, status: "Active" },
  { code: "BULK500PLUS", type: "Volume slab", value: "Extra 5% on 500+ units", channel: "B2B", costBorneBy: "Vendor", uses: 214, status: "Active" },
  { code: "EARLYPAY2", type: "Early-payment discount", value: "2% off on advance", channel: "B2B", costBorneBy: "Vendor", uses: 96, status: "Active" },
];

// ---- Analytics & BI (Admin) ----
export const gmvTrend = [
  { month: "Mar", b2c: 6.1, b2b: 9.4 },
  { month: "Apr", b2c: 6.8, b2b: 10.1 },
  { month: "May", b2c: 7.4, b2b: 11.6 },
  { month: "Jun", b2c: 8.0, b2b: 12.3 },
  { month: "Jul", b2c: 8.9, b2b: 13.8 },
];

export const cohorts = [
  { segment: "New (0-30d)", retail: "38%", business: "22%", risk: "High churn watch" },
  { segment: "Active (Recency < 90d)", retail: "54%", business: "61%", risk: "Healthy" },
  { segment: "Loyal (Freq > 6/qtr)", retail: "21%", business: "34%", risk: "Healthy" },
  { segment: "At Risk (Recency > 120d)", retail: "12%", business: "9%", risk: "Needs win-back" },
];

export const vendorScorecards = [
  { vendor: "Kutch Handloom Co.", sla: 96, quality: 4.6, rfqResponse: "3.2 hrs", composite: "A" },
  { vendor: "Sahyadri Spice Farms", sla: 98, quality: 4.8, rfqResponse: "1.8 hrs", composite: "A+" },
  { vendor: "Shenzhen Circuit Traders", sla: 81, quality: 4.1, rfqResponse: "11.4 hrs", composite: "C" },
];

// ---- Tax, Compliance & Audit Center (Admin) ----
export const gstSummary = [
  { state: "Maharashtra", hsn: "5407 / 0910", gstCollected: 412000, invoicesIRN: 1840, status: "Filed" },
  { state: "Gujarat", hsn: "6304 / 7419", gstCollected: 268000, invoicesIRN: 962, status: "Filed" },
  { state: "Karnataka", hsn: "8544 / 3304", gstCollected: 594000, invoicesIRN: 2210, status: "Pending Review" },
];

export const activityLogs = [
  { id: "log1", actor: "Vendor · Sahyadri Spice Farms", action: "Updated tiered price on SKU TUR-1KG", ip: "103.21.4.88", time: "2 Aug 2026, 10:42 AM" },
  { id: "log2", actor: "Admin · Priya Nair", action: "Approved B2B account: Sunrise Institutional Supplies", ip: "10.4.2.15", time: "2 Aug 2026, 09:15 AM" },
  { id: "log3", actor: "Admin · Rahul Sen", action: "Increased credit limit for Aarav Retail Chain to ₹5,00,000", ip: "10.4.2.9", time: "1 Aug 2026, 06:52 PM" },
  { id: "log4", actor: "Vendor · Moradabad Metal Works", action: "Product status set to Out of Stock — Brass Diya Set", ip: "182.68.4.201", time: "1 Aug 2026, 04:20 PM" },
];

// ---- System & Integrations (Admin) ----
export const notificationRules = [
  { audience: "B2C Customer", trigger: "Order placed / shipped / delivered", channel: "WhatsApp + SMS", status: "Enabled" },
  { audience: "Business Buyer", trigger: "Quotation received / credit limit nearing threshold", channel: "Email + In-app", status: "Enabled" },
  { audience: "Vendor", trigger: "New order / new RFQ / low stock", channel: "Email + App push", status: "Enabled" },
  { audience: "Admin", trigger: "High-value transaction / credit-limit breach", channel: "Email + Slack webhook", status: "Enabled" },
];

export const integrations = [
  { name: "Tally", category: "ERP / Accounting", status: "Connected" },
  { name: "Zoho Books", category: "ERP / Accounting", status: "Connected" },
  { name: "SAP Business One", category: "ERP / Accounting", status: "Not Connected" },
  { name: "Shiprocket", category: "Logistics Aggregator", status: "Connected" },
  { name: "Delhivery", category: "Logistics Aggregator", status: "Connected" },
  { name: "LTL Freight Partner Network", category: "Bulk Freight", status: "Connected" },
  { name: "Public / Partner REST API", category: "Developer Access", status: "12 active keys" },
];

export const securitySettings = [
  { control: "Role-Based Access Control (RBAC)", scope: "Admin, Vendor, multi-user Business accounts", status: "Enforced" },
  { control: "Data Encryption (at-rest & in-transit)", scope: "All KYC and financial data", status: "Enforced" },
  { control: "DPDP Act & PCI-DSS Alignment", scope: "Platform-wide", status: "Compliant" },
  { control: "Two-Factor Authentication", scope: "Admin — mandatory · High-credit B2B — optional", status: "Enforced" },
];

export const supportTickets = [
  { id: "TCK-8821", from: "Ishita Verma (B2C)", subject: "Return pickup delayed", priority: "Normal", status: "Open" },
  { id: "TCK-8822", from: "Sunrise Institutional Supplies (B2B)", subject: "Consolidated invoice mismatch", priority: "High — SLA 4h", status: "In Progress" },
  { id: "TCK-8823", from: "Global Export Traders (B2B)", subject: "Export documentation query", priority: "High — SLA 4h", status: "Open" },
];

export const languages = [
  { code: "en", name: "English", coverage: "100%" },
  { code: "hi", name: "Hindi", coverage: "94%" },
  { code: "gu", name: "Gujarati", coverage: "78%" },
  { code: "ta", name: "Tamil", coverage: "41%" },
];

// ---- Vendor: Store Setup ----
export const storeProfile = {
  name: "Kutch Handloom Co.",
  tagline: "Handwoven heritage textiles from Kutch artisan clusters",
  channels: ["B2C", "B2B"],
  warehouses: [
    { id: "w1", label: "Bhuj Primary Warehouse", pincode: "370001", priority: "B2C + B2B" },
    { id: "w2", label: "Ahmedabad Bulk Dispatch Hub", pincode: "382445", priority: "B2B only" },
  ],
  social: { instagram: "@kutchhandloom", website: "kutchhandloom.co" },
};

// ---- Vendor: B2B Selling Toolkit ----
export const contractPricing = [
  { buyer: "Aarav Retail Chain Pvt Ltd", product: "Handloom Cotton Saree", rate: "₹1,120/unit", validity: "Till 31 Mar 2027" },
  { buyer: "Global Export Traders", product: "Handloom Cotton Saree", rate: "₹960/unit (Export slab)", validity: "Till 30 Sep 2026" },
];

export const sampleOrders = [
  { id: "SMP-221", buyer: "Coastal Distributors LLP", product: "Organic Turmeric Powder", qty: 5, status: "Dispatched" },
  { id: "SMP-222", buyer: "Sunrise Institutional Supplies", product: "USB-C Fast Charging Cable", qty: 10, status: "Requested" },
];

// ---- Vendor: Financials ----
export const receivables = [
  { buyer: "Aarav Retail Chain Pvt Ltd", invoiced: 236000, collected: 180000, overdue: 0, terms: "Net 30" },
  { buyer: "Sunrise Institutional Supplies", invoiced: 892000, collected: 620000, overdue: 272000, terms: "Net 45" },
];

export const vendorReviews = [
  { from: "Aarav Retail Chain Pvt Ltd", type: "B2B structured", onTime: 5, quality: 5, responsiveness: 4, note: "Consistent batch quality across 6 months of orders." },
  { from: "Rhea Kapoor", type: "B2C", onTime: 5, quality: 5, responsiveness: 5, note: "Beautiful weave, packaging was excellent." },
];

// ---- B2B Buyer Portal ----
export const teamMembers = [
  { name: "Karan Mehta", role: "Company Admin", email: "karan@aaravretail.in", limit: "Unlimited" },
  { name: "Sneha Iyer", role: "Purchase Manager", email: "sneha@aaravretail.in", limit: "Up to ₹1,00,000 / order" },
  { name: "Devendra Rao", role: "Approver", email: "dev@aaravretail.in", limit: "Approves orders above ₹1,00,000" },
  { name: "Alok Bansal", role: "Accountant", email: "alok@aaravretail.in", limit: "Read-only — invoices & ledger" },
];

export const creditNotes = [
  { id: "CN-4021", against: "PVT-10188", reason: "Short shipment — 40 units", amount: 17800, status: "Adjusted" },
  { id: "CN-4022", against: "PVT-10201", reason: "Quality rejection — batch 12", amount: 42500, status: "Pending Adjustment" },
];

export const savedAddresses = [
  { label: "Mumbai Retail Warehouse", pincode: "400072", isDefault: true },
  { label: "Pune Distribution Branch", pincode: "411057", isDefault: false },
  { label: "Nagpur Regional Store", pincode: "440001", isDefault: false },
];

export const b2bInvoices = [
  { id: "INV-B-3301", period: "Jul 2026 (Consolidated)", orders: 6, amount: 236000, status: "Paid" },
  { id: "INV-B-3302", period: "Aug 2026 (Consolidated)", orders: 2, amount: 118500, status: "Due 30 Aug" },
];
