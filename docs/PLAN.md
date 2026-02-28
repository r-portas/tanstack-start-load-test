# FSTR Exchange — Implementation Plan

## Overview

Replace the template landing page with a fake stock trading platform for load testing.
Two routes: `/` (market overview) and `/$ticker` (stock detail).

---

## Styling Guide

The theme is already configured in `src/global.css`. All styling decisions follow from it — do not hardcode colors or override with zinc/slate/arbitrary hex values.

**Tokens to use:**

| Intent                            | Token / Class                                    |
| --------------------------------- | ------------------------------------------------ |
| Page background                   | `bg-background` (`oklch(0.08 0 0)` — near-black) |
| Card / panel background           | `bg-card` (`oklch(0.11 0 0)`)                    |
| Borders                           | `border-border` (`oklch(0.2 0 0)`)               |
| Body / label text                 | `text-foreground`                                |
| Dim / secondary text              | `text-muted-foreground`                          |
| Primary accent (Bloomberg orange) | `text-primary`, `bg-primary`                     |
| Price up / positive               | `text-[var(--positive)]` (green)                 |
| Price down / negative             | `text-[var(--negative)]` (red)                   |
| Monospace font                    | `font-mono` → resolves to IBM Plex Mono          |

**Rules:**

- **No rounding.** `--radius: 0rem` — never use `rounded-*` classes.
- **No hardcoded colors.** No `zinc-*`, `gray-*`, or hex values in className props. Use the tokens above.
- **No `Heading` or `Lead` typography components** on this app's pages — those are serif/editorial. All text is `font-mono` with explicit `text-xs/sm/base` and `text-muted-foreground`/`text-foreground` as appropriate.
- **Chart colors** in `ChartConfig`: use `"var(--positive)"`, `"var(--negative)"`, `"var(--muted-foreground)"` for trading-semantic colors; use `"var(--chart-1)"` (orange) for neutral data series.
- **Density:** tight padding (`px-3 py-2`, `gap-1`/`gap-2`), small text (`text-xs`/`text-sm`), uppercase tracking-widest labels. Bloomberg terminals are dense — avoid generous whitespace.

---

## Step 1 — Install dependencies

```bash
bunx shadcn@latest add chart sonner
```

- `chart` — shadcn chart component; generates `src/components/ui/chart.tsx` and installs `recharts` automatically
- `sonner` — shadcn-wrapped toast; generates `src/components/ui/sonner.tsx`

---

## Step 2 — Create `src/lib/mock-data.ts`

Core data layer. Both routes import from here. Computed once at module load time.

**Exports:**

- All interfaces: `Stock`, `Trend`, `PriceTick`, `OrderBookEntry`, `StockWithMeta`
- `STOCKS: StockWithMeta[]` — 6 stocks with 100 pre-generated price ticks each
- `STOCKS_BY_TICKER: Record<string, StockWithMeta>` — O(1) lookup for the detail page
- `ORDER_BOOK: OrderBookEntry[]` — ~20 pending entries spread across all tickers
- `formatPrice`, `formatVolume`, `formatMarketCap`, `formatChangePercent` — domain formatting helpers

**Price tick generation (random walk per stock):**

| Ticker | Start Price | Shares     | Volatility | Bias  | Crash Prob | Base Vol |
| ------ | ----------- | ---------- | ---------- | ----- | ---------- | -------- |
| MOON   | $142.57     | 1,000,000  | ±8%        | none  | 0%         | 5,000    |
| ROCK   | $88.00      | 5,000,000  | ±0.2%      | none  | 0%         | 10,000   |
| HYPE   | $55.20      | 2,000,000  | ±3%        | +0.3% | 2%         | 15,000   |
| DOGE   | $12.44      | 10,000,000 | ±6%        | none  | 0%         | 80,000   |
| BOOM   | $1,240.00   | 500,000    | ±4%        | none  | 0%         | 1,000    |
| FLAT   | $25.00      | 3,000,000  | ±0.1%      | none  | 0%         | 500      |

Each tick: `SESSION_START_MS + i * 60_000` (fixed constant for consistent SSR renders).

**`StockWithMeta` computed fields:**

