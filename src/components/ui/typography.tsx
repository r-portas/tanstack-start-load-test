import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";
import { cn } from "src/lib/utils";

// ---------------------------------------------------------------------------
// Heading — Bloomberg-style panel/section label
// Monospace, uppercase, tight tracking. Use for section headers in the UI.
// ---------------------------------------------------------------------------

function Heading({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-mono text-xs uppercase tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Lead — large price / ticker display
// ---------------------------------------------------------------------------

function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("font-mono text-2xl font-bold leading-none text-foreground", className)} {...props} />
  );
}

// ---------------------------------------------------------------------------
// Typography — body text variants
// ---------------------------------------------------------------------------

const typographyVariants = cva("font-mono leading-tight", {
  variants: {
    variant: {
      body: "text-sm text-foreground",
      "body-sm": "text-xs text-foreground",
      muted: "text-xs text-muted-foreground",
      caption: "text-xs text-muted-foreground",
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
export { Heading, Lead, Typography, typographyVariants };
