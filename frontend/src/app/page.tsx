"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col overflow-hidden">
      {/* Header removed: Navbar is global in layout */}

      <main className="flex-1">
        <section className="relative overflow-hidden h-dvh flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,.35),transparent_35%),radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,.35),transparent_35%)] bg-drift" />
          <div className="absolute inset-0 opacity-60 water-float">
            <svg
              aria-hidden
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1440 560"
            >
              <path
                fill="url(#g)"
                d="M0,192L60,165.3C120,139,240,85,360,80C480,75,600,117,720,117.3C840,117,960,75,1080,90.7C1200,107,1320,181,1380,218.7L1440,256L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z"
              ></path>
              <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute inset-0 water-float-2">
            <svg
              aria-hidden
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1440 560"
            >
              <path
                fill="url(#g2)"
                opacity="0.25"
                d="M0,256L60,261.3C120,267,240,277,360,256C480,235,600,181,720,176C840,171,960,213,1080,229.3C1200,245,1320,235,1380,229.3L1440,224L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z"
              ></path>
              <defs>
                <linearGradient id="g2" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute inset-0 water-shimmer" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 shadow-sm">
              AI + IoT • Water Health • Early Warning
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 max-w-3xl">
              Smart Community Health Monitoring
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
              AI and IoT powered Early Warning for Water-Borne Diseases in Rural
              India.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                Log in to Dashboard
              </Link>
              <Link
                href="/auth?tab=signup"
                className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
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
