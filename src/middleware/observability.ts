import { createMiddleware } from "@tanstack/react-start";

import { httpRequestDuration, httpRequestTotal } from "@/lib/metrics";

export const observability = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  const route = url.pathname;
  const end = httpRequestDuration.startTimer({ method: request.method, route });
  try {
    const result = await next();
    end({ status_code: result.response.status });
    httpRequestTotal.inc({
      method: request.method,
      route,
      status_code: result.response.status,
    });
    return result;
  } catch (error) {
    end({ status_code: 500 });
    httpRequestTotal.inc({ method: request.method, route, status_code: 500 });
    throw error;
  }
});
