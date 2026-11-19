"use client";

// lib/store.js
//
// This used to be a localStorage-only mock backend (see the old
// lib/data.js seed). It's now a thin bridge between the pages (which all
// go through useStore()) and the real pavitram-backend-COMPLETE API in
// lib/api.js, plus the separate auth service in lib/authApi.js.
//
// Every page in the app already calls useStore() and destructures things
// like `state`, `products.add(...)`, `login(...)`, `addToCart(...)` etc.
// That whole surface is preserved here on purpose so no page had to be
// rewritten — only the implementation underneath changed from
// "read/write localStorage" to "call the API".

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import api from "./api";
import authApi from "./authApi";

const AUTH_KEY = "pavitram_auth_v1";

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 9999)}`;

function unwrapList(res) {
  // Paginated resources return { data, total, page, limit }.
  // Cart / wishlist / a couple of others return a plain array.
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

function normalizeStoreProfile(sp) {
  if (!sp) return { name: "", tagline: "", channels: [], warehouses: [], social: {}, about: "", logoUrl: "", coverUrl: "" };
  return {
    id: sp.id,
    vendorId: sp.vendorId,
    name: sp.name || "",
    tagline: sp.tagline || "",
    // BUGFIX: about/logoUrl/coverUrl now round-trip through the API instead
    // of only ever existing in local form state (see the DTO/schema fix).
    about: sp.about || "",
    logoUrl: sp.logoUrl || "",
    coverUrl: sp.coverUrl || "",
    channels: sp.channels || [],
    warehouses: sp.warehouses || [],
    social: { website: sp.website || "", instagram: sp.instagram || "" },
  };
}

function mapCartItem(item) {
  // BUGFIX: this used to drop the nested `product` the API already returns
  // on every cart item, on the theory that "pages already look products up
  // from state.products via productId". That lookup silently failed
  // whenever a cart item's product fell outside the globally preloaded
  // state.products slice (which is capped and, until recently, mixed every
  // moderation status together) — the item just vanished from the cart and
  // checkout totals with no error shown to the customer. Keeping the API's
  // own embedded product removes that dependency entirely for cart/checkout.
  return { id: item.id, productId: item.productId, variantId: item.variantId ?? null, qty: item.qty, product: item.product };
}

function roleLabel(role) {
  return role === "admin" ? "Admin" : role === "vendor" ? "Vendor" : role === "b2b" ? "Business" : "Customer";
}

// Resource key -> api.js client, for every generic-CRUD collection the
// backend exposes. This drives both the initial "load everything" fetch
// and the generic crud(key) factory below.
const RESOURCE_MAP = {
  products: api.products,
  vendors: api.vendors,
  businessBuyers: api.businessBuyers,
  orders: api.orders,
  rfqs: api.rfqs,
  banners: api.banners,
  coupons: api.coupons,
  teamMembers: api.teamMembers,
  contractPricing: api.contractPricing,
  sampleOrders: api.sampleOrders,
  receivables: api.receivables,
  vendorReviews: api.vendorReviews,
  supportTickets: api.supportTickets,
  notificationRules: api.notificationRules,
  integrations: api.integrations,
  securitySettings: api.securitySettings,
  activityLogs: api.activityLogs,
  gstSummary: api.gstSummary,
  creditNotes: api.creditNotes,
  savedAddresses: api.savedAddresses,
  b2bInvoices: api.b2bInvoices,
  users: api.users,
  categories: api.categories,
  heroStats: api.heroStats,
  gmvTrend: api.gmvTrends,
  cohorts: api.cohorts,
  vendorScorecards: api.vendorScorecards,
  languages: api.languages,
  commissionRules: api.commissionRules,
  payouts: api.payouts,
  disputes: api.disputes,
  returns: api.returns,
};

// CRITICAL BUGFIX (platform-wide data exposure): the bootstrap effect below
// used to call `.list({ limit: 200 })` on every single key in RESOURCE_MAP —
// for EVERY visitor, logged in or not, on first page load, with no auth or
// role check whatsoever. That meant an anonymous person just opening the
// homepage silently downloaded (into plain JS state, visible in devtools)
// up to 200 rows each of: every customer's orders + delivery
// addresses + phone numbers, every return/refund reason and amount, every
// saved home address, every business buyer's KYC, every vendor's
// receivables/invoices/credit notes, the full admin activity/audit log,
// securitySettings/integrations config, every dispute, every user account
// (name/email/phone/role), and every vendor payout.
//
// Only these are genuinely public catalog/marketing data, safe to fetch for
// anyone before login — the same set a logged-out shopper is supposed to
// see while browsing.
const PUBLIC_RESOURCE_KEYS = ["products", "categories", "banners", "languages", "heroStats", "vendors", "vendorReviews"];

// IMPORTANT — this is a mitigation, not the real fix: gating the bulk fetch
// behind `auth` stops the *accidental* mass exposure to ordinary anonymous
// visitors using the site normally. It does NOT stop someone from calling
// these same backend endpoints directly (curl/Postman) — none of them have
// any authentication or authorization check server-side (this backend has
// no auth guards at all; see users.controller.ts's own comment). Every
// module here (orders, returns, savedAddresses, businessBuyers, disputes,
// users, payouts, securitySettings, …) needs real backend-side
// authorization — verifying the caller's token against the central auth
// service and enforcing role/ownership per request — before this can be
// considered safe in production. That's a dedicated backend task, flagged
// separately; this fix only closes the easiest, most-hit exposure path.

const EMPTY_STATE = Object.keys(RESOURCE_MAP).reduce(
  (acc, key) => ({ ...acc, [key]: [] }),
  {
    cart: [],
    wishlist: [],
    wishlistItems: [], // full records ({ id, productId, alertPrice, alertActive }) — wishlist above stays plain productIds so existing pages don't break
    storeProfile: { name: "", tagline: "", channels: [], warehouses: [], social: {}, about: "", logoUrl: "", coverUrl: "" },
    loyalty: null, // { id, points, lifetimePoints, tier, referralCode, transactions, referrals }
  }
);

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE);
  const [auth, setAuth] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [ready, setReady] = useState(false);
  const hydratedAuth = useRef(false);

  const notify = useCallback((message, tone = "success") => {
    const id = uid("toast");
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const logActivity = useCallback(
    (action) => {
      const entry = {
        actor: auth ? `${roleLabel(auth.role)} · ${auth.name}` : "Guest",
        action,
        ip: "—",
        time: new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setState((s) => ({ ...s, activityLogs: [{ id: uid("log"), ...entry }, ...s.activityLogs] }));
      api.activityLogs.create(entry).catch(() => {});
    },
    [auth]
  );

  // ---------- Initial load: hydrate auth, then pull resources ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let initialAuth = null;
      try {
        const raw = localStorage.getItem(AUTH_KEY);
        initialAuth = raw ? JSON.parse(raw) : null;
      } catch {
        initialAuth = null;
      }
      if (!cancelled) setAuth(initialAuth);

      // BUGFIX: only public catalog/marketing resources load for a
      // logged-out visitor now. Every other resource (orders, returns,
      // saved addresses, business-buyer KYC, disputes, payouts, user
      // records, security settings, ...) only loads once someone is
      // actually signed in — see the RESOURCE_MAP comment above for why.
      const keys = initialAuth ? Object.keys(RESOURCE_MAP) : PUBLIC_RESOURCE_KEYS;
      const entries = keys.map((k) => [k, RESOURCE_MAP[k]]);
      // Guests only ever get Approved products in this global slice (same
      // reasoning as the /products page fix) — logged-in vendor/admin
      // sessions still see every status here, since their dashboards
      // (moderation queues, "my products") depend on that.
      const results = await Promise.allSettled(
        entries.map(([key, client]) =>
          client.list(key === "products" && !initialAuth ? { limit: 200, status: "Approved" } : { limit: 200 })
        )
      );
      if (cancelled) return;

      const patch = {};
      entries.forEach(([key], i) => {
        const r = results[i];
        patch[key] = r.status === "fulfilled" ? unwrapList(r.value) : [];
      });

      setState((s) => ({ ...s, ...patch }));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time bootstrap
  }, []);

  // ---------- Cart / wishlist / store-profile / private resources: (re)load whenever the signed-in user changes ----------
  const privateResourcesLoadedForRef = useRef(null);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      let cart = [];
      try {
        cart = unwrapList(await api.cart.list(auth?.id)).map(mapCartItem);
      } catch {
        /* backend not reachable — leave cart empty rather than crash the page */
      }
      let wishlist = [];
      let wishlistItems = [];
      try {
        wishlistItems = unwrapList(await api.wishlist.list(auth?.id));
        wishlist = wishlistItems.map((w) => w.productId);
      } catch {
        /* noop */
      }
      let storeProfile = EMPTY_STATE.storeProfile;
      if (auth?.vendorId) {
        try {
          storeProfile = normalizeStoreProfile(await api.vendors.storeProfile.get(auth.vendorId));
        } catch {
          /* vendor hasn't set up a store profile yet */
        }
      }
      let loyalty = null;
      if (auth?.id) {
        try {
          loyalty = await api.loyalty.get(auth.id);
        } catch {
          /* noop — account gets auto-created lazily on first earn/redeem/view */
        }
      }
      if (!cancelled) setState((s) => ({ ...s, cart, wishlist, wishlistItems, storeProfile, loyalty }));

      // BUGFIX: the bootstrap effect only fetches the private RESOURCE_MAP
      // keys once, on first mount, for whoever was ALREADY logged in from a
      // saved session. A guest who logs in mid-session (the common case)
      // never triggered that fetch at all, so their orders/returns/saved
      // addresses/etc. pages would look permanently empty post-login. Fetch
      // the remaining resources here instead, exactly once per login.
      if (auth?.id && privateResourcesLoadedForRef.current !== auth.id) {
        privateResourcesLoadedForRef.current = auth.id;
        const remainingKeys = Object.keys(RESOURCE_MAP).filter((k) => !PUBLIC_RESOURCE_KEYS.includes(k));
        const results = await Promise.allSettled(remainingKeys.map((k) => RESOURCE_MAP[k].list({ limit: 200 })));
        if (cancelled) return;
        const patch = {};
        // Also refetch `products` unfiltered now that we're authenticated,
        // so vendor/admin screens see Pending/Rejected listings too.
        patch.products = undefined;
        try {
          patch.products = unwrapList(await api.products.list({ limit: 200 }));
        } catch {
          /* keep the Approved-only guest snapshot if this fails */
        }
        remainingKeys.forEach((key, i) => {
          const r = results[i];
          patch[key] = r.status === "fulfilled" ? unwrapList(r.value) : [];
        });
        if (!cancelled) setState((s) => ({ ...s, ...patch, products: patch.products ?? s.products }));
      } else if (!auth?.id) {
        privateResourcesLoadedForRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, auth?.id, auth?.vendorId]);

  // ---------- Persist auth session (skip the very first hydration write) ----------
  useEffect(() => {
    if (!hydratedAuth.current) {
      hydratedAuth.current = true;
      return;
    }
    try {
      if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      else localStorage.removeItem(AUTH_KEY);
    } catch {
      /* noop */
    }
  }, [auth]);

  // ---------- Generic CRUD factory (covers ~26 resources) ----------
  const crud = useCallback(
    (key) => {
      const client = RESOURCE_MAP[key];
      return {
        add: async (item, opts = {}) => {
          try {
            const record = await client.create(item);
            setState((s) => ({ ...s, [key]: [record, ...s[key]] }));
            if (opts.notify !== false) notify(opts.message || "Created successfully");
            if (opts.log) logActivity(opts.log);
            return record;
          } catch (e) {
            notify(e.message || "Could not save — check the backend is running", "error");
            throw e;
          }
        },
        update: async (id, patch, opts = {}) => {
          try {
            const record = await client.update(id, patch);
            setState((s) => ({
              ...s,
              [key]: s[key].map((r) => (r.id === id || r.code === id ? record : r)),
            }));
            if (opts.notify !== false) notify(opts.message || "Updated successfully");
            if (opts.log) logActivity(opts.log);
            return record;
          } catch (e) {
            notify(e.message || "Could not update", "error");
            throw e;
          }
        },
        remove: async (id, opts = {}) => {
          try {
            await client.remove(id);
            setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id && r.code !== id) }));
            if (opts.notify !== false) notify(opts.message || "Deleted", "success");
            if (opts.log) logActivity(opts.log);
          } catch (e) {
            notify(e.message || "Could not delete", "error");
            throw e;
          }
        },
      };
    },
    [notify, logActivity]
  );

  // ---------- Auth ----------
  // Login/signup hit a SEPARATE auth backend (lib/authApi.js). That service
  // owns credentials and issues the access_token; it knows nothing about
  // Pavitram's own admin/vendor/b2b/customer roles or vendorId/buyerId
  // linkage, so we mirror a matching profile row in the local `users`
  // resource (pavitram-backend-COMPLETE) and merge the two into one
  // session object every page already expects.
  const ensureLocalProfile = useCallback(async (externalUser, roleHint) => {
    const email = externalUser?.email;
    // BUGFIX: the central auth service's role (USER / ADMIN / SUPER_ADMIN)
    // was never being read here — new local profiles always fell back to
    // "customer", and existing local profiles were returned as-is even if
    // the central identity had since been promoted to ADMIN/SUPER_ADMIN.
    // That's why an account showing "Pavitram Super Admin" still landed on
    // /account with customer navigation instead of /admin/dashboard: the
    // *local* pavitram-ecommerce role never got synced to "admin".
    // Fix: whenever the central role is ADMIN or SUPER_ADMIN, force the
    // local role to "admin" (creating or updating as needed). We only ever
    // sync it *upward* to admin — a plain central "USER" role never
    // downgrades a local vendor/b2b/admin role that was set inside this app.
    const centralRole = (externalUser?.role || "").toUpperCase();
    const isCentralAdmin = centralRole === "ADMIN" || centralRole === "SUPER_ADMIN";

    let existing = null;
    if (email) {
      const found = unwrapList(await api.users.list({ search: email, limit: 5 }));
      existing = found.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
    }

    if (existing) {
      if (isCentralAdmin && existing.role !== "admin") {
        return api.users.update(existing.id, { role: "admin" });
      }
      return existing;
    }

    return api.users.create({
      name: externalUser?.name || email || "Pavitram User",
      email,
      phone: externalUser?.phone || "",
      // Credentials live in the external auth service — this is a placeholder
      // so the local `users` row (used only as an FK target / role holder)
      // satisfies the backend's required field.
      password: "external-auth",
      role: isCentralAdmin ? "admin" : roleHint || "customer",
    });
  }, []);

  const buildSession = useCallback(
    (externalRes, localUser) => ({
      id: localUser.id,
      externalId: externalRes?.user?.id,
      accessToken: externalRes?.access_token,
      name: localUser.name || externalRes?.user?.name,
      email: localUser.email || externalRes?.user?.email,
      phone: localUser.phone || externalRes?.user?.phone,
      role: localUser.role,
      vendorId: localUser.vendorId || null,
      buyerId: localUser.buyerId || null,
      // Richer identity fields owned by the central auth service — used for
      // onboarding prompts and pre-filling the profile page.
      isOnboarded: externalRes?.user?.isOnboarded ?? false,
      accountStatus: externalRes?.user?.accountStatus,
      kycStatus: externalRes?.user?.kycStatus,
      address: externalRes?.user?.address || null,
      city: externalRes?.user?.city || null,
      state: externalRes?.user?.state || null,
      profession: externalRes?.user?.profession || null,
      designation: externalRes?.user?.designation || null,
      organization: externalRes?.user?.organization || null,
    }),
    []
  );

  const login = useCallback(
    async (identifier, password) => {
      try {
        const res = await authApi.signin({ identifier, password });
        const localUser = await ensureLocalProfile(res.user, undefined);
        const session = buildSession(res, localUser);
        setAuth(session);
        notify(`Welcome back, ${session.name}`);
        return { ok: true, user: session };
      } catch (e) {
        const error = e.message || "Invalid email or password";
        notify(error, "error");
        return { ok: false, error };
      }
    },
    [ensureLocalProfile, buildSession, notify]
  );

  const register = useCallback(
    async (payload) => {
      try {
        const res = await authApi.signup({ email: payload.email, password: payload.password, phone: payload.phone });
        const found = payload.email
          ? unwrapList(await api.users.list({ search: payload.email, limit: 5 })).find(
              (u) => u.email?.toLowerCase() === payload.email.toLowerCase()
            )
          : null;
        const localUser = found
          ? await api.users.update(found.id, { name: payload.name, role: payload.role, phone: payload.phone })
          : await api.users.create({
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              password: "external-auth",
              role: payload.role,
            });
        const session = buildSession(res, localUser);
        setAuth(session);
        notify("Account created successfully");
        return { ok: true, user: session };
      } catch (e) {
        const error = e.message || "An account with this email may already exist";
        notify(error, "error");
        return { ok: false, error };
      }
    },
    [buildSession, notify]
  );

  const logout = useCallback(() => {
    setAuth(null);
    // BUGFIX: logging out only cleared the auth token, not the private data
    // already sitting in memory (orders, returns, saved addresses, and for
    // an admin/vendor session: disputes, payouts, security settings, every
    // user record, etc.). On a shared device, the next person could still
    // see the previous session's data until a hard refresh. Reset every
    // private resource back to empty on logout; public catalog data (kept
    // in PUBLIC_RESOURCE_KEYS) is left alone since it's fine for anyone.
    setState((s) => {
      const cleared = { ...s };
      Object.keys(RESOURCE_MAP)
        .filter((k) => !PUBLIC_RESOURCE_KEYS.includes(k))
        .forEach((k) => {
          cleared[k] = [];
        });
      cleared.cart = [];
      cleared.wishlist = [];
      cleared.wishlistItems = [];
      cleared.storeProfile = EMPTY_STATE.storeProfile;
      cleared.loyalty = null;
      return cleared;
    });
    notify("Signed out");
  }, [notify]);

  const linkVendor = useCallback(
    async (vendorId) => {
      if (!auth) return;
      try {
        await api.users.update(auth.id, { vendorId, role: "vendor" });
        setAuth((a) => (a ? { ...a, vendorId, role: "vendor" } : a));
      } catch (e) {
        notify(e.message || "Could not link vendor account", "error");
      }
    },
    [auth, notify]
  );

  const linkBuyer = useCallback(
    async (buyerId) => {
      if (!auth) return;
      try {
        await api.users.update(auth.id, { buyerId, role: "b2b" });
        setAuth((a) => (a ? { ...a, buyerId, role: "b2b" } : a));
      } catch (e) {
        notify(e.message || "Could not link business account", "error");
      }
    },
    [auth, notify]
  );

  const updateProfile = useCallback(
    async (patch) => {
      if (!auth) return;
      try {
        await api.users.update(auth.id, patch);
        // Name/address/profession-type fields are owned by the central
        // Pavitram identity service — keep it in sync so other modules
        // (realestate, etc.) see the same profile too.
        const centralFields = ["name", "phone", "address", "city", "state", "profession", "designation", "organization"];
        const centralPatch = Object.fromEntries(Object.entries(patch).filter(([k]) => centralFields.includes(k)));
        if (auth.accessToken && Object.keys(centralPatch).length > 0) {
          try {
            await authApi.updateProfile(auth.accessToken, centralPatch);
          } catch {
            /* non-fatal — local profile still saved even if central sync fails */
          }
        }
        setAuth((a) => (a ? { ...a, ...patch, isOnboarded: true } : a));
        notify("Profile updated");
      } catch (e) {
        notify(e.message || "Could not update profile", "error");
      }
    },
    [auth, notify]
  );

  // ---------- Vendor store profile / warehouses ----------
  const upsertVendorStoreProfile = useCallback(async (vendorId, data) => {
    const sp = await api.vendors.storeProfile.upsert(vendorId, data);
    setState((s) => ({ ...s, storeProfile: normalizeStoreProfile(sp) }));
    return sp;
  }, []);

  const saveStoreProfile = useCallback(
    async (patch) => {
      if (!auth?.vendorId) return;
      const merged = { ...state.storeProfile, ...patch };
      try {
        await upsertVendorStoreProfile(auth.vendorId, {
          name: merged.name,
          tagline: merged.tagline,
          channels: merged.channels,
          instagram: merged.social?.instagram,
          website: merged.social?.website,
          about: merged.about,
          logoUrl: merged.logoUrl,
          coverUrl: merged.coverUrl,
        });
        notify("Store profile saved");
      } catch (e) {
        notify(e.message || "Could not save store profile", "error");
      }
    },
    [auth, state.storeProfile, notify, upsertVendorStoreProfile]
  );

  const toggleStoreChannel = useCallback(
    async (c) => {
      if (!auth?.vendorId) return;
      const has = (state.storeProfile.channels || []).includes(c);
      const channels = has
        ? state.storeProfile.channels.filter((x) => x !== c)
        : [...(state.storeProfile.channels || []), c];
      try {
        await upsertVendorStoreProfile(auth.vendorId, {
          name: state.storeProfile.name,
          tagline: state.storeProfile.tagline,
          channels,
          instagram: state.storeProfile.social?.instagram,
          website: state.storeProfile.social?.website,
        });
      } catch (e) {
        notify(e.message || "Could not update channel", "error");
      }
    },
    [auth, state.storeProfile, notify, upsertVendorStoreProfile]
  );

  const addWarehouse = useCallback(
    async (data) => {
      if (!auth?.vendorId) return;
      try {
        const wh = await api.vendors.warehouses.create(auth.vendorId, data);
        setState((s) => ({
          ...s,
          storeProfile: { ...s.storeProfile, warehouses: [...(s.storeProfile.warehouses || []), wh] },
        }));
        notify("Warehouse added");
      } catch (e) {
        notify(e.message || "Could not add warehouse", "error");
      }
    },
    [auth, notify]
  );

  const removeWarehouse = useCallback(
    async (warehouseId) => {
      if (!auth?.vendorId) return;
      try {
        await api.vendors.warehouses.remove(auth.vendorId, warehouseId);
        setState((s) => ({
          ...s,
          storeProfile: {
            ...s.storeProfile,
            warehouses: (s.storeProfile.warehouses || []).filter((w) => w.id !== warehouseId),
          },
        }));
        notify("Warehouse removed");
      } catch (e) {
        notify(e.message || "Could not remove warehouse", "error");
      }
    },
    [auth, notify]
  );

  // ---------- Cart ----------
  const tierPriceFor = useCallback((product, qty) => {
    if (!product.tierPricing || !product.tierPricing.length) return product.price;
    const tier = product.tierPricing.find((t) => qty >= t.min && (t.max === null || t.max === undefined || qty <= t.max));
    return tier ? tier.price : product.tierPricing[product.tierPricing.length - 1].price;
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const list = unwrapList(await api.cart.list(auth?.id));
      setState((s) => ({ ...s, cart: list.map(mapCartItem) }));
    } catch {
      /* noop */
    }
  }, [auth]);

  const addToCart = useCallback(
    async (productId, qty, variantId = null) => {
      try {
        await api.cart.add({ userId: auth?.id, productId, variantId: variantId || undefined, qty });
        await refreshCart();
        notify("Added to cart");
      } catch (e) {
        notify(e.message || "Could not add to cart", "error");
      }
    },
    [auth, notify, refreshCart]
  );

  const updateCartQty = useCallback(
    async (cartId, qty) => {
      try {
        if (qty <= 0) await api.cart.remove(cartId);
        else await api.cart.update(cartId, { qty });
        await refreshCart();
      } catch (e) {
        notify(e.message || "Could not update cart", "error");
      }
    },
    [notify, refreshCart]
  );

  const removeFromCart = useCallback(
    async (cartId) => {
      try {
        await api.cart.remove(cartId);
        await refreshCart();
        notify("Removed from cart");
      } catch (e) {
        notify(e.message || "Could not remove item", "error");
      }
    },
    [notify, refreshCart]
  );

  const clearCart = useCallback(async () => {
    try {
      await api.cart.clear(auth?.id);
      setState((s) => ({ ...s, cart: [] }));
    } catch (e) {
      notify(e.message || "Could not clear cart", "error");
    }
  }, [auth, notify]);

  const toggleWishlist = useCallback(
    async (productId) => {
      try {
        const res = await api.wishlist.toggle({ userId: auth?.id, productId });
        setState((s) => ({
          ...s,
          wishlist: res.added ? [...s.wishlist, productId] : s.wishlist.filter((id) => id !== productId),
          wishlistItems: res.added
            ? [...s.wishlistItems, res.item]
            : s.wishlistItems.filter((w) => w.productId !== productId),
        }));
        notify(res.added ? "Saved to wishlist" : "Removed from wishlist");
      } catch (e) {
        notify(e.message || "Could not update wishlist", "error");
      }
    },
    [auth, notify]
  );

  // Doc §3.1 "Wishlist & Price-Drop Alerts": set/clear a target price on a
  // saved item. Pass alertPrice: null to turn the alert off.
  const setWishlistPriceAlert = useCallback(
    async (wishlistItemId, alertPrice) => {
      try {
        const record = await api.wishlist.setPriceAlert(wishlistItemId, {
          alertPrice: alertPrice ?? undefined,
          alertActive: alertPrice != null,
        });
        setState((s) => ({
          ...s,
          wishlistItems: s.wishlistItems.map((w) => (w.id === wishlistItemId ? record : w)),
        }));
        notify(alertPrice != null ? `We'll notify you if the price drops to ₹${alertPrice}` : "Price alert removed");
        return record;
      } catch (e) {
        notify(e.message || "Could not set price alert", "error");
        throw e;
      }
    },
    [notify]
  );

  // Doc §1.2 / §3.1 — Loyalty points, redemption, and referrals.
  const earnLoyaltyPoints = useCallback(
    async (points, { orderId, note } = {}) => {
      if (!auth?.id) return null;
      try {
        const res = await api.loyalty.earn({ userId: auth.id, points, orderId, note });
        setState((s) => ({ ...s, loyalty: { ...s.loyalty, ...res.account } }));
        return res;
      } catch {
        return null; // non-critical — don't block whatever the caller was doing (e.g. placing an order)
      }
    },
    [auth]
  );

  const redeemLoyaltyPoints = useCallback(
    async (points) => {
      if (!auth?.id) return null;
      try {
        const res = await api.loyalty.redeem({ userId: auth.id, points });
        setState((s) => ({ ...s, loyalty: { ...s.loyalty, ...res.account } }));
        notify(`Redeemed ${points} points`);
        return res;
      } catch (e) {
        notify(e.message || "Could not redeem points", "error");
        throw e;
      }
    },
    [auth, notify]
  );

  const shareReferral = useCallback(
    async (referredEmail) => {
      if (!auth?.id) return null;
      try {
        const referral = await api.referrals.create({ referrerUserId: auth.id, referredEmail });
        setState((s) => ({ ...s, loyalty: { ...s.loyalty, referrals: [referral, ...(s.loyalty?.referrals || [])] } }));
        notify(`Referral sent to ${referredEmail}`);
        return referral;
      } catch (e) {
        notify(e.message || "Could not send referral", "error");
        throw e;
      }
    },
    [auth, notify]
  );

  // Doc §3.1 "Automated Return/Refund Requests" — customer raises a return
  // from a delivered order; admin/vendor later moves its status forward.
  const requestReturn = useCallback(
    async ({ orderId, reason, photos }) => {
      try {
        const record = await api.returns.create({ orderId, userId: auth?.id, reason, photos });
        setState((s) => ({ ...s, returns: [record, ...s.returns] }));
        notify(`Return requested for ${orderId}`);
        logActivity(`Requested return for order ${orderId}`);
        return record;
      } catch (e) {
        notify(e.message || "Could not submit return request", "error");
        throw e;
      }
    },
    [auth, notify, logActivity]
  );

  // Doc §1.5 "Dispute Management" — customer/business buyer/vendor raises a
  // dispute on an order; admin arbitrates via the stage field.
  const raiseDispute = useCallback(
    async ({ orderId, raisedBy, against, type, description, evidenceUrls }) => {
      try {
        const record = await api.disputes.create({ orderId, raisedBy, against, type, description, evidenceUrls });
        setState((s) => ({ ...s, disputes: [record, ...s.disputes] }));
        notify(`Dispute raised for ${orderId}`);
        logActivity(`Raised a dispute on order ${orderId}`);
        return record;
      } catch (e) {
        notify(e.message || "Could not raise dispute", "error");
        throw e;
      }
    },
    [auth, notify, logActivity]
  );

  const placeOrder = useCallback(
    async (orderInput) => {
      try {
        const record = await api.orders.create({ ...orderInput, userId: auth?.id });
        setState((s) => ({ ...s, orders: [record, ...s.orders], cart: [] }));
        notify(`Order ${record.id} placed successfully`);
        logActivity(`Placed order ${record.id} (${orderInput.type})`);
        // Doc §3.1 "Loyalty, Rewards & Referral Engine" — 1 point per ₹100
        // spent on retail (B2C) orders. Non-blocking: a loyalty hiccup should
        // never stop the order confirmation itself.
        if (orderInput.type === "B2C" && auth?.id) {
          const points = Math.floor((record.amount || 0) / 100);
          if (points > 0) earnLoyaltyPoints(points, { orderId: record.id, note: `Earned on order ${record.id}` });
        }
        return record;
      } catch (e) {
        notify(e.message || "Could not place order", "error");
        throw e;
      }
    },
    [auth, notify, logActivity, earnLoyaltyPoints]
  );

  // Vendor moves an order forward one step (Confirmed by Vendor -> Packed ->
  // Shipped -> Out for Delivery -> Delivered / Cancelled). Appends to the
  // order's tracking timeline on the backend and mirrors the result into
  // local state so both the vendor's pipeline and the customer's tracking
  // page update immediately.
  const advanceOrderTracking = useCallback(
    async (orderId, { status, note, deliveryDate } = {}) => {
      try {
        if (deliveryDate !== undefined) {
          await api.orders.update(orderId, { deliveryDate });
        }
        const record = await api.orders.addTracking(orderId, { status, note });
        setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === orderId ? { ...record, deliveryDate: deliveryDate ?? record.deliveryDate } : o)) }));
        notify(`${orderId} → ${status}`);
        logActivity(`Order ${orderId} moved to "${status}"${deliveryDate ? ` (delivery: ${deliveryDate})` : ""}`);
        return record;
      } catch (e) {
        notify(e.message || "Could not update order tracking", "error");
        throw e;
      }
    },
    [notify, logActivity]
  );

  if (!ready) return null;

  const value = {
    state,
    setState,
    auth,
    login,
    register,
    logout,
    linkVendor,
    linkBuyer,
    updateProfile,
    notify,
    log: logActivity,
    uid,
    tierPriceFor,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    setWishlistPriceAlert,
    earnLoyaltyPoints,
    redeemLoyaltyPoints,
    shareReferral,
    requestReturn,
    raiseDispute,
    placeOrder,
    advanceOrderTracking,
    upsertVendorStoreProfile,
    saveStoreProfile,
    toggleStoreChannel,
    addWarehouse,
    removeWarehouse,
    products: crud("products"),
    vendors: crud("vendors"),
    businessBuyers: crud("businessBuyers"),
    orders: crud("orders"),
    rfqs: crud("rfqs"),
    banners: crud("banners"),
    coupons: crud("coupons"),
    teamMembers: crud("teamMembers"),
    contractPricing: crud("contractPricing"),
    sampleOrders: crud("sampleOrders"),
    receivables: crud("receivables"),
    vendorReviews: crud("vendorReviews"),
    supportTickets: crud("supportTickets"),
    notificationRules: crud("notificationRules"),
    integrations: crud("integrations"),
    securitySettings: crud("securitySettings"),
    activityLogs: crud("activityLogs"),
    gstSummary: crud("gstSummary"),
    creditNotes: crud("creditNotes"),
    savedAddresses: crud("savedAddresses"),
    b2bInvoices: crud("b2bInvoices"),
    users: crud("users"),
    categories: crud("categories"),
    heroStats: crud("heroStats"),
    gmvTrend: crud("gmvTrend"),
    cohorts: crud("cohorts"),
    vendorScorecards: crud("vendorScorecards"),
    languages: crud("languages"),
    commissionRules: crud("commissionRules"),
    payouts: crud("payouts"),
    disputes: crud("disputes"),
    returns: crud("returns"),
    toasts,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
