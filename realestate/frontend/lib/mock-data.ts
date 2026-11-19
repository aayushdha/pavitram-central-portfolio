// Mock data layer for the Pavitram Realestate frontend.
// In production this would be replaced by API calls into the
// Central Auth Engine / listings service described in the spec.

export type PropertyType = "Apartment" | "Villa" | "Plot" | "Commercial" | "PG/Co-living";
export type ListingIntent = "Buy" | "Rent" | "PG";

export type Property = {
  id: string;
  title: string;
  type: PropertyType;
  intent: ListingIntent;
  city: string;
  locality: string;
  price: number; // in INR
  priceUnit: "total" | "month";
  bhk: string;
  areaSqft: number;
  possession: "Ready to Move" | "Under Construction";
  furnishing: "Unfurnished" | "Semi-Furnished" | "Furnished";
  verified: boolean;
  rera?: string;
  image: string;
  postedBy: string;
  postedByType: "Owner" | "Agent" | "Builder";
  views: number;
  shortlists: number;
  inquiries: number;
  postedDaysAgo: number;
};

const CITY_IMG: Record<string, string> = {
  Ahmedabad: "photo-1567157577867-05ccb1388e66",
  Mumbai: "photo-1570168007204-dfb528c6958f",
  Bengaluru: "photo-1596176530529-78163a4f7af2",
  Pune: "photo-1580216643062-cf460548a66a",
  Delhi: "photo-1587474260584-136574528ed5",
};

function img(seed: string) {
  return `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=60`;
}

export const properties: Property[] = [
  {
    id: "PVT-AHM-10231",
    title: "Sattva Greens — 3BHK with Sabarmati Riverfront View",
    type: "Apartment",
    intent: "Buy",
    city: "Ahmedabad",
    locality: "Bodakdev",
    price: 14500000,
    priceUnit: "total",
    bhk: "3 BHK",
    areaSqft: 1850,
    possession: "Ready to Move",
    furnishing: "Semi-Furnished",
    verified: true,
    rera: "GJ/RAA11234/281123",
    image: img(CITY_IMG.Ahmedabad),
    postedBy: "Nirvana Realty Group",
    postedByType: "Builder",
    views: 2140,
    shortlists: 186,
    inquiries: 42,
    postedDaysAgo: 3,
  },
  {
    id: "PVT-AHM-10198",
    title: "Independent Villa near SG Highway with Private Garden",
    type: "Villa",
    intent: "Buy",
    city: "Ahmedabad",
    locality: "South Bopal",
    price: 21000000,
    priceUnit: "total",
    bhk: "4 BHK",
    areaSqft: 3200,
    possession: "Ready to Move",
    furnishing: "Unfurnished",
    verified: true,
    image: img(CITY_IMG.Ahmedabad),
    postedBy: "Rakesh Patel",
    postedByType: "Owner",
    views: 1320,
    shortlists: 94,
    inquiries: 21,
    postedDaysAgo: 9,
  },
  {
    id: "PVT-MUM-30011",
    title: "Sea-Facing 2BHK, Fully Furnished, Bandra West",
    type: "Apartment",
    intent: "Rent",
    city: "Mumbai",
    locality: "Bandra West",
    price: 95000,
    priceUnit: "month",
    bhk: "2 BHK",
    areaSqft: 980,
    possession: "Ready to Move",
    furnishing: "Furnished",
    verified: true,
    image: img(CITY_IMG.Mumbai),
    postedBy: "Meridian Estates",
    postedByType: "Agent",
    views: 3980,
    shortlists: 301,
    inquiries: 76,
    postedDaysAgo: 1,
  },
  {
    id: "PVT-BLR-40456",
    title: "Prestige Lakeview — Premium 3BHK, Whitefield",
    type: "Apartment",
    intent: "Buy",
    city: "Bengaluru",
    locality: "Whitefield",
    price: 18700000,
    priceUnit: "total",
    bhk: "3 BHK",
    areaSqft: 1720,
    possession: "Under Construction",
    furnishing: "Unfurnished",
    verified: true,
    rera: "KA/RERA/1251/446/PR/091223",
    image: img(CITY_IMG.Bengaluru),
    postedBy: "Prestige Group",
    postedByType: "Builder",
    views: 5210,
    shortlists: 512,
    inquiries: 128,
    postedDaysAgo: 5,
  },
  {
    id: "PVT-PUN-50187",
    title: "Co-living PG for Working Women, Single Sharing, Baner",
    type: "PG/Co-living",
    intent: "PG",
    city: "Pune",
    locality: "Baner",
    price: 14500,
    priceUnit: "month",
    bhk: "Single",
    areaSqft: 180,
    possession: "Ready to Move",
    furnishing: "Furnished",
    verified: true,
    image: img(CITY_IMG.Pune),
    postedBy: "StayEasy Co-living",
    postedByType: "Agent",
    views: 1890,
    shortlists: 143,
    inquiries: 58,
    postedDaysAgo: 2,
  },
  {
    id: "PVT-DEL-60892",
    title: "Commercial Office Space, Connaught Place, Grade-A",
    type: "Commercial",
    intent: "Rent",
    city: "Delhi",
    locality: "Connaught Place",
    price: 385000,
    priceUnit: "month",
    bhk: "—",
    areaSqft: 4200,
    possession: "Ready to Move",
    furnishing: "Furnished",
    verified: false,
    image: img(CITY_IMG.Delhi),
    postedBy: "Capital Commercial Advisors",
    postedByType: "Agent",
    views: 940,
    shortlists: 41,
    inquiries: 9,
    postedDaysAgo: 14,
  },
  {
    id: "PVT-AHM-10344",
    title: "Residential Plot, Gated Township, Shela",
    type: "Plot",
    intent: "Buy",
    city: "Ahmedabad",
    locality: "Shela",
    price: 6800000,
    priceUnit: "total",
    bhk: "—",
    areaSqft: 2400,
    possession: "Ready to Move",
    furnishing: "Unfurnished",
    verified: true,
    image: img(CITY_IMG.Ahmedabad),
    postedBy: "Rakesh Patel",
    postedByType: "Owner",
    views: 760,
    shortlists: 38,
    inquiries: 12,
    postedDaysAgo: 20,
  },
  {
    id: "PVT-BLR-40901",
    title: "Godrej Woodscape — 2BHK Under Construction, Budigere",
    type: "Apartment",
    intent: "Buy",
    city: "Bengaluru",
    locality: "Budigere Cross",
    price: 8900000,
    priceUnit: "total",
    bhk: "2 BHK",
    areaSqft: 1180,
    possession: "Under Construction",
    furnishing: "Unfurnished",
    verified: true,
    rera: "KA/RERA/1251/446/PR/030124",
    image: img(CITY_IMG.Bengaluru),
    postedBy: "Godrej Properties",
    postedByType: "Builder",
    views: 4120,
    shortlists: 388,
    inquiries: 97,
    postedDaysAgo: 6,
  },
];

