/**
 * FSTR Exchange — Soak Test
 *
 * Runs a moderate load for an extended period to surface memory leaks,
 * connection pool exhaustion, or gradual performance degradation in the
 * SSR server.
 *
 * Run (defaults to 20 min — adjust DURATION env var as needed):
 *   k6 run k6/soak.js
 *   k6 run -e DURATION=10m k6/soak.js
 *   k6 run -e BASE_URL=http://my-server:3000 -e DURATION=30m k6/soak.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const DURATION = __ENV.DURATION || "20m";

const TICKERS = ["MOON", "ROCK", "HYPE", "DOGE", "BOOM", "FLAT"];

const successRate = new Rate("success_rate");
const p1Duration = new Trend("first_minute_duration", true);
const lastDuration = new Trend("last_minute_duration", true);

export const options = {
  stages: [
    { duration: "2m", target: 15 },   // ramp up
    { duration: DURATION, target: 15 }, // hold steady load
    { duration: "1m", target: 0 },    // drain
  ],
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    success_rate: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  // Alternate between index and a random ticker to simulate realistic mix
  const visitTicker = Math.random() > 0.4;
  const url = visitTicker
    ? `${BASE_URL}/${TICKERS[Math.floor(Math.random() * TICKERS.length)]}`
    : `${BASE_URL}/`;

  const res = http.get(url);
  const ok = check(res, {
    "status 200": (r) => r.status === 200,
  });

  successRate.add(ok);

  // Track duration in first and last minute to spot degradation over time.
  // __ITER is the iteration number; we use elapsed time from startTime instead
  // since __ITER resets per VU. Use the k6 execution object if available.
  const elapsed = getElapsedSeconds();
  if (elapsed < 60) {
    p1Duration.add(res.timings.duration);
  }
  // Tag the last minute based on DURATION — approximate, works for fixed runs
  const totalSeconds = parseDurationToSeconds(DURATION);
  if (elapsed > totalSeconds + 120 - 60) {
    lastDuration.add(res.timings.duration);
  }

  sleep(1 + Math.random() * 2);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _startTime = null;

function getElapsedSeconds() {
  const now = Date.now();
  if (_startTime === null) _startTime = now;
  return (now - _startTime) / 1000;
}

function parseDurationToSeconds(d) {
  const match = d.match(/^(\d+)(s|m|h)$/);
  if (!match) return 1200; // default 20m
  const [, val, unit] = match;
  const multipliers = { s: 1, m: 60, h: 3600 };
  return parseInt(val, 10) * multipliers[unit];
}
