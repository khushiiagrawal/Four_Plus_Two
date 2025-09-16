"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on admin page and legal authorities routes
  if (pathname === "/admin" || pathname.startsWith("/legal")) {
    return null;
  }

  return <Navbar />;
}
