// lib/authApi.js
//
// Login/signup/profile are handled by Pavitram's CENTRAL AUTH service — a
// separate backend (mainbackend.pavitramindia.com) that is the single
// source of truth for identity across every Pavitram module (ecommerce,
// realestate, etc). See AUTH_API_INTEGRATION.md for the full contract.
//
//   POST  {AUTH_URL}/auth/signup   { email, password, phone }
//   POST  {AUTH_URL}/auth/signin   { identifier, password }   // identifier = email or phone
//   GET   {AUTH_URL}/auth/me                                  // validate token, needs Bearer header
//   PATCH {AUTH_URL}/auth/profile  { name, phone, address, city, state, profession, designation, organization }
//
// signup/signin return: { message, access_token?, user: { id, name, email,
// phone, role, avatarUrl, accountStatus, kycStatus, isOnboarded, address,
// city, state, profession, designation, organization, reference } }
//
// `role` here is one of USER / ADMIN / SUPER_ADMIN — Pavitram's own central
// identity role, NOT the same thing as this app's admin/vendor/b2b/customer
// role. lib/store.js treats this service purely as an identity provider
// (who is this person, what's their access_token, what's their profile) and
// keeps Pavitram-ecommerce-specific role/vendorId/buyerId in the local
// pavitram-backend-COMPLETE `users` table instead. See lib/store.js for how
// the two are bridged.

const AUTH_URL = (process.env.NEXT_PUBLIC_AUTH_URL || "https://mainbackend.pavitramindia.com/api/v1").replace(
  /\/$/,
  ""
);

async function authRequest(method, path, { body, token } = {}) {
  const res = await fetch(`${AUTH_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
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
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return data;
}

export const authApi = {
  // { email, password, phone }
  signup: (payload) => authRequest("POST", "/auth/signup", { body: payload }),
  // { identifier, password } — identifier can be email or phone
  signin: (payload) => authRequest("POST", "/auth/signin", { body: payload }),
  // Validate an access_token / fetch the identity it belongs to
  me: (token) => authRequest("GET", "/auth/me", { token }),
  // Onboarding / profile completion — any subset of the fields
  updateProfile: (token, patch) => authRequest("PATCH", "/auth/profile", { body: patch, token }),
};

export default authApi;