export type LocalityGuide = {
  slug: string;
  name: string;
  city: string;
  avgPriceSqft: number;
  trend: number;
  rentAvg: number;
  description: string;
  connectivity: string[];
  nearby: { category: string; places: string[] }[];
  reviews: { author: string; rating: number; text: string; livingSince: string }[];
  priceHistory: { label: string; value: number }[];
};

export const localityGuides: LocalityGuide[] = [
  {
    slug: "bodakdev-ahmedabad",
    name: "Bodakdev",
    city: "Ahmedabad",
    avgPriceSqft: 7850,
    trend: 4.2,
    rentAvg: 28000,
    description:
      "One of Ahmedabad's most established residential pockets, popular with families for its wide roads, established schools, and closeness to SG Highway's office belt.",
    connectivity: ["12 min to SG Highway IT corridor", "8 min to Iscon Cross Road", "AMTS & BRTS stops on 132 Ft Ring Road"],
    nearby: [
      { category: "Schools", places: ["Anand Niketan School", "Udgam School", "Zebar International School"] },
      { category: "Hospitals", places: ["Sterling Hospital", "CIMS Hospital"] },
      { category: "Shopping", places: ["Iscon Mega Mall", "Gulmohar Park Mall"] },
    ],
    reviews: [
      { author: "Meera D.", rating: 4.5, text: "Quiet streets, good schools nearby, and everything within a 10-minute drive.", livingSince: "2019" },
      { author: "Kunal P.", rating: 4.0, text: "Traffic on the main road gets heavy in the evenings, but the society itself is peaceful.", livingSince: "2021" },
    ],
    priceHistory: [
      { label: "Mar", value: 7100 }, { label: "Apr", value: 7280 }, { label: "May", value: 7420 },
      { label: "Jun", value: 7600 }, { label: "Jul", value: 7720 }, { label: "Aug", value: 7850 },
    ],
  },
  {
    slug: "south-bopal-ahmedabad",
    name: "South Bopal",
    city: "Ahmedabad",
    avgPriceSqft: 5200,
    trend: 6.1,
    rentAvg: 16500,
    description:
      "A fast-growing suburb favoured by young families for larger homes at lower prices than central Ahmedabad, with new societies coming up every year.",
    connectivity: ["15 min to SG Highway", "Close to South Bopal–Ghuma Road", "Upcoming BRTS extension"],
    nearby: [
      { category: "Schools", places: ["Delhi Public School Bopal", "Podar International School"] },
      { category: "Hospitals", places: ["Sunshine Global Hospital"] },
      { category: "Shopping", places: ["Praniv Highstreet"] },
    ],
    reviews: [
      { author: "Ritika S.", rating: 4.2, text: "Great value for the space you get. Growing fast, so more shops opening every month.", livingSince: "2022" },
    ],
    priceHistory: [
      { label: "Mar", value: 4650 }, { label: "Apr", value: 4780 }, { label: "May", value: 4900 },
      { label: "Jun", value: 5020 }, { label: "Jul", value: 5120 }, { label: "Aug", value: 5200 },
    ],
  },
  {
    slug: "bandra-west-mumbai",
    name: "Bandra West",
    city: "Mumbai",
    avgPriceSqft: 44200,
    trend: 2.3,
    rentAvg: 95000,
    description:
      "Mumbai's most sought-after western suburb — a mix of heritage bungalows, sea-facing towers, and the city's best restaurants and nightlife, all within walking distance of the sea.",
    connectivity: ["Bandra railway station (Western line)", "5 min to Bandra-Worli Sea Link", "Metro Line 2B upcoming"],
    nearby: [
      { category: "Schools", places: ["Jamnabai Narsee School", "St. Stanislaus High School"] },
      { category: "Hospitals", places: ["Lilavati Hospital", "Holy Family Hospital"] },
      { category: "Shopping", places: ["Linking Road", "Bandra Bandstand"] },
    ],
    reviews: [
      { author: "Aditya M.", rating: 4.7, text: "You pay a premium, but the location, food, and sea view make it worth it.", livingSince: "2017" },
    ],
    priceHistory: [
      { label: "Mar", value: 42800 }, { label: "Apr", value: 43100 }, { label: "May", value: 43400 },
      { label: "Jun", value: 43700 }, { label: "Jul", value: 43900 }, { label: "Aug", value: 44200 },
    ],
  },
  {
    slug: "whitefield-bengaluru",
    name: "Whitefield",
    city: "Bengaluru",
    avgPriceSqft: 8650,
    trend: 7.4,
    rentAvg: 32000,
    description:
      "Bengaluru's IT hub in the east, home to major tech parks and a dense cluster of gated apartment communities built for the working professionals who fill them.",
    connectivity: ["Whitefield Metro Station (Purple Line)", "10 min to ITPL", "Close to Outer Ring Road"],
    nearby: [
      { category: "Schools", places: ["Vydehi School of Excellence", "Ryan International School"] },
      { category: "Hospitals", places: ["Vydehi Hospital", "Columbia Asia"] },
      { category: "Shopping", places: ["Phoenix Marketcity", "Forum Shantiniketan"] },
    ],
    reviews: [
      { author: "Sandeep R.", rating: 4.3, text: "Best if you work in ITPL or EPIP — walk to work, and the metro now reaches most of the city.", livingSince: "2020" },
    ],
    priceHistory: [
      { label: "Mar", value: 7900 }, { label: "Apr", value: 8100 }, { label: "May", value: 8280 },
      { label: "Jun", value: 8420 }, { label: "Jul", value: 8540 }, { label: "Aug", value: 8650 },
    ],
  },
  {
    slug: "baner-pune",
    name: "Baner",
    city: "Pune",
    avgPriceSqft: 9100,
    trend: 5.5,
    rentAvg: 24000,
    description:
      "A well-planned western suburb popular with IT professionals working in Hinjewadi and Balewadi, known for its co-living options and modern high-rises.",
    connectivity: ["15 min to Hinjewadi IT Park", "Close to Mumbai-Pune Expressway", "PMPML bus network"],
    nearby: [
      { category: "Schools", places: ["Vibgyor High School", "Orchid School"] },
      { category: "Hospitals", places: ["Sahyadri Hospital Baner"] },
      { category: "Shopping", places: ["Xion Mall", "Balewadi High Street"] },
    ],
    reviews: [
      { author: "Neha J.", rating: 4.4, text: "Loads of cafes and co-living options. Commute to Hinjewadi is easy outside peak hours.", livingSince: "2023" },
    ],
    priceHistory: [
      { label: "Mar", value: 8300 }, { label: "Apr", value: 8500 }, { label: "May", value: 8700 },
      { label: "Jun", value: 8870 }, { label: "Jul", value: 9000 }, { label: "Aug", value: 9100 },
    ],
  },
];