- `currentPrice` = tick[99].price, `previousPrice` = tick[98].price
- `volume` = sum of all tick volumes
- `marketCap` = currentPrice × totalShares
- `trend`: "up" / "down" / "flat" based on last tick vs. second-to-last
- `changePercent` = ((current - previous) / previous) × 100

**Order book:** ~20 entries with deterministic IDs (`"ord-{ticker}-{i}"`), all `status: "pending"`, `limitPrice` near current price, `userId` from a fixed fake user pool.

**Note:** `Portfolio` and `Holding` interfaces from the design doc are out of scope for v0.1 — do not declare them (TypeScript `noUnusedLocals` will fail).

---

## Step 3 — Update `src/constants.ts`

```ts
export const APP_NAME = "FSTR Exchange";
```

---

## Step 4 — Update `src/routes/__root.tsx`

- Remove `import { Navbar }` and `<Navbar />`.
- Replace `<main className="container mx-auto px-4">` with a bare `{children}` — each route manages its own full-width layout.
- Add `<Toaster />` from `@/components/ui/sonner` inside `<body>` (after children, before `<Scripts />`).

---

## Step 5 — Delete dead files

- `src/routes/dashboard.tsx` — unused template route
- `src/components/navbar.tsx` — Navbar being removed from root

TanStack Router will auto-regenerate `routeTree.gen.ts` on next `bun dev` run. Never edit `routeTree.gen.ts` manually.

---

## Step 6 — Create `src/components/sparkline.tsx`

Tiny inline shadcn chart for the stock table's "Trend" column. Uses `ChartContainer` from `@/components/ui/chart` wrapping a bare `LineChart`.

```tsx
// Props: data: PriceTick[], trend: Trend
// ChartConfig defines a "price" key with color set dynamically by trend
// ChartContainer handles the responsive sizing wrapper
// LineChart with no axes, no grid, no tooltip — pure visual sparkline
// dot={false}, isAnimationActive={false} (SSR safety)
```

Color is passed via `ChartConfig`:

```ts
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
```

Then `<Line>` uses `stroke="var(--color-price)"` — `ChartContainer` resolves `--color-price` from the config. No hardcoded hex. The sparkline wrapper div needs a fixed height: `className="h-8 w-20"` so `ChartContainer` has a constrained box to fill.

---

## Step 7 — Replace `src/routes/index.tsx` — Market Overview

**Typography note:** This page is a terminal-style dashboard. Raw `<p>`/`<span>` with `font-mono` Tailwind classes are used throughout — NOT the `Heading`, `Lead`, or `Typography` components (which are serif/editorial and visually wrong here). This is an intentional exception per CLAUDE.md's guidance to explain mismatches.

**Layout:** `<div className="min-h-screen bg-background text-foreground">`

**Top Bar** (`<TopBar />` inline component):

- Left: `FSTR Exchange` in `font-mono font-bold tracking-widest text-primary` (Bloomberg orange)
- Right: `SESSION HH:MM:SS` — client-side clock via `useState` + `useEffect` interval. `suppressHydrationWarning` on the time element.
- Bar: `bg-card border-b border-border px-4 py-2`

**Market Summary Strip** (computed from imported `STOCKS`):

- 5 cards: Market Status (hardcode OPEN in `text-[var(--positive)]`), Most Active, Top Gainer (`text-[var(--positive)]` with ▲), Top Loser (`text-[var(--negative)]` with ▼), Total Volume
- Layout: `grid grid-cols-5 gap-px border border-border` — gap-px with a border creates a Bloomberg-style segmented bar rather than individual floating cards
- Each cell: `bg-card px-3 py-2`, label in `text-xs uppercase tracking-widest text-muted-foreground`, value in `text-sm font-mono font-bold text-foreground`

**Stock Table** (using existing shadcn `Table` components):

