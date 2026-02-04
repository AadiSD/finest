import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/gallery", label: "Gallery" },
  { href: "/event-planner", label: "Event Planner" },
];

export function SiteHeader() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 w-full z-50 border-b bg-background/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg md:text-xl text-foreground">
          Blessed Hospitality
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                location === item.href && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/admin" aria-label="Admin Login">
            <Shield className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="md:hidden px-6 pb-3 flex gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              location === item.href && "text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
