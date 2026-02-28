import { Link } from "@tanstack/react-router";

import { APP_NAME } from "@/constants";

import ButtonLink from "./ui/button-link";

type NavItem = {
  to: "/" | "/dashboard" | "/blog" | "/kitchen-sink";
  label: string;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/blog", label: "Blog" },
  { to: "/kitchen-sink", label: "Kitchen Sink" },
];

function NavLink({ to, label, exact }: NavItem) {
  return (
    <ButtonLink
      variant="ghost"
      to={to}
      activeOptions={exact ? { exact: true } : undefined}
      activeProps={{ variant: "default" }}
      preload="intent"
    >
      {label}
    </ButtonLink>
  );
}

export function Navbar() {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link
            to="/"
            className="font-serif text-xl font-light tracking-tight transition-opacity hover:opacity-70"
          >
            {APP_NAME}
          </Link>

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1" role="list">
              {navItems.map(({ to, label, exact }) => (
                <li key={to}>
                  <NavLink to={to} label={label} exact={exact} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
