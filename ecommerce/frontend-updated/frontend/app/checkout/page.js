"use client";

import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { Field, Input, Button } from "@/components/Field";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

export default function CheckoutPage() {
  const { state, auth, tierPriceFor, placeOrder, savedAddresses, notify } = useStore();
  const [addressIdx, setAddressIdx] = useState(0);
  const [payment, setPayment] = useState("Cash on Delivery");
  const [placedOrders, setPlacedOrders] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const emptyAddressForm = { label: "", type: "Home", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" };
  const [form, setForm] = useState(emptyAddressForm);
  // BUGFIX: admin could create coupon codes (Section 4.7 CMS), but there was
  // no way to apply one anywhere in cart/checkout — the whole feature was
  // unreachable by customers. Adds a code field + validation + discount.
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const cartItems = state.cart
    .map((c) => {
      // BUGFIX: same as the cart page — prefer the API-embedded product over
      // the capped global state.products lookup so items can't silently
      // disappear from the order total at the final step of checkout.
      const product = c.product || state.products.find((p) => p.id === c.productId);
      if (!product) return null;
      // BUGFIX: same variant-price gap as the cart page — see its comment.
      const activeVariant = c.variantId ? product.variants?.find((v) => v.id === c.variantId) : null;
      const unitPrice = activeVariant?.price ?? (product.channels.includes("b2b") ? tierPriceFor(product, c.qty) : product.price);
      return { ...c, product, unitPrice };
    })
    .filter(Boolean);

  const byVendor = cartItems.reduce((acc, item) => {
    acc[item.product.vendor] = acc[item.product.vendor] || [];
    acc[item.product.vendor].push(item);
    return acc;
  }, {});

  const subtotal = cartItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const shipping = cartItems.length === 0 ? 0 : 79 * Object.keys(byVendor).length;
  const orderChannel = auth?.role === "b2b" ? "B2B" : "B2C";
  const discount = (() => {
    if (!appliedCoupon) return 0;
    const raw = parseFloat(String(appliedCoupon.value).replace(/[^0-9.]/g, "")) || 0;
    const isPercent = /percent|%/i.test(appliedCoupon.type || "") || /%/.test(String(appliedCoupon.value));
    const amount = isPercent ? (subtotal * raw) / 100 : raw;
    return Math.min(amount, subtotal);
  })();
  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const coupon = await api.coupons.get(code);
      if ((coupon.status || "Active").toLowerCase() !== "active") {
        setCouponError("This coupon is no longer active.");
        return;
      }
      if (coupon.channel && coupon.channel !== "Both" && coupon.channel !== orderChannel) {
        setCouponError(`This coupon only applies to ${coupon.channel} orders.`);
        return;
      }
      setAppliedCoupon(coupon);
      notify(`Coupon ${code} applied`);
    } catch {
      setCouponError("Invalid coupon code.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    savedAddresses.add({ ...form, isDefault: state.savedAddresses.length === 0 });
    setForm(emptyAddressForm);
    setAddOpen(false);
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = state.savedAddresses[addressIdx];
    if (!selectedAddress) {
      alert("Please add a delivery address before placing the order.");
      return;
    }
    // BUGFIX: checkout previously had no MOQ check of its own — a below-MOQ
    // quantity for a B2B-only product could reach here (e.g. via the quick
    // "Add to cart" button on a listing card) and be paid for anyway, which
    // contradicts the documented "you can't check out below MOQ" rule.
    const belowMoq = cartItems.find(
      (i) => i.product.channels.includes("b2b") && !i.product.channels.includes("b2c") && i.qty < (i.product.moq || 1)
    );
    if (belowMoq) {
      alert(
        `${belowMoq.product.name} has a minimum order quantity of ${belowMoq.product.moq} units. Please update the quantity in your cart before checking out.`
      );
      return;
    }
    const entries = Object.entries(byVendor);
    const created = await Promise.all(
      entries.map(([vendor, items]) => {
        const rawAmount = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
        // Split the coupon discount proportionally across vendor sub-orders
        // so the sum of sub-order amounts still matches the discounted total.
        const amount = discount > 0 ? Math.max(0, rawAmount - (rawAmount / subtotal) * discount) : rawAmount;
        const isBulk = items.some((i) => i.product.channels.includes("b2b") && i.qty >= (i.product.moq || Infinity));
        return placeOrder({
          type: isBulk || auth?.role === "b2b" ? "B2B" : "B2C",
          customer: auth?.name || "Guest Customer",
          vendor,
          // BUGFIX: pass the vendor's stable id (not just its display name)
          // so the order stays discoverable on the vendor's dashboard even
          // if the store is renamed later. All items in a vendor group share
          // the same vendorId since they were grouped by vendor.
          vendorId: items[0]?.product?.vendorId || undefined,
          amount,
          items: items.map((i) => ({ productId: i.productId, product: i.product.name, qty: i.qty, price: i.unitPrice, variantId: i.variantId || undefined })),
          payment,
          couponCode: appliedCoupon?.code || undefined,
          address: {
            label: selectedAddress.label,
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2,
            landmark: selectedAddress.landmark,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          },
        });
      })
    );
    if (appliedCoupon) {
      api.coupons.update(appliedCoupon.code, { uses: (appliedCoupon.uses || 0) + 1 }).catch(() => {});
    }
    setPlacedOrders(created);
  };

  if (placedOrders) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <span
            className="mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl text-white"
            style={{ background: "var(--color-jade)" }}
          >
            ✓
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
            Order placed successfully
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {placedOrders.length} order{placedOrders.length > 1 ? "s" : ""} created — one per vendor —
            and confirmed. Track {placedOrders.length > 1 ? "them" : "it"} anytime from your account.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {placedOrders.map((o) => (
              <div key={o.id} className="rounded-xl border border-line bg-paper-raised px-4 py-3 text-left text-sm">
                <span className="font-mono font-semibold text-ink">{o.id}</span>
                <span className="ml-2 text-ink-muted">{o.vendor} · ₹{o.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Nothing to check out</h1>
          <p className="mt-2 text-sm text-ink-muted">Your cart is empty.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Delivery Address</h2>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-gold)" }}>
              <Plus size={13} /> Add new
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {state.savedAddresses.map((a, i) => (
              <button
                key={a.id || a.label + i}
                onClick={() => setAddressIdx(i)}
                className="rounded-xl border p-4 text-left text-sm"
                style={{
                  borderColor: addressIdx === i ? "var(--color-gold)" : "var(--color-line)",
                  background: addressIdx === i ? "var(--color-gold-dim)" : "var(--color-paper-raised)",
                }}
              >
                <p className="font-semibold text-ink">{a.label} {a.fullName ? `· ${a.fullName}` : ""}</p>
                <p className="mt-1 text-ink-muted">
                  {[a.line1, a.line2, a.landmark].filter(Boolean).join(", ") || "—"}
                </p>
                <p className="text-ink-muted">
                  {[a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                </p>
                {a.phone && <p className="mt-1 text-ink-muted">📞 {a.phone}</p>}
              </button>
            ))}
            {state.savedAddresses.length === 0 && (
              <p className="text-sm text-ink-muted">No saved address yet — add one to continue.</p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-base font-semibold text-ink">Payment Method</h2>
          <div className="mt-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "var(--color-gold)", background: "var(--color-gold-dim)", color: "var(--color-ink)" }}>
            <Wallet size={16} style={{ color: "var(--color-gold)" }} />
            Cash on Delivery — pay when your order arrives
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">Online payments are coming soon. For now, every order is Cash on Delivery.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-paper-raised p-5">
          <h2 className="font-display text-base font-semibold text-ink">Coupon code</h2>
          {appliedCoupon ? (
            <div className="mt-2 flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm" style={{ borderColor: "var(--color-jade)", background: "var(--color-jade-dim, transparent)" }}>
              <span className="font-mono font-semibold text-ink">{appliedCoupon.code}</span>
              <button onClick={removeCoupon} className="text-xs font-semibold" style={{ color: "var(--color-rose)" }}>Remove</button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1"
              />
              <Button type="button" onClick={applyCoupon} disabled={applyingCoupon || !couponInput.trim()}>
                {applyingCoupon ? "Checking…" : "Apply"}
              </Button>
            </div>
          )}
          {couponError && <p className="mt-1.5 text-xs" style={{ color: "var(--color-rose)" }}>{couponError}</p>}
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-paper-raised p-5">
          <div className="space-y-1.5 text-sm text-ink-muted">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-mono text-ink">₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping ({Object.keys(byVendor).length} parcels)</span><span className="font-mono text-ink">₹{shipping}</span></div>
            {discount > 0 && (
              <div className="flex justify-between" style={{ color: "var(--color-jade)" }}>
                <span>Coupon discount</span><span className="font-mono">−₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1.5 font-semibold text-ink"><span>Order total</span><span className="font-mono">₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={state.savedAddresses.length === 0}
            className="mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--color-ink)" }}
          >
            Place Order · Pay on Delivery
          </button>
        </section>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add delivery address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Label" required>
              <Input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home, Office" />
            </Field>
            <Field label="Full name" required>
              <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Receiver's name" />
            </Field>
          </div>
          <Field label="Phone number" required>
            <Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
          </Field>
          <Field label="House / Flat / Street" required>
            <Input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Flat no., building, street" />
          </Field>
          <Field label="Area / Locality">
            <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </Field>
          <Field label="Landmark">
            <Input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="Nearby landmark (optional)" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" required>
              <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="State" required>
              <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Field>
            <Field label="Pincode" required>
              <Input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="380001" />
            </Field>
          </div>
          <Button type="submit" className="w-full">Save address</Button>
        </form>
      </Modal>
      <Footer />
    </div>
  );
}
