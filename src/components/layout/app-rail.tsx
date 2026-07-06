"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Settings, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/networks", label: "Networks", icon: Workflow },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings/tools", label: "Settings", icon: Settings, match: "/settings" },
] as const;

export function AppRail() {
  const pathname = usePathname();

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center bg-rail py-4">
      <Link
        href="/networks"
        aria-label="AXN home"
        className="flex size-9 items-center justify-center rounded-xl bg-accent text-[13px] font-bold text-white"
      >
        AX
      </Link>

      <div className="mt-6 flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon, ...item }) => {
          const active = pathname.startsWith("match" in item ? item.match : href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex w-14 flex-col items-center gap-1 rounded-xl py-2 transition-colors",
                active
                  ? "bg-rail-raised text-rail-ink"
                  : "text-rail-ink-muted hover:bg-rail-raised/60 hover:text-rail-ink",
              )}
            >
              <Icon className="size-[18px]" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>

      <div
        className="mt-auto flex size-8 items-center justify-center rounded-full bg-rail-raised text-[11px] font-semibold text-rail-ink"
        title="Local workspace"
      >
        OC
      </div>
    </nav>
  );
}
