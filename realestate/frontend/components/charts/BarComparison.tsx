"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { compactINR } from "@/lib/format-compact";

const PALETTE = ["#C9A227", "#1A2238", "#D4AF37", "#5B6178", "#8F7220"];

export function BarComparison({
  data,
  dataKey,
  xKey = "label",
  height = 240,
  horizontal = false,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey?: string;
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 10, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={!horizontal}
          vertical={horizontal}
          stroke="#E6DFD1"
          strokeDasharray="3 4"
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#8B90A3" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={compactINR}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#2E3548" }}
              axisLine={false}
              tickLine={false}
              width={118}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: "#8B90A3" }}
              axisLine={{ stroke: "#E6DFD1" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#8B90A3" }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={compactINR}
              allowDecimals={false}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "#FAF7F2" }}
          contentStyle={{ borderRadius: 10, borderColor: "#E6DFD1", fontSize: 13 }}
          formatter={(value) => [Number(value).toLocaleString("en-IN"), ""]}
        />
        <Bar dataKey={dataKey} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
