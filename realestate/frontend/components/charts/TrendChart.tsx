"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { compactINR } from "@/lib/format-compact";

export function TrendChart({
  data,
  dataKey,
  xKey = "label",
  color = "#C9A227",
  height = 240,
  valuePrefix = "",
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  valuePrefix?: string;
}) {
  const gradientId = `grad-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E6DFD1" strokeDasharray="3 4" />
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
          width={52}
          tickFormatter={(v: number) => `${valuePrefix}${compactINR(v)}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            borderColor: "#E6DFD1",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}
          formatter={(value) => [`${valuePrefix}${Number(value).toLocaleString("en-IN")}`, ""]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.25}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