// Back-compat simple shape used by the homepage price-trend teaser
export const localities = localityGuides.map((l) => ({ name: `${l.name}, ${l.city}`, avgPriceSqft: l.avgPriceSqft, trend: l.trend }));

export const priceTrend = [
  { label: "Mar", value: 6900 },
  { label: "Apr", value: 7040 },
  { label: "May", value: 7150 },
  { label: "Jun", value: 7320 },
  { label: "Jul", value: 7600 },
  { label: "Aug", value: 7850 },
];

// ---------- Housing News / resource articles ----------

export type Article = {
  slug: string;
  title: string;
  category: "Buying Guide" | "Legal" | "Home Loans" | "Market Trends" | "Rental Guide";
  excerpt: string;
  body: string[];
  readMinutes: number;
  publishedOn: string;
  author: string;
};

export const articles: Article[] = [
  {
    slug: "checklist-before-buying-resale-flat",
    title: "8 things to check before buying a resale flat",
    category: "Buying Guide",
    excerpt: "Resale homes move fast, but skipping paperwork checks is how buyers lose money. Here's what to verify first.",
    readMinutes: 6,
    publishedOn: "12 Aug 2026",
    author: "Pavitram Editorial",
    body: [
      "Buying a resale flat can save you the wait of an under-construction project, but the paperwork trail is longer and easier to get wrong.",
      "Start with the title deed. Ask for a certified copy and confirm the seller's name matches every past sale agreement in the chain — gaps here are the single biggest cause of disputes later.",
      "Get an encumbrance certificate covering at least 13 years. It tells you whether the property has any pending loans or legal claims against it.",
      "Check the occupancy certificate. Without it, the building is technically not approved for people to live in, no matter how long people have lived there.",
      "Ask for the last three years of property tax and maintenance receipts. Unpaid dues transfer to the new owner in most housing societies.",
      "If the building is over 10 years old, ask about any planned structural repairs or special maintenance charges the society has approved.",
      "Get the property independently valued if the price feels off from nearby listings — a second opinion costs little next to what you'd overpay.",
      "Finally, don't skip a physical visit at a different time of day than your first one. Water pressure, noise, and parking availability all change through the day.",
    ],
  },
  {
    slug: "rera-what-it-means-for-buyers",
    title: "RERA, explained simply — what it actually protects you from",
    category: "Legal",
    excerpt: "RERA registration is mentioned on every new listing. Here's what it actually guarantees, and what it doesn't.",
    readMinutes: 5,
    publishedOn: "3 Aug 2026",
    author: "Pavitram Editorial",
    body: [
      "RERA (the Real Estate Regulation Act) requires builders to register any project over 500 sq. m. with the state authority before advertising or selling units.",
      "Registration means the builder has declared the project timeline, land title, and approved plans publicly — and can be penalised for missing the declared possession date.",
      "It does not mean the government has verified construction quality. RERA covers disclosure and timelines, not workmanship.",
      "Always check the RERA number on the state authority's website directly, not just the number printed on a brochure — mismatched or expired numbers are a common red flag.",
      "If a project is delayed past its RERA-declared date, buyers can claim compensation or a refund with interest through the state RERA tribunal.",
    ],
  },
  {
    slug: "home-loan-eligibility-basics",
    title: "How banks actually decide your home loan amount",
    category: "Home Loans",
    excerpt: "Your salary isn't the only number that matters. Here's what really drives your loan eligibility.",
    readMinutes: 7,
    publishedOn: "28 Jul 2026",
    author: "Pavitram Editorial",
    body: [
      "Most banks cap your total monthly loan payments (EMIs) at 40-50% of your take-home income — this is called FOIR, and it includes any existing loans, not just the new one.",
      "A longer tenure lowers your EMI and can raise how much you're eligible for, but you'll pay more interest overall — it's a trade-off, not free money.",
      "Your credit score matters more than most buyers expect. Anything above 750 typically gets you the best rate; below 650 and some banks will decline outright.",
      "Co-applying with a working spouse or parent combines incomes and can meaningfully raise your eligible loan amount.",
      "Self-employed applicants are usually assessed on average income across the last two to three years of tax filings, not just the most recent year.",
    ],
  },
  {
    slug: "ahmedabad-property-prices-2026",
    title: "Where Ahmedabad's home prices are moving fastest in 2026",
    category: "Market Trends",
    excerpt: "South Bopal and Shela are outpacing the city average. Here's why, and where prices may head next.",
    readMinutes: 5,
    publishedOn: "15 Jul 2026",
    author: "Pavitram Editorial",
    body: [
      "Ahmedabad's western suburbs are seeing the fastest price growth in the city, led by South Bopal and Shela, both up more than 6% over the past six months.",
      "The driver is straightforward: new gated townships offering larger homes at lower per-sq-ft prices than established areas like Bodakdev or Satellite.",
      "Central localities like Navrangpura and Vastrapur are growing more slowly but remain the most expensive per square foot, thanks to limited new supply.",
      "Plot prices in peripheral areas have grown even faster than apartment prices, as buyers hedge against construction cost inflation by locking in land early.",
    ],
  },
  {
    slug: "rent-agreement-clauses-to-check",
    title: "5 rent agreement clauses tenants often miss",
    category: "Rental Guide",
    excerpt: "Standard-looking rent agreements can hide clauses that cost you your deposit. Read these carefully.",
    readMinutes: 4,
    publishedOn: "9 Jul 2026",
    author: "Pavitram Editorial",
    body: [
      "Check the lock-in period. Many agreements require you to pay rent for a minimum number of months even if you move out early — usually 6 to 11 months.",
      "Look for who pays for repairs. Some agreements shift routine maintenance costs onto the tenant, which isn't standard practice.",
      "Check the notice period required from both sides — it should be equal, typically one to two months.",
      "Confirm how the deposit refund is handled, and whether deductions for 'wear and tear' are capped at a fixed amount.",
      "If the property is furnished, ask for a written inventory list signed by both parties before you move in.",
    ],
  },
];

