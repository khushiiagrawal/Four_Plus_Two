"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const authoritiesLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthoritiesAuthPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof authoritiesLoginSchema>>({
    resolver: zodResolver(authoritiesLoginSchema),
  });

  async function onLogin(values: z.infer<typeof authoritiesLoginSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/authorities/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Login Successful",
          message: "Welcome to Higher Authorities Dashboard!",
        });
        setTimeout(() => router.push("/authorities/dashboard"), 500);
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({
          type: "error",
          title: "Login Failed",
          message: data.error || "Invalid credentials",
        });
      }
    } catch {
      addToast({
        type: "error",
        title: "Login Error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh p-4 md:p-6 bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90">
      <div className="min-h-dvh flex items-center justify-center overflow-hidden p-6">
        <div className="w-full max-w-lg mx-auto rounded-2xl border border-white/40 bg-white/30 backdrop-blur shadow-lg p-4 flex flex-col min-h-[560px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">
              Higher Authorities Portal
            </h1>
            <p className="text-slate-600 text-sm">
              Secure access for higher authorities and district officials
            </p>
          </div>

          <form
            className="mt-8 rounded-2xl border border-white/40 bg-white/40 backdrop-blur p-6 pb-8 shadow relative flex flex-col"
            onSubmit={loginForm.handleSubmit(onLogin)}
          >
            <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow" />
            <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow" />
            <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow" />

            <div className="flex-1 space-y-8 md:space-y-10">
              <div>
                <label className="block text-sm mb-1 text-slate-700">Username</label>
                <input
                  type="text"
                  {...loginForm.register("username")}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400 text-slate-800"
                  placeholder="Enter username"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1 text-slate-700">Password</label>
                <input
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 text-slate-800"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  ⚠️ This portal is restricted to authorized higher authorities
                  only. Unauthorized access is prohibited and may be subject to
                  disciplinary action.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white py-2.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-700 hover:to-sky-700 transition-colors"
            >
              {isLoading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
