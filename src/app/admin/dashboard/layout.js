"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart2, LayoutDashboard, LogOut, ShoppingBag, UtensilsCrossed } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/dashboard/menuManagement", label: "Menu", icon: UtensilsCrossed, exact: false },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart2, exact: false },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setRestaurant(res.admin);
        else router.replace("/login");
      })
      .catch(() => router.replace("/login"));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  };

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const initials = restaurant?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "MB";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-30">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-base">🍽️</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-gray-900 text-sm leading-tight">MenuBuddy</p>
            <p className="text-[11px] text-gray-400 truncate leading-tight">
              {restaurant?.name || "—"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: profile + logout */}
        <div className="px-3 pb-5 border-t border-gray-100 pt-3 shrink-0 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                {restaurant?.name || "Loading..."}
              </p>
              <p className="text-[10px] text-gray-400 truncate leading-tight">
                {restaurant?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-500 transition-colors" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Content area ────────────────────────────────────────────── */}
      <div className="flex-1 md:ml-56 min-h-screen pb-16 md:pb-0">
        {children}
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
        <div className="grid grid-cols-4 h-16">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-orange-600" : "text-gray-400"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${active ? "text-orange-500" : "text-gray-400"}`}
                />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