// ---------- Builder profiles ----------

export type BuilderProfile = {
  slug: string;
  name: string;
  city: string;
  founded: number;
  totalProjects: number;
  unitsDelivered: number;
  description: string;
  verified: boolean;
};

export const builderProfiles: BuilderProfile[] = [
  {
    slug: "nirvana-realty-group",
    name: "Nirvana Realty Group",
    city: "Ahmedabad",
    founded: 2008,
    totalProjects: 14,
    unitsDelivered: 3200,
    description:
      "Ahmedabad-based developer known for mid-to-premium residential townships along the SG Highway and Shela corridor, with a focus on green building certification.",
    verified: true,
  },
  {
    slug: "godrej-properties",
    name: "Godrej Properties",
    city: "Bengaluru",
    founded: 1990,
    totalProjects: 96,
    unitsDelivered: 42000,
    description:
      "One of India's largest listed developers, active across Bengaluru, Mumbai, Pune, and NCR, with a wide portfolio spanning affordable to luxury housing.",
    verified: true,
  },
  {
    slug: "prestige-group",
    name: "Prestige Group",
    city: "Bengaluru",
    founded: 1986,
    totalProjects: 300,
    unitsDelivered: 160000,
    description:
      "A leading South India developer with residential, commercial, and hospitality projects across Bengaluru, Chennai, Hyderabad, and Goa.",
    verified: true,
  },
  {
    slug: "sobha-limited",
    name: "Sobha Ltd.",
    city: "Bengaluru",
    founded: 1995,
    totalProjects: 130,
    unitsDelivered: 50000,
    description:
      "Known for backward-integrated construction (owning its own contracting and manufacturing arms), delivering premium residential projects across South India.",
    verified: true,
  },
];

// ---------- NRI corner ----------

export const nriServices = [
  { title: "NRI home loans", desc: "Compare loan offers from banks that lend against NRE/NRO income, with FEMA-compliant paperwork support." },
  { title: "Power of Attorney assistance", desc: "Get a lawyer to draft and register a POA so a trusted person can transact on your behalf in India." },
  { title: "Video property tours", desc: "Schedule a live video walkthrough with the listing agent at a time that works across time zones." },
  { title: "Currency & repatriation guidance", desc: "Understand FEMA rules for bringing sale proceeds back to your country of residence." },
];



// ---------- Admin dashboard mock data ----------

export const platformStats = {
  activeSeekers: 214500,
  ownersAgentsBuilders: 18420,
  liveListings: 96230,
  siteVisitsPerDay: 3120,
  conversionRate: 4.8,
  mrr: 8420000,
  arr: 101040000,
  churn: 2.1,
};

export const mrrTrend = [
  { label: "Mar", value: 6650000 },
  { label: "Apr", value: 7010000 },
  { label: "May", value: 7320000 },
  { label: "Jun", value: 7680000 },
  { label: "Jul", value: 8050000 },
  { label: "Aug", value: 8420000 },
];

export const listingsByCategory = [
  { label: "Apartment", value: 52400 },
  { label: "Plot / Land", value: 14200 },
  { label: "Villa", value: 9800 },
  { label: "Commercial", value: 8100 },
  { label: "PG / Co-living", value: 11730 },
];

export const revenueByPlan = [
  { label: "Owner — Basic", value: 1240000 },
  { label: "Agent — Pro", value: 2380000 },
  { label: "Agent — Elite", value: 1890000 },
  { label: "Builder — Featured", value: 2100000 },
  { label: "Builder — Spotlight", value: 810000 },
];

export type ModerationStatus = "Pending Review" | "Approved" | "Flagged" | "Rejected";

export const moderationQueue: {
  id: string;
  title: string;
  postedBy: string;
  type: PropertyType;
  city: string;
  status: ModerationStatus;
  flag?: string;
  submitted: string;
}[] = [
  { id: "PVT-AHM-10412", title: "3BHK Flat, Naranpura", postedBy: "Suresh Iyer", type: "Apartment", city: "Ahmedabad", status: "Pending Review", submitted: "2 hrs ago" },
  { id: "PVT-MUM-30099", title: "1BHK Studio, Andheri East", postedBy: "Quick Homes Agency", type: "Apartment", city: "Mumbai", status: "Flagged", flag: "Duplicate of PVT-MUM-30011", submitted: "5 hrs ago" },
  { id: "PVT-BLR-41002", title: "Sobha Dream Acres — 2BHK", postedBy: "Sobha Ltd.", type: "Apartment", city: "Bengaluru", status: "Pending Review", submitted: "7 hrs ago" },
  { id: "PVT-PUN-50221", title: "Commercial Shop, FC Road", postedBy: "Vinod Deshmukh", type: "Commercial", city: "Pune", status: "Flagged", flag: "Price 340% below locality average", submitted: "1 day ago" },
  { id: "PVT-DEL-60955", title: "Plot, Dwarka Sector 21", postedBy: "Capital Land Co.", type: "Plot", city: "Delhi", status: "Approved", submitted: "1 day ago" },
  { id: "PVT-AHM-10455", title: "PG for Men, Satellite", postedBy: "HomeStay PGs", type: "PG/Co-living", city: "Ahmedabad", status: "Rejected", flag: "Missing owner ID proof", submitted: "2 days ago" },
];

export type KycStatus = "Verified" | "Pending" | "On Hold" | "Rejected";

export const seekerAccounts = [
  { id: "SK-88213", name: "Ananya Sharma", email: "ananya.sharma@mail.com", city: "Ahmedabad", joined: "12 Jan 2026", status: "Active" as const },
  { id: "SK-88214", name: "Rohit Malhotra", email: "rohit.m@mail.com", city: "Mumbai", joined: "15 Jan 2026", status: "Active" as const },
  { id: "SK-88215", name: "Priya Nair", email: "priya.nair@mail.com", city: "Bengaluru", joined: "18 Jan 2026", status: "Suspended" as const },
  { id: "SK-88216", name: "Karan Mehta", email: "karan.mehta@mail.com", city: "Pune", joined: "2 Feb 2026", status: "Active" as const },
];

