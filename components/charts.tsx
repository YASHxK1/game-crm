"use client";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axisProps = { fontSize: 11, stroke: "#a1a1aa", tick: { fill: "#a1a1aa" } } as const;
const tooltipProps = {
  contentStyle: { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, color: "#fff" },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#fff" },
} as const;

export function RevenueChart({ data }: { data: { day: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="day" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipProps} />
          <Line type="monotone" dataKey="total" stroke="#ffffff" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VisitsChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="count" fill="#ffffff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
