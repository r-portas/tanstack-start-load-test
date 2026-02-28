import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ORDER_BOOK,
  STOCKS_BY_TICKER,
  formatChange,
  formatChangePercent,
  formatMarketCap,
  formatPrice,
  formatVolume,
  type Trend,
} from "@/lib/mock-data";

export const Route = createFileRoute("/$ticker")({
  component: StockDetail,
});

function trendColor(trend: Trend): string {
  if (trend === "up") return "text-[var(--positive)]";
  if (trend === "down") return "text-[var(--negative)]";
  return "text-muted-foreground";
}

function trendGlyph(trend: Trend): string {
  if (trend === "up") return "▲";
  if (trend === "down") return "▼";
  return "—";
}

// ---------------------------------------------------------------------------
// Price Chart
// ---------------------------------------------------------------------------

function PriceChart({
  ticker,
  priceHistory,
  trend,
}: {
  ticker: string;
  priceHistory: { price: number; timestamp: number }[];
  trend: Trend;
}) {
  const openPrice = priceHistory[0].price;

  const chartConfig = {
    price: {
      color: trend === "up" ? "var(--positive)" : "var(--negative)",
    },
  } satisfies ChartConfig;

  return (
    <div className="border-b border-border bg-card p-4">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        ${ticker} — Price History
      </p>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <LineChart data={priceHistory} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 4"
            stroke="var(--border)"
          />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            interval={9}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }}
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={60}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "monospace" }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `$${Number(value).toFixed(2)}`,
                  "Price",
                ]}
                labelFormatter={(label: number) =>
                  new Date(label).toLocaleTimeString()
                }
              />
            }
          />
          <ReferenceLine
            y={openPrice}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
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

// ---------------------------------------------------------------------------
// Order Book
// ---------------------------------------------------------------------------