export const ownerAgentAccounts: {
  id: string;
  name: string;
  role: "Owner" | "Agent" | "Builder";
  company?: string;
  city: string;
  kyc: KycStatus;
  listings: number;
  rera?: string;
}[] = [
  { id: "OA-51023", name: "Rakesh Patel", role: "Owner", city: "Ahmedabad", kyc: "Verified", listings: 2 },
  { id: "OA-51024", name: "Meridian Estates", role: "Agent", company: "Meridian Estates Pvt. Ltd.", city: "Mumbai", kyc: "Verified", listings: 34 },
  { id: "OA-51025", name: "Nirvana Realty Group", role: "Builder", company: "Nirvana Realty Group", city: "Ahmedabad", kyc: "Verified", listings: 6, rera: "GJ/RAA11234/281123" },
  { id: "OA-51026", name: "Sobha Ltd.", role: "Builder", company: "Sobha Limited", city: "Bengaluru", kyc: "Pending", listings: 3, rera: "KA/RERA/1251/990/PR/210824" },
  { id: "OA-51027", name: "Quick Homes Agency", role: "Agent", company: "Quick Homes", city: "Mumbai", kyc: "On Hold", listings: 19 },
  { id: "OA-51028", name: "Capital Land Co.", role: "Builder", company: "Capital Land Co.", city: "Delhi", kyc: "Rejected", listings: 1 },
];

export const disputes = [
  { id: "TCK-9021", subject: "Fraudulent listing — PVT-MUM-30099 flagged twice", raisedBy: "Ananya Sharma (Seeker)", against: "Quick Homes Agency", severity: "High" as const, sla: "2h left", status: "Escalated" as const },
  { id: "TCK-9022", subject: "Site visit no-show, refund requested", raisedBy: "Karan Mehta (Seeker)", against: "Meridian Estates", severity: "Medium" as const, sla: "8h left", status: "In Progress" as const },
  { id: "TCK-9023", subject: "Owner disputes lead marked as fake", raisedBy: "Rakesh Patel (Owner)", against: "Platform / Lead Engine", severity: "Low" as const, sla: "1d left", status: "Open" as const },
  { id: "TCK-9024", subject: "RERA mismatch flagged on project microsite", raisedBy: "System (Auto-Flag)", against: "Capital Land Co.", severity: "High" as const, sla: "Late", status: "Escalated" as const },
];

export const auditLog = [
  { id: "AL-77021", action: "Listing approved", actor: "admin.priyank@pavitram.com", target: "PVT-DEL-60955", time: "19 Aug, 10:42 AM", ip: "103.21.244.10" },
  { id: "AL-77020", action: "Owner account suspended", actor: "admin.riya@pavitram.com", target: "SK-88215", time: "19 Aug, 09:58 AM", ip: "103.21.244.11" },
  { id: "AL-77019", action: "RERA status overridden", actor: "admin.priyank@pavitram.com", target: "OA-51026", time: "18 Aug, 06:20 PM", ip: "103.21.244.10" },
  { id: "AL-77018", action: "Plan price updated — Agent Pro", actor: "admin.finance@pavitram.com", target: "PLAN-AGENT-PRO", time: "18 Aug, 03:11 PM", ip: "103.21.244.14" },
  { id: "AL-77017", action: "Bulk-notify sent to 4,200 seekers", actor: "admin.marketing@pavitram.com", target: "CAMPAIGN-0819", time: "18 Aug, 11:02 AM", ip: "103.21.244.16" },
];

export const fraudSignals = [
  { listing: "PVT-MUM-30099", riskScore: 91, reason: "Duplicate photos matched to 2 other listings", city: "Mumbai" },
  { listing: "PVT-PUN-50221", riskScore: 84, reason: "Price 340% below locality average", city: "Pune" },
  { listing: "PVT-DEL-60872", riskScore: 62, reason: "Owner phone number linked to 5 listings", city: "Delhi" },
  { listing: "PVT-AHM-10455", riskScore: 55, reason: "Missing ownership document", city: "Ahmedabad" },
];

export const promoCodes = [
  { code: "BUILDER25", desc: "25% off Featured Project plans", scope: "Builders", redemptions: 142, status: "Active" },
  { code: "AGENTLAUNCH", desc: "First month free — Agent Pro", scope: "Agents", redemptions: 318, status: "Active" },
  { code: "MONSOON2026", desc: "Seasonal promo — all owner plans", scope: "Owners", redemptions: 89, status: "Expired" },
];

export const cmsBanners = [
  { id: "BN-01", title: "Monsoon Home Fest — Up to 5% Cashback", placement: "Homepage Hero", live: true },
  { id: "BN-02", title: "Godrej Woodscape — New Launch, Budigere", placement: "Featured Projects Rail", live: true },
  { id: "BN-03", title: "RERA-Verified Plots — Shela Township", placement: "Locality Page — Ahmedabad", live: false },
];

// ---------- Owner / Agent / Builder portal mock data ----------

export const ownerListings = [
  { id: "PVT-AHM-10231", title: "Sattva Greens — 3BHK", status: "Live" as const, views: 2140, shortlists: 186, inquiries: 42, expiresIn: "18 days" },
  { id: "PVT-AHM-10344", title: "Residential Plot, Shela", status: "Live" as const, views: 760, shortlists: 38, inquiries: 12, expiresIn: "6 days" },
  { id: "PVT-AHM-10198", title: "Villa, South Bopal", status: "Under Review" as const, views: 0, shortlists: 0, inquiries: 0, expiresIn: "—" },
  { id: "PVT-AHM-09982", title: "2BHK, Vastrapur", status: "Expired" as const, views: 1890, shortlists: 122, inquiries: 31, expiresIn: "Expired 4 days ago" },
];

export type LeadStage = "New" | "Contacted" | "Site Visit Scheduled" | "Negotiation" | "Closed" | "Lost";

export const leads: {
  id: string;
  name: string;
  property: string;
  stage: LeadStage;
  intentScore: number;
  phone: string;
  lastActivity: string;
}[] = [
  { id: "LD-3301", name: "Vivek Shah", property: "Sattva Greens 3BHK", stage: "New", intentScore: 82, phone: "+91 98******21", lastActivity: "12 min ago" },
  { id: "LD-3307", name: "Nikita Solanki", property: "Plot, Shela", stage: "New", intentScore: 58, phone: "+91 91******30", lastActivity: "40 min ago" },
  { id: "LD-3308", name: "Harsh Oza", property: "Sattva Greens 3BHK", stage: "New", intentScore: 71, phone: "+91 88******65", lastActivity: "1 hr ago" },
  { id: "LD-3302", name: "Foram Trivedi", property: "Sattva Greens 3BHK", stage: "Contacted", intentScore: 68, phone: "+91 97******44", lastActivity: "1 hr ago" },
  { id: "LD-3309", name: "Sameer Qureshi", property: "Villa, South Bopal", stage: "Contacted", intentScore: 74, phone: "+91 90******52", lastActivity: "2 hrs ago" },
  { id: "LD-3303", name: "Devansh Rao", property: "Villa, South Bopal", stage: "Site Visit Scheduled", intentScore: 91, phone: "+91 90******09", lastActivity: "3 hrs ago" },
  { id: "LD-3310", name: "Kavya Iyer", property: "Plot, Shela", stage: "Site Visit Scheduled", intentScore: 63, phone: "+91 95******18", lastActivity: "5 hrs ago" },
  { id: "LD-3304", name: "Meera Joshi", property: "Residential Plot, Shela", stage: "Negotiation", intentScore: 76, phone: "+91 99******62", lastActivity: "Yesterday" },
  { id: "LD-3305", name: "Aakash Bhatt", property: "Sattva Greens 3BHK", stage: "Closed", intentScore: 95, phone: "+91 98******17", lastActivity: "2 days ago" },
  { id: "LD-3306", name: "Ritu Chawla", property: "Villa, South Bopal", stage: "Lost", intentScore: 34, phone: "+91 96******88", lastActivity: "4 days ago" },
];

