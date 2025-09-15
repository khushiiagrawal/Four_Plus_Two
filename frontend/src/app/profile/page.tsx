"use client";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          background:
            "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
        }}
      >
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
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
      className="min-h-dvh p-4 md:p-6"
      style={{
        background:
          "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 mt-20 animate-fade-in">
          <h1 className="text-3xl font-bold text-white animate-slide-up">
            Profile
          </h1>
          <p className="text-slate-300 mt-2 animate-slide-up animation-delay-100">
            Manage your account information and view your authentication status
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 animate-slide-up animation-delay-200">
            <div className="h-full rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-xl font-semibold flex items-center justify-center animate-pulse-slow">
                  {getUserInitials(user.name)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {user.name}
                  </h2>
                  <p className="text-slate-300">{user.designation}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Full Name
                    </label>
                    <p className="text-white">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Email
                    </label>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Employee ID
                    </label>
                    <p className="text-white">{user.employeeId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Designation
                    </label>
                    <p className="text-white">{user.designation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Department
                    </label>
                    <p className="text-white">{user.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Region
                    </label>
                    <p className="text-white">{user.region}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="animate-slide-up animation-delay-300">
            <div className="h-full rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Authentication Status
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    user.isAuthenticated ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    user.isAuthenticated ? "text-green-200" : "text-yellow-200"
                  }`}
                >
                  {user.isAuthenticated ? "Authenticated" : "Pending Approval"}
                </span>
              </div>

              <p className="text-sm text-slate-300">
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
