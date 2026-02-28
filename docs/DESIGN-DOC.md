# FSTR Exchange — Design Doc v0.1

## Overview

**FSTR Exchange** is a fake stock trading platform built as a disposable test
application for running HTTP load tests against a TanStack Start SSR application.

The app is intentionally designed to simulate realistic, varied server workloads
rather than trivial "hello world" benchmarks. Each route exercises different
performance characteristics:

- **`/`** — high-frequency SSR reads with aggregation across multiple data
  sources, simulating a busy public-facing dashboard hammered by many concurrent
  users
- **`/$ticker`** — per-resource SSR rendering with heavier data requirements,
  simulating a detail page that sees traffic spikes when a particular resource
  becomes "hot"

The stock trading theme was chosen specifically because it naturally produces the
kinds of load patterns that stress real applications:

- **Read-heavy traffic** on the market overview
- **Uneven hotspot traffic** on individual stock pages (some tickers will be hit
  far more than others)
- **Write contention** when the trade form is wired up to a real backend (future
  scope)
- **Thundering herd potential** when all clients poll for price updates
  simultaneously

The app uses **mock data only** in v0.1. No database, no auth, no real order
execution. The goal is to get a meaningful load test target up quickly —
correctness and realism of the trading logic is not a priority.

---

## Data Interfaces

```ts
interface Stock {
  ticker: string; // "MOON"
  name: string; // "Moonshot Industries"
  currentPrice: number; // 142.57
  previousPrice: number; // 138.20 (last tick, used for % change)
  volume: number; // total shares traded this session
  marketCap: number; // currentPrice * totalShares
  totalShares: number; // fixed supply per stock
}

type Trend = "up" | "down" | "flat";

interface PriceTick {
  ticker: string;
  price: number;
  timestamp: number; // unix ms
  volume: number; // shares traded this tick
}

interface OrderBookEntry {
  id: string;
  ticker: string;
  type: "buy" | "sell";
  quantity: number;
  limitPrice: number;
  status: "pending" | "filled" | "cancelled";
  userId: string;
  createdAt: number; // unix ms
}

interface Portfolio {
  userId: string;
  holdings: Holding[];
}

interface Holding {
  ticker: string;
  quantity: number;
  averageBuyPrice: number;
}

// Derived — computed at render time, not stored
interface StockWithMeta extends Stock {
  trend: Trend;
  changePercent: number; // ((currentPrice - previousPrice) / previousPrice) * 100
  priceHistory: PriceTick[];
}
```

---

## Mock Data Notes

- Seed **6 stocks** (see tickers below)
- Each stock should have **100 pre-generated price ticks** simulating a trading
  session, with realistic-looking price movement (random walk with per-stock
  volatility factor)
- Generate **~20 pending order book entries** spread across stocks

### Seed Stocks

```ts
const STOCKS: Stock[] = [
  {
    ticker: "MOON",
    name: "Moonshot Industries",
    totalShares: 1_000_000,
    // high volatility — swings ±8% per tick
  },
  {
    ticker: "ROCK",
    name: "Bedrock Holdings",
    totalShares: 5_000_000,
    // near-zero volatility — moves ±0.2% per tick
  },
  {
    ticker: "HYPE",
    name: "Hype Corp",
    totalShares: 2_000_000,
    // upward bias — trends up until a random crash event
  },
  {
    ticker: "DOGE",
    name: "Doge Dynamics",
    totalShares: 10_000_000,
    // pure random walk, high volume
  },
  {
    ticker: "BOOM",
    name: "Boom Technologies",
    totalShares: 500_000,
    // low supply, high price, moderate volatility
  },
  {
    ticker: "FLAT",
    name: "Flatline Corp",
    totalShares: 3_000_000,
    // essentially no movement, boring by design
  },
];
```

---

## Pages

---

### `GET /` — Market Overview

**Purpose:** A live-feeling dashboard showing all stocks at a glance. This is
the highest-traffic route and should feel like a real trading terminal.

#### Layout

Full-width dark-themed page. No sidebar. The page has three vertical sections:

1. **Top bar**
2. **Market summary strip**
3. **Stock table**

#### Top Bar

A slim horizontal bar across the top of the page containing:

- Left: App name — `FSTR Exchange` in a monospace font, styled like a terminal
  logo
