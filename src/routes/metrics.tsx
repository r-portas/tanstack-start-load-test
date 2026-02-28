import { createFileRoute } from "@tanstack/react-router";
import client from "prom-client";

export const Route = createFileRoute("/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const metrics = await client.register.metrics();
        return new Response(metrics, {
          headers: {
            "Content-Type": client.register.contentType,
          },
        });
      },
    },
  },
});
