/**
 * FSTR Exchange — Stress Test
 *
 * Gradually ramps virtual users across four levels to find the point at which
 * the app's latency or error rate degrades:
 *
 *   10 VUs  → warm-up / baseline
 *   50 VUs  → moderate load
 *   100 VUs → heavy load
 *   500 VUs → peak / breaking-point probe
 *
 * Each level holds for long enough to produce stable percentile data before
 * stepping up. After the peak the test ramps back down to confirm recovery.
 *
 * Run:
 *   k6 run k6/stress.js
 *
 * Override base URL for a remote host:
 *   k6 run -e BASE_URL=http://my-server:3000 k6/stress.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const TICKERS = ["MOON", "ROCK", "HYPE", "DOGE", "BOOM", "FLAT"];

const TICKER_WEIGHTS = [
  { ticker: "DOGE", cumulative: 0.35 },
  { ticker: "HYPE", cumulative: 0.55 },
  { ticker: "MOON", cumulative: 0.70 },
  { ticker: "BOOM", cumulative: 0.82 },
  { ticker: "ROCK", cumulative: 0.92 },
  { ticker: "FLAT", cumulative: 1.00 },
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
     * Users repeatedly loading the market overview page.
     * Steps through 10 → 50 → 100 → 500 VUs, holding at each level to
     * collect stable latency data, then ramps back down to verify recovery.
     */
    stress_overview: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        // Level 1 — warm-up / baseline
        { duration: "1m", target: 10 },   // ramp to 10
        { duration: "2m", target: 10 },   // hold at 10

        // Level 2 — moderate load
        { duration: "1m", target: 50 },   // ramp to 50
        { duration: "2m", target: 50 },   // hold at 50

        // Level 3 — heavy load
        { duration: "1m", target: 100 },  // ramp to 100
        { duration: "2m", target: 100 },  // hold at 100

        // Level 4 — peak / breaking-point probe
        { duration: "2m", target: 500 },  // ramp to 500
        { duration: "3m", target: 500 },  // hold at 500

        // Recovery
        { duration: "2m", target: 0 },    // ramp down
      ],
      exec: "stressOverview",
      tags: { scenario: "stress_overview" },
    },

    /**
     * Users navigating from the overview to a ticker detail page.
     * Runs at 30% of the overview concurrency to model a realistic funnel.
     */
    stress_tickers: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 3 },
        { duration: "2m", target: 3 },
        { duration: "1m", target: 15 },
        { duration: "2m", target: 15 },
        { duration: "1m", target: 30 },
        { duration: "2m", target: 30 },
        { duration: "2m", target: 150 },
        { duration: "3m", target: 150 },
        { duration: "2m", target: 0 },
      ],
      exec: "stressTicker",
      tags: { scenario: "stress_tickers" },
    },
  },

  thresholds: {
    // Overall p95 under 2s — relaxed vs. the load test because stress is
    // intentionally pushing past the comfortable operating range.
    http_req_duration: ["p(95)<2000"],

    // Individual page thresholds
    index_duration: ["p(95)<1500", "p(99)<3000"],
    ticker_duration: ["p(95)<2000", "p(99)<4000"],

    // Allow a slightly higher error budget — we expect some degradation at
    // the 500-VU peak, but want to spot outright failures.
    success_rate: ["rate>0.95"],
    http_req_failed: ["rate<0.05"],
  },
};

// ---------------------------------------------------------------------------
// Scenario functions
// ---------------------------------------------------------------------------

/**
 * Repeatedly fetches the market overview page.
 * Short think time to keep pressure high as VUs scale.
 */
export function stressOverview() {
  const res = http.get(`${BASE_URL}/`, { tags: { page: "index" } });

  const ok = check(res, {
    "index: status 200": (r) => r.status === 200,
    "index: has FSTR": (r) => r.body.includes("FSTR"),
  });

  successRate.add(ok);
  indexDuration.add(res.timings.duration);
  if (!ok) indexErrors.add(1);

  // Short think time — still realistic but tight to sustain high concurrency
  sleep(randomBetween(0.5, 1.5));
}

/**
 * Loads the overview then navigates to a weighted-random ticker detail page.
 */
export function stressTicker() {
  // 1. Overview
  const indexRes = http.get(`${BASE_URL}/`, { tags: { page: "index" } });

  const indexOk = check(indexRes, {
    "index: status 200": (r) => r.status === 200,
  });

  successRate.add(indexOk);
  indexDuration.add(indexRes.timings.duration);
  if (!indexOk) indexErrors.add(1);

  sleep(randomBetween(0.5, 2));

  // 2. Ticker detail
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

  sleep(randomBetween(1, 3));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function weightedTicker() {
  const r = Math.random();
  for (const { ticker, cumulative } of TICKER_WEIGHTS) {
    if (r < cumulative) return ticker;
  }
  return TICKERS[TICKERS.length - 1];
}
