// Mock data layer — stands in for the platform's real APIs so every
// dashboard can be demoed end-to-end with realistic, consistent numbers.

export type PipelineStage =
  | "Applied"
  | "Shortlisted"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export const pipelineStages: PipelineStage[] = [
  "Applied",
  "Shortlisted",
  "Assessment",
  "Interview",
  "Offer",
  "Hired",
];

export const seekerProfile = {
  name: "Ananya Kulkarni",
  headline: "Senior Product Designer · Fintech & B2B SaaS",
  location: "Bengaluru, Karnataka",
  profileStrength: 82,
  openToWork: true,
  avatarInitials: "AK",
  skills: [
    { name: "Product Design", verified: true },
    { name: "Figma", verified: true },
    { name: "Design Systems", verified: true },
    { name: "User Research", verified: false },
    { name: "Prototyping", verified: true },
    { name: "SQL", verified: false },
  ],
  resumeVersions: ["Product Design — Fintech.pdf", "General — UX Lead.pdf"],
};

export const recommendedJobs = [
  {
    id: "j1",
    title: "Senior Product Designer",
    company: "Anthropi Finserve",
    logo: "AF",
    location: "Bengaluru · Hybrid",
    salary: "₹28L – ₹38L",
    type: "Full-time",
    posted: "2 days ago",
    match: 94,
    skills: ["Figma", "Design Systems", "B2B SaaS"],
    experience: "5–8 years",
    openings: 2,
    applicants: 142,
    views: 892,
    education: "Any graduate, Design degree preferred",
    description:
      "Anthropi Finserve is looking for a Senior Product Designer to own the design of our lending and payments products end to end. You'll work closely with product managers and engineers to ship features used by 2 million small businesses.",
    responsibilities: [
      "Own end-to-end design for 1–2 product areas, from research to shipped feature",
      "Maintain and grow our design system used by 4 product teams",
      "Run user interviews and usability tests, and turn findings into design decisions",
      "Mentor 2 junior designers on the team",
    ],
    requirements: [
      "5+ years designing B2B or fintech products",
      "Strong portfolio showing end-to-end product thinking",
      "Expert in Figma, comfortable working in a design system",
      "Experience partnering closely with engineering",
    ],
    benefits: ["Health insurance for family", "Annual learning budget", "Flexible work hours", "ESOPs"],
    aboutCompany:
      "Anthropi Finserve builds lending and payments infrastructure for India's small businesses. Founded in 2019, the team is 500 people strong across Bengaluru, Pune, and remote.",
  },
  {
    id: "j2",
    title: "Lead UX Designer",
    company: "Nimbus Health",
    logo: "NH",
    location: "Remote",
    salary: "₹32L – ₹42L",
    type: "Full-time",
    posted: "1 day ago",
    match: 89,
    skills: ["Healthcare", "Prototyping", "Research"],
    experience: "7–10 years",
    openings: 1,
    applicants: 98,
    views: 654,
    education: "Any graduate",
    description:
      "Nimbus Health is building the operating system for Indian clinics. As Lead UX Designer, you'll shape the doctor and patient experience across our web and mobile apps.",
    responsibilities: [
      "Lead UX strategy for the clinical workflow product line",
      "Set up and run a research practice with doctors and clinic staff",
      "Partner with the founder on product direction",
    ],
    requirements: [
      "7+ years in UX, ideally in healthcare or another regulated space",
      "Comfortable talking to doctors and non-technical users",
      "Strong prototyping skills",
    ],
    benefits: ["Remote-first", "Health insurance", "Annual offsite", "Latest MacBook"],
    aboutCompany:
      "Nimbus Health is a 120-person healthtech startup helping clinics in tier-2 India go digital. Backed by leading healthcare investors.",
  },
  {
    id: "j3",
    title: "Product Designer II",
    company: "Kesari Retail Tech",
    logo: "KR",
    location: "Pune · On-site",
    salary: "₹18L – ₹24L",
    type: "Full-time",
    posted: "4 days ago",
    match: 81,
    skills: ["E-commerce", "Design Systems"],
    experience: "3–5 years",
    openings: 3,
    applicants: 210,
    views: 1140,
    education: "Any graduate, Design degree preferred",
    description:
      "Kesari Retail Tech powers the online storefronts of 40,000+ Indian retailers. We're hiring a Product Designer to work on our merchant-facing dashboard.",
    responsibilities: [
      "Design merchant-facing dashboard features",
      "Work with the design system team to keep patterns consistent",
      "Ship fast — we release weekly",
    ],
    requirements: ["3+ years product design experience", "E-commerce or dashboard/B2B experience a plus", "Good communication in English and Hindi"],
    benefits: ["Provident fund", "Health insurance", "Free lunch", "Performance bonus"],
    aboutCompany:
      "Kesari Retail Tech is Pune's fastest-growing retail-tech company, helping small and medium retailers sell online.",
  },
  {
    id: "j4",
    title: "Design Systems Lead",
    company: "Vertex Cloud",
    logo: "VC",
    location: "Hyderabad · Hybrid",
    salary: "₹35L – ₹45L",
    type: "Full-time",
    posted: "6 hours ago",
    match: 91,
    skills: ["Design Systems", "Figma", "Leadership"],
    experience: "6–9 years",
    openings: 1,
    applicants: 61,
    views: 410,
    education: "Any graduate",
    description:
      "Vertex Cloud is hiring a Design Systems Lead to build and scale our component library across 12 product teams and 3 platforms.",
    responsibilities: [
      "Own the roadmap for our cross-platform design system",
      "Work with engineering to keep design and code in sync",
      "Run office hours and training for product designers",
    ],
    requirements: ["6+ years product design, 2+ years owning a design system", "Strong Figma and front-end (HTML/CSS) literacy", "Experience leading without direct reports"],
    benefits: ["Health insurance", "Stock options", "Learning stipend", "Hybrid — 2 days in office"],
    aboutCompany:
      "Vertex Cloud builds developer infrastructure used by over 8,000 companies worldwide, with an engineering hub in Hyderabad.",
  },
  {
    id: "j5",
    title: "Freelance Product Designer",
    company: "Studio Baaki",
    logo: "SB",
    location: "Remote · Contract",
    salary: "₹8,000/day",
    type: "Freelance",
    posted: "3 days ago",
    match: 74,
    skills: ["Branding", "Prototyping"],
    experience: "2+ years",
    openings: 2,
    applicants: 37,
    views: 205,
    education: "Any graduate",
    description:
      "Studio Baaki is a design studio working with early-stage startups. We need a freelance product designer for a 3-month engagement, roughly 20 hours a week.",
    responsibilities: ["Design a new onboarding flow for a fintech client", "Deliver weekly design reviews", "Work directly with the client's founder"],
    requirements: ["2+ years freelance or agency design experience", "Can commit 20 hrs/week for 3 months", "Portfolio of shipped consumer or fintech products"],
    benefits: ["Flexible hours", "Fully remote", "Possible extension"],
    aboutCompany: "Studio Baaki is a 6-person independent design studio based in Goa, working with founders across India.",
  },
];

