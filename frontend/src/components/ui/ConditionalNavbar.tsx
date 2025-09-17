"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on admin page, legal authorities routes, and error pages
  if (pathname === "/admin" || pathname.startsWith("/legal") || pathname.startsWith("/_error") || pathname === "/404") {
    return null;
  }

  return <Navbar />;
}
