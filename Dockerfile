FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS build

COPY package.json bun.lock .
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM base AS production

COPY --from=build /app/.output /app
EXPOSE 3000
CMD ["bun", "server/index.mjs"]