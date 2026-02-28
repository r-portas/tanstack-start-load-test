import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import { Heading, Lead, Typography } from "src/components/ui/typography";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

const posts = [
  {
    slug: "post",
    title: "The Quiet Power of Negative Space in Design",
    excerpt:
      "Why the emptiest parts of a composition often carry the most weight — and how to use restraint as a creative tool.",
    category: "Design",
    author: { name: "Ada Lovelace", initials: "AL" },
    date: "Feb 14, 2026",
    readTime: "5 min read",
  },
  {
    slug: "post",
    title: "Building a Design System from Scratch",
    excerpt:
      "From tokens to components, a practical guide to creating a coherent visual language that scales with your team.",
    category: "Engineering",
    author: { name: "Grace Hopper", initials: "GH" },
    date: "Feb 10, 2026",
    readTime: "8 min read",
  },
  {
    slug: "post",
    title: "Typography at Scale: Lessons from Print",
    excerpt:
      "Centuries of typographic craft distilled into principles that still apply to digital interfaces today.",
    category: "Typography",
    author: { name: "Claude Shannon", initials: "CS" },
    date: "Feb 6, 2026",
    readTime: "6 min read",
  },
  {
    slug: "post",
    title: "Color Theory for Dark Interfaces",
    excerpt:
      "Dark mode isn't just about inverting colors. A deep look at saturation, contrast, and tinted neutrals.",
    category: "Design",
    author: { name: "Ada Lovelace", initials: "AL" },
    date: "Jan 29, 2026",
    readTime: "7 min read",
  },
  {
    slug: "post",
    title: "The Case for Fewer Components",
    excerpt:
      "How over-componentization leads to design debt, and why a minimal component library often outperforms a large one.",
    category: "Engineering",
    author: { name: "Grace Hopper", initials: "GH" },
    date: "Jan 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "post",
    title: "Responsive Type Without Media Queries",
    excerpt:
      "Using fluid typography and CSS clamp() to create type scales that adapt smoothly across every viewport.",
    category: "CSS",
    author: { name: "Claude Shannon", initials: "CS" },
    date: "Jan 15, 2026",
    readTime: "5 min read",
  },
];

function BlogIndex() {
  return (
    <div className="py-10">
      <Heading level={1} className="mb-3">
        The Blog
      </Heading>
      <Lead className="mb-8">
        Thoughts on design, engineering, and the craft of building software.
      </Lead>

      <Separator className="mb-10" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <Link key={i} to="/blog/post" preload="intent">
            <Card className="flex flex-col justify-between">
              <CardHeader className="gap-3">
                <Badge className="w-fit">{post.category}</Badge>
                <Heading level={3} className="leading-snug">
                  {post.title}
                </Heading>
                <Typography variant="muted">{post.excerpt}</Typography>
              </CardHeader>
              <CardContent />
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{post.author.initials}</AvatarFallback>
                  </Avatar>
                  <Typography variant="body-sm" className="text-muted-foreground">
                    {post.author.name}
                  </Typography>
                </div>
                <Typography variant="caption">{post.date}</Typography>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button variant="outline">Load more</Button>
      </div>
    </div>
  );
}
