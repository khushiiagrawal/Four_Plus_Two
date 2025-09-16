"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const legalLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LegalAuthPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof legalLoginSchema>>({
    resolver: zodResolver(legalLoginSchema),
  });

  async function onLogin(values: z.infer<typeof legalLoginSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/legal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        addToast({
          type: "success",
          title: "Login Successful",
          message: "Welcome to Legal Authorities Dashboard!",
        });
        setTimeout(() => router.push("/legal/dashboard"), 500);
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
    <div
      className="min-h-dvh flex items-center justify-center overflow-hidden p-6"
      style={{
        background:
          "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
      }}
    >
      <div className="w-full max-w-lg mx-auto rounded-2xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur shadow-lg p-4 flex flex-col min-h-[560px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">
            Legal Authorities Portal
          </h1>
          <p className="text-slate-200 text-sm">
            Secure access for legal authorities and law enforcement
          </p>
        </div>

        <form
          className="mt-8 rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur p-6 pb-8 shadow relative flex flex-col fade-up"
          onSubmit={loginForm.handleSubmit(onLogin)}
        >
          <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow water-float animation-delay-100" />
          <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow water-float-2 animation-delay-200" />
          <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow water-float animation-delay-300" />

          <div className="flex-1 space-y-8 md:space-y-10">
            <div>
              <label className="block text-sm mb-1 text-white">Username</label>
              <input
                type="text"
                {...loginForm.register("username")}
                className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter username"
                disabled={isLoading}
              />
              {loginForm.formState.errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {loginForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1 text-white">Password</label>
              <input
                type="password"
                {...loginForm.register("password")}
                className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-200">
                ⚠️ This portal is restricted to authorized legal authorities
                only. Unauthorized access is prohibited and may be subject to
                legal action.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white py-2.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-orange-700 transition-colors"
          >
            {isLoading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
