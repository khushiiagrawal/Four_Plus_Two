"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on admin page
  if (pathname === "/admin") {
    return null;
  }

  return <Navbar />;
}