export const leadStages: LeadStage[] = ["New", "Contacted", "Site Visit Scheduled", "Negotiation", "Closed", "Lost"];

export const builderProjects = [
  {
    id: "PRJ-101",
    name: "Nirvana Skyline",
    city: "Ahmedabad",
    towers: 4,
    totalUnits: 320,
    available: 118,
    booked: 64,
    sold: 138,
    rera: "GJ/RAA11234/281123",
    reraStatus: "Verified" as const,
  },
  {
    id: "PRJ-102",
    name: "Nirvana Greens Phase II",
    city: "Ahmedabad",
    towers: 2,
    totalUnits: 160,
    available: 92,
    booked: 30,
    sold: 38,
    rera: "GJ/RAA11298/090224",
    reraStatus: "Renewal Due" as const,
  },
];

export const listingPerformance = [
  { label: "Sattva Greens 3BHK", value: 2140 },
  { label: "Plot, Shela", value: 760 },
  { label: "2BHK, Vastrapur", value: 1890 },
  { label: "Villa, South Bopal", value: 1320 },
];

export const localityDemand = [
  { label: "Bodakdev", value: 412 },
  { label: "South Bopal", value: 298 },
  { label: "Shela", value: 176 },
  { label: "Satellite", value: 143 },
  { label: "Vastrapur", value: 121 },
];

export const invoices = [
  { id: "INV-88231", plan: "Agent Pro — Monthly", amount: 4999, gst: 899.82, date: "1 Aug 2026", status: "Paid" as const },
  { id: "INV-88112", plan: "Featured Listing x3", amount: 1499, gst: 269.82, date: "22 Jul 2026", status: "Paid" as const },
  { id: "INV-87990", plan: "Lead Unlock Pack (25)", amount: 999, gst: 179.82, date: "10 Jul 2026", status: "Paid" as const },
  { id: "INV-87801", plan: "Agent Pro — Monthly", amount: 4999, gst: 899.82, date: "1 Jul 2026", status: "Refunded" as const },
];

// ---------- Property seeker dashboard mock data ----------

export const savedSearches = [
  { id: "SS-01", query: "3BHK · Bodakdev, Ahmedabad · Under ₹1.6 Cr", newMatches: 6, frequency: "Instant" },
  { id: "SS-02", query: "2BHK Rent · Bandra West, Mumbai · ₹80k–1.1L", newMatches: 2, frequency: "Daily" },
  { id: "SS-03", query: "Plot · Shela / South Bopal · 2000–3000 sqft", newMatches: 0, frequency: "Weekly" },
];

export const wishlist = [properties[0], properties[1], properties[6]];

export const siteVisits = [
  { id: "SV-501", property: "Sattva Greens — 3BHK", date: "22 Aug 2026", time: "11:00 AM", agent: "Nirvana Realty Group", status: "Confirmed" as const },
  { id: "SV-502", property: "Villa, South Bopal", date: "24 Aug 2026", time: "4:30 PM", agent: "Rakesh Patel", status: "Pending" as const },
  { id: "SV-499", property: "2BHK, Vastrapur", date: "10 Aug 2026", time: "10:00 AM", agent: "Meridian Estates", status: "Completed" as const },
];

// ---------- Services marketplace mock data ----------

export type ServiceCategory = "Material Suppliers" | "Legal Services" | "Home Services" | "Finance & Loans";

export const serviceProviders: {
  id: string;
  name: string;
  category: ServiceCategory;
  specialty: string;
  city: string;
  rating: number;
  reviews: number;
  verified: boolean;
  priceFrom: string;
}[] = [
  { id: "SP-01", name: "BuildMart Traders", category: "Material Suppliers", specialty: "Cement, Tiles & Sanitaryware", city: "Ahmedabad", rating: 4.6, reviews: 212, verified: true, priceFrom: "Quote on request" },
  { id: "SP-02", name: "Adv. Nisha Kapoor", category: "Legal Services", specialty: "Sale Deed & Title Verification", city: "Mumbai", rating: 4.9, reviews: 88, verified: true, priceFrom: "₹1,499 / consultation" },
  { id: "SP-03", name: "Om Electricals & Plumbing", category: "Home Services", specialty: "Electrician & Plumber", city: "Ahmedabad", rating: 4.5, reviews: 340, verified: true, priceFrom: "₹299 / visit" },
  { id: "SP-04", name: "Suvidha Home Loans", category: "Finance & Loans", specialty: "Home Loan & LAP Advisory", city: "Bengaluru", rating: 4.7, reviews: 156, verified: true, priceFrom: "Free consultation" },
  { id: "SP-05", name: "CleanNest Deep Cleaning", category: "Home Services", specialty: "Deep Cleaning & Pest Control", city: "Pune", rating: 4.4, reviews: 199, verified: true, priceFrom: "₹899 / visit" },
  { id: "SP-06", name: "Adv. Rohan Bakshi", category: "Legal Services", specialty: "RERA Dispute Resolution", city: "Delhi", rating: 4.8, reviews: 61, verified: true, priceFrom: "₹2,499 / consultation" },
];

export const providerBookings: {
  id: string;
  customer: string;
  service: string;
  scheduled: string;
  amount: number;
  status: "New" | "Accepted" | "In Progress" | "Completed";
}[] = [
  { id: "BK-2201", customer: "Ananya Sharma", service: "Electrician — Switchboard Check", scheduled: "19 Aug, 3:00 PM", amount: 349, status: "New" },
  { id: "BK-2198", customer: "Karan Mehta", service: "Deep Cleaning — 3BHK", scheduled: "20 Aug, 10:00 AM", amount: 2499, status: "Accepted" },
  { id: "BK-2185", customer: "Rohit Malhotra", service: "Plumber — Leak Repair", scheduled: "18 Aug, 5:30 PM", amount: 449, status: "In Progress" },
  { id: "BK-2170", customer: "Priya Nair", service: "Painter — 2BHK Full Paint", scheduled: "12 Aug, 9:00 AM", amount: 18500, status: "Completed" },
];

