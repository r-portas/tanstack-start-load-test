import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "src/components/ui/avatar";
import { Badge } from "src/components/ui/badge";
import { Separator } from "src/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import { Heading, Lead, Typography } from "src/components/ui/typography";

import ButtonLink from "@/components/ui/button-link";

export const Route = createFileRoute("/blog/post")({
  component: BlogPost,
});

function BlogPost() {
  return (
    <article className="mx-auto max-w-2xl py-10">
      {/* Meta */}
      <div className="mb-6 flex gap-2">
        <Badge variant="outline">Typography</Badge>
        <Badge variant="secondary">6 min read</Badge>
      </div>

      {/* Title */}
      <Heading level={1} className="mb-4 leading-tight">
        Typography at Scale: Lessons from Print
      </Heading>

      {/* Lead */}
      <Lead className="mb-6">
        Centuries of typographic craft distilled into principles that still hold in digital
        interfaces — from measure and leading to the hierarchy of a well-set page.
      </Lead>

      {/* Author row */}
      <div className="mb-6 flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>CS</AvatarFallback>
        </Avatar>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Claude Shannon</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Feb 6, 2026</span>
          <Separator orientation="vertical" className="h-4" />
          <span>6 min read</span>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Body */}
      <div className="space-y-6">
        <Heading level={2}>What print got right</Heading>
        <Typography>
          Before screens, typographers spent centuries refining the rules of the page. They
          discovered that a line of text should be between 45 and 75 characters wide — the measure —
          for comfortable reading. They learned that leading, the space between lines, should be
          roughly 120–145% of the type size. These weren&apos;t aesthetic opinions; they were
          hard-won observations about human perception.
        </Typography>
        <Typography>
          When the web arrived, many of these rules were ignored. Text stretched edge-to-edge. Lines
          were packed tight. Fonts were chosen for availability, not suitability. The result was
          interfaces that were technically functional but tiring to read.
        </Typography>

        <Heading level={2}>Applying the lessons</Heading>
        <Typography>
          The most impactful single change you can make to a content-heavy interface is to constrain
          the line length. A max-width of around 65ch on body text immediately improves readability
          without any other changes. Everything else — font choice, line height, spacing — builds on
          top of that foundation.
        </Typography>

        <Heading level={3}>Type scales</Heading>
        <Typography>
          A harmonious type scale is built on a ratio, just like a musical scale. Common choices are
          the minor third (1.200), the major third (1.250), and the perfect fourth (1.333). The
          ratio you choose affects the visual contrast between levels — a larger ratio creates more
          drama; a smaller one, more subtlety.
        </Typography>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scale step</TableHead>
              <TableHead>Minor third (×1.2)</TableHead>
              <TableHead>Major third (×1.25)</TableHead>
              <TableHead>Perfect fourth (×1.333)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["Base", "16px", "16px", "16px"],
              ["md", "19.2px", "20px", "21.3px"],
              ["lg", "23px", "25px", "28.4px"],
              ["xl", "27.6px", "31.3px", "37.9px"],
              ["2xl", "33.2px", "39px", "50.5px"],
            ].map(([step, a, b, c]) => (
              <TableRow key={step}>
                <TableCell className="font-medium">{step}</TableCell>
                <TableCell>{a}</TableCell>
                <TableCell>{b}</TableCell>
                <TableCell>{c}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography variant="caption">
          Table 1: Font sizes at each scale step for three common type scale ratios, starting from a
          16px base.
        </Typography>

        <Heading level={3}>Pairing serif and sans</Heading>
        <Typography>
          One of the most reliable typographic moves is pairing a serif for headings with a
          sans-serif for body text. The contrast signals hierarchy immediately — readers understand
          the page structure before they read a word. The key constraint is that the two families
          should share a similar x-height so they feel optically matched.
        </Typography>

        {/* Blockquote */}
        <blockquote className="border-border border-l-2 pl-6 italic">
          <Typography>
            &ldquo;Typography is what language looks like. And how it looks affects how it is read —
            and whether it is read at all.&rdquo;
          </Typography>
          <Typography variant="caption" className="mt-2 not-italic">
            — Ellen Lupton, <em>Thinking with Type</em>
          </Typography>
        </blockquote>

        <Heading level={2}>Where digital diverges</Heading>
        <Typography>
          Print is static; screens are not. Responsive design means type must work across a
          three-hundred-pixel phone and a thirty-inch monitor. Fluid typography — using CSS clamp()
          to interpolate between a minimum and maximum size — lets a type scale adapt continuously
          rather than jumping between breakpoints.
        </Typography>
        <Typography>
          Dark mode introduces another dimension that print never had to consider. On a light
          background, thin serifs read crisply. On dark backgrounds, the same thin strokes can feel
          fragile or even disappear at small sizes. Font weight often needs to be heavier in dark
          mode to maintain apparent weight.
        </Typography>

        <Separator />

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Badge variant="outline">Typography</Badge>
            <Badge variant="outline">Design</Badge>
            <Badge variant="outline">CSS</Badge>
          </div>
          <ButtonLink to="/blog" variant="outline" size="sm">
            ← Back to blog
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
