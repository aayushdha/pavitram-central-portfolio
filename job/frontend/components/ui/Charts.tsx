"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const gridColor = "#E6E7F0";
const mutedColor = "#64667A";
const pieColors = ["#4F3FF0", "#FF7A1A", "#17A672", "#6C63F5", "#E0A700"];

type ChartRow = Record<string, string | number>;
type TooltipEntry = { dataKey?: string | number; color?: string; name?: string | number; value?: string | number };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipEntry[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-ink-900 text-white text-xs px-3 py-2 shadow-lg">
      <p className="font-semibold mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </p>
      ))}
    </div>
  );
}

export function FunnelChart({ data }: { data: { stage: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "#12131C" }} axisLine={false} tickLine={false} width={90} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F5F6FB" }} />
        <Bar dataKey="value" fill="#4F3FF0" radius={[0, 6, 6, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({
  data,
  dataKey,
  color = "#4F3FF0",
  xKey = "month",
}: {
  data: ChartRow[];
  dataKey: string;
  color?: string;
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiTrendLine({
  data,
  lines,
  xKey = "month",
}: {
  data: ChartRow[];
  lines: { key: string; color: string; name: string }[];
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: mutedColor }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SplitPie({ data, nameKey, valueKey }: { data: ChartRow[]; nameKey: string; valueKey: string }) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={42} outerRadius={68} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={pieColors[i % pieColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={d[nameKey]} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: pieColors[i % pieColors.length] }} />
            <span className="text-ink font-medium">{d[valueKey]}%</span>
            <span className="text-muted">{d[nameKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
