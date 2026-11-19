"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Home, AlertCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ownerNav } from "@/lib/nav-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Field,
  TextInput,
  Select,
  Textarea,
  FormSection,
  PillToggle,
  CheckboxTile,
} from "@/components/ui/FormField";
import { LoadingRow } from "@/components/ui/DataState";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { propertiesApi } from "@/lib/api/properties";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import {
  Furnishing,
  ListingIntent,
  Possession,
  PropertyType,
} from "@/lib/api/domain-types";

const propertyTypeOptions: { label: string; value: PropertyType }[] = [
  { label: "Apartment", value: "APARTMENT" },
  { label: "Villa", value: "VILLA" },
  { label: "Plot", value: "PLOT" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "PG / Co-living", value: "PG_COLIVING" },
];
const amenitiesList = [
  "Lift", "Power backup", "Parking", "24x7 security", "Gym", "Swimming pool",
  "Club house", "Kids' play area", "Garden", "CCTV cameras", "Intercom",
  "Fire safety", "24x7 water supply", "Rainwater harvesting", "Vastu compliant",
];
const cities = ["Ahmedabad", "Mumbai", "Bengaluru", "Pune", "Delhi"];

function NewListingContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [listingFor, setListingFor] = useState<"Sell" | "Rent" | "PG">("Sell");
  const [propertyType, setPropertyType] = useState<PropertyType>("APARTMENT");
  const [possession, setPossession] = useState<Possession>("READY_TO_MOVE");
  const [furnishing, setFurnishing] = useState<Furnishing>("SEMI_FURNISHED");
  const [amenities, setAmenities] = useState<string[]>(["Lift", "Parking", "24x7 security"]);
  const [title, setTitle] = useState("");
  const [bhk, setBhk] = useState("3 BHK");
  const [city, setCity] = useState("Ahmedabad");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [loadingExisting, setLoadingExisting] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  useEffect(() => {
    subscriptionsApi
      .mine()
      .then((res) => {
        const active = res.subscriptions.find((s) => s.status === "ACTIVE");
        setCreditsRemaining(active?.creditsRemaining ?? 0);
      })
      .catch(() => setCreditsRemaining(null));
  }, []);

  useEffect(() => {
    if (!editId) return;
    propertiesApi
      .mine()
      .then((res) => {
        const p = res.properties.find((x) => x.id === editId);
        if (!p) {
          setError("Couldn't find that listing to edit.");
          return;
        }
        setListingFor(p.intent === "BUY" ? "Sell" : p.intent === "RENT" ? "Rent" : "PG");
        setPropertyType(p.type);
        setPossession(p.possession);
        setFurnishing(p.furnishing);
        setAmenities(p.amenities);
        setTitle(p.title);
        setBhk(p.bhk ?? "3 BHK");
        setCity(p.city);
        setLocality(p.locality);
        setAddress(p.address ?? "");
        setAreaSqft(String(p.areaSqft));
        setPrice(String(p.price));
        setDescription(p.description ?? "");
        setImages(p.images);
      })
      .catch(() => setError("Couldn't load that listing."))
      .finally(() => setLoadingExisting(false));
  }, [editId]);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  const showsPlotFields = propertyType === "PLOT";
  const intent: ListingIntent = listingFor === "Sell" ? "BUY" : listingFor === "Rent" ? "RENT" : "PG";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedArea = parseInt(areaSqft.replace(/[,\s]/g, ""), 10);
    const parsedPrice = parseInt(price.replace(/[,\s]/g, ""), 10);
    if (!title.trim() || !locality.trim() || !parsedArea || !parsedPrice) {
      setError("Please fill in the required fields: title, locality, area and price.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        title: title.trim(),
        description: description.trim() || undefined,
        type: propertyType,
        intent,
        city,
        locality: locality.trim(),
        address: address.trim() || undefined,
        price: parsedPrice,
        priceUnit: listingFor === "Rent" ? ("MONTH" as const) : ("TOTAL" as const),
        bhk: showsPlotFields ? undefined : bhk,
        areaSqft: parsedArea,
        possession,
        furnishing,
        amenities,
        images,
      };

      if (editId) {
        await propertiesApi.update(editId, input);
      } else {
        await propertiesApi.create(input);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this listing. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle={editId ? "Edit listing" : "Post a property"}
      pageSubtitle="Fill in the details so buyers can find your listing"
    >
      <Link
        href="/dashboard/owner/listings"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-600 hover:text-ink-900"
      >
        <ArrowLeft size={14} /> Back to my listings
      </Link>

      {loadingExisting ? (
        <LoadingRow label="Loading listing…" />
      ) : submitted ? (
        <Card className="mx-auto max-w-lg py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-50">
            <CheckCircle2 size={28} className="text-brass-600" />
          </div>
          <h2 className="mt-5 font-display text-xl font-medium text-ink-900">
            {editId ? "Your listing has been updated" : "Your listing has been sent for review"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text-600">
            Our team checks every new or edited listing before it goes live. This usually takes a
            few hours. You&apos;ll get a notification once it&apos;s approved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/dashboard/owner/listings" variant="primary" size="md">
              Go to my listings
            </Button>
            {!editId && (
              <Button variant="outline" size="md" onClick={() => { setSubmitted(false); setTitle(""); }}>
                Post another
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card>
            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-xl bg-danger-50 p-3.5 text-sm text-danger-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <FormSection step={1} title="What are you listing?" subtitle="Choose how you want to sell or rent it out">
              <div className="space-y-4">
                <Field label="I want to">
                  <PillToggle
                    value={listingFor}
                    onChange={setListingFor}
                    options={[
                      { label: "Sell", value: "Sell" },
                      { label: "Rent out", value: "Rent" },
                      { label: "List a PG", value: "PG" },
                    ]}
                  />
                </Field>
                <Field label="Type of property" required>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {propertyTypeOptions.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setPropertyType(t.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                          propertyType === t.value
                            ? "border-brass-400 bg-brass-50 text-ink-900"
                            : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection step={2} title="Basic details" subtitle="Give buyers the key facts up front">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Give your listing a title" required className="sm:col-span-2">
                  <TextInput
                    placeholder="e.g. 3BHK with Sabarmati riverfront view"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                {!showsPlotFields && (
                  <Field label="How many bedrooms (BHK)?" required>
                    <Select value={bhk} onChange={(e) => setBhk(e.target.value)}>
                      <option>1 RK</option>
                      <option>1 BHK</option>
                      <option>2 BHK</option>
                      <option>3 BHK</option>
                      <option>4 BHK</option>
                      <option>5+ BHK</option>
                    </Select>
                  </Field>
                )}
                {!showsPlotFields && (
                  <Field label="Is it furnished?">
                    <Select value={furnishing} onChange={(e) => setFurnishing(e.target.value as Furnishing)}>
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI_FURNISHED">Semi-Furnished</option>
                      <option value="FURNISHED">Furnished</option>
                    </Select>
                  </Field>
                )}
                <Field label="Is it ready to move in?" required>
                  <PillToggle
                    value={possession}
                    onChange={setPossession}
                    options={[
                      { label: "Ready to move", value: "READY_TO_MOVE" },
                      { label: "Under construction", value: "UNDER_CONSTRUCTION" },
                    ]}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection step={3} title="Where is it?" subtitle="Buyers search by city and area first">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" required>
                  <Select value={city} onChange={(e) => setCity(e.target.value)}>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Area / Locality" required>
                  <TextInput placeholder="e.g. Bodakdev" required value={locality} onChange={(e) => setLocality(e.target.value)} />
                </Field>
                <Field label="Full address" className="sm:col-span-2">
                  <Textarea rows={2} placeholder="House / building no., street, area" value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={4} title="Size and price" subtitle="Be accurate — this is what buyers compare first">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Carpet area" required>
                  <div className="flex items-center gap-2">
                    <TextInput placeholder="1850" inputMode="numeric" required value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} />
                    <span className="shrink-0 text-sm text-text-400">sqft</span>
                  </div>
                </Field>
                <Field label={listingFor === "Sell" ? "Total price" : "Monthly rent"} required className="sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-sm text-text-500">₹</span>
                    <TextInput
                      placeholder={listingFor === "Sell" ? "1,45,00,000" : "25,000"}
                      inputMode="numeric"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection step={5} title="What does it have?" subtitle="Tap everything that applies">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {amenitiesList.map((a) => (
                  <CheckboxTile key={a} label={a} checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                ))}
              </div>
            </FormSection>

            <FormSection step={6} title="Photos" subtitle="Upload up to 10 photos — clear photos get 3x more views">
              <ImageUploader images={images} onChange={setImages} max={10} />
            </FormSection>

            <FormSection step={7} title="Tell buyers about it">
              <Field label="Description">
                <Textarea
                  rows={4}
                  placeholder="Describe the property, what makes it special, and anything buyers should know"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </FormSection>
          </Card>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-brass-300">
                  <Home size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Before you post</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-text-600">
                <li>· Clear photos get 3x more views</li>
                <li>· Accurate pricing brings serious buyers faster</li>
                <li>· Every listing is checked before it goes live</li>
                <li>· You can edit this listing anytime after posting</li>
              </ul>
            </Card>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Saving…" : editId ? "Save changes" : "Post this listing"}
            </Button>
            {creditsRemaining !== null && (
              <p className="text-center text-xs text-text-400">
                This uses 1 listing credit. You have {creditsRemaining} left.
              </p>
            )}
          </div>
        </form>
      )}
    </DashboardShell>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<LoadingRow />}>
      <NewListingContent />
    </Suspense>
  );
}