export function getJobById(id: string) {
  return recommendedJobs.find((j) => j.id === id);
}

export function similarJobs(id: string) {
  return recommendedJobs.filter((j) => j.id !== id).slice(0, 3);
}

export const seekerApplications = [
  { id: "a1", job: "Senior Product Designer", company: "Anthropi Finserve", stage: "Interview" as PipelineStage, applied: "12 Aug", updated: "19 Aug" },
  { id: "a2", job: "Lead UX Designer", company: "Nimbus Health", stage: "Shortlisted" as PipelineStage, applied: "10 Aug", updated: "17 Aug" },
  { id: "a3", job: "Design Systems Lead", company: "Vertex Cloud", stage: "Applied" as PipelineStage, applied: "20 Aug", updated: "20 Aug" },
  { id: "a4", job: "Product Designer II", company: "Kesari Retail Tech", stage: "Offer" as PipelineStage, applied: "28 Jul", updated: "18 Aug" },
  { id: "a5", job: "UX Researcher", company: "Orbit Mobility", stage: "Rejected" as PipelineStage, applied: "02 Aug", updated: "09 Aug" },
  { id: "a6", job: "Principal Designer", company: "Lumen Bank", stage: "Assessment" as PipelineStage, applied: "14 Aug", updated: "16 Aug" },
];

export const savedJobs = recommendedJobs.slice(0, 3);

