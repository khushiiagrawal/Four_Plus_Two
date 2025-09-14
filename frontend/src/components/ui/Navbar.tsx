"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-3">
      <div className="mt-3 w-full max-w-6xl rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 shadow-sm px-4 py-2 flex items-center justify-between">
        <Link href={"/"} className="font-semibold tracking-tight">
          AquaShield
        </Link>
        <nav className="flex items-center gap-2 text-sm">
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
        </nav>
      </div>
    </div>
  );
}
