"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Home, Users, FileText, Lock, Stethoscope, LogOut, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/useUser';

const navItems = [
  { href: '/doctor', label: 'Dashboard', icon: Home, exact: true },
  { href: '/doctor/patients', label: 'My Patients', icon: Users },
  { href: '/doctor/records', label: 'Medical Records', icon: FileText },
  { href: '/doctor/settings', label: 'Change Password', icon: Lock },
];

function getBreadcrumb(pathname: string) {
  const specific = navItems
    .filter(nav => pathname.startsWith(nav.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return specific?.label || 'Dashboard';
}

const DoctorLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (loading) return;

    if (!user && pathname !== '/doctor/login') {
      router.push('/doctor/login');
      return;
    }

    if (user && pathname !== '/doctor/login') {
      const verifyDoctorRole = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        
        if (!isMounted) return;

        if (data?.role === 'doctor') {
          setIsAuthorized(true);
        } else {
          // Additional fallback check against doctors table
          const { data: docData } = await supabase.from('doctors').select('id').eq('email', user.email).single();
          if (docData && isMounted) {
            setIsAuthorized(true);
          } else if (isMounted) {
            // Not a doctor, boot them to normal patient dashboard
            router.push('/dashboard');
          }
        }
      };
      verifyDoctorRole();
    } else {
      setIsAuthorized(true);
    }

    return () => { isMounted = false; };
  }, [user, loading, pathname, router]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const breadcrumb = getBreadcrumb(pathname);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  // Show loading spinner while verifying authorization (skip for login page)
  if (loading || (!isAuthorized && pathname !== '/doctor/login')) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 border-none m-0 p-0">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-700 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-emerald-700">
          <Stethoscope className="w-7 h-7 mr-3" />
          DOCTOR PORTAL
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-900 font-semibold text-white'
                    : 'text-emerald-200 hover:bg-emerald-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm text-emerald-200 hover:bg-emerald-700 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <span className="text-gray-500">Doctor Portal</span>
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

export default DoctorLayout;