function OrderBook({ ticker }: { ticker: string }) {
  const orders = ORDER_BOOK.filter(
    (o) => o.ticker === ticker && o.status === "pending",
  );

  const bids = orders
    .filter((o) => o.type === "buy")
    .sort((a, b) => b.limitPrice - a.limitPrice);

  const asks = orders
    .filter((o) => o.type === "sell")
    .sort((a, b) => a.limitPrice - b.limitPrice);

  const bidsVisible = bids.slice(0, 8);
  const asksVisible = asks.slice(0, 8);
  const bidsOverflow = bids.length - bidsVisible.length;
  const asksOverflow = asks.length - asksVisible.length;

  return (
    <div className="bg-card">
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Bids */}
        <div className="p-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--positive)]">
            Bids
          </p>
          <div className="grid grid-cols-3 gap-x-2 pb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span>Price</span>
            <span>Qty</span>
            <span>User</span>
          </div>
          {bidsVisible.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-3 gap-x-2 py-0.5 font-mono text-xs"
            >
              <span className="text-[var(--positive)]">
                {formatPrice(order.limitPrice)}
              </span>
              <span className="text-muted-foreground">{order.quantity}</span>
              <span className="truncate text-muted-foreground">
                {order.userId}
              </span>
            </div>
          ))}
          {bidsOverflow > 0 && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              and {bidsOverflow} more…
            </p>
          )}
        </div>

        {/* Asks */}
        <div className="p-3">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[var(--negative)]">
            Asks
          </p>
          <div className="grid grid-cols-3 gap-x-2 pb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span>Price</span>
            <span>Qty</span>
            <span>User</span>
          </div>
          {asksVisible.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-3 gap-x-2 py-0.5 font-mono text-xs"
            >
              <span className="text-[var(--negative)]">
                {formatPrice(order.limitPrice)}
              </span>
              <span className="text-muted-foreground">{order.quantity}</span>
              <span className="truncate text-muted-foreground">
                {order.userId}
              </span>
            </div>
          ))}
          {asksOverflow > 0 && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              and {asksOverflow} more…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock Info Panel
// ---------------------------------------------------------------------------

function StockInfoPanel({
  ticker,
  name,
  currentPrice,
  previousPrice,
  volume,
  marketCap,
  totalShares,
  trend,
  changePercent,
  priceHistory,
}: {
  ticker: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  volume: number;
  marketCap: number;
  totalShares: number;
  trend: Trend;
  changePercent: number;
  priceHistory: { price: number }[];
}) {
  const sessionHigh = Math.max(...priceHistory.map((t) => t.price));
  const sessionLow = Math.min(...priceHistory.map((t) => t.price));
  const openPrice = priceHistory[0].price;

  const stats = [
    { label: "Volume", value: formatVolume(volume) },
    { label: "Mkt Cap", value: formatMarketCap(marketCap) },
    { label: "Shares", value: formatVolume(totalShares) },
    { label: "Session High", value: formatPrice(sessionHigh) },
    { label: "Session Low", value: formatPrice(sessionLow) },
    { label: "Open", value: formatPrice(openPrice) },
  ];

  return (
    <div className="border-b border-border bg-card p-4">
      <p className="font-mono text-2xl font-bold text-primary">{ticker}</p>
      <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {name}
      </p>

      <p className={`mt-3 font-mono text-3xl font-bold ${trendColor(trend)}`}>
        {formatPrice(currentPrice)}
      </p>
      <p className={`mt-0.5 font-mono text-sm ${trendColor(trend)}`}>
        {trendGlyph(trend)}{" "}
        {formatChange(currentPrice, previousPrice, trend)} (
        {formatChangePercent(changePercent, trend)})
      </p>

      <Separator className="my-3" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="font-mono text-xs text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trade Form
// ---------------------------------------------------------------------------

function TradeForm({
  ticker,
  currentPrice,
}: {
  ticker: string;
  currentPrice: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(
    parseFloat(currentPrice.toFixed(2)),
  );

  const estimatedTotal = (quantity * limitPrice).toFixed(2);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quantity < 1 || limitPrice <= 0) return;
    console.log({ ticker, side, quantity, limitPrice });
    toast.success(
      `Order placed: ${side.toUpperCase()} ${quantity} ${ticker} @ $${limitPrice.toFixed(2)}`,
    );
  }

  const isBuy = side === "buy";
  const submitClass = isBuy
    ? "w-full bg-[var(--positive)] text-background hover:opacity-90"
    : "w-full bg-[var(--negative)] text-background hover:opacity-90";

  return (
    <div className="bg-card p-4">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Place Order
      </p>

      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="buy" className="flex-1 font-mono text-xs uppercase tracking-widest">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1 font-mono text-xs uppercase tracking-widest">
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Quantity
          </label>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Limit Price
          </label>
          <Input
            type="number"
            min={0.01}
            step={0.01}
            value={limitPrice}
            onChange={(e) =>
              setLimitPrice(parseFloat(e.target.value) || 0)
            }
            className="font-mono text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Estimated Total
          </label>
          <div className="border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground">
            ${estimatedTotal}
          </div>
        </div>

        <Button type="submit" className={submitClass}>
          Place {isBuy ? "Buy" : "Sell"} Order
        </Button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function StockDetail() {
  const { ticker } = Route.useParams();
  const stock = STOCKS_BY_TICKER[ticker.toUpperCase()];

  if (!stock) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="font-mono text-sm text-muted-foreground">
          Stock not found: {ticker}
        </p>
        <Link
          to="/"
          className="font-mono text-xs text-muted-foreground underline hover:text-primary"
        >
          ← Back to market
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back nav */}
      <div className="border-b border-border bg-card px-4 py-2">
        <Link
          to="/"
          className="font-mono text-xs text-muted-foreground hover:text-primary"
        >
          ← FSTR Exchange
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-px border-t border-border bg-border lg:grid-cols-[60%_40%]">
        {/* Left column */}
        <div className="flex flex-col divide-y divide-border bg-background">
          <PriceChart
            ticker={stock.ticker}
            priceHistory={stock.priceHistory}
            trend={stock.trend}
          />
          <OrderBook ticker={stock.ticker} />
        </div>

        {/* Right column */}
        <div className="flex flex-col divide-y divide-border border-l border-border bg-background">
          <StockInfoPanel
            ticker={stock.ticker}
            name={stock.name}
            currentPrice={stock.currentPrice}
            previousPrice={stock.previousPrice}
            volume={stock.volume}
            marketCap={stock.marketCap}
            totalShares={stock.totalShares}
            trend={stock.trend}
            changePercent={stock.changePercent}
            priceHistory={stock.priceHistory}
          />
          <TradeForm ticker={stock.ticker} currentPrice={stock.currentPrice} />
        </div>
      </div>
    </div>
  );
}
