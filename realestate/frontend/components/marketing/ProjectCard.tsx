import Link from "next/link";
import { MapPin, Building2, Layers } from "lucide-react";
import { NewProject, formatINR } from "@/lib/mock-data";
import { Badge } from "../ui/Badge";

export function ProjectCard({ project }: { project: NewProject }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg hover:shadow-ink-900/5"
    >
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {project.reraVerified && <Badge variant="verified">RERA Verified</Badge>}
          <Badge variant="neutral" className="bg-white/90">
            {project.status}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-medium leading-snug text-ink-900">{project.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-text-500">
          <MapPin size={12} />
          {project.locality}, {project.city}
        </p>
        <p className="mt-1 text-xs text-text-400">by {project.builder}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-text-600">
          <span className="flex items-center gap-1">
            <Building2 size={13} /> {project.configurations.join(", ")}
          </span>
          <span className="flex items-center gap-1">
            <Layers size={13} /> {project.towers} towers
          </span>
        </div>

        <div className="mt-3 border-t border-stone-100 pt-3">
          <p className="text-xs text-text-400">Price range</p>
          <p className="font-display text-base font-medium text-ink-900">
            {formatINR(project.priceFrom)} – {formatINR(project.priceTo)}
          </p>
        </div>
      </div>
    </Link>
  );
}