- Columns: Ticker, Name, Price, Change, Change %, Volume, Market Cap, Trend (sparkline)
- Row click → `navigate({ to: "/$ticker", params: { ticker } })` via `useNavigate` hook
- Do NOT wrap rows in `<Link>` — `<a>` inside `<tr>` is invalid HTML
- Ticker column: `font-mono font-bold text-primary` (Bloomberg orange)
- Change %: `text-[var(--positive)]` (up), `text-[var(--negative)]` (down), `text-muted-foreground` (flat)
- Table header: `text-xs uppercase tracking-widest text-muted-foreground`
- Row hover: `hover:bg-card` (subtle lift against background)
- Sparkline uses last 20 ticks

---

## Step 8 — Create `src/routes/$ticker.tsx` — Stock Detail

**Route file name:** `$ticker.tsx` (TanStack Router dynamic segment convention)
**Param access:** `const { ticker } = Route.useParams()`

**Invalid ticker:** Show "Stock not found" message + `<Link to="/">← Back to market</Link>` (use `@/components/ui/link`)

**Layout:**

```
bg-background min-h-screen
├── Slim back nav bar (← FSTR Exchange link, text-muted-foreground hover:text-primary)
└── grid grid-cols-1 lg:grid-cols-[60%_40%] gap-px border-t border-border
    ├── Left col (divide-y divide-border)
    │   ├── Price chart (shadcn ChartContainer + LineChart, 100 ticks)
    │   └── Order book (bids left / asks right, max 8 each)
    └── Right col (divide-y divide-border border-l border-border)
        ├── Stock info card
        └── Trade form
```

Using `gap-px` and `divide-*` instead of `gap-6` achieves Bloomberg's flush panel-grid layout where sections are separated by hairline borders, not gaps.

**Price Chart** (shadcn `ChartContainer` + Recharts primitives):

- `ChartConfig` defines `"price"` series: color `"var(--positive)"` if `currentPrice > openPrice`, else `"var(--negative)"`
- `ChartContainer` wrapper, then `LineChart` with:
  - `CartesianGrid` — `strokeDasharray="2 4"` `stroke="var(--border)"`, `vertical={false}`
  - `XAxis` — `tickFormatter` showing time every 10 ticks, `tick` styled with `fill: var(--muted-foreground)`, `fontSize: 10`
  - `YAxis` — `$` formatted, same tick style, `width={55}`
  - `ChartTooltip` + `ChartTooltipContent` from `@/components/ui/chart`
  - `ReferenceLine` — opening price, `stroke="var(--muted-foreground)"`, `strokeDasharray="4 4"` (imported directly from `recharts`)
  - `Line` — `stroke="var(--color-price)"`, `dot={false}`, `isAnimationActive={false}`
- Wrap in a `bg-card border-b border-border p-4` panel

**Order Book:**

- Filter `ORDER_BOOK` for ticker + `status === "pending"`
- Bids: buy orders sorted by `limitPrice` desc; Asks: sell orders sorted asc
- `grid grid-cols-2 divide-x divide-border` layout
- Bids panel header: `text-xs uppercase tracking-widest text-[var(--positive)]`; Asks: `text-[var(--negative)]`
- Data rows: `font-mono text-xs`, price in `text-[var(--positive)]` / `text-[var(--negative)]`, quantity and userId in `text-muted-foreground`
- Overflow: `text-xs text-muted-foreground` "and N more…" line

**Stock Info Card:**

- No shadcn `Card` wrapper — use a plain `div` with `bg-card p-4` to stay flush with the panel grid
- Ticker: `font-mono text-2xl font-bold text-primary` (Bloomberg orange)
- Company name: `text-xs text-muted-foreground uppercase tracking-widest`
- Current price: `font-mono text-3xl font-bold text-[var(--positive)]` or `text-[var(--negative)]`
- Change line: `font-mono text-sm` with ▲/▼ glyph
- Divider: `border-t border-border my-3`
- Stats grid: `grid grid-cols-2 gap-x-4 gap-y-2 text-xs`, label in `text-muted-foreground uppercase tracking-wide`, value in `font-mono text-foreground`

**Trade Form:**

