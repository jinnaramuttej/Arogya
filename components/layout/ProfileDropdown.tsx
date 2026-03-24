"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProfileDropdownProps {
  userId: string;
  userEmail: string;
  onLogout: () => void;
}

export default function ProfileDropdown({ userId, userEmail, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Fetch user profile for avatar
    const fetchProfile = async () => {
      if (!userId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("avatar_base64")
        .eq("id", userId)
        .single();
        
      if (data?.avatar_base64) {
        setAvatar(data.avatar_base64);
      }
    };
    
    fetchProfile();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userId]);

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-bold border-2 border-transparent hover:border-brand-500 transition-all focus:outline-none cursor-pointer overflow-hidden"
      >
        {avatar ? (
          <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {userEmail}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 no-underline"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 no-underline"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-700 py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border-none bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
