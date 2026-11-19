// ---------------------------------------------------------------------------
// Types mirroring the backend's main_* Prisma models (public-facing shape).
// ---------------------------------------------------------------------------

export type ApiFeature = { icon: string; title: string; desc: string };
export type ApiStep = { num: string; title: string; desc: string };

export type ApiService = {
  id: string;
  slug: string;
  name: string;
  hindi: string;
  tagline: string;
  heroIcon: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  pills: string[];
  whyUs: string[];
  features: ApiFeature[];
  steps: ApiStep[];
  dashboardDescription: string;
  dashboardHref: string;
  dashboardExternal: boolean;
  dashboardSso: boolean;
  dashboardAccent: string;
  showOnDashboard: boolean;
  order: number;
  isPublished: boolean;
};

export type ApiOppStep = { title: string; body: string };

export type ApiOpportunity = {
  id: string;
  slug: string;
  title: string;
  hindi: string;
  label: string;
  icon: string;
  intro: string;
  benefits: string[];
  steps: ApiOppStep[];
  order: number;
  isPublished: boolean;
};

export type ApiFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
};

export type ApiTestimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatarUrl: string | null;
  rating: number;
  order: number;
  isPublished: boolean;
};

export type ApiTeamMember = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  order: number;
  isPublished: boolean;
};

export type ApiStat = {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  order: number;
  isPublished: boolean;
};

export type ApiPageSection = {
  id: string;
  type: string;
  title: string | null;
  hindi: string | null;
  subtitle: string | null;
  body: Record<string, any>;
  order: number;
};

export type ApiPage = {
  slug: string;
  title: string;
  hindi: string | null;
  subtitle: string | null;
  metaDescription: string | null;
  sections: Record<string, ApiPageSection>;
};

export type ApiSettingsMap = Record<string, string>;
