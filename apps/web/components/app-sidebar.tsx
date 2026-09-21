"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  ListChecks,
  BookOpen,
  LayoutTemplate,
  SlidersHorizontal,
  Package,
  Settings,
  Aperture,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/photos", label: "Photos", icon: Images },
  { href: "/jobs", label: "Editing Jobs", icon: ListChecks },
  { href: "/albums", label: "Albums", icon: BookOpen },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/presets", label: "Presets", icon: SlidersHorizontal },
  { href: "/outputs", label: "Outputs", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-6">
        <Aperture className="h-7 w-7 text-gold" />
        <div>
          <p className="font-display text-lg leading-tight tracking-wide">Wedding Studio</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Photoshop Edition
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-gold",
                active
                  ? "bg-gold/10 font-medium text-gold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-5 py-4 text-[11px] leading-relaxed text-muted-foreground">
        Edits are produced by <span className="text-gold">Adobe Photoshop 2022</span> via the local
        Windows agent — not by browser filters.
      </div>
    </aside>
  );
}