export const providerEarnings = [
  { label: "Mar", value: 42000 },
  { label: "Apr", value: 51000 },
  { label: "May", value: 47500 },
  { label: "Jun", value: 58200 },
  { label: "Jul", value: 63400 },
  { label: "Aug", value: 71200 },
];

// ---------- Utility formatters ----------

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPrice(p: Property): string {
  const base = formatINR(p.price);
  return p.priceUnit === "month" ? `${base}/mo` : base;
}

export function findLocalityGuide(city: string, locality: string): LocalityGuide | undefined {
  return localityGuides.find(
    (l) => l.city.toLowerCase() === city.toLowerCase() && l.name.toLowerCase() === locality.toLowerCase()
  );
}

// ---------- Public New Projects (Housing.com-style project pages) ----------

export type NewProject = {
  id: string;
  name: string;
  builder: string;
  city: string;
  locality: string;
  type: "Residential" | "Commercial" | "Mixed Use";
  priceFrom: number;
  priceTo: number;
  configurations: string[]; // e.g. ["2 BHK", "3 BHK"]
  areaFrom: number;
  areaTo: number;
  possession: string; // e.g. "Dec 2027"
  status: "New Launch" | "Under Construction" | "Ready to Move";
  rera: string;
  reraVerified: boolean;
  totalUnits: number;
  towers: number;
  amenities: string[];
  image: string;
  description: string;
  connectivity: string[];
};

export const newProjects: NewProject[] = [
  {
    id: "PRJ-101",
    name: "Nirvana Skyline",
    builder: "Nirvana Realty Group",
    city: "Ahmedabad",
    locality: "Bodakdev",
    type: "Residential",
    priceFrom: 8900000,
    priceTo: 18700000,
    configurations: ["2 BHK", "3 BHK", "4 BHK"],
    areaFrom: 1180,
    areaTo: 2450,
    possession: "Dec 2027",
    status: "Under Construction",
    rera: "GJ/RAA11234/281123",
    reraVerified: true,
    totalUnits: 320,
    towers: 4,
    amenities: ["Club house", "Swimming pool", "Gym", "Landscaped garden", "24x7 security", "Power backup", "EV charging", "Kids' play area"],
    image: img(CITY_IMG.Ahmedabad),
    description: "A landmark riverfront-facing residential tower with resort-style amenities, built for families who want space without leaving the city centre.",
    connectivity: ["12 min to SG Highway", "8 min to Bodakdev metro station", "Close to Shanti Asiatic School"],
  },
  {
    id: "PRJ-102",
    name: "Nirvana Greens Phase II",
    builder: "Nirvana Realty Group",
    city: "Ahmedabad",
    locality: "Shela",
    type: "Residential",
    priceFrom: 5200000,
    priceTo: 9800000,
    configurations: ["2 BHK", "3 BHK"],
    areaFrom: 980,
    areaTo: 1560,
    possession: "Ready to Move",
    status: "Ready to Move",
    rera: "GJ/RAA11298/090224",
    reraVerified: true,
    totalUnits: 160,
    towers: 2,
    amenities: ["Garden", "24x7 security", "Power backup", "Rainwater harvesting", "Club house"],
    image: img(CITY_IMG.Ahmedabad),
    description: "A quieter, garden-facing project in the fast-growing Shela belt — ready to move in with possession handed over.",
    connectivity: ["Close to South Bopal", "15 min to SG Highway"],
  },
  {
    id: "PRJ-201",
    name: "Prestige Lakeview",
    builder: "Prestige Group",
    city: "Bengaluru",
    locality: "Whitefield",
    type: "Residential",
    priceFrom: 14500000,
    priceTo: 24000000,
    configurations: ["2 BHK", "3 BHK"],
    areaFrom: 1350,
    areaTo: 2100,
    possession: "Ready to Move",
    status: "Ready to Move",
    rera: "KA/RERA/1251/446/PR/091223",
    reraVerified: true,
    totalUnits: 480,
    towers: 6,
    amenities: ["Club house", "Swimming pool", "Gym", "Sports court", "Jogging track", "24x7 security", "Multi-level parking"],
    image: img(CITY_IMG.Bengaluru),
    description: "Premium lakeside living in Whitefield, close to the IT corridor, with a full clubhouse and sports facilities.",
    connectivity: ["5 min to ITPL", "10 min to Whitefield metro", "Close to top international schools"],
  },
  {
    id: "PRJ-202",
    name: "Godrej Woodscape",
    builder: "Godrej Properties",
    city: "Bengaluru",
    locality: "Budigere Cross",
    type: "Residential",
    priceFrom: 7200000,
    priceTo: 12800000,
    configurations: ["1 BHK", "2 BHK", "3 BHK"],
    areaFrom: 680,
    areaTo: 1580,
    possession: "Mar 2028",
    status: "New Launch",
    rera: "KA/RERA/1251/446/PR/030124",
    reraVerified: true,
    totalUnits: 610,
    towers: 8,
    amenities: ["Club house", "Swimming pool", "Yoga deck", "Amphitheatre", "Senior citizen area", "EV charging"],
    image: img(CITY_IMG.Bengaluru),
    description: "A new-launch forest-themed township with over 3 acres of open green space, in one of East Bengaluru's fastest-growing corridors.",
    connectivity: ["Close to Whitefield", "20 min to KR Puram", "Upcoming metro connectivity"],
  },
  {
    id: "PRJ-301",
    name: "Capital Heights",
    builder: "Capital Land Co.",
    city: "Delhi",
    locality: "Dwarka",
    type: "Mixed Use",
    priceFrom: 9500000,
    priceTo: 21000000,
    configurations: ["2 BHK", "3 BHK", "Retail Shop"],
    areaFrom: 950,
    areaTo: 2200,
    possession: "Jun 2027",
    status: "Under Construction",
    rera: "DL/RERA/2024/0091",
    reraVerified: false,
    totalUnits: 280,
    towers: 3,
    amenities: ["24x7 security", "Power backup", "Multi-level parking", "Garden"],
    image: img(CITY_IMG.Delhi),
    description: "A mixed residential-commercial development in Dwarka, close to the airport expressway and upcoming metro extension.",
    connectivity: ["10 min to Dwarka Sector 21 metro", "Close to IGI Airport"],
  },
];

