"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Building2, Plus, Trash2, AlertCircle } from "lucide-react";
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
import { projectsApi } from "@/lib/api/projects";
import { ProjectStatus, ProjectType, ProjectUnit } from "@/lib/api/domain-types";

const projectAmenities = [
  "Club house", "Swimming pool", "Gym", "Sports court", "Landscaped garden",
  "Kids' play area", "Jogging track", "EV charging", "Multi-level parking",
  "24x7 security", "Power backup", "Rainwater harvesting", "Senior citizen area",
  "Amphitheatre", "Yoga deck",
];
const projectTypeOptions: { label: string; value: ProjectType }[] = [
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Mixed use", value: "MIXED_USE" },
];
const cities = ["Ahmedabad", "Mumbai", "Bengaluru", "Pune", "Delhi"];

type UnitRow = { id: number; configuration: string; areaSqft: string; price: string; unitsAvailable: string };

function NewProjectContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("RESIDENTIAL");
  const [towers, setTowers] = useState("4");
  const [totalUnits, setTotalUnits] = useState("");
  const [possessionLabel, setPossessionLabel] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("NEW_LAUNCH");
  const [city, setCity] = useState("Ahmedabad");
  const [locality, setLocality] = useState("");
  const [rera, setRera] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["Club house", "24x7 security", "Power backup"]);
  const [units, setUnits] = useState<UnitRow[]>([
    { id: 1, configuration: "2 BHK", areaSqft: "1050", price: "7800000", unitsAvailable: "20" },
    { id: 2, configuration: "3 BHK", areaSqft: "1450", price: "10500000", unitsAvailable: "12" },
  ]);
  const [description, setDescription] = useState("");
  const [connectivity, setConnectivity] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [loadingExisting, setLoadingExisting] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    projectsApi
      .mine()
      .then((res) => {
        const p = res.projects.find((x) => x.id === editId);
        if (!p) {
          setError("Couldn't find that project to edit.");
          return;
        }
        setName(p.name);
        setProjectType(p.type);
        setTowers(String(p.towers));
        setTotalUnits(String(p.totalUnits));
        setPossessionLabel(p.possessionLabel);
        setStatus(p.status);
        setCity(p.city);
        setLocality(p.locality);
        setRera(p.rera ?? "");
        setPriceFrom(String(p.priceFrom));
        setPriceTo(String(p.priceTo));
        setAmenities(p.amenities);
        setDescription(p.description ?? "");
        setConnectivity(p.connectivity.join(", "));
        setImages(p.images);
        if (p.units?.length) {
          setUnits(p.units.map((u, i) => ({
            id: i + 1,
            configuration: u.configuration,
            areaSqft: String(u.areaSqft),
            price: String(u.price),
            unitsAvailable: String(u.unitsAvailable ?? 0),
          })));
        }
      })
      .catch(() => setError("Couldn't load that project."))
      .finally(() => setLoadingExisting(false));
  }, [editId]);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }
  function addUnitRow() {
    setUnits((prev) => [...prev, { id: Date.now(), configuration: "1 BHK", areaSqft: "", price: "", unitsAvailable: "" }]);
  }
  function updateUnitRow(id: number, field: keyof UnitRow, value: string) {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }
  function removeUnitRow(id: number) {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedTowers = parseInt(towers, 10) || 1;
    const parsedTotalUnits = parseInt(totalUnits, 10) || 0;
    const parsedPriceFrom = parseInt(priceFrom.replace(/[,\s]/g, ""), 10);
    const parsedPriceTo = parseInt(priceTo.replace(/[,\s]/g, ""), 10);
    const validUnits: ProjectUnit[] = units
      .filter((u) => u.configuration && u.areaSqft && u.price)
      .map((u) => ({
        configuration: u.configuration,
        areaSqft: parseInt(u.areaSqft, 10),
        price: parseInt(u.price.replace(/[,\s]/g, ""), 10),
        unitsAvailable: parseInt(u.unitsAvailable || "0", 10),
      }));

    if (!name.trim() || !locality.trim() || !possessionLabel.trim() || !parsedPriceFrom || !parsedPriceTo) {
      setError("Please fill in the required fields: project name, locality, possession date and price range.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        city,
        locality: locality.trim(),
        type: projectType,
        priceFrom: parsedPriceFrom,
        priceTo: parsedPriceTo,
        areaFrom: validUnits.length ? Math.min(...validUnits.map((u) => u.areaSqft)) : 0,
        areaTo: validUnits.length ? Math.max(...validUnits.map((u) => u.areaSqft)) : 0,
        configurations: Array.from(new Set(validUnits.map((u) => u.configuration))),
        possessionLabel: possessionLabel.trim(),
        status,
        rera: rera.trim() || undefined,
        totalUnits: parsedTotalUnits,
        towers: parsedTowers,
        amenities,
        connectivity: connectivity.split(",").map((s) => s.trim()).filter(Boolean),
        images,
        description: description.trim() || undefined,
        units: validUnits,
      };

      if (editId) {
        await projectsApi.update(editId, input);
      } else {
        await projectsApi.create(input);
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this project. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell
      groups={ownerNav}
      roleColor="brass"
      pageTitle={editId ? "Edit project" : "Add a new project"}
      pageSubtitle="Set up a project page with unit types, pricing, and RERA details"
    >
      <Link
        href="/dashboard/owner/projects"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-600 hover:text-ink-900"
      >
        <ArrowLeft size={14} /> Back to projects
      </Link>

      {loadingExisting ? (
        <LoadingRow label="Loading project…" />
      ) : submitted ? (
        <Card className="mx-auto max-w-lg py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-50">
            <CheckCircle2 size={28} className="text-brass-600" />
          </div>
          <h2 className="mt-5 font-display text-xl font-medium text-ink-900">
            {editId ? "Your project has been updated" : "Your project has been sent for review"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-text-600">
            We check the RERA number and project details before the page goes live. This
            usually takes 1–2 working days.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/dashboard/owner/projects" variant="primary" size="md">
              Go to my projects
            </Button>
            {!editId && (
              <Button variant="outline" size="md" onClick={() => { setSubmitted(false); setName(""); }}>
                Add another project
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

            <FormSection step={1} title="Tell us about your project" subtitle="The basics buyers see first">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Project name" required className="sm:col-span-2">
                  <TextInput placeholder="e.g. Nirvana Skyline" required value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="What kind of project is it?" required className="sm:col-span-2">
                  <PillToggle value={projectType} onChange={setProjectType} options={projectTypeOptions} />
                </Field>
                <Field label="Number of towers" required>
                  <TextInput placeholder="4" inputMode="numeric" required value={towers} onChange={(e) => setTowers(e.target.value)} />
                </Field>
                <Field label="Total number of units" required>
                  <TextInput placeholder="320" inputMode="numeric" required value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} />
                </Field>
                <Field label="Construction status" required>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                    <option value="NEW_LAUNCH">New launch</option>
                    <option value="UNDER_CONSTRUCTION">Under construction</option>
                    <option value="READY_TO_MOVE">Ready to move</option>
                  </Select>
                </Field>
                <Field label="Possession (e.g. Dec 2027)" required>
                  <TextInput placeholder="Dec 2027" required value={possessionLabel} onChange={(e) => setPossessionLabel(e.target.value)} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={2} title="Where is it?">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" required>
                  <Select value={city} onChange={(e) => setCity(e.target.value)}>
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Area / Locality" required>
                  <TextInput placeholder="e.g. Shela" required value={locality} onChange={(e) => setLocality(e.target.value)} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={3} title="Pricing and RERA" subtitle="Needed before the project can go live">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Starting price (₹)" required>
                  <TextInput placeholder="7800000" inputMode="numeric" required value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
                </Field>
                <Field label="Top price (₹)" required>
                  <TextInput placeholder="15000000" inputMode="numeric" required value={priceTo} onChange={(e) => setPriceTo(e.target.value)} />
                </Field>
                <Field label="RERA registration number">
                  <TextInput placeholder="e.g. GJ/RAA11234/281123" value={rera} onChange={(e) => setRera(e.target.value)} />
                </Field>
              </div>
            </FormSection>

            <FormSection step={4} title="Unit types and prices" subtitle="Add every configuration you're offering">
              <div className="space-y-3">
                {units.map((u) => (
                  <div key={u.id} className="grid grid-cols-2 gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-6">
                    <Select
                      className="sm:col-span-1"
                      value={u.configuration}
                      onChange={(e) => updateUnitRow(u.id, "configuration", e.target.value)}
                    >
                      <option>1 BHK</option>
                      <option>2 BHK</option>
                      <option>3 BHK</option>
                      <option>4 BHK</option>
                      <option>Shop</option>
                      <option>Office</option>
                    </Select>
                    <TextInput
                      className="sm:col-span-1"
                      placeholder="Area (sqft)"
                      inputMode="numeric"
                      value={u.areaSqft}
                      onChange={(e) => updateUnitRow(u.id, "areaSqft", e.target.value)}
                    />
                    <TextInput
                      className="sm:col-span-2"
                      placeholder="Price (₹)"
                      inputMode="numeric"
                      value={u.price}
                      onChange={(e) => updateUnitRow(u.id, "price", e.target.value)}
                    />
                    <TextInput
                      className="sm:col-span-1"
                      placeholder="Units avail."
                      inputMode="numeric"
                      value={u.unitsAvailable}
                      onChange={(e) => updateUnitRow(u.id, "unitsAvailable", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeUnitRow(u.id)}
                      className="flex items-center justify-center rounded-lg text-text-400 hover:text-danger-600 sm:col-span-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addUnitRow}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brass-700 hover:text-brass-600"
              >
                <Plus size={14} /> Add another unit type
              </button>
            </FormSection>

            <FormSection step={5} title="What does the project offer?" subtitle="Tap everything that applies">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {projectAmenities.map((a) => (
                  <CheckboxTile key={a} label={a} checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                ))}
              </div>
            </FormSection>

            <FormSection step={6} title="Photos" subtitle="Upload project photos, renders & master plan images">
              <ImageUploader images={images} onChange={setImages} max={15} />
            </FormSection>

            <FormSection step={7} title="Tell buyers about the project">
              <div className="space-y-4">
                <Field label="Project description">
                  <Textarea rows={4} placeholder="What makes this project stand out?" value={description} onChange={(e) => setDescription(e.target.value)} />
                </Field>
                <Field label="Nearby places and connectivity" hint="Comma-separated — schools, hospitals, metro, highways, etc.">
                  <Textarea rows={2} placeholder="10 min from SG Highway, Near Shanti Asiatic School" value={connectivity} onChange={(e) => setConnectivity(e.target.value)} />
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-brass-300">
                  <Building2 size={16} />
                </div>
                <p className="text-sm font-semibold text-ink-900">Before you submit</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-text-600">
                <li>· RERA number is checked against the government registry</li>
                <li>· Projects with full unit pricing get more inquiries</li>
                <li>· You can update pricing anytime after it&apos;s live</li>
                <li>· Review usually takes 1–2 working days</li>
              </ul>
            </Card>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Saving…" : editId ? "Save changes" : "Submit project for review"}
            </Button>
          </div>
        </form>
      )}
    </DashboardShell>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<LoadingRow />}>
      <NewProjectContent />
    </Suspense>
  );
}
