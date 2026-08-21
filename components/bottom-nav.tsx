"use client";

import { CalendarDays, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/events", icon: CalendarDays, label: "내 이벤트" },
  { href: "/events/new", icon: Plus, label: "새 이벤트" },
  { href: "/profile", icon: User, label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="max-w-app-frame bg-background fixed bottom-0 left-1/2 z-50 flex h-16 w-full -translate-x-1/2 items-center border-t px-2">
      <div className="flex flex-1 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <ThemeSwitcher />
    </nav>
  );
}