// ---------- City guide data ----------

export type CityGuide = {
  city: string;
  tagline: string;
  avgPriceSqft: number;
  yoyChange: number;
  topLocalities: { name: string; avgPriceSqft: number; trend: number }[];
  aboutText: string;
};

export const cityGuides: Record<string, CityGuide> = {
  Ahmedabad: {
    city: "Ahmedabad",
    tagline: "Gujarat's fastest-growing real estate market",
    avgPriceSqft: 6450,
    yoyChange: 8.2,
    topLocalities: [
      { name: "Bodakdev", avgPriceSqft: 7850, trend: 4.2 },
      { name: "South Bopal", avgPriceSqft: 5200, trend: 6.1 },
      { name: "Shela", avgPriceSqft: 4400, trend: 9.8 },
      { name: "Satellite", avgPriceSqft: 7100, trend: 3.5 },
      { name: "Vastrapur", avgPriceSqft: 8300, trend: 2.9 },
    ],
    aboutText:
      "Ahmedabad's western suburbs — Bodakdev, South Bopal, and Shela — continue to draw the most demand, driven by SG Highway connectivity and new social infrastructure. Plot and villa demand has grown alongside apartments in the last two years.",
  },
  Mumbai: {
    city: "Mumbai",
    tagline: "India's largest and most expensive property market",
    avgPriceSqft: 28400,
    yoyChange: 3.1,
    topLocalities: [
      { name: "Bandra West", avgPriceSqft: 44200, trend: 2.3 },
      { name: "Andheri West", avgPriceSqft: 26800, trend: 3.8 },
      { name: "Powai", avgPriceSqft: 21500, trend: 4.6 },
      { name: "Thane West", avgPriceSqft: 15200, trend: 6.4 },
      { name: "Chembur", avgPriceSqft: 19800, trend: 3.1 },
    ],
    aboutText:
      "Mumbai's rental and resale markets remain tight across the western suburbs. Thane and Navi Mumbai continue to absorb price-sensitive demand as the metro network expands.",
  },
  Bengaluru: {
    city: "Bengaluru",
    tagline: "India's tech capital, driven by IT-corridor demand",
    avgPriceSqft: 7900,
    yoyChange: 9.4,
    topLocalities: [
      { name: "Whitefield", avgPriceSqft: 8650, trend: 7.4 },
      { name: "Sarjapur Road", avgPriceSqft: 7200, trend: 8.9 },
      { name: "Electronic City", avgPriceSqft: 5800, trend: 6.2 },
      { name: "Hebbal", avgPriceSqft: 9100, trend: 5.5 },
      { name: "Budigere Cross", avgPriceSqft: 6100, trend: 11.2 },
    ],
    aboutText:
      "Bengaluru's East and North corridors are seeing the sharpest price growth, tracking new IT campuses and the upcoming metro Phase 3 alignment.",
  },
  Pune: {
    city: "Pune",
    tagline: "A steady, IT- and education-led market",
    avgPriceSqft: 7300,
    yoyChange: 6.8,
    topLocalities: [
      { name: "Baner", avgPriceSqft: 9100, trend: 5.5 },
      { name: "Wakad", avgPriceSqft: 7600, trend: 6.8 },
      { name: "Hinjewadi", avgPriceSqft: 6900, trend: 8.1 },
      { name: "Kharadi", avgPriceSqft: 8400, trend: 7.2 },
      { name: "Viman Nagar", avgPriceSqft: 9800, trend: 3.9 },
    ],
    aboutText:
      "Pune's western belt — Baner, Wakad, and Hinjewadi — remains the most active due to IT-park proximity, while Kharadi has emerged as the fastest-growing eastern micro-market.",
  },
  Delhi: {
    city: "Delhi",
    tagline: "NCR's core market, anchored by metro connectivity",
    avgPriceSqft: 13200,
    yoyChange: 4.5,
    topLocalities: [
      { name: "Dwarka", avgPriceSqft: 11800, trend: 5.8 },
      { name: "Connaught Place", avgPriceSqft: 24500, trend: 2.1 },
      { name: "Rohini", avgPriceSqft: 9600, trend: 4.9 },
      { name: "Vasant Kunj", avgPriceSqft: 18200, trend: 3.4 },
      { name: "Dwarka Expressway", avgPriceSqft: 10400, trend: 9.6 },
    ],
    aboutText:
      "Delhi's western and southwestern pockets continue to benefit from the Dwarka Expressway and airport-linked infrastructure, drawing both end-users and investors.",
  },
};

// ---------- Home loan offers ----------

export const loanOffers = [
  { lender: "Suvidha Home Loans", rate: 8.35, processingFee: "0.5%", maxTenure: 30, minAmount: "₹5 L", rating: 4.7 },
  { lender: "Capital Bank", rate: 8.5, processingFee: "0.35%", maxTenure: 25, minAmount: "₹10 L", rating: 4.5 },
  { lender: "Nationwide Housing Finance", rate: 8.6, processingFee: "Up to ₹10,000", maxTenure: 30, minAmount: "₹3 L", rating: 4.3 },
  { lender: "Trust Co-operative Bank", rate: 8.75, processingFee: "0.4%", maxTenure: 20, minAmount: "₹5 L", rating: 4.2 },
  { lender: "Bharat Housing Finance", rate: 8.45, processingFee: "0.3%", maxTenure: 30, minAmount: "₹8 L", rating: 4.6 },
];

// ---------- Notifications ----------

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "lead" | "listing" | "system" | "payment";
};

export const sampleNotifications: NotificationItem[] = [
  { id: "N1", title: "New lead on Sattva Greens 3BHK", body: "Vivek Shah just enquired about your listing.", time: "12 min ago", read: false, type: "lead" },
  { id: "N2", title: "Listing approved", body: "Your listing PVT-AHM-10412 is now live.", time: "2 hrs ago", read: false, type: "listing" },
  { id: "N3", title: "Site visit confirmed", body: "Devansh Rao confirmed the visit for 24 Aug, 4:30 PM.", time: "5 hrs ago", read: false, type: "lead" },
  { id: "N4", title: "Payment received", body: "Featured Listing x3 payment of ₹1,499 was successful.", time: "1 day ago", read: true, type: "payment" },
  { id: "N5", title: "RERA renewal due soon", body: "Nirvana Greens Phase II's RERA renewal is due in 14 days.", time: "2 days ago", read: true, type: "system" },
];
