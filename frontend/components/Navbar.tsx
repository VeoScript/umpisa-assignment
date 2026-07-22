"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

const LINKS = [
  { href: "/dashboard", label: "Discover" },
  { href: "/saved", label: "Saved" },
  { href: "/meal-plan", label: "Meal Plan" },
  { href: "/stats", label: "Stats" },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="border-b border-line bg-cream/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="font-display text-xl font-semibold text-plum">
          Pantry
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-plum text-cream"
                    : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-ink-soft sm:inline">
              Hi, {user.name.split(" ")[0]}
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm font-medium text-ink-soft hover:text-danger"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
