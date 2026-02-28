import { createLink } from "@tanstack/react-router";

const LinkComponent = ({ ref, ...props }: React.ComponentPropsWithRef<"a">) => (
  <a ref={ref} {...props} className="hover:text-primary underline underline-offset-4" />
);

const Link = createLink(LinkComponent);

/**
 * Plain anchor wrapped with TanStack Router for type-safe internal navigation.
 * Use this instead of a plain `<a>` tag when linking to internal routes.
 *
 * @example
 * Basic link:
 * ```tsx
 * <Link to="/about">About</Link>
 * ```
 *
 * @example
 * Link with a route param:
 * ```tsx
 * <Link to="/posts/$id" params={{ id: post.id }}>Read more</Link>
 * ```
 */
export default Link;
