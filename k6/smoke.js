/**
 * FSTR Exchange — Smoke Test
 *
 * Runs a single VU through every route once to verify the app is up and
 * returning sane responses before committing to a full load run.
 *
 * Run:
 *   k6 run k6/smoke.js
 *   k6 run -e BASE_URL=http://my-server:3000 k6/smoke.js
 */

import http from "k6/http";
import { check, group } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const TICKERS = ["MOON", "ROCK", "HYPE", "DOGE", "BOOM", "FLAT"];

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate==0"],
    http_req_duration: ["p(100)<5000"],
  },
};

export default function () {
  group("Market overview", () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      "status 200": (r) => r.status === 200,
      "body contains FSTR": (r) => r.body.includes("FSTR"),
      "content-type is html": (r) =>
        (r.headers["Content-Type"] || "").includes("text/html"),
    });
  });

  group("Ticker detail pages", () => {
    for (const ticker of TICKERS) {
      const res = http.get(`${BASE_URL}/${ticker}`);
      check(res, {
        [`${ticker}: status 200`]: (r) => r.status === 200,
        [`${ticker}: body contains ticker`]: (r) => r.body.includes(ticker),
      });
    }
  });

  group("Invalid ticker returns gracefully", () => {
    const res = http.get(`${BASE_URL}/NOTREAL`);
    // App should return 200 with a "not found" message, not a 500
    check(res, {
      "status not 5xx": (r) => r.status < 500,
    });
  });
}