export const seekerNetwork = {
  connections: 486,
  pendingInvites: 7,
  feed: [
    {
      id: "p1",
      author: "Rhea Sen",
      role: "Engineering Manager at Vertex Cloud",
      time: "3h",
      content:
        "We're opening 4 new roles on the platform team this quarter — reach out if you know strong backend engineers looking to build at scale.",
      likes: 128,
      comments: 14,
    },
    {
      id: "p2",
      author: "Kabir Anand",
      role: "Talent Partner at Nimbus Health",
      time: "1d",
      content:
        "Hot take: a well-structured skills section beats a two-page resume every time. Recruiters scan, they don't read.",
      likes: 342,
      comments: 51,
    },
    {
      id: "p3",
      author: "Meera Iyer",
      role: "Alumni · IIT Bombay",
      time: "2d",
      content:
        "Just completed the Advanced Data Storytelling certification on JobConnect Learning. Genuinely useful for anyone in product analytics.",
      likes: 76,
      comments: 6,
    },
  ],
  suggestions: [
    { name: "Aditya Rao", role: "Staff Designer, Lumen Bank", mutual: 12 },
    { name: "Priya Menon", role: "Recruiter, Orbit Mobility", mutual: 5 },
    { name: "Farhan Sheikh", role: "Design Lead, Kesari Retail", mutual: 9 },
  ],
};

// ---------------- Employer ----------------

export const employerCompany = {
  name: "Anthropi Finserve",
  verified: true,
  plan: "Growth — 40 credits/mo",
  credits: 26,
  creditsTotal: 40,
  logo: "AF",
};

export const employerJobs = [
  { id: "ej1", title: "Senior Product Designer", dept: "Design", location: "Bengaluru", applicants: 142, status: "Live", posted: "12 Aug", expiresIn: "18 days", sponsored: true },
  { id: "ej2", title: "Backend Engineer (Node.js)", dept: "Engineering", location: "Remote", applicants: 268, status: "Live", posted: "08 Aug", expiresIn: "12 days", sponsored: false },
  { id: "ej3", title: "Growth Marketing Manager", dept: "Marketing", location: "Bengaluru", applicants: 74, status: "Draft", posted: "—", expiresIn: "—", sponsored: false },
  { id: "ej4", title: "Customer Success Associate", dept: "Support", location: "Mumbai", applicants: 91, status: "Expiring", posted: "22 Jul", expiresIn: "2 days", sponsored: false },
  { id: "ej5", title: "QA Automation Engineer", dept: "Engineering", location: "Pune", applicants: 53, status: "Live", posted: "15 Aug", expiresIn: "24 days", sponsored: true },
  { id: "ej6", title: "Finance Intern", dept: "Finance", location: "Bengaluru", applicants: 210, status: "Closed", posted: "01 Jul", expiresIn: "—", sponsored: false },
];

export type Candidate = {
  id: string;
  name: string;
  initials: string;
  role: string;
  experience: string;
  location: string;
  ctc: string;
  notice: string;
  score: number;
  stage: PipelineStage;
  skills: string[];
  appliedFor: string;
};

