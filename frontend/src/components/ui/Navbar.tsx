"use client";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, isLoading, logout } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <div className="mt-3 w-full max-w-6xl rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 shadow-sm px-4 py-2 flex items-center justify-between">
        <Link href={"/"} className="font-semibold tracking-tight">
          <span className="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M12.22 2.22a.75.75 0 0 0-1.44 0C9.73 6.2 6 8.6 6 12.25 6 16.22 8.86 19 12 19s6-2.78 6-6.75c0-3.65-3.73-6.05-5.78-10.03z" />
            </svg>
            <span>JalSurakshak</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-sm font-semibold flex items-center justify-center">
                  {getUserInitials(user.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-white/10 backdrop-blur shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                    <p className="text-xs mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.isAuthenticated 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                      }`}>
                        {user.isAuthenticated ? "Authenticated" : "Pending Approval"}
                      </span>
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                className="px-3 py-1 rounded-full hover:bg-white/60 dark:hover:bg-white/10"
                href="/auth"
              >
                Log in
              </Link>
              <Link
                className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white"
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
