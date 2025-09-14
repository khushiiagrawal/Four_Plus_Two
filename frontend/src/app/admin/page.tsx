"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
  region: string;
  photoIdUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onAdminLogin(values: z.infer<typeof adminLoginSchema>) {
    try {
      setError("");
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        await fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }

  function handleLogout() {
    document.cookie =
      "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    setUsers([]);
    adminForm.reset();
  }

  if (loading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{
          background:
            "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
        }}
      >
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center overflow-hidden p-6"
        style={{
          background:
            "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
        }}
      >
        <div className="w-full max-w-md mx-auto rounded-2xl border border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur shadow-lg p-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-slate-300 text-sm">
              Enter admin credentials to continue
            </p>
          </div>

          <form
            className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur p-6 pb-8 shadow relative"
            onSubmit={adminForm.handleSubmit(onAdminLogin)}
          >
            <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow" />
            <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow" />
            <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow" />

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-1 text-white">
                  Username
                </label>
                <input
                  type="text"
                  {...adminForm.register("username")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white">
                  Password
                </label>
                <input
                  type="password"
                  {...adminForm.register("password")}
                  className="w-full rounded-xl border border-slate-300/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>
            <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-white py-2.5 shadow-lg hover:shadow-xl transition-shadow">
              Login as Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh pt-20 p-6"
      style={{
        background:
          "linear-gradient(to bottom, #25404c, #1f4a5e, #1e485c, #1e4558, #1d4254, #1c3e50, #1b3b4b, #1b3745, #193440, #18303c)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-300">
                Manage registered users ({users.length} total)
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Registered Users
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-300">
              <p className="text-lg">No users registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Name
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Email
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Employee ID
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Designation
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Department
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Region
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Photo ID
                    </th>
                    <th className="text-left p-4 text-slate-200 font-medium">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/5 ${
                        index % 2 === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="p-4 text-white font-medium">
                        {user.name}
                      </td>
                      <td className="p-4 text-slate-300">{user.email}</td>
                      <td className="p-4 text-slate-300">{user.employeeId}</td>
                      <td className="p-4 text-slate-300">{user.designation}</td>
                      <td className="p-4 text-slate-300">{user.department}</td>
                      <td className="p-4 text-slate-300">{user.region}</td>
                      <td className="p-4">
                        {user.photoIdUrl ? (
                          user.photoIdUrl.startsWith("mock-") ? (
                            <span className="text-yellow-400 text-xs">
                              Mock File
                            </span>
                          ) : (
                            <a
                              href={user.photoIdUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 text-sm underline"
                            >
                              View File
                            </a>
                          )
                        ) : (
                          <span className="text-slate-500 text-sm">
                            No file
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