export const candidates: Candidate[] = [
  { id: "c1", name: "Ishaan Verma", initials: "IV", role: "Senior Product Designer", experience: "6 yrs", location: "Bengaluru", ctc: "₹24L", notice: "30 days", score: 96, stage: "Interview", skills: ["Figma", "Design Systems"], appliedFor: "Senior Product Designer" },
  { id: "c2", name: "Ananya Kulkarni", initials: "AK", role: "Senior Product Designer", experience: "7 yrs", location: "Bengaluru", ctc: "₹27L", notice: "60 days", score: 94, stage: "Interview", skills: ["Figma", "B2B SaaS"], appliedFor: "Senior Product Designer" },
  { id: "c3", name: "Devansh Oberoi", initials: "DO", role: "Backend Engineer", experience: "4 yrs", location: "Remote", ctc: "₹19L", notice: "15 days", score: 90, stage: "Shortlisted", skills: ["Node.js", "PostgreSQL"], appliedFor: "Backend Engineer (Node.js)" },
  { id: "c4", name: "Sara Thomas", initials: "ST", role: "Backend Engineer", experience: "5 yrs", location: "Kochi", ctc: "₹22L", notice: "45 days", score: 87, stage: "Assessment", skills: ["Node.js", "AWS"], appliedFor: "Backend Engineer (Node.js)" },
  { id: "c5", name: "Rohan Mehta", initials: "RM", role: "Product Designer", experience: "3 yrs", location: "Pune", ctc: "₹14L", notice: "30 days", score: 78, stage: "Applied", skills: ["Prototyping", "Research"], appliedFor: "Senior Product Designer" },
  { id: "c6", name: "Neha Chawla", initials: "NC", role: "QA Automation Engineer", experience: "4 yrs", location: "Pune", ctc: "₹16L", notice: "20 days", score: 85, stage: "Offer", skills: ["Selenium", "Cypress"], appliedFor: "QA Automation Engineer" },
  { id: "c7", name: "Aman Gill", initials: "AG", role: "Backend Engineer", experience: "8 yrs", location: "Delhi NCR", ctc: "₹34L", notice: "90 days", score: 92, stage: "Hired", skills: ["Node.js", "System Design"], appliedFor: "Backend Engineer (Node.js)" },
  { id: "c8", name: "Priyanka Das", initials: "PD", role: "Product Designer", experience: "2 yrs", location: "Kolkata", ctc: "₹9L", notice: "Immediate", score: 68, stage: "Rejected", skills: ["Figma", "Illustration"], appliedFor: "Senior Product Designer" },
];

export const funnelData = [
  { stage: "Applied", value: 484 },
  { stage: "Shortlisted", value: 212 },
  { stage: "Assessment", value: 138 },
  { stage: "Interview", value: 76 },
  { stage: "Offer", value: 24 },
  { stage: "Hired", value: 17 },
];

export const timeToHireTrend = [
  { month: "Mar", days: 34 },
  { month: "Apr", days: 31 },
  { month: "May", days: 29 },
  { month: "Jun", days: 27 },
  { month: "Jul", days: 24 },
  { month: "Aug", days: 22 },
];

export const sourceOfHire = [
  { source: "Direct search", value: 38 },
  { source: "AI matching", value: 27 },
  { source: "Sourced outreach", value: 19 },
  { source: "Referral", value: 11 },
  { source: "Job alert", value: 5 },
];

// ---------------- Admin ----------------

export const platformMetrics = {
  activeSeekers: 486213,
  seekerGrowth: 8.4,
  activeEmployers: 12840,
  employerGrowth: 5.1,
  liveJobs: 38492,
  jobsGrowth: 12.3,
  applicationsToday: 91204,
  matchSuccessRate: 61.8,
};

export const growthTrend = [
  { month: "Mar", seekers: 398000, employers: 10200 },
  { month: "Apr", seekers: 418000, employers: 10800 },
  { month: "May", seekers: 437000, employers: 11300 },
  { month: "Jun", seekers: 452000, employers: 11700 },
  { month: "Jul", seekers: 469000, employers: 12300 },
  { month: "Aug", seekers: 486213, employers: 12840 },
];

export const revenueTrend = [
  { month: "Mar", mrr: 4210000 },
  { month: "Apr", mrr: 4460000 },
  { month: "May", mrr: 4720000 },
  { month: "Jun", mrr: 5040000 },
  { month: "Jul", mrr: 5380000 },
  { month: "Aug", mrr: 5790000 },
];

export const revenueSplit = [
  { plan: "Job-posting credits", value: 42 },
  { plan: "Resume DB access", value: 24 },
  { plan: "Featured listings", value: 19 },
  { plan: "Seeker premium", value: 15 },
];

export const moderationQueue = [
  { id: "m1", title: "Urgent Hiring — Work From Home, ₹1.2L/week guaranteed", company: "QuickEarn Pvt Ltd", flag: "Unrealistic salary", risk: "High" },
  { id: "m2", title: "Data Entry Executive", company: "BrightPath Solutions", flag: "Requests upfront payment", risk: "High" },
  { id: "m3", title: "Senior React Developer", company: "Novatech Systems", flag: "Domain mismatch with email", risk: "Medium" },
  { id: "m4", title: "Telecaller — Immediate Joining", company: "CallHive Media", flag: "Duplicate posting pattern", risk: "Medium" },
  { id: "m5", title: "Graphic Design Intern", company: "PixelForge Studio", flag: "Keyword spam in description", risk: "Low" },
];

