"use client";

import { BarChart3, Calendar, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/events", icon: Calendar, label: "이벤트 관리" },
  { href: "/admin/users", icon: Users, label: "사용자 관리" },
  { href: "/admin/analytics", icon: BarChart3, label: "통계 분석" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card flex min-h-screen w-60 flex-col border-r">
      <div className="text-card-foreground flex h-16 items-center px-4 font-bold">
        Gather Admin
      </div>
      <nav className="flex flex-col">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-12 items-center gap-3 px-4 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-muted-foreground text-sm">화면 테마</span>
          <ThemeSwitcher />
        </div>
        <LogoutButton className="w-full" redirectTo="/admin/login" />
      </div>
    </aside>
  );
}
