import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Sparkline } from "@/components/sparkline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStocks,
  formatChange,
  formatChangePercent,
  formatMarketCap,
  formatPrice,
  formatVolume,
  type StockWithMeta,
  type Trend,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: MarketOverview,
  loader: () => ({
    stocks: getStocks(),
  })
});

// ---------------------------------------------------------------------------
// Top Bar
// ---------------------------------------------------------------------------

function TopBar() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = time.toTimeString().slice(0, 8);

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      <span className="font-mono text-base font-bold tracking-widest text-primary">
        FSTR Exchange
      </span>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Session
        </span>
        <span className="font-mono text-sm text-foreground" suppressHydrationWarning>
          {formatted}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Market Summary Strip
// ---------------------------------------------------------------------------

function trendColor(trend: Trend): string {
  if (trend === "up") return "text-[var(--positive)]";
  if (trend === "down") return "text-[var(--negative)]";
  return "text-muted-foreground";
}

function MarketSummaryStrip({ stocks }: { stocks: StockWithMeta[] }) {
  const mostActive = stocks.reduce((a, b) => (a.volume > b.volume ? a : b));
  const topGainer = stocks.reduce((a, b) =>
    a.changePercent > b.changePercent ? a : b,
  );
  const topLoser = stocks.reduce((a, b) =>
    a.changePercent < b.changePercent ? a : b,
  );
  const totalVol = stocks.reduce((sum, s) => sum + s.volume, 0);

  const cells = [
    {
      label: "Market Status",
      value: "OPEN",
      valueClass: "text-[var(--positive)]",
    },
    {
      label: "Most Active",
      value: mostActive.ticker,
      valueClass: "text-foreground",
    },
    {
      label: "Top Gainer",
      value: `▲ ${topGainer.ticker}`,
      valueClass: "text-[var(--positive)]",
    },
    {
      label: "Top Loser",
      value: `▼ ${topLoser.ticker}`,
      valueClass: "text-[var(--negative)]",
    },
    {
      label: "Total Volume",
      value: formatVolume(totalVol),
      valueClass: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-px border-b border-border bg-border">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-3 py-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {cell.label}
          </p>
          <p className={`mt-0.5 font-mono text-sm font-bold ${cell.valueClass}`}>
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock Table
// ---------------------------------------------------------------------------

function StockTableRow({
  stock,
  onClick,
}: {
  stock: StockWithMeta;
  onClick: () => void;
}) {
  const changeClass = trendColor(stock.trend);

  return (
    <TableRow
      className="cursor-pointer hover:bg-card"
      role="link"
      tabIndex={0}
      onClick={onClick}
    >
      <TableCell className="font-mono font-bold text-primary">
        {stock.ticker}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {stock.name}
      </TableCell>
      <TableCell className="font-mono text-sm">
        {formatPrice(stock.currentPrice)}
      </TableCell>
      <TableCell className={`font-mono text-sm ${changeClass}`}>
        {formatChange(stock.currentPrice, stock.previousPrice, stock.trend)}
      </TableCell>
      <TableCell className={`font-mono text-sm font-bold ${changeClass}`}>
        {formatChangePercent(stock.changePercent, stock.trend)}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {formatVolume(stock.volume)}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {formatMarketCap(stock.marketCap)}
      </TableCell>
      <TableCell>
        <Sparkline data={stock.priceHistory.slice(-20)} trend={stock.trend} />
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function MarketOverview() {
  const { stocks } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <MarketSummaryStrip stocks={stocks} />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Ticker
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Name
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Price
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Change
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Change %
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Volume
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Mkt Cap
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Trend
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <StockTableRow
              key={stock.ticker}
              stock={stock}
              onClick={() =>
                navigate({ to: "/$ticker", params: { ticker: stock.ticker } })
              }
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
