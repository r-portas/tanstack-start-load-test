import { Line, LineChart } from "recharts";

import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { PriceTick, Trend } from "@/lib/mock-data";

interface SparklineProps {
  data: PriceTick[];
  trend: Trend;
}

export function Sparkline({ data, trend }: SparklineProps) {
  const chartConfig = {
    price: {
      color:
        trend === "up"
          ? "var(--positive)"
          : trend === "down"
            ? "var(--negative)"
            : "var(--muted-foreground)",
    },
  } satisfies ChartConfig;

  return (
    <div className="h-8 w-20">
      <ChartContainer config={chartConfig}>
        <LineChart data={data}>
          <Line
            dataKey="price"
            type="linear"
            stroke="var(--color-price)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