export const userAccounts = [
  { id: "u1", name: "Ishaan Verma", type: "Job Seeker", status: "Active", joined: "14 Jan 2025", flags: 0 },
  { id: "u2", name: "Anthropi Finserve", type: "Employer", status: "Verified", joined: "03 Nov 2024", flags: 0 },
  { id: "u3", name: "QuickEarn Pvt Ltd", type: "Employer", status: "KYC Pending", joined: "18 Aug 2026", flags: 3 },
  { id: "u4", name: "Sara Thomas", type: "Job Seeker", status: "Active", joined: "22 Feb 2025", flags: 0 },
  { id: "u5", name: "BrightPath Solutions", type: "Employer", status: "Suspended", joined: "30 Jun 2026", flags: 5 },
  { id: "u6", name: "Nimbus Health", type: "Employer", status: "Verified", joined: "11 Sep 2024", flags: 0 },
  { id: "u7", name: "Priyanka Das", type: "Job Seeker", status: "Suspended", joined: "05 May 2025", flags: 2 },
];

export const supportTickets = [
  { id: "t1", subject: "Refund for featured listing not applied", from: "Kesari Retail Tech", sla: "2h left", priority: "High" },
  { id: "t2", subject: "Can't verify company domain", from: "Orbit Mobility", sla: "5h left", priority: "Medium" },
  { id: "t3", subject: "Duplicate profile merge request", from: "Rohan Mehta", sla: "1d left", priority: "Low" },
];

// ---------------- Companies (public profile pages) ----------------

export const companies = [
  {
    id: "co1",
    name: "Anthropi Finserve",
    logo: "AF",
    industry: "Financial Services",
    size: "500–1,000 employees",
    hq: "Bengaluru, India",
    founded: "2019",
    rating: 4.3,
    reviews: 286,
    followers: 12400,
    about:
      "Anthropi Finserve builds lending and payments infrastructure for India's small businesses, serving over 2 million merchants across the country.",
    photos: 3,
    openJobIds: ["j1"],
  },
  {
    id: "co2",
    name: "Nimbus Health",
    logo: "NH",
    industry: "Healthcare Technology",
    size: "100–500 employees",
    hq: "Remote-first, India",
    founded: "2021",
    rating: 4.5,
    reviews: 94,
    followers: 5200,
    about:
      "Nimbus Health is building the operating system for Indian clinics — appointments, records, and billing in one app.",
    photos: 2,
    openJobIds: ["j2"],
  },
  {
    id: "co3",
    name: "Vertex Cloud",
    logo: "VC",
    industry: "Cloud Infrastructure",
    size: "1,000+ employees",
    hq: "Hyderabad, India",
    founded: "2016",
    rating: 4.1,
    reviews: 512,
    followers: 31000,
    about:
      "Vertex Cloud builds developer infrastructure used by over 8,000 companies worldwide, with a large engineering hub in Hyderabad.",
    photos: 4,
    openJobIds: ["j4"],
  },
];

export const companyReviews = [
  { id: "r1", companyId: "co1", author: "Former Product Designer", rating: 5, title: "Great team, real ownership", body: "Small teams, real ownership of features, and leadership actually listens to design. Growth was fast for me here.", date: "Jun 2026" },
  { id: "r2", companyId: "co1", author: "Current Engineer", rating: 4, title: "Good pace, occasional crunch", body: "Solid engineering culture. Release cycles can get intense around quarter-end but it's manageable.", date: "Apr 2026" },
  { id: "r3", companyId: "co1", author: "Former Sales Associate", rating: 3, title: "Good learning, average pay hikes", body: "Learned a lot in my 2 years here. Pay hikes were below market in my last cycle though.", date: "Feb 2026" },
];

// ---------------- Notifications (seeker) ----------------

