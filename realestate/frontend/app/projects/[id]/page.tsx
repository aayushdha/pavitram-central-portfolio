import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Layers,
  CalendarCheck2,
  ChevronRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ProjectCard } from "@/components/marketing/ProjectCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { newProjects, formatINR } from "@/lib/mock-data";

export function generateStaticParams() {
  return newProjects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = newProjects.find((p) => p.id === id);
  if (!project) notFound();

  const similar = newProjects.filter((p) => p.id !== project.id && p.city === project.city).slice(0, 3);

  const facts = [
    { icon: Building2, label: "Configurations", value: project.configurations.join(", ") },
    { icon: Layers, label: "Area range", value: `${project.areaFrom.toLocaleString("en-IN")} – ${project.areaTo.toLocaleString("en-IN")} sqft` },
    { icon: CalendarCheck2, label: "Possession", value: project.possession },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-1.5 text-xs text-text-400">
          <Link href="/projects" className="hover:text-ink-900">New Projects</Link>
          <ChevronRight size={12} />
          <span>{project.city}</span>
          <ChevronRight size={12} />
          <span className="text-text-600">{project.locality}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="h-72 w-full overflow-hidden rounded-2xl bg-stone-100 sm:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
            </div>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {project.reraVerified && <Badge variant="verified">RERA Verified</Badge>}
                  <Badge variant="neutral">{project.status}</Badge>
                  <Badge variant="neutral">{project.type}</Badge>
                </div>
                <h1 className="mt-3 font-display text-2xl font-medium text-ink-900 sm:text-3xl">{project.name}</h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-500">
                  <MapPin size={14} />
                  {project.locality}, {project.city} · by {project.builder}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-400">Price range</p>
                <p className="font-display text-2xl font-medium text-ink-900">
                  {formatINR(project.priceFrom)} – {formatINR(project.priceTo)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <f.icon size={16} className="text-brass-600" />
                  <p className="mt-2 text-xs text-text-500">{f.label}</p>
                  <p className="text-sm font-medium text-ink-900">{f.value}</p>
                </div>
              ))}
            </div>

            {project.reraVerified && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-brass-200 bg-brass-50/60 p-5">
                <SealMark size={30} className="shrink-0 text-brass-600" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">RERA registered project</p>
                  <p className="font-mono text-xs text-text-600">{project.rera}</p>
                  <p className="mt-0.5 text-xs text-text-500">Checked against the official registry</p>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink-900">About this project</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-600">{project.description}</p>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink-900">What&apos;s nearby</h2>
              <ul className="mt-3 space-y-2">
                {project.connectivity.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-text-600">
                    <MapPin size={13} className="shrink-0 text-brass-600" /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink-900">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {project.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-text-700">
                    <Check size={14} className="shrink-0 text-brass-600" /> {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg font-medium text-ink-900">Project details</h2>
              <div className="mt-3 grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-text-400">Total units</p>
                  <p className="text-sm font-medium text-ink-900">{project.totalUnits}</p>
                </div>
                <div>
                  <p className="text-xs text-text-400">Towers</p>
                  <p className="text-sm font-medium text-ink-900">{project.towers}</p>
                </div>
                <div>
                  <p className="text-xs text-text-400">Project type</p>
                  <p className="text-sm font-medium text-ink-900">{project.type}</p>
                </div>
                <div>
                  <p className="text-xs text-text-400">Status</p>
                  <p className="text-sm font-medium text-ink-900">{project.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — enquire */}
          <aside className="space-y-5">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                  {project.builder.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{project.builder}</p>
                  <p className="text-xs text-text-500">Builder</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <Button variant="primary" size="md" icon={<Phone size={15} />} className="w-full">
                  Get callback
                </Button>
                <Button variant="outline" size="md" icon={<MessageSquare size={15} />} className="w-full">
                  Chat with builder
                </Button>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-xs text-text-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brass-600" />
                Your number stays private until you choose to share it.
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 font-display text-xl font-medium text-ink-900">More projects in {project.city}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
