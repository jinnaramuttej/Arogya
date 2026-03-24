"use client";

import { ReactNode } from 'react';
import { Home, Users, Stethoscope, Hospital, BookText, Settings, Database, ChevronRight, Bell, HeartHandshake, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home, exact: true },
  { href: '/admin/users', label: 'User Directory', icon: UserCog },
  { href: '/admin/patients', label: 'Patient Management', icon: Users },
  { href: '/admin/doctors', label: 'Doctor Management', icon: Stethoscope },
  { href: '/admin/hospitals', label: 'Hospital Management', icon: Hospital },
  { href: '/admin/donors', label: 'Donor Management', icon: HeartHandshake },
  { href: '/admin/reports', label: 'Reports Library', icon: BookText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function getBreadcrumb(pathname: string) {
  const specific = navItems
    .filter(nav => pathname.startsWith(nav.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return specific?.label || 'Dashboard';
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
          <Database className="w-7 h-7 mr-3" />
          ADMIN CONSOLE
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  active
                    ? 'bg-gray-900 font-semibold text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
                {!item.exact && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
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
            <Bell className="w-6 h-6 text-gray-500" />
          </div>
        </header>
        <main className="p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
