"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, ADMIN_NAV_ITEM } from "@/lib/utils/constants";

const iconMap = {
  Home,
  Users,
  User,
  Calendar,
  Settings,
} as const;

interface BottomNavProps {
  isAdmin?: boolean;
}

export function BottomNav({ isAdmin }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[4rem]",
                isActive
                  ? "text-amber-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
