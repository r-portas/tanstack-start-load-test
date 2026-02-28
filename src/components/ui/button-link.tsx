import { createLink } from "@tanstack/react-router";
import type React from "react";

import { Button } from "@/components/ui/button";

const ButtonRouterLink = createLink(Button);

/**
 * shadcn Button wrapped with TanStack Router for type-safe internal navigation.
 * Use this when a navigation action should look like a button rather than a text link.
 *
 * @example
 * Basic button link:
 * ```tsx
 * <ButtonLink to="/about">Go to About</ButtonLink>
 * ```
 *
 * @example
 * Button link with a route param:
 * ```tsx
 * <ButtonLink to="/posts/$id" params={{ id: post.id }} variant="outline">View post</ButtonLink>
 * ```
 */
export default function ButtonLink(props: React.ComponentProps<typeof ButtonRouterLink>) {
  return <ButtonRouterLink preload="intent" {...props} />;
}
