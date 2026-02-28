# App Template

A modern React application template built with Bun, TanStack Start, and shadcn/ui.

![Screenshot of the app template](./docs/screenshot.png)

## Features

- Dark mode enabled by default
- File-based routing with TanStack Router
- TypeScript strict mode with path aliases (`@/*` → `src/*`)
- Two-font typography system: Newsreader (serif, headings) + Archivo (sans-serif, body)
- Custom `Link` and `ButtonLink` components for type-safe TanStack Router navigation
- Custom `Typography` component with `Display`, `Heading`, `Lead` variants

## Tech Stack

- **[Bun](https://bun.sh)** - Fast JavaScript runtime and package manager
- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework with file-based routing
- **[shadcn/ui](https://ui.shadcn.com)** - Component library built on Tailwind CSS and Radix UI
- **React 19** - Latest React with TypeScript
- **Vite** - Build tool for fast development
- **[lucide-react](https://lucide.dev)** - Icon library
- **[oxlint](https://oxc.rs/docs/guide/usage/linter)** - Fast linter
- **[oxfmt](https://oxc.rs/docs/guide/usage/formatter)** - Fast formatter

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
