"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  User,
  Calendar,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, ADMIN_NAV_ITEM } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";

const iconMap = {
  Home,
  Users,
  User,
  Calendar,
  Settings,
} as const;

interface SidebarProps {
  onNavClick?: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ onNavClick, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-card border-r border-border">
      <div className="h-14 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2" onClick={onNavClick}>
          <span className="text-lg font-bold tracking-tight">
            Liga <span className="text-amber-500">Softball</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
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
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        ) : (
          <Link
            href="/auth/login"
            onClick={onNavClick}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <LogIn size={16} />
            Iniciar Sesión
          </Link>
        )}
        <p className="text-xs text-zinc-600 text-center">Liga Softball v1.0</p>
        <p className="text-[10px] text-zinc-700 text-center">Desarrollada por Ing. Eduardo Millán Nuñez</p>
      </div>
    </aside>
  );
}
