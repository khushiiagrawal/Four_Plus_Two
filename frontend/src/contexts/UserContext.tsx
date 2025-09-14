"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/jwt";

interface UserContextType {
  user: AppUser | null;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (setLoading = false) => {
    try {
      const res = await fetch("/api/auth/me", { 
        credentials: "include",
        cache: "no-store" // Ensure we don't cache the request
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        
        // If we get a 401, the token might be expired, so force logout
        if (res.status === 401) {
          // Force logout to clear any cached state
          await fetch("/api/auth/logout", { method: "POST" });
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      if (setLoading) {
        setIsLoading(false);
      }
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      // Clear any client-side storage as well
      if (typeof window !== 'undefined') {
        // Force clear cookies on client side too
        document.cookie = "aquashield_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      router.push("/");
    }
  }, [router]); // router dependency

  useEffect(() => {
    refreshUser(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - refreshUser is memoized and stable

  return (
    <UserContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
