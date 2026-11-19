export const FAQS = [
  {
    category: "About Pavitram",
    question: "What is Pavitram India?",
    answer:
      "Pavitram India is a self-reliant cooperative community where members fulfill each other's needs — from daily essentials to education, health, real estate, and financial services. It's a professionally managed network built on transparency, ethics, and collective growth.",
    order: 1,
  },
  {
    category: "About Pavitram",
    question: "What are the four pillars of the community?",
    answer:
      "The four pillars are: Intellectual Citizen (प्रबुद्ध नागरिक), Prosperous Family (समृद्ध परिवार), Self-Reliant Society (आत्मनिर्भर समाज), and Developed India (विकसित भारत). Together they represent our vision for a self-sustaining, empowered nation.",
    order: 2,
  },
  {
    category: "About Pavitram",
    question: "How does the community financially support its members?",
    answer:
      "Members benefit through reduced expenses via cooperative purchasing, income opportunities through the business network, investment returns of 12%+ through the cooperative model, and access to employment through Pavitram Rozgar.",
    order: 3,
  },
  {
    category: "Opportunities & Network",
    question: "What opportunities are available for individuals?",
    answer:
      "You can join as a Consumer (access ethical products/services), Merchant (grow your business), Investor (earn cooperative returns), or as a Career associate (find dignified employment matching your skills).",
    order: 4,
  },
  {
    category: "Opportunities & Network",
    question: "Who are the main collaborators of this network?",
    answer:
      "Our network includes government policy implementers, beneficiaries of government schemes, independent organizations, and community members across 15+ states in India.",
    order: 5,
  },
  {
    category: "Opportunities & Network",
    question: "What is the Pavitram Business Network?",
    answer:
      "It is a professionally managed cooperative business network spanning 15+ states with 10,000+ members. It connects consumers, merchants, investors, and career associates through ethical, transparent, and mutually beneficial partnerships.",
    order: 6,
  },
  {
    category: "Services",
    question: "What is Pavitram Mart?",
    answer:
      "Pavitram Mart is a multi-category, multi-vendor, multi-location B2B and B2C e-commerce platform where all products are available in one place at fair cooperative prices.",
    order: 7,
  },
  {
    category: "Services",
    question: "What solutions are provided under Pavitram Properties?",
    answer:
      "Pavitram Properties offers complete solutions for all property-related needs including buying, selling, renting, and investment in real estate across India.",
    order: 8,
  },
  {
    category: "Services",
    question: "What is Pavitram Gyan?",
    answer:
      "Pavitram Gyan is the education arm focused on awareness, skill development, and equal education access for all community members, regardless of background.",
    order: 9,
  },
  {
    category: "Services",
    question: "What is Pavitram Rozgar?",
    answer:
      "Pavitram Rozgar connects job seekers with dignified employment and business opportunities that match their qualifications, abilities, and personal interests within the cooperative network.",
    order: 10,
  },
];

export const TESTIMONIALS = [
  {
    name: "Suresh Kumar",
    role: "Government Employee · Bhopal",
    quote:
      "Pavitram India helped me understand my constitutional rights and connect with others who share the same values of equality and dignity.",
    order: 1,
  },
  {
    name: "Meena Devi",
    role: "Business Associate · Indore",
    quote:
      "As a small business owner, I found a community that supports ethical business practices and gives me access to genuine customers.",
    order: 2,
  },
  {
    name: "Ramesh Patel",
    role: "Community Member · Jabalpur",
    quote:
      "The health guidance and cooperative services have genuinely improved our family's quality of life. This is real community support.",
    order: 3,
  },
  {
    name: "Sunita Sharma",
    role: "Education Coordinator · Gwalior",
    quote:
      "Through Pavitram Gyan and Rozgar, our youth are gaining valuable skills and dignified employment right within our region.",
    order: 4,
  },
];

export const STATS = [
  { label: "Community Members", value: "10000+", icon: "UsersRound", order: 1 },
  { label: "Service Sectors", value: "12", icon: "Cpu", order: 2 },
  { label: "Golden Rules", value: "27", icon: "BookOpen", order: 3 },
  { label: "States Covered", value: "15+", icon: "Globe", order: 4 },
];

export const TEAM_MEMBERS = [
  {
    name: "Pavitram Leadership Council",
    role: "Founding Team",
    bio: "The founding council guiding Pavitram India's cooperative mission across all 12 service sectors. Update this from Super Admin with real leadership profiles.",
    order: 1,
  },
];

// ---------------------------------------------------------------------------
// Generic CMS Pages + Sections (About + sub-pages, Home narrative, Contact,
// Join, FAQ intros). Every field below is editable from the Super Admin
// "Pages" screen without touching code.
// ---------------------------------------------------------------------------

