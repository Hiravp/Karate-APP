"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-accent">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">All-in-One Math Help</span>
          <span className="sm:hidden">Math Help</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? "bg-ink/5 text-ink"
                  : "text-ink/60 hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="ml-2 flex items-center gap-2 border-l border-ink/10 pl-3">
              <span className="hidden text-xs text-ink/55 md:inline">
                {user.full_name} · {user.role}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
