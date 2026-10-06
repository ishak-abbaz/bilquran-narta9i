"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  SalesRange,
  SalesTimelinePoint,
} from "@/lib/data/sales";
import {
  formatPrice,
} from "@/lib/utils";

type SalesChartProps = {
  data: SalesTimelinePoint[];
  range: SalesRange;
};

const compactNumberFormatter =
  new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    },
  );

export default function SalesChart({
  data,
  range,
}: SalesChartProps) {
  const tickInterval =
    range === "30d"
      ? 4
      : range === "24h"
        ? 2
        : 0;

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        لا توجد بيانات مبيعات لهذه الفترة.
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className="h-80 w-full"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 8,
            right: 4,
            bottom: 0,
            left: 4,
          }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="label"
            reversed
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
            }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{
              fontSize: 12,
            }}
            tickFormatter={(value) =>
              compactNumberFormatter.format(
                Number(value),
              )
            }
          />

          <Tooltip
            cursor={{
              opacity: 0.08,
            }}
            formatter={(value) => [
              formatPrice(
                Number(value),
              ),
              "الإيرادات",
            ]}
            contentStyle={{
              borderRadius: "0.75rem",
            }}
          />

          <Bar
            dataKey="revenue"
            fill="var(--primary)"
            radius={[
              6,
              6,
              0,
              0,
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}