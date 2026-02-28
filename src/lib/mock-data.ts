// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Stock {
  ticker: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  volume: number;
  marketCap: number;
  totalShares: number;
}

export type Trend = "up" | "down" | "flat";

export interface PriceTick {
  ticker: string;
  price: number;
  timestamp: number;
  volume: number;
}

export interface OrderBookEntry {
  id: string;
  ticker: string;
  type: "buy" | "sell";
  quantity: number;
  limitPrice: number;
  status: "pending" | "filled" | "cancelled";
  userId: string;
  createdAt: number;
}

export interface StockWithMeta extends Stock {
  trend: Trend;
  changePercent: number;
  priceHistory: PriceTick[];
}

// ---------------------------------------------------------------------------
// Seed config (internal)
// ---------------------------------------------------------------------------

interface SeedConfig {
  ticker: string;
  name: string;
  startPrice: number;
  totalShares: number;
  volatility: number;
  bias: number;
  crashProbability: number;
  baseVolume: number;
}

const SEED_CONFIGS: SeedConfig[] = [
  {
    ticker: "MOON",
    name: "Moonshot Industries",
    startPrice: 142.57,
    totalShares: 1_000_000,
    volatility: 0.08,
    bias: 0,
    crashProbability: 0,
    baseVolume: 5_000,
  },
  {
    ticker: "ROCK",
    name: "Bedrock Holdings",
    startPrice: 88.0,
    totalShares: 5_000_000,
    volatility: 0.002,
    bias: 0,
    crashProbability: 0,
    baseVolume: 10_000,
  },
  {
    ticker: "HYPE",
    name: "Hype Corp",
    startPrice: 55.2,
    totalShares: 2_000_000,
    volatility: 0.03,
    bias: 0.003,
    crashProbability: 0.02,
    baseVolume: 15_000,
  },
  {
    ticker: "DOGE",
    name: "Doge Dynamics",
    startPrice: 12.44,
    totalShares: 10_000_000,
    volatility: 0.06,
    bias: 0,
    crashProbability: 0,
    baseVolume: 80_000,
  },
  {
    ticker: "BOOM",
    name: "Boom Technologies",
    startPrice: 1_240.0,
    totalShares: 500_000,
    volatility: 0.04,
    bias: 0,
    crashProbability: 0,
    baseVolume: 1_000,
  },
  {
    ticker: "FLAT",
    name: "Flatline Corp",
    startPrice: 25.0,
    totalShares: 3_000_000,
    volatility: 0.001,
    bias: 0,
    crashProbability: 0,
    baseVolume: 500,
  },
];

// Fixed session start — consistent across SSR renders
const SESSION_START_MS = new Date("2026-02-28T09:30:00Z").getTime();

const FAKE_USERS = ["usr-alpha", "usr-beta", "usr-gamma", "usr-delta", "usr-epsilon"];

// ---------------------------------------------------------------------------
// Generation functions
// ---------------------------------------------------------------------------

function generatePriceTicks(config: SeedConfig, tickCount = 100): PriceTick[] {
  const ticks: PriceTick[] = [];
  let price = config.startPrice;

  for (let i = 0; i < tickCount; i++) {
    const delta = price * config.volatility * (Math.random() * 2 - 1);
    price = price * (1 + config.bias) + delta;

    if (config.crashProbability > 0 && Math.random() < config.crashProbability) {
      price *= 0.7;
    }

    price = Math.max(0.01, price);

    ticks.push({
      ticker: config.ticker,
      price,
      timestamp: SESSION_START_MS + i * 60_000,
      volume: Math.floor(config.baseVolume * (0.5 + Math.random())),
    });
  }

  return ticks;
}

function buildStockWithMeta(config: SeedConfig): StockWithMeta {
  const priceHistory = generatePriceTicks(config);
  const currentPrice = priceHistory[99].price;
  const previousPrice = priceHistory[98].price;
  const volume = priceHistory.reduce((sum, t) => sum + t.volume, 0);
  const marketCap = currentPrice * config.totalShares;

  const pctChange = (currentPrice - previousPrice) / previousPrice;
  const trend: Trend =
    pctChange > 0.0001 ? "up" : pctChange < -0.0001 ? "down" : "flat";

  return {
    ticker: config.ticker,
    name: config.name,
    currentPrice,
    previousPrice,
    volume,
    marketCap,
    totalShares: config.totalShares,
    trend,
    changePercent: pctChange * 100,
    priceHistory,
  };
}

function generateOrderBook(stocks: StockWithMeta[]): OrderBookEntry[] {
  const entries: OrderBookEntry[] = [];
  let idx = 0;

  for (const stock of stocks) {
    const price = stock.currentPrice;

    // 2 buy orders per stock
    for (let i = 0; i < 2; i++) {
      entries.push({
        id: `ord-${stock.ticker}-${idx++}`,
        ticker: stock.ticker,
        type: "buy",
        quantity: Math.floor(10 + Math.random() * 490),
        limitPrice: price * (0.97 + Math.random() * 0.025),
        status: "pending",
        userId: FAKE_USERS[idx % FAKE_USERS.length],
        createdAt: SESSION_START_MS + Math.floor(Math.random() * 5_400_000),
      });
    }

    // 1–2 sell orders per stock
    const sellCount = idx % 2 === 0 ? 2 : 1;
    for (let i = 0; i < sellCount; i++) {
      entries.push({
        id: `ord-${stock.ticker}-${idx++}`,
        ticker: stock.ticker,
        type: "sell",
        quantity: Math.floor(10 + Math.random() * 490),
        limitPrice: price * (1.005 + Math.random() * 0.025),
        status: "pending",
        userId: FAKE_USERS[idx % FAKE_USERS.length],
        createdAt: SESSION_START_MS + Math.floor(Math.random() * 5_400_000),
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Exported data — computed once at module load time
// ---------------------------------------------------------------------------

export const STOCKS: StockWithMeta[] = SEED_CONFIGS.map(buildStockWithMeta);

export const STOCKS_BY_TICKER: Record<string, StockWithMeta> = Object.fromEntries(
  STOCKS.map((s) => [s.ticker, s]),
);

export const ORDER_BOOK: OrderBookEntry[] = generateOrderBook(STOCKS);

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function formatMarketCap(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString("en-US")}`;
}

export function formatChangePercent(n: number, trend: Trend): string {
  if (trend === "flat") return "0.00%";
  const prefix = n > 0 ? "+" : "";
  return `${prefix}${n.toFixed(2)}%`;
}

export function formatChange(current: number, previous: number, trend: Trend): string {
  const diff = current - previous;
  if (trend === "flat") return "0.00";
  const prefix = diff > 0 ? "+" : "";
  return `${prefix}${diff.toFixed(2)}`;
}
