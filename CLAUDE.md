# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server on port 3000
bun run build        # Production build
bun preview          # Preview production build
bun lint             # Lint with oxlint
bun format           # Format with oxfmt
```

No test framework is configured yet. CI runs `bun run build` on every push via GitHub Actions.

## Architecture

This is a full-stack React app built on **TanStack Start** with **Bun** as the runtime/package manager.

**Routing**: File-based routing via TanStack Router. Route files live in `src/routes/`. The file `src/routeTree.gen.ts` is auto-generated — never edit it manually. Add new routes by creating files in `src/routes/` following TanStack Router's file-based conventions.

**UI**: [shadcn/ui](https://ui.shadcn.com) (new-york style) with Tailwind CSS v4. Components live in `src/components/ui/` and are added via the shadcn CLI (`bunx shadcn@latest add <component>`). Use the `shadcn` MCP server to browse and add components.

**Custom components**: Three custom components live alongside the shadcn components in `src/components/ui/`:

- `link.tsx` — wraps a plain `<a>` with TanStack Router's `createLink` for type-safe navigation. Use this instead of raw `<a>` tags for internal routes.
- `button-link.tsx` — does the same with the shadcn `Button`.
- `typography.tsx` — provides `Display`, `Heading`, `Lead`, and `Typography` components with serif/sans-serif variants.

**Icons**: [lucide-react](https://lucide.dev) is installed and used throughout.

**Path aliases**: `@/*` maps to `src/*` via `vite-tsconfig-paths` (e.g., `import { cn } from "@/lib/utils"`).

## Typography

Always use the components from `src/components/ui/typography.tsx` (`Display`, `Heading`, `Lead`, `Typography`) rather than raw HTML elements with inline Tailwind classes. Never write a raw `<h1>`–`<h6>` or `<p>` with custom class overrides when a typography component exists.

If a use case doesn't fit the existing typography components — for example, a label or eyebrow style that conflicts with `Heading`'s serif/large defaults — **do not work around it silently**. Instead, explain the mismatch and ask how to handle it before writing any code.

## TypeScript

Strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`. Target is ES2022.

## MCP Servers

Two MCP servers are available:

- **shadcn**: Use `mcp__shadcn__*` tools to search, view, and add shadcn/ui components. Key tools: `search_items_in_registries`, `view_items_in_registries`, `get_item_examples_from_registries`, `get_add_command_for_items`.
- **tanstack**: Use `mcp__tanstack__*` tools to browse TanStack docs, search documentation, list add-ons, and get ecosystem recommendations. Key tools: `tanstack_doc`, `tanstack_search_docs`, `tanstack_list_libraries`.