export const notifications = [
  { id: "n1", type: "match", title: "New job match: 94% fit", body: "Senior Product Designer at Anthropi Finserve matches your profile.", time: "10m ago", read: false },
  { id: "n2", type: "status", title: "Application shortlisted", body: "Nimbus Health shortlisted you for Lead UX Designer.", time: "2h ago", read: false },
  { id: "n3", type: "message", title: "New message", body: "Kabir Anand sent you a message about Lead UX Designer.", time: "3h ago", read: false },
  { id: "n4", type: "view", title: "Your profile was viewed", body: "A recruiter from Vertex Cloud viewed your profile.", time: "6h ago", read: true },
  { id: "n5", type: "interview", title: "Interview scheduled", body: "Your interview for Senior Product Designer is on 26 Aug, 3:00 PM.", time: "1d ago", read: true },
  { id: "n6", type: "connection", title: "New connection request", body: "Aditya Rao wants to connect with you.", time: "2d ago", read: true },
  { id: "n7", type: "digest", title: "Weekly digest", body: "12 new jobs matching \"Product Design\" were posted this week.", time: "3d ago", read: true },
];

// ---------------- Messages (shared shape for seeker + employer) ----------------

export const seekerConversations = [
  {
    id: "c1",
    name: "Kabir Anand",
    role: "Talent Partner, Nimbus Health",
    lastMessage: "Would 3pm on Wednesday work for a quick call?",
    time: "3h",
    unread: 2,
    messages: [
      { from: "them", text: "Hi Ananya, loved your portfolio — especially the fintech onboarding case study.", time: "Mon 10:12 AM" },
      { from: "them", text: "We'd love to set up a first call for the Lead UX Designer role.", time: "Mon 10:13 AM" },
      { from: "me", text: "Thank you! I'd be happy to chat. I'm free most afternoons this week.", time: "Mon 11:40 AM" },
      { from: "them", text: "Would 3pm on Wednesday work for a quick call?", time: "Mon 2:05 PM" },
    ],
  },
  {
    id: "c2",
    name: "Rhea Sen",
    role: "Engineering Manager, Vertex Cloud",
    lastMessage: "Thanks for applying! We'll review and get back within a week.",
    time: "1d",
    unread: 0,
    messages: [
      { from: "them", text: "Thanks for applying! We'll review and get back within a week.", time: "Sun 6:20 PM" },
    ],
  },
  {
    id: "c3",
    name: "Meera Iyer",
    role: "Alumni · IIT Bombay",
    lastMessage: "Congrats on the new certification!",
    time: "2d",
    unread: 0,
    messages: [
      { from: "them", text: "Congrats on the new certification!", time: "Fri 9:00 AM" },
      { from: "me", text: "Thank you Meera! Took a while but worth it.", time: "Fri 9:45 AM" },
    ],
  },
];

export const employerConversations = [
  {
    id: "ec1",
    name: "Ishaan Verma",
    role: "Applied for Senior Product Designer",
    lastMessage: "Looking forward to the interview on Thursday.",
    time: "1h",
    unread: 1,
    messages: [
      { from: "them", text: "Hi, thanks for shortlisting me! Happy to share more work samples if useful.", time: "Today 9:10 AM" },
      { from: "me", text: "That would be great — please send 2 case studies before Thursday.", time: "Today 9:40 AM" },
      { from: "them", text: "Looking forward to the interview on Thursday.", time: "Today 10:02 AM" },
    ],
  },
  {
    id: "ec2",
    name: "Devansh Oberoi",
    role: "Applied for Backend Engineer (Node.js)",
    lastMessage: "Sure, I can join the call at 4pm.",
    time: "5h",
    unread: 0,
    messages: [
      { from: "me", text: "Can you join a quick technical screen this week?", time: "Today 8:00 AM" },
      { from: "them", text: "Sure, I can join the call at 4pm.", time: "Today 8:30 AM" },
    ],
  },
];

// ---------------- Skill assessments ----------------

export const assessments = [
  { id: "as1", title: "Figma & Prototyping", questions: 15, minutes: 20, level: "Intermediate", status: "completed", score: 88 },
  { id: "as2", title: "Design Systems Fundamentals", questions: 20, minutes: 25, level: "Advanced", status: "available" },
  { id: "as3", title: "User Research Methods", questions: 12, minutes: 15, level: "Beginner", status: "available" },
  { id: "as4", title: "SQL for Product Teams", questions: 18, minutes: 20, level: "Intermediate", status: "in_progress", progress: 40 },
];

