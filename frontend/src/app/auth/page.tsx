"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";
import { useUser } from "@/contexts/UserContext";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  employeeId: z.string().min(3),
  designation: z.string().min(2),
  department: z.string().min(2),
  region: z.string().min(2),
  password: z.string().min(8),
  invitationCode: z.string().optional(),
  photoId: z.any().optional(),
});

export default function AuthPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { refreshUser } = useUser();
  const defaultTab = params.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);


  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (res.ok) {
        addToast({
          type: "success",
          title: "Login Successful",
          message: "Welcome back! Redirecting to dashboard...",
        });
        // Wait a bit for the cookie to be set, then refresh user context
        setTimeout(async () => {
          await refreshUser(); // Refresh user context
          setTimeout(() => router.push("/dashboard"), 500);
        }, 500);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.requiresApproval) {
          addToast({
            type: "warning",
            title: "Access Pending",
            message: data.error,
            duration: 8000,
          });
        } else {
          addToast({
            type: "error",
            title: "Login Failed",
            message: data.error || "Invalid credentials",
          });
        }
      }
    } catch {
      addToast({
        type: "error",
        title: "Login Error",
        message: "Network error. Please try again.",
      });
    }
  }

  async function onSignup(values: z.infer<typeof signupSchema>) {
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (k === "photoId" && v && (v as FileList).length) {
          fd.append("photoId", (v as FileList)[0]);
        } else if (v != null) {
          fd.append(k, String(v));
        }
      });
      
      const res = await fetch("/api/auth/signup", { method: "POST", body: fd });
      
      if (res.ok) {
        addToast({
          type: "success",
          title: "Account Created",
          message: "Your account has been created. Please wait for admin approval.",
          duration: 8000,
        });
        // Wait a bit for the cookie to be set, then refresh user context
        setTimeout(async () => {
          await refreshUser(); // Refresh user context
          setTimeout(() => router.push("/dashboard"), 500);
        }, 500);
      } else {
        const data = await res.json().catch(() => ({}));
        if (data.error && typeof data.error === "object") {
          // Handle validation errors
          const errorMessages = Object.values(data.error).flat();
          addToast({
            type: "error",
            title: "Signup Failed",
            message: errorMessages.join(", "),
          });
        } else {
          addToast({
            type: "error",
            title: "Signup Failed",
            message: data.error || "Failed to create account",
          });
        }
      }
    } catch {
      addToast({
        type: "error",
        title: "Signup Error",
        message: "Network error. Please try again.",
      });
    }
  }

  const cardSizeClass =
    tab === "login" ? "max-w-lg min-h-[560px]" : "max-w-2xl min-h-[460px]";
  const outerPadClass = tab === "signup" ? "pt-16 md:pt-24" : "";

  return (
    <div
      className={`min-h-dvh flex items-center justify-center overflow-hidden p-6 ${outerPadClass}`}
      style={{
        background:
          "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
      }}
    >
      <div
        className={`w-full mx-auto rounded-2xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur shadow-lg p-4 flex flex-col transition-all duration-300 ${cardSizeClass}`}
      >
        <div className="relative grid grid-cols-2 bg-white/60 dark:bg-white/[0.06] backdrop-blur p-1 rounded-2xl shadow border border-slate-200/60 dark:border-white/10">
          <div
            className="absolute inset-y-1 left-1 w-1/2 rounded-xl bg-white shadow-sm border border-white/40 transition-transform duration-300 ease-out"
            style={{ transform: tab === "login" ? "translateX(0%)" : "translateX(100%)" }}
            aria-hidden
          />
          <button
            onClick={() => setTab("login")}
            className={`relative z-10 flex-1 rounded-xl px-4 py-2 text-sm transition-colors ${
              tab === "login" ? "text-slate-900" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`relative z-10 flex-1 rounded-xl px-4 py-2 text-sm transition-colors ${
              tab === "signup" ? "text-slate-900" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Sign up
          </button>
        </div>

        {tab === "login" ? (
          <form
            className="mt-8 rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur p-6 pb-8 shadow relative flex flex-col fade-up"
            onSubmit={loginForm.handleSubmit(onLogin)}
          >
            <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow water-float animation-delay-100" />
            <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow water-float-2 animation-delay-200" />
            <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow water-float animation-delay-300" />
            <div className="flex-1 space-y-8 md:space-y-10">
              <div>
                <label className="block text-sm mb-1">Official Email</label>
                <input
                  type="email"
                  {...loginForm.register("email")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="name@district.gov.in"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Secure Password</label>
                <input
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Note: Use your official email and valid credentials. Access is
                limited to authorized government/legal authorities. Keep your
                password confidential.
              </p>
            </div>
            <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-white py-2.5 shadow-lg">
              Log in
            </button>
          </form>
        ) : (
          <form
            className="mt-10 pt-8 space-y-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur p-5 shadow relative flex-1 fade-up"
            onSubmit={signupForm.handleSubmit(onSignup)}
          >
            <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow water-float animation-delay-100" />
            <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow water-float-2 animation-delay-200" />
            <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow water-float animation-delay-300" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  {...signupForm.register("name")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Official Email</label>
                <input
                  type="email"
                  {...signupForm.register("email")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Employee ID/Number</label>
                <input
                  {...signupForm.register("employeeId")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Designation</label>
                <input
                  {...signupForm.register("designation")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Department/Organization
                </label>
                <input
                  {...signupForm.register("department")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Region/District</label>
                <input
                  {...signupForm.register("region")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Secure Password</label>
              <input
                type="password"
                {...signupForm.register("password")}
                className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Invitation Code (if pre-approved)
              </label>
              <input
                {...signupForm.register("invitationCode")}
                className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Photo ID Upload</label>
              <label className="block w-full">
                <span className="sr-only">Choose photo ID file</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    signupForm.setValue("photoId", e.target.files as FileList)
                  }
                  className="block w-full text-sm cursor-pointer file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200/80 dark:file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-300/80 dark:hover:file:bg-white/20"
                />
              </label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Accepted: images only JPG . Click the field to select a file.
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access limited to legal/government authorities.
            </p>
            <button className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white py-2.5 shadow-lg">
              Request Access
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
