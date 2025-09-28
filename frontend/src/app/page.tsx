"use client";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import SplineHero from "@/components/widgets/SplineHero";
import { FormattedMessage, useIntl } from "react-intl";

export default function Home() {
  const { user, isLoading, refreshUser } = useUser();
  const router = useRouter();
  const { addToast } = useToast();
  const intl = useIntl();

  const handleDashboardClick = async () => {
    if (isLoading) return;
    
    // Refresh user context to ensure we have the latest data
    await refreshUser();
    
    if (!user) {
      addToast({
        type: "error",
        title: intl.formatMessage({ id: "toast.accessDenied.title", defaultMessage: "Access Denied" }),
        message: intl.formatMessage({ id: "toast.accessDenied.message", defaultMessage: "Please log in to access the dashboard." }),
      });
      router.push("/auth");
      return;
    }
    
    if (!user.isAuthenticated) {
      addToast({
        type: "warning",
        title: intl.formatMessage({ id: "toast.accessPending.title", defaultMessage: "Access Pending" }),
        message: intl.formatMessage({ id: "toast.accessPending.message", defaultMessage: "User not given access yet. Please wait for admin approval." }),
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
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-28">
            <span className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-white drop-shadow-md shadow-sm">
              <FormattedMessage id="home.badge" defaultMessage="AI & IoT • Water Health • Early Warning" />
            </span>
            <h1 className="mt-4 text-2xl sm:text-4xl md:text-6xl font-semibold tracking-tight text-white max-w-3xl">
              <FormattedMessage id="home.title" defaultMessage="Smart Community Health Monitoring" />
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
              <FormattedMessage id="home.subtitle" defaultMessage="AI and IoT powered Early Warning for Water-Borne Diseases in Rural India." />
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button
                onClick={handleDashboardClick}
                className="w-full sm:w-auto rounded-xl bg-white text-cyan-600 px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-cyan-600/30 text-sm sm:text-base"
              >
                <FormattedMessage id="home.cta.dashboard" defaultMessage="Go to Dashboard" />
              </button>
              {!user && (
                <Link
                  href="/auth"
                  className="w-full sm:w-auto rounded-xl bg-white text-cyan-600 px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-cyan-600/30 text-sm sm:text-base"
                >
                  <FormattedMessage id="home.cta.hcwLogin" defaultMessage="Health-Care Workers Login" />
                </Link>
              )}
              <Link
                href="/authorities"
                className="w-full sm:w-auto rounded-xl bg-white text-cyan-600 px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-cyan-600/30 text-sm sm:text-base"
              >
                <FormattedMessage id="home.cta.ministryLogin" defaultMessage="Ministry Login" />
              </Link>
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-white">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" />
                  <FormattedMessage id="home.card1.title" defaultMessage="Higher Authorities Only" />
                </div>
                <div className="text-xs text-white/90 mt-2">
                  <FormattedMessage id="home.card1.desc" defaultMessage="Verified access for district health officials" />
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-white">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500" />
                  <FormattedMessage id="home.card2.title" defaultMessage="Real-time Signals" />
                </div>
                <div className="text-xs text-white/90 mt-2">
                  <FormattedMessage id="home.card2.desc" defaultMessage="Field reports and IoT water sensors" />
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white/20 backdrop-blur-md border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-white">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  <FormattedMessage id="home.card3.title" defaultMessage="Actionable Insights" />
                </div>
                <div className="text-xs text-white/90 mt-2">
                  <FormattedMessage id="home.card3.desc" defaultMessage="Outbreak hotspots and areas at risk" />
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