export const sampleQuiz = [
  {
    id: "q1",
    prompt: "In Figma, what is the fastest way to turn a group of layers into a reusable component?",
    options: ["Right-click → Create Component", "File → Export", "Duplicate the layer", "Group → Rename"],
    answer: 0,
  },
  {
    id: "q2",
    prompt: "Auto Layout in Figma is mainly used to:",
    options: ["Add drop shadows", "Make frames resize responsively based on content", "Export assets faster", "Add page transitions"],
    answer: 1,
  },
  {
    id: "q3",
    prompt: "Which is a core principle of a good design system?",
    options: ["Every screen should look different", "Consistency and reuse of components", "Designers should avoid documentation", "Skip accessibility to move faster"],
    answer: 1,
  },
];

// ---------------- Job alerts ----------------

export const jobAlerts = [
  { id: "al1", query: "Product Designer", location: "Bengaluru", frequency: "Daily", matches: 12, active: true },
  { id: "al2", query: "UX Lead", location: "Remote", frequency: "Weekly", matches: 5, active: true },
  { id: "al3", query: "Design Systems", location: "Any", frequency: "Daily", matches: 8, active: false },
];

// ---------------- Salary insights ----------------

export const salaryInsights = {
  role: "Product Designer",
  city: "Bengaluru",
  median: 2200000,
  min: 1200000,
  max: 4500000,
  byExperience: [
    { years: "0–2", salary: 900000 },
    { years: "2–5", salary: 1600000 },
    { years: "5–8", salary: 2600000 },
    { years: "8–12", salary: 3800000 },
    { years: "12+", salary: 5200000 },
  ],
  byCity: [
    { city: "Bengaluru", salary: 2200000 },
    { city: "Mumbai", salary: 2100000 },
    { city: "Delhi NCR", salary: 2000000 },
    { city: "Hyderabad", salary: 1900000 },
    { city: "Pune", salary: 1750000 },
  ],
};

// ---------------- Employer talent pool (saved candidates) ----------------

export const talentPool = candidates.slice(0, 5).map((c) => ({ ...c, savedOn: "12 Aug 2026", tag: "Design hires" }));

// ---------------- Full profile (LinkedIn-style) ----------------

export const profileExperience = [
  { id: "pe1", role: "Senior Product Designer", company: "Lumen Bank", from: "Jan 2023", to: "Present", location: "Bengaluru", desc: "Leading design for the consumer lending product line. Built and scaled the design system now used by 4 teams." },
  { id: "pe2", role: "Product Designer", company: "Orbit Mobility", from: "Jun 2020", to: "Dec 2022", location: "Bengaluru", desc: "Designed the driver-onboarding and earnings experience. Raised onboarding completion from 61% to 88%." },
  { id: "pe3", role: "UI/UX Designer", company: "PixelCraft Studio", from: "Jul 2018", to: "May 2020", location: "Pune", desc: "Worked across 6 client projects spanning fintech, edtech, and D2C brands." },
];

export const profileEducation = [
  { id: "pd1", school: "IIT Bombay", degree: "B.Des, Industrial Design", year: "2014 – 2018" },
];

export const profileRecommendations = [
  { id: "rec1", author: "Rhea Sen", role: "Engineering Manager, Vertex Cloud", relation: "Worked with Ananya at Orbit Mobility", text: "Ananya has a rare mix of visual craft and product thinking. She turned a confusing onboarding flow into our best-converting screen in the app." },
  { id: "rec2", author: "Kabir Anand", role: "Talent Partner, Nimbus Health", relation: "Managed Ananya directly", text: "One of the most reliable designers I've worked with — always ships on time, and pushes back constructively when a request doesn't serve the user." },
];

export const profileViewers = {
  total: 214,
  last7days: 42,
  trend: [
    { day: "Mon", views: 24 },
    { day: "Tue", views: 31 },
    { day: "Wed", views: 19 },
    { day: "Thu", views: 38 },
    { day: "Fri", views: 45 },
    { day: "Sat", views: 22 },
    { day: "Sun", views: 35 },
  ],
  recentViewers: [
    { name: "Recruiter at Vertex Cloud", role: "Talent Acquisition", time: "2h ago" },
    { name: "Meera Iyer", role: "Alumni · IIT Bombay", time: "5h ago" },
    { name: "Recruiter at Lumen Bank", role: "Talent Acquisition", time: "1d ago" },
    { name: "Aditya Rao", role: "Staff Designer, Lumen Bank", time: "2d ago" },
  ],
  industries: [
    { name: "Financial Services", value: 38 },
    { name: "Healthcare Tech", value: 24 },
    { name: "E-commerce", value: 21 },
    { name: "Other", value: 17 },
  ],
};