- Right: A simulated session clock — displays current time in `HH:MM:SS` format,
  labeled `SESSION`, updates every second client-side
- Background: near-black (`zinc-950` or equivalent)

#### Market Summary Strip

A horizontal row of stat cards sitting below the top bar. One card per metric:

- **Market Status** — `OPEN` in green or `CLOSED` in red (hardcode to OPEN for
  mock)
- **Most Active** — ticker with highest volume, e.g. `DOGE`
- **Top Gainer** — ticker with highest positive `changePercent`, shown in green
  with a `▲`
- **Top Loser** — ticker with most negative `changePercent`, shown in red with a
  `▼`
- **Total Volume** — sum of volume across all stocks, formatted as `1.2M`

Cards have a dark border, subtle background, and monospace text. No icons.

#### Stock Table

A full-width table with the following columns:

| Column     | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| Ticker     | Bold monospace ticker symbol e.g. `MOON`                                            |
| Name       | Full company name in muted text                                                     |
| Price      | Current price formatted as `$142.57`                                                |
| Change     | Absolute change from previous price e.g. `+4.37`                                    |
| Change %   | Percentage change e.g. `+3.16%` — green if positive, red if negative, muted if flat |
| Volume     | Formatted with commas or shorthand e.g. `842,300`                                   |
| Market Cap | Formatted as `$1.2B` or `$842M`                                                     |
| Trend      | A small inline sparkline chart (last 20 ticks) — green line if up, red if down      |

Table behaviour:

- Clicking any row navigates to `/$ticker`
- Rows have a subtle hover highlight
- Ticker and Change % columns are the most visually prominent
- Positive change % values are prefixed with `+`, negative with `-`
- Zero/flat values are shown in muted grey with no prefix

---

### `GET /$ticker` — Stock Detail Page

**Purpose:** Deep-dive view for a single stock. Shows price history, order book,
and a buy/sell form. This is the write contention hotspot during load testing.

**On invalid ticker:** Return a simple "Stock not found" message with a back
link to `/`.

#### Layout

Dark-themed. Two-column layout on desktop, stacked on mobile:

- **Left column (60%):** Price chart + order book
- **Right column (40%):** Stock info card + trade form

#### Left Column

**Price Chart**

A line chart rendering all 100 price ticks as a continuous line. Requirements:

- X-axis: timestamps, showing time labels every 10 ticks
- Y-axis: price in `$` format
- Line color: green if current price > first tick price, red otherwise
- A horizontal dashed line marking the session opening price (first tick)
- Chart title: `$TICKER — Price History`
- Use a charting library such as Recharts

**Order Book**

Sits below the chart. Two side-by-side panels:

- **Bids (Buy Orders):** Left panel, green accent. Lists pending buy orders
  sorted by `limitPrice` descending. Columns: Price, Quantity, User.
- **Asks (Sell Orders):** Right panel, red accent. Lists pending sell orders
  sorted by `limitPrice` ascending. Columns: Price, Quantity, User.

Show a maximum of 8 entries per side. If more exist, show a muted
"and N more…" line at the bottom. No pagination.

#### Right Column

**Stock Info Card**

A card at the top of the right column containing:

- Ticker in large bold monospace (e.g. `MOON`)
- Full company name beneath it in muted text
- Current price in large text, coloured green/red based on trend
- Change and change % on the same line, e.g. `▲ $4.37 (3.16%)`
- A divider, then a grid of stats in label/value pairs:
  - Volume
  - Market Cap
  - Total Shares
  - Session High (max price from ticks)
  - Session Low (min price from ticks)
  - Opening Price (first tick)

**Trade Form**

Below the info card. A simple form with:

- A segmented toggle to switch between **Buy** and **Sell** — switching changes
  the form's accent colour (green for buy, red for sell)
- **Quantity** — number input, min 1
- **Limit Price** — number input, pre-filled with current price
- **Estimated Total** — computed display field (`quantity × limitPrice`), updates
  on input change, not user-editable
- A large submit button — `Place Buy Order` or `Place Sell Order` depending on
  mode
- On submit: log to console and show a success toast. No real server action
  needed yet.
- Validation: quantity must be ≥ 1, limit price must be > 0

---

## Out of Scope (v0.1)

- Auth / real user sessions
- Live price updates (no websockets yet)
- Real order execution logic
- Portfolio route
