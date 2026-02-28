import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import { Display, Heading, Lead, Typography } from "src/components/ui/typography";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    title: "Type-safe routing",
    description:
      "File-based routes with full TypeScript inference. Navigate with confidence — if it compiles, the route exists.",
  },
  {
    title: "Design tokens built in",
    description:
      "A dark-mode-first palette with greenish-tinted neutrals, two variable fonts, and a consistent spacing scale.",
  },
  {
    title: "Component library ready",
    description:
      "shadcn/ui components pre-configured for this theme. Add what you need, delete what you don't.",
  },
  {
    title: "Fast by default",
    description:
      "Bun as the runtime and package manager. Vite for bundling. SSR with TanStack Start.",
  },
  {
    title: "Opinionated typography",
    description:
      "Newsreader for headings and captions. Archivo for everything else. A full set of typography components.",
  },
  {
    title: "Lint and format included",
    description:
      "oxlint and oxfmt configured out of the box. Consistent code style without the setup friction.",
  },
];

function Landing() {
  return (
    <div className="space-y-20 py-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <Badge variant="outline" className="mb-2">
          App Template v1.0
        </Badge>
        <Display className="leading-tight">The foundation your next project deserves</Display>
        <Lead className="mx-auto max-w-xl">
          A full-stack React template with TanStack Start, shadcn/ui, and a dark theme that&apos;s
          actually pleasant to look at.
        </Lead>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="lg">Get started</Button>
          <Button size="lg" variant="outline">
            View on GitHub
          </Button>
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section>
        <div className="mb-10 text-center">
          <Heading level={2} className="mb-3">
            Everything you need to ship
          </Heading>
          <Typography variant="muted" className="mx-auto max-w-md">
            Carefully chosen defaults so you can focus on your product from the first commit.
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="muted">{feature.description}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="mx-auto max-w-xl space-y-4 text-center">
        <Heading level={2}>Ready to build?</Heading>
        <Lead>Clone the repo and have a running app in under a minute.</Lead>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="lg">Start building</Button>
          <Button size="lg" variant="ghost">
            Read the docs
          </Button>
        </div>
      </section>
    </div>
  );
}
