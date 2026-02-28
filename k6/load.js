/**
 * FSTR Exchange — k6 Load Test
 *
 * Models three realistic traffic patterns from the design doc:
 *
 *   1. market-watchers  — high-frequency reads on `/` (the busiest route)
 *   2. ticker-browsers  — users who navigate from `/` to a stock detail page
 *   3. hotspot-hype     — a surge of traffic on a single "hot" ticker (HYPE),
 *                         simulating a thundering-herd spike on one resource
 *
 * Target: http://localhost:3000 (app running in Docker via docker-compose)
 *
 * Run:
 *   k6 run k6/load.js
 *
 * Override base URL for a remote host:
 *   k6 run -e BASE_URL=http://my-server:3000 k6/load.js
 *
 * Quick smoke test (1 VU, 10s):
 *   k6 run --vus 1 --duration 10s k6/load.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

/** All valid ticker symbols seeded in mock-data.ts */
const TICKERS = ["MOON", "ROCK", "HYPE", "DOGE", "BOOM", "FLAT"];

/**
 * Weighted ticker distribution — mirrors realistic "some tickers get way more
 * traffic than others" behaviour described in the design doc.
 * Values are cumulative weights (must sum to 1.0).
 */
const TICKER_WEIGHTS = [
  { ticker: "DOGE", cumulative: 0.35 }, // high volume, most watched
  { ticker: "HYPE", cumulative: 0.55 }, // upward bias attracts attention
  { ticker: "MOON", cumulative: 0.70 }, // high volatility, exciting
  { ticker: "BOOM", cumulative: 0.82 }, // low supply, high price
  { ticker: "ROCK", cumulative: 0.92 }, // stable, occasional checks
  { ticker: "FLAT", cumulative: 1.00 }, // barely visited
];

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

const indexErrors = new Counter("index_errors");
const tickerErrors = new Counter("ticker_errors");
const indexDuration = new Trend("index_duration", true);
const tickerDuration = new Trend("ticker_duration", true);
const successRate = new Rate("success_rate");

// ---------------------------------------------------------------------------
// Scenarios & thresholds
// ---------------------------------------------------------------------------

export const options = {
  scenarios: {
    /**
     * Steady stream of users refreshing the market overview.
     * Ramps up to 20 VUs over 30s, holds for 1 min, then ramps down.
     */
    market_watchers: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 },
        { duration: "1m", target: 20 },
        { duration: "15s", target: 0 },
      ],
      exec: "marketWatcher",
      tags: { scenario: "market_watchers" },
    },

    /**
     * Users who land on `/` then click through to a ticker detail page.
     * Lighter concurrency — represents a conversion funnel subset.
     */
    ticker_browsers: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 8 },
        { duration: "1m", target: 8 },
        { duration: "15s", target: 0 },
      ],
      exec: "tickerBrowser",
      tags: { scenario: "ticker_browsers" },
    },

    /**
     * Hotspot burst — simulates a "hot" ticker (HYPE) getting hammered when
     * its upward trend is noticed. Fires once as a spike mid-test.
     */
    hotspot_hype: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      preAllocatedVUs: 30,
      maxVUs: 50,
      stages: [
        { duration: "45s", target: 0 },   // wait for other scenarios to settle
        { duration: "15s", target: 30 },  // spike to 30 req/s
        { duration: "30s", target: 30 },  // sustain the spike
        { duration: "15s", target: 0 },   // drain
      ],
      exec: "hotspotHype",
      tags: { scenario: "hotspot_hype" },
    },
  },

  thresholds: {
    // Overall p95 response time under 1s
    http_req_duration: ["p(95)<1000"],

    // Index and ticker pages individually
    index_duration: ["p(95)<800", "p(99)<1500"],
    ticker_duration: ["p(95)<1000", "p(99)<2000"],

    // At least 99% of requests must succeed
    success_rate: ["rate>0.99"],

    // Hard cap on HTTP errors
    http_req_failed: ["rate<0.01"],
  },
};

// ---------------------------------------------------------------------------
// Scenario functions
// ---------------------------------------------------------------------------

/**
 * Repeatedly hits the market overview page.
 * Simulates a user watching prices update (short think time between requests).
 */
export function marketWatcher() {
  const res = http.get(`${BASE_URL}/`, { tags: { page: "index" } });

  const ok = check(res, {
    "index: status 200": (r) => r.status === 200,
    "index: has FSTR": (r) => r.body.includes("FSTR"),
  });

  successRate.add(ok);
  indexDuration.add(res.timings.duration);

  if (!ok) indexErrors.add(1);

  // Short think time — market watchers poll frequently
  sleep(randomBetween(0.5, 2));
}

/**
 * Navigates from `/` to a weighted-random ticker detail page, then back.
 * Models a user who scans the overview and clicks into a stock they fancy.
 */
export function tickerBrowser() {
  // 1. Load the overview
  const indexRes = http.get(`${BASE_URL}/`, { tags: { page: "index" } });

  const indexOk = check(indexRes, {
    "index: status 200": (r) => r.status === 200,
  });

  successRate.add(indexOk);
  indexDuration.add(indexRes.timings.duration);
  if (!indexOk) indexErrors.add(1);

  // Pause to "read" the page
  sleep(randomBetween(1, 3));

  // 2. Click through to a weighted-random ticker
  const ticker = weightedTicker();
  const tickerRes = http.get(`${BASE_URL}/${ticker}`, {
    tags: { page: "ticker", ticker },
  });

  const tickerOk = check(tickerRes, {
    "ticker: status 200": (r) => r.status === 200,
    "ticker: contains ticker symbol": (r) => r.body.includes(ticker),
  });

  successRate.add(tickerOk);
  tickerDuration.add(tickerRes.timings.duration);
  if (!tickerOk) tickerErrors.add(1);

  // Longer dwell — users spend more time on detail pages
  sleep(randomBetween(3, 8));
}

/**
 * Hammers the HYPE ticker detail page at high rate.
 * Used with the ramping-arrival-rate executor to model a thundering herd.
 */
export function hotspotHype() {
  const res = http.get(`${BASE_URL}/HYPE`, { tags: { page: "ticker", ticker: "HYPE" } });

  const ok = check(res, {
    "hype: status 200": (r) => r.status === 200,
    "hype: body contains HYPE": (r) => r.body.includes("HYPE"),
  });

  successRate.add(ok);
  tickerDuration.add(res.timings.duration);
  if (!ok) tickerErrors.add(1);

  // No sleep — arrival-rate executor controls the pacing
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a random float in [min, max).
 */
function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Returns a ticker symbol using the weighted distribution defined above.
 * Lower-index (more popular) tickers are chosen more often.
 */
function weightedTicker() {
  const r = Math.random();
  for (const { ticker, cumulative } of TICKER_WEIGHTS) {
    if (r < cumulative) return ticker;
  }
  return TICKERS[TICKERS.length - 1];
}
