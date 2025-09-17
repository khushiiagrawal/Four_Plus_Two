"use client";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import SplineHero from "@/components/widgets/SplineHero";

export default function Home() {
  const { user, isLoading, refreshUser } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const handleDashboardClick = async () => {
    if (isLoading) return;
    
    // Refresh user context to ensure we have the latest data
    await refreshUser();
    
    if (!user) {
      addToast({
        type: "error",
        title: "Access Denied",
        message: "Please log in to access the dashboard.",
      });
      router.push("/auth");
      return;
    }
    
    if (!user.isAuthenticated) {
      addToast({
        type: "warning",
        title: "Access Pending",
        message: "User not given access yet. Please wait for admin approval.",
        duration: 8000,
      });
      router.push("/profile");
      return;
    }
    
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden">
      {/* Header removed: Navbar is global in layout */}

      <main className="flex-1">
        <section className="relative overflow-hidden h-dvh flex items-center">
          <SplineHero />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-md px-4 py-1.5 text-sm text-white drop-shadow-md shadow-sm">
              AI & IoT • Water Health • Early Warning
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 max-w-3xl">
              Smart Community Health Monitoring
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
              AI and IoT powered Early Warning for Water-Borne Diseases in Rural
              India.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleDashboardClick}
                className="rounded-xl bg-white text-cyan-600 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-cyan-600/30"
              >
                Go to Dashboard
              </button>
              <Link
                href="/auth?tab=signup"
                className="rounded-xl bg-white text-cyan-600 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-cyan-600/30"
              >
                Request Access
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-sky-200/70 dark:border-teal-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-animate">
                <div className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" />
                  Legal Authorities Only
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-2">
                  Verified access for district health officials
                </div>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-sky-200/70 dark:border-teal-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-animate">
                <div className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500" />
                  Real-time Signals
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-2">
                  Field reports and IoT water sensors
                </div>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-sky-200/70 dark:border-teal-500/20 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-animate">
                <div className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  Actionable Insights
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-2">
                  Outbreak hotspots and areas at risk
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer removed per request */}
    </div>
  );
}
