import { Link, useLocation } from "@tanstack/react-router";
import { Home, Library, Moon, User } from "lucide-react";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/library", label: "Library", icon: Library },
  { to: "/moon", label: "Rituals", icon: Moon },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const memberPaths = ["/home", "/library", "/moon", "/profile", "/account", "/record"];

export function MobileNav() {
  const location = useLocation();
  const isPlayer = location.pathname.startsWith("/player");
  const inMemberArea = memberPaths.some((p) => location.pathname.startsWith(p));

  if (isPlayer || !inMemberArea) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around px-6 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 rounded-xl px-4 py-1 transition-colors"
            >
              <Icon
                className={`size-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