- Contained in `bg-card p-4`
- `side: "buy" | "sell"` toggle via shadcn `Tabs`/`TabsList`/`TabsTrigger` — active tab uses `data-[state=active]:text-primary` (orange) by default from the theme
- Input labels: `text-xs uppercase tracking-widest text-muted-foreground`
- Inputs: standard shadcn `Input` — `bg-input border-border font-mono text-sm`
- Estimated Total: `bg-muted font-mono text-sm text-foreground` read-only display
- Submit button: override color via `className` — `bg-[var(--positive)] text-background hover:opacity-90` for buy; `bg-[var(--negative)] text-background hover:opacity-90` for sell. Uses semantic vars, not hardcoded green/red Tailwind classes.
- On submit: `console.log(...)` + `toast.success(...)` from `sonner`
- Validation: quantity ≥ 1, limitPrice > 0 (HTML `min` attrs + guard in handler)

---

## Execution Order

Steps must run in order due to import dependencies:

1. Install deps (Step 1) — recharts and sonner must exist before writing imports
2. `mock-data.ts` (Step 2) — both routes depend on it
3. `constants.ts` (Step 3) — independent, clean to do early
4. `__root.tsx` (Step 4) — needs sonner installed; remove Navbar import before deleting file
5. Delete files (Step 5) — after Step 4 removes the Navbar import
6. `sparkline.tsx` (Step 6) — needed by Step 7
7. `index.tsx` (Step 7) and `$ticker.tsx` (Step 8) — can be written in any order

After Step 8: run `bun dev` to trigger `routeTree.gen.ts` regeneration including `/$ticker`.

---

## Step 2b — Rework `src/components/ui/typography.tsx`

The existing typography components (`Display`, `Heading`, `Lead`, `Typography`) are designed for a serif editorial style that is incompatible with the Bloomberg Terminal aesthetic. They need to be replaced with variants appropriate for a dense, monospace data UI.

**New variants:**

| Component            | Old behavior                     | New behavior                                                                                                                    |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Display`            | Serif, 8xl, italic               | Remove — no use case in this app                                                                                                |
| `Heading`            | Serif, font-light, various sizes | Repurpose as section label: `font-mono text-xs uppercase tracking-widest text-muted-foreground` — Bloomberg-style panel headers |
| `Lead`               | `text-xl text-muted-foreground`  | Repurpose as ticker/price display: `font-mono text-2xl font-bold text-foreground`                                               |
| `Typography` body    | `text-base leading-7`            | `font-mono text-sm text-foreground`                                                                                             |
| `Typography` body-sm | `text-sm leading-6`              | `font-mono text-xs text-foreground`                                                                                             |
| `Typography` muted   | `text-sm text-muted-foreground`  | `font-mono text-xs text-muted-foreground`                                                                                       |
| `Typography` caption | Serif, `text-xs`                 | `font-mono text-xs text-muted-foreground` (drop serif)                                                                          |

**Key changes to implement:**

- Remove `font-serif` from `headingVariants` — replace with `font-mono uppercase tracking-widest`
- Remove the `level` size variants from `Heading` (h1–h6 scale doesn't apply to a terminal UI) — or collapse them to a single size; panel labels are always `text-xs`
- Remove `Display` entirely (nothing in this app needs an 8xl italic serif heading)
- Strip `font-serif` from the `caption` variant
- All `leading-*` values tighten to `leading-none` or `leading-tight` — Bloomberg terminals are dense, not airy

**Note:** The `routeTree.gen.ts` root layout, `src/routes/__root.tsx`, and existing shadcn component files import typography only indirectly. Check if any existing UI components (badge, card, etc.) apply `font-serif` via the typography variants before removing it.

---

## Potential Issues

- **Recharts + SSR:** Use `isAnimationActive={false}` on all `<Line>` elements. `ChartContainer` uses `ResponsiveContainer` internally — fine for the detail page. For the sparkline, set a fixed height on the wrapper div (`className="h-8 w-20"`) so `ChartContainer` has a bounded box.
- **`Math.random()` in mock data:** Data is consistent within one process lifetime but varies across restarts. Acceptable for load testing. If determinism is needed, swap in a seeded PRNG (mulberry32).
- **`routeTree.gen.ts` stale refs:** Existing stale route references (kitchen-sink, blog) will be cleaned on next codegen cycle. Pre-existing issue; not introduced by this plan.
- **`lg:grid-cols-[60%_40%]`:** Tailwind v4 arbitrary value — already supported in this project.
