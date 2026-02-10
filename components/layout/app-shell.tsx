import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { isAdmin } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar isAdmin={admin} />
      </div>

      {/* Mobile top bar */}
      <TopBar isAdmin={admin} />

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8 animate-fade-in">
          {children}
        </div>
        <footer className="lg:hidden pb-20 text-center">
          <p className="text-[10px] text-zinc-700">
            Desarrollada por Ing. Eduardo Millán Nuñez
          </p>
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav isAdmin={admin} />
    </div>
  );
}
