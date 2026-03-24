"use client";

import { ReactNode } from "react";
import {
  Home,
  Users,
  Stethoscope,
  Hospital,
  BookText,
  HeartHandshake,
  UserCog,
  ChevronRight,
  Bell,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/users", label: "User Directory", icon: UserCog },
  { href: "/admin/patients", label: "Patient Management", icon: Users },
  { href: "/admin/doctors", label: "Doctor Management", icon: Stethoscope },
  { href: "/admin/hospitals", label: "Hospital Management", icon: Hospital },
  { href: "/admin/donors", label: "Donor Management", icon: HeartHandshake },
  { href: "/admin/reports", label: "Reports Library", icon: BookText },
];

function getBreadcrumb(pathname: string) {
  const specific = navItems
    .filter((nav) => pathname.startsWith(nav.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return specific?.label || "Dashboard";
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center justify-center gap-2 text-xl font-bold border-b border-gray-200 text-red-600">
          <HeartPulse className="w-7 h-7" />
          ADMIN
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors no-underline ${
                  active
                    ? "bg-red-50 font-semibold text-red-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-red-600"
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
                {!item.exact && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors no-underline"
          >
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <span className="text-gray-500">Home</span>
            <span className="text-gray-400 mx-2">&gt;</span>
            <span className="text-gray-800 font-semibold">{breadcrumb}</span>
          </div>
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-gray-400" />
          </div>
        </header>
        <main className="p-8 overflow-y-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
