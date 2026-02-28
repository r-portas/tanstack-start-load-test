# TanStack Start Load Test

An example of instrumenting a [TanStack Start](https://tanstack.com/start) app with Prometheus metrics, running the full stack in Docker, and load testing with k6 — to explore how scalable TanStack Start is under realistic traffic patterns.

## What's included

- **TanStack Start app** — a mock stock exchange with per-route HTTP metrics exposed at `/metrics` via [prom-client](https://github.com/siimon/prom-client)
- **Prometheus** — scrapes the app's `/metrics` endpoint every second and receives k6 metrics via remote write
- **Grafana** — pre-provisioned with Prometheus as a datasource and an app metrics dashboard (request rate, latency percentiles, error rate, Node.js runtime)
- **k6 load tests** — four scripts modelling different traffic patterns, pushing results directly into Prometheus

## Tech Stack

- **[Bun](https://bun.sh)** — runtime and package manager
- **[TanStack Start](https://tanstack.com/start)** — full-stack React framework with file-based routing
- **[prom-client](https://github.com/siimon/prom-client)** — Prometheus metrics for Node.js
- **[Prometheus](https://prometheus.io)** — metrics collection and storage
- **[Grafana](https://grafana.com)** — metrics visualisation
- **[k6](https://k6.io)** — load testing
- **[shadcn/ui](https://ui.shadcn.com)** — component library built on Tailwind CSS and Radix UI

## Running the stack

```bash
docker compose up --build
```

| Service        | URL                   |
| -------------- | --------------------- |
| App            | http://localhost:3000 |
| Prometheus     | http://localhost:9090 |
| Grafana        | http://localhost:3001 |
| k6 Dashboard\* | http://localhost:5665 |

Grafana opens with no login required. The **App Metrics** dashboard is pre-loaded. The k6 dashboard is only available while a test is running.

## Running load tests

The load tests run inside Docker and push results to Prometheus via remote write, so metrics from both the app and k6 appear in Grafana in real time. A live k6 dashboard is also available at http://localhost:5665 while the test is running.

The k6 dashboard will be available at http://localhost:5665 throughout the test run.

**Run a specific script** using the `K6_SCRIPT` environment variable (defaults to `load.js`):

```bash
K6_SCRIPT=smoke.js docker compose up --build

K6_SCRIPT=load.js docker compose up --build

K6_SCRIPT=soak.js docker compose up --build

K6_SCRIPT=stress.js docker compose up --build
```

Alternatively, run k6 as part of the full stack:

```bash
docker compose up k6
```

This starts the app, Prometheus, Grafana, and k6 together, with k6 waiting for all services to be healthy before starting the test.

### Load test scripts

| Script      | Description                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `smoke.js`  | Minimal traffic — verifies the app works correctly before a full test run    |
| `load.js`   | Realistic mixed load — market watchers, ticker browsers, and a hotspot spike |
| `soak.js`   | Extended duration — checks for memory leaks and degradation over time        |
| `stress.js` | Stepped ramp — gradually increases VUs (10 → 50 → 100 → 500) to find limits  |

## Instrumenting TanStack Start with prom-client

### The prom-client gotcha

When using prom-client in TanStack Start you must import the **default export** (the client itself) and call methods on it — do not use named imports like `collectDefaultMetrics` or `Histogram` directly. TanStack Start's module handling causes the named exports to resolve against a different registry instance than the default client, so metrics registered via named imports won't appear when `client.register.metrics()` is called.

```ts
// ✅ Correct — everything goes through the same client instance
import client from "prom-client";

client.collectDefaultMetrics();

export const httpRequestDuration = new client.Histogram({ ... });
export const httpRequestTotal = new client.Counter({ ... });

// ❌ Wrong — named imports may resolve against a different registry
import { collectDefaultMetrics, Histogram } from "prom-client";
```

### Setting up metrics (`src/lib/metrics.ts`)

Create a single module that initialises default metrics and exports your custom metrics. Centralising this ensures the registry is only configured once.

```ts
import client from "prom-client";

client.collectDefaultMetrics();

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});
```

### Instrumenting middleware (`src/middleware/observability.ts`)

Use `createMiddleware().server(...)` so the instrumentation only runs server-side. The timer is started before `next()` and stopped after, capturing the full duration including any downstream middleware or route handlers.

```ts
import { createMiddleware } from "@tanstack/react-start";
import { httpRequestDuration, httpRequestTotal } from "@/lib/metrics";

export const observability = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  const route = url.pathname;
  const end = httpRequestDuration.startTimer({ method: request.method, route });
  try {
    const result = await next();
    end({ status_code: result.response.status });
    httpRequestTotal.inc({ method: request.method, route, status_code: result.response.status });
    return result;
  } catch (error) {
    end({ status_code: 500 });
    httpRequestTotal.inc({ method: request.method, route, status_code: 500 });
    throw error;
  }
});
```

Register it globally in `src/start.ts`:

```ts
import { createStart } from "@tanstack/react-start";
import { observability } from "./middleware/observability";

export const startInstance = createStart(() => ({
  requestMiddleware: [observability],
}));
```

### Exposing the `/metrics` endpoint (`src/routes/metrics.tsx`)

Add a file-based route that returns the registry output. Again, import the default client and call `client.register.metrics()` — not the named `register` export.

```ts
import { createFileRoute } from "@tanstack/react-router";
import client from "prom-client";

export const Route = createFileRoute("/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const metrics = await client.register.metrics();
        return new Response(metrics, {
          headers: { "Content-Type": client.register.contentType },
        });
      },
    },
  },
});
```

## Development

```bash
# Install dependencies
bun install

# Start the development server
bun dev

# Build for production
bun run build

# Preview production build
bun preview

# Lint
bun lint

# Format
bun format
```
