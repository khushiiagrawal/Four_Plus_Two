"use client";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { user, isLoading, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-3">
      <div className="mt-3 w-full max-w-6xl rounded-full border border-cyan-700/40 bg-cyan-600/80 backdrop-blur-md text-white shadow-md px-4 py-2 flex items-center justify-between">
        <Link href={"/"} className="font-semibold tracking-tight text-lg md:text-xl">
          <span className="inline-flex items-center gap-2">
            <svg suppressHydrationWarning
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path d="M12.22 2.22a.75.75 0 0 0-1.44 0C9.73 6.2 6 8.6 6 12.25 6 16.22 8.86 19 12 19s6-2.78 6-6.75c0-3.65-3.73-6.05-5.78-10.03z" />
            </svg>
            <span>JalRakshak</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-3 text-base text-white">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-base font-semibold flex items-center justify-center">
                  {getUserInitials(user.name)}
                </div>
                <span className="hidden sm:block text-base font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-300/60 bg-white/95 backdrop-blur shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-slate-200/60">
                    <p className="text-sm font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {user.email}
                    </p>
                    <p className="text-xs mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.isAuthenticated 
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {user.isAuthenticated ? "Authenticated" : "Pending Approval"}
                      </span>
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                className="px-3 py-1 rounded-full hover:bg-white/20"
                href="/auth"
              >
                Log in
              </Link>
              <Link
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white shadow-sm border border-white/20"
                href="/auth?tab=signup"
              >
                Request Access
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
