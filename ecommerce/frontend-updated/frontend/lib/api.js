// lib/api.js
//
// Thin HTTP client for the pavitram-backend-COMPLETE NestJS API.
// Every resource the backend exposes gets a matching set of functions here
// (list / get / create / update / remove), so lib/store.js never has to
// build fetch() calls or URLs by hand.
//
// This file talks ONLY to the main Pavitram API (products, orders, vendors,
// cart, wishlist, admin CMS resources, etc). Login/signup are handled
// separately in lib/authApi.js against a different backend, per the
// project's instructions.

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(/\/$/, "");

function qs(params = {}) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

function authHeaders() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("pavitram_auth_v1");
    const auth = raw ? JSON.parse(raw) : null;
    return auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = "GET", body, headers, isForm = false } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || "Request failed";
    const err = new Error(Array.isArray(message) ? message.join(", ") : message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Generic CRUD factory — one call per resource covers the standard
// Post() / Get() / Get(:id) / Patch(:id) / Delete(:id) controller shape that
// ~28 of the backend's modules share (categories, banners, coupons,
// support-tickets, notification-rules, integrations, security-settings,
// activity-logs, gst-summary, hero-stats, gmv-trends, cohorts,
// vendor-scorecards, languages, saved-addresses, credit-notes,
// b2b-invoices, sample-orders, receivables, contract-pricing,
// team-members, rfqs, products, vendors, vendor-reviews, business-buyers,
// orders, users). Coupons use "code" as the id param but that's transparent
// here since it's just whatever string you pass as id.
// ---------------------------------------------------------------------------
function resource(path, { idParam = "id" } = {}) {
  return {
    list: (params) => request(`${path}${qs(params)}`),
    get: (id) => request(`/${path.replace(/^\//, "")}/${encodeURIComponent(id)}`),
    create: (dto) => request(path, { method: "POST", body: dto }),
    update: (id, dto) => request(`${path}/${encodeURIComponent(id)}`, { method: "PATCH", body: dto }),
    remove: (id) => request(`${path}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  };
}

export const api = {
  raw: request,
  baseUrl: BASE_URL,

  // ---- Part 1: admin / CMS / ops resources ----
  categories: resource("/categories"),
  banners: resource("/banners"),
  coupons: resource("/coupons"), // id = coupon code
  supportTickets: resource("/support-tickets"),
  notificationRules: resource("/notification-rules"),
  integrations: resource("/integrations"),
  securitySettings: resource("/security-settings"),
  activityLogs: resource("/activity-logs"),
  gstSummary: resource("/gst-summary"),
  heroStats: resource("/hero-stats"),
  gmvTrends: resource("/gmv-trends"),
  cohorts: resource("/cohorts"),
  vendorScorecards: resource("/vendor-scorecards"),
  languages: resource("/languages"),
  savedAddresses: resource("/saved-addresses"),
  creditNotes: resource("/credit-notes"),
  b2bInvoices: resource("/b2b-invoices"),
  sampleOrders: resource("/sample-orders"),
  receivables: resource("/receivables"),
  contractPricing: resource("/contract-pricing"),
  teamMembers: resource("/team-members"),
  rfqs: resource("/rfqs"),

  // ---- Part 2: catalog / vendors / commerce ----
  products: {
    ...resource("/products"),
    tierPricing: {
      list: (productId) => request(`/products/${productId}/tier-pricing`),
      create: (productId, dto) => request(`/products/${productId}/tier-pricing`, { method: "POST", body: dto }),
      update: (productId, tierId, dto) =>
        request(`/products/${productId}/tier-pricing/${tierId}`, { method: "PATCH", body: dto }),
      remove: (productId, tierId) =>
        request(`/products/${productId}/tier-pricing/${tierId}`, { method: "DELETE" }),
    },
  },
  vendors: {
    ...resource("/vendors"),
    storeProfile: {
      get: (vendorId) => request(`/vendors/${vendorId}/store-profile`),
      upsert: (vendorId, dto) => request(`/vendors/${vendorId}/store-profile`, { method: "POST", body: dto }),
      remove: (vendorId) => request(`/vendors/${vendorId}/store-profile`, { method: "DELETE" }),
    },
    warehouses: {
      list: (vendorId) => request(`/vendors/${vendorId}/warehouses`),
      create: (vendorId, dto) => request(`/vendors/${vendorId}/warehouses`, { method: "POST", body: dto }),
      update: (vendorId, warehouseId, dto) =>
        request(`/vendors/${vendorId}/warehouses/${warehouseId}`, { method: "PATCH", body: dto }),
      remove: (vendorId, warehouseId) =>
        request(`/vendors/${vendorId}/warehouses/${warehouseId}`, { method: "DELETE" }),
    },
  },
  vendorReviews: resource("/vendor-reviews"),
  businessBuyers: resource("/business-buyers"),
  orders: {
    ...resource("/orders"),
    addTracking: (id, dto) => request(`/orders/${id}/tracking`, { method: "POST", body: dto }),
  },

  chat: {
    startThread: (dto) => request("/chat/threads", { method: "POST", body: dto }),
    listThreads: (params) => request(`/chat/threads${qs(params)}`),
    getThread: (id) => request(`/chat/threads/${id}`),
    sendMessage: (id, dto) => request(`/chat/threads/${id}/messages`, { method: "POST", body: dto }),
    markRead: (id, as) => request(`/chat/threads/${id}/read${qs({ as })}`, { method: "PATCH" }),
    setStatus: (id, status) => request(`/chat/threads/${id}`, { method: "PATCH", body: { status } }),
  },

  cart: {
    list: (userId) => request(`/cart${qs({ userId })}`),
    get: (id) => request(`/cart/${id}`),
    add: (dto) => request("/cart", { method: "POST", body: dto }),
    update: (id, dto) => request(`/cart/${id}`, { method: "PATCH", body: dto }),
    remove: (id) => request(`/cart/${id}`, { method: "DELETE" }),
    clear: (userId) => request(`/cart/clear${qs({ userId })}`, { method: "DELETE" }),
  },
  wishlist: {
    list: (userId) => request(`/wishlist${qs({ userId })}`),
    get: (id) => request(`/wishlist/${id}`),
    add: (dto) => request("/wishlist", { method: "POST", body: dto }),
    toggle: (dto) => request("/wishlist/toggle", { method: "POST", body: dto }),
    remove: (id) => request(`/wishlist/${id}`, { method: "DELETE" }),
    clear: (userId) => request(`/wishlist/clear${qs({ userId })}`, { method: "DELETE" }),
    priceDrops: (userId) => request(`/wishlist/price-drops${qs({ userId })}`),
    setPriceAlert: (id, dto) => request(`/wishlist/${id}/price-alert`, { method: "PATCH", body: dto }),
    acknowledgeDrop: (id) => request(`/wishlist/${id}/acknowledge-drop`, { method: "PATCH" }),
  },

  users: resource("/users"),

  // ---- Part 3: Loyalty/Referral, Commissions & Payouts, Disputes, Returns ----
  loyalty: {
    get: (userId) => request(`/loyalty/${encodeURIComponent(userId)}`),
    earn: (dto) => request("/loyalty/earn", { method: "POST", body: dto }),
    redeem: (dto) => request("/loyalty/redeem", { method: "POST", body: dto }),
  },
  referrals: {
    list: (userId) => request(`/referrals${qs({ userId })}`),
    create: (dto) => request("/referrals", { method: "POST", body: dto }),
    update: (id, dto) => request(`/referrals/${id}`, { method: "PATCH", body: dto }),
  },
  commissionRules: {
    ...resource("/commission-rules"),
    resolve: (params) => request(`/commission-rules/resolve${qs(params)}`),
  },
  payouts: resource("/payouts"),
  disputes: resource("/disputes"),
  returns: resource("/returns"),

  // ---- Reports (admin CSV export) — triggers a real file download ----
  reports: {
    downloadUrl: (entity, params = {}) => `${BASE_URL}/reports/${entity}/export${qs(params)}`,
    download: (entity, params = {}) => {
      if (typeof window !== "undefined") window.open(`${BASE_URL}/reports/${entity}/export${qs(params)}`, "_blank");
    },
  },

  // Homepage CMS — keyed sections (hero, howItWorks, testimonials, trending).
  // Not the standard id-based CRUD shape, so it gets its own tiny client
  // instead of resource().
  siteContent: {
    all: () => request("/site-content"), // { [key]: value } map, used by the public homepage
    get: (key) => request(`/site-content/${encodeURIComponent(key)}`),
    set: (key, value) => request(`/site-content/${encodeURIComponent(key)}`, { method: "PUT", body: { value } }),
    remove: (key) => request(`/site-content/${encodeURIComponent(key)}`, { method: "DELETE" }),
  },

  uploads: {
    list: (folder) => request(`/uploads${qs({ folder })}`),
    get: (id) => request(`/uploads/${id}`),
    remove: (id) => request(`/uploads/${id}`, { method: "DELETE" }),
    uploadOne: (file, folder) => {
      const form = new FormData();
      form.append("file", file);
      return request(`/uploads${qs({ folder })}`, { method: "POST", body: form, isForm: true });
    },
    uploadMany: (files, folder) => {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      return request(`/uploads/multiple${qs({ folder })}`, { method: "POST", body: form, isForm: true });
    },
  },
};

export default api;
