"use client";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90"
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="min-h-dvh p-3 sm:p-4 md:p-6 bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90"
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8 mt-16 sm:mt-20 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 animate-slide-up">
            Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 animate-slide-up animation-delay-100">
            Manage your account information and view your authentication status
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 animate-slide-up animation-delay-200">
            <div className="h-full rounded-xl sm:rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-lg sm:text-xl font-semibold flex items-center justify-center animate-pulse-slow">
                  {getUserInitials(user.name)}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                    {user.name}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600">{user.designation}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Full Name
                    </label>
                    <p className="text-sm sm:text-base text-slate-800 break-words">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Email
                    </label>
                    <p className="text-sm sm:text-base text-slate-800 break-all">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Employee ID
                    </label>
                    <p className="text-sm sm:text-base text-slate-800">{user.employeeId}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Designation
                    </label>
                    <p className="text-sm sm:text-base text-slate-800">{user.designation}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Department
                    </label>
                    <p className="text-sm sm:text-base text-slate-800">{user.department}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Region
                    </label>
                    <p className="text-sm sm:text-base text-slate-800">{user.region}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="animate-slide-up animation-delay-300">
            <div className="h-full rounded-xl sm:rounded-2xl border border-white/50 bg-white/40 backdrop-blur-md shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                  Authentication Status
                </h3>
                <button
                  onClick={() => refreshUser()}
                  className="w-full sm:w-auto px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    user.isAuthenticated ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span
                  className={`text-sm sm:text-base font-medium ${
                    user.isAuthenticated ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {user.isAuthenticated ? "Authenticated" : "Pending Approval"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                {user.isAuthenticated
                  ? "Your account has been approved by an administrator. You have full access to the dashboard and all features."
                  : "Your account is pending approval from an administrator. You will receive access once your credentials are verified."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