export const PAGES = [
  {
    slug: "home",
    title: "Pavitram India",
    hindi: "पवित्रम इंडिया",
    subtitle:
      "The dream of a prosperous, self-reliant India starts not in policy — but in people.",
    metaDescription:
      "Pavitram India connects 10,000+ members across 15+ states through a cooperative network of 12 services.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Pavitram India",
        hindi: "पवित्रम इंडिया",
        subtitle: "Pavitram India",
        body: {
          label: "Pavitram India",
          paragraph:
            "The dream of a prosperous, self-reliant India starts not in policy — but in people. Pavitram India brings that dream to life through a cooperative community where every farmer, every woman, every youth, and every family grows together — sharing resources, reducing costs, and building a better life from within.",
        },
        order: 1,
      },
      {
        key: "pillars",
        type: "ICON_CARDS",
        title: "The Four Pillars of Pavitram",
        hindi: "",
        subtitle: "Our Vision",
        body: {
          items: [
            { icon: "GraduationCap", title: "Intellectual Citizen", hindi: "प्रबुद्ध नागरिक", text: "Aware, educated, and rational citizen" },
            { icon: "Home", title: "Prosperous Family", hindi: "समृद्ध परिवार", text: "Ensuring availability of all basic needs, higher income, and lower expenses" },
            { icon: "Users", title: "Self-Reliant Society", hindi: "आत्मनिर्भर समाज", text: "Fulfilling all needs of the society by the society itself" },
            { icon: "Flag", title: "Developed India", hindi: "विकसित भारत", text: "Enlightened, prosperous, self-reliant, and developed India" },
          ],
        },
        order: 2,
      },
    ],
  },
  {
    slug: "about",
    title: "About Pavitram India",
    hindi: "हमारे बारे में",
    subtitle: "Our Story",
    metaDescription: "Learn about Pavitram India's story, mission and cooperative model.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "About Pavitram India",
        hindi: "हमारे बारे में",
        subtitle: "Our Story",
        body: { label: "Our Story" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-mission",
    title: "Empower Every Indian Family",
    hindi: "हमारा मिशन",
    subtitle: "Our Mission",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Empower Every Indian Family",
        hindi: "हमारा मिशन",
        subtitle: "Our Mission",
        body: {
          label: "Our Mission",
          statement:
            "To empower every Indian family by creating a transparent, ethical, and cooperative platform that connects people, businesses, and opportunities — making self-reliance a reality for all, not just a few.",
        },
        order: 1,
      },
    ],
  },
  {
    slug: "about-vision",
    title: "A Self-Reliant Tomorrow",
    hindi: "हमारी दृष्टि",
    subtitle: "Our Vision",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "A Self-Reliant Tomorrow",
        hindi: "हमारी दृष्टि",
        subtitle: "Our Vision",
        body: { label: "Our Vision" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-philosophy",
    title: "Vasudhaiva Kutumbakam",
    hindi: "वसुधैव कुटुम्बकम्",
    subtitle: "Our Philosophy",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Vasudhaiva Kutumbakam",
        hindi: "वसुधैव कुटुम्बकम्",
        subtitle: "Our Philosophy",
        body: { label: "Our Philosophy" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-ethics",
    title: "Ethical Governance & Roadmap",
    hindi: "नैतिकता एवं आचार संहिता",
    subtitle:
      "The ethical roadmap and guidelines that protect member interests and ensure zero corruption across Pavitram India.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Ethical Governance & Roadmap",
        hindi: "नैतिकता एवं आचार संहिता",
        subtitle:
          "The ethical roadmap and guidelines that protect member interests and ensure zero corruption across Pavitram India.",
        body: { label: "OUR ETHICS" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-values",
    title: "Five Core Values",
    hindi: "पंच मूल्य",
    subtitle: "The bedrock principles guiding every decision, partnership, and service in Pavitram India.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Five Core Values",
        hindi: "पंच मूल्य",
        subtitle: "The bedrock principles guiding every decision, partnership, and service in Pavitram India.",
        body: { label: "OUR VALUES" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-focus",
    title: "Empowering 4 Key Pillars of India",
    hindi: "हमारा ध्यान — गरीब, युवा, महिला, किसान",
    subtitle: "Targeted cooperative initiatives for Economically Weaker Families, Youth, Women, and Farmers.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Empowering 4 Key Pillars of India",
        hindi: "हमारा ध्यान — गरीब, युवा, महिला, किसान",
        subtitle: "Targeted cooperative initiatives for Economically Weaker Families, Youth, Women, and Farmers.",
        body: { label: "OUR FOCUS" },
        order: 1,
      },
    ],
  },
  {
    slug: "about-network",
    title: "The Pavitram Business Network",
    hindi: "व्यापार नेटवर्क",
    subtitle: "Cooperative. Transparent. Nationwide.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "The Pavitram Business Network",
        hindi: "व्यापार नेटवर्क",
        subtitle: "Cooperative. Transparent. Nationwide.",
        body: {
          label: "BUSINESS NETWORK",
          paragraph:
            "A professionally managed cooperative business network connecting 10,000+ members across 15+ states — built on ethics, transparency, and collective growth.",
        },
        order: 1,
      },
    ],
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    hindi: "अक्सर पूछे जाने वाले प्रश्न",
    subtitle: "Answers about Pavitram India, opportunities, and services.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Frequently Asked Questions",
        hindi: "अक्सर पूछे जाने वाले प्रश्न",
        subtitle: "Answers about Pavitram India, opportunities, and services.",
        body: { label: "FAQ" },
        order: 1,
      },
    ],
  },
  {
    slug: "contact",
    title: "Get in Touch",
    hindi: "संपर्क करें",
    subtitle: "Have questions, partnership inquiries, or need support? Reach out to our dedicated cooperative support team.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Get in Touch",
        hindi: "संपर्क करें",
        subtitle: "Have questions, partnership inquiries, or need support? Reach out to our dedicated cooperative support team.",
        body: { label: "CONTACT US" },
        order: 1,
      },
    ],
  },
  {
    slug: "join",
    title: "Become a Community Member",
    hindi: "समुदाय में शामिल हों",
    subtitle: "Fill in your details below to register with Pavitram India and connect with 10,000+ network partners across India.",
    sections: [
      {
        key: "hero",
        type: "HERO",
        title: "Become a Community Member",
        hindi: "समुदाय में शामिल हों",
        subtitle: "Fill in your details below to register with Pavitram India and connect with 10,000+ network partners across India.",
        body: { label: "JOIN COMMUNITY" },
        order: 1,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Site-wide settings — every field editable from Super Admin > Settings
// ---------------------------------------------------------------------------

export const SETTINGS = [
  { key: "site_name", value: "Pavitram India", group: "general", label: "Site Name", type: "text" },
  {
    key: "site_tagline_en",
    value: "Building Intellectual Citizens, Prosperous Families & Self-Reliant Society",
    group: "general",
    label: "Tagline (English)",
    type: "text",
  },
  {
    key: "site_tagline_hi",
    value: "प्रबुद्ध नागरिक | समृद्ध परिवार | आत्मनिर्भर समाज",
    group: "general",
    label: "Tagline (Hindi)",
    type: "text",
  },
  { key: "logo_url", value: "/pavitram-logo.jpg", group: "general", label: "Logo URL", type: "image" },
  { key: "contact_phone", value: "+91 98765 43210", group: "contact", label: "Support Phone", type: "text" },
  { key: "contact_phone_hours", value: "Mon - Sat: 9:00 AM - 7:00 PM", group: "contact", label: "Phone Support Hours", type: "text" },
  { key: "contact_email", value: "info@pavitramindia.org", group: "contact", label: "Primary Email", type: "text" },
  { key: "contact_email_support", value: "support@pavitramindia.org", group: "contact", label: "Support Email", type: "text" },
  {
    key: "contact_address",
    value: "Pavitram Elevate Tower, Commercial Hub, Indore & Bhopal, Madhya Pradesh — 452001",
    group: "contact",
    label: "Headquarters Address",
    type: "textarea",
  },
  { key: "contact_whatsapp", value: "+91 98765 43210", group: "contact", label: "WhatsApp Number", type: "text" },
  { key: "social_facebook", value: "https://facebook.com/pavitramindia", group: "social", label: "Facebook URL", type: "url" },
  { key: "social_instagram", value: "https://instagram.com/pavitramindia", group: "social", label: "Instagram URL", type: "url" },
  { key: "social_youtube", value: "https://youtube.com/@pavitramindia", group: "social", label: "YouTube URL", type: "url" },
  { key: "social_twitter", value: "https://twitter.com/pavitramindia", group: "social", label: "Twitter / X URL", type: "url" },
  {
    key: "footer_slogan",
    value: "Sabka Saath · Sabka Vikas · Sabka Vishwas · Sabka Prayaas",
    group: "footer",
    label: "Footer Slogan",
    type: "text",
  },
  { key: "footer_copyright", value: "© 2026 Pavitram India. All rights reserved.", group: "footer", label: "Copyright Text", type: "text" },
  { key: "properties_url", value: "https://realestate.pavitramindia.com/", group: "integrations", label: "Real Estate Portal URL", type: "url" },
];
