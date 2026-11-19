import Link from "next/link";
import { Property, formatPrice } from "@/lib/mock-data";
import { SealMark } from "../ui/SealMark";

// Deterministic pseudo-scatter so pins don't overlap and look intentional,
// without depending on a real geocoding/tiles service.
function pinPosition(index: number) {
  const angle = index * 137.508; // golden angle
  const radius = 14 + (index % 4) * 9;
  const cx = 50 + radius * Math.cos((angle * Math.PI) / 180) * 0.9;
  const cy = 50 + radius * Math.sin((angle * Math.PI) / 180) * 0.7;
  return {
    left: `${Math.min(92, Math.max(8, cx))}%`,
    top: `${Math.min(88, Math.max(10, cy))}%`,
  };
}

export function MapPreview({ properties }: { properties: Property[] }) {
  return (
    <div className="relative h-[560px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
      <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#E6DFD1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path d="M0,120 C200,80 320,220 560,160 S820,90 1000,180" stroke="#9AA0B0" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M0,340 C180,300 380,420 600,360 S900,260 1100,380" stroke="#9AA0B0" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>

      {properties.map((p, i) => {
        const pos = pinPosition(i);
        return (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            style={pos}
            className="group absolute -translate-x-1/2 -translate-y-full"
          >
            <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition-transform group-hover:scale-105">
              {p.verified && <SealMark size={10} className="text-brass-200" />}
              {formatPrice(p)}
            </div>
            <div className="mx-auto h-2.5 w-2.5 -translate-y-px rotate-45 bg-ink-900" />
          </Link>
        );
      })}

      <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 text-xs text-text-500 shadow">
        Map is a stylized preview of {properties.length} result{properties.length === 1 ? "" : "s"} — hover a pin to see price
      </div>
    </div>
  );
}
