import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "src/lib/utils";

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

function Display({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Heading level={1} className={cn("text-8xl tracking-tighter italic", className)} {...props} />
  );
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

const headingVariants = cva("font-serif font-light tracking-tight", {
  variants: {
    level: {
      1: "text-4xl",
      2: "text-3xl",
      3: "text-2xl",
      4: "text-xl",
      5: "text-lg",
      6: "text-base",
    },
  },
  defaultVariants: {
    level: 1,
  },
});

const headingElements = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

function Heading({
  level = 1,
  className,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : headingElements[level];

  return (
    <Comp
      className={cn(headingVariants({ level }), className)}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    />
  );
}

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xl leading-8 text-muted-foreground", className)} {...props} />;
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const typographyVariants = cva("", {
  variants: {
    variant: {
      body: "text-base leading-7",
      "body-sm": "text-sm leading-6",
      muted: "text-sm leading-6 text-muted-foreground",
      caption: "text-xs leading-5 font-serif text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

function Typography({
  className,
  variant,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof typographyVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "p";

  return (
    <Comp
      className={cn(typographyVariants({ variant }), className)}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    />
  );
}

// Exports
export { Heading, headingVariants, Display, Typography, typographyVariants, Lead };