// ---------------- People search (LinkedIn-style) ----------------

export const people = [
  { id: "p1", name: "Aditya Rao", role: "Staff Designer", company: "Lumen Bank", location: "Bengaluru", mutual: 12, connected: false },
  { id: "p2", name: "Priya Menon", role: "Recruiter", company: "Orbit Mobility", location: "Bengaluru", mutual: 5, connected: false },
  { id: "p3", name: "Farhan Sheikh", role: "Design Lead", company: "Kesari Retail Tech", location: "Pune", mutual: 9, connected: false },
  { id: "p4", name: "Rhea Sen", role: "Engineering Manager", company: "Vertex Cloud", location: "Hyderabad", mutual: 18, connected: true },
  { id: "p5", name: "Kabir Anand", role: "Talent Partner", company: "Nimbus Health", location: "Remote", mutual: 14, connected: true },
  { id: "p6", name: "Meera Iyer", role: "Data Analyst", company: "Alumni · IIT Bombay", location: "Mumbai", mutual: 22, connected: true },
  { id: "p7", name: "Sara Thomas", role: "Backend Engineer", company: "Lumen Bank", location: "Kochi", mutual: 3, connected: false },
  { id: "p8", name: "Devansh Oberoi", role: "Backend Engineer", company: "Anthropi Finserve", location: "Remote", mutual: 7, connected: false },
];

// ---------------- Learning / courses ----------------

export const courses = [
  { id: "cr1", title: "Advanced Design Systems", provider: "JobConnect Learning", hours: 6, level: "Advanced", progress: 65, enrolled: true },
  { id: "cr2", title: "User Research Foundations", provider: "JobConnect Learning", hours: 4, level: "Beginner", progress: 100, enrolled: true },
  { id: "cr3", title: "Figma for Teams", provider: "JobConnect Learning", hours: 3, level: "Intermediate", progress: 0, enrolled: false },
  { id: "cr4", title: "Data Storytelling for Product Teams", provider: "JobConnect Learning", hours: 5, level: "Intermediate", progress: 0, enrolled: false },
  { id: "cr5", title: "Negotiating Your Salary", provider: "JobConnect Learning", hours: 1, level: "Beginner", progress: 0, enrolled: false },
  { id: "cr6", title: "SQL for Product & Design Teams", provider: "JobConnect Learning", hours: 4, level: "Beginner", progress: 0, enrolled: false },
];

// ---------------- Interview preparation ----------------

export const interviewPrepTopics = [
  {
    id: "ip1",
    title: "Product Design interviews",
    questions: [
      { q: "Walk me through your design process for a recent project.", tip: "Use a clear structure: problem, research, iterations, outcome. Keep it under 3 minutes." },
      { q: "How do you handle disagreement with a product manager?", tip: "Show you use data and user insight to resolve disagreements, not just opinion." },
      { q: "Design a better version of a common app screen.", tip: "Ask clarifying questions first — who's the user, what's the goal — before jumping to solutions." },
    ],
  },
  {
    id: "ip2",
    title: "Behavioral questions",
    questions: [
      { q: "Tell me about a time you missed a deadline.", tip: "Own the mistake briefly, then focus on what you changed afterward." },
      { q: "Describe a conflict with a teammate and how you resolved it.", tip: "Focus on the resolution and what you learned, not on who was right." },
    ],
  },
  {
    id: "ip3",
    title: "Salary negotiation",
    questions: [
      { q: "What are your salary expectations?", tip: "Give a range based on market data, not a single number, and let them respond first if possible." },
    ],
  },
];

// ---------------- Premium plans (seeker) ----------------

export const seekerPremiumPlans = [
  { name: "Basic", price: "Free", perks: ["Apply to unlimited jobs", "Basic profile", "Job alerts"] },
  { name: "Premium", price: "₹499/mo", perks: ["See who viewed your profile", "Priority application badge", "Salary insights", "1 free resume review"], current: false, highlight: true },
  { name: "Career Pro", price: "₹999/mo", perks: ["Everything in Premium", "Direct recruiter messages", "Unlimited resume reviews", "Interview prep 1:1 session"] },
];
