"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

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
  isAuthenticated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface S3Image {
  key: string;
  fileName: string;
  signedUrl: string;
  size: number;
  lastModified: string | null;
  userId: string | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [s3Images, setS3Images] = useState<S3Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const router = useRouter();

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
        await fetchS3Images(); // Fetch S3 images after authentication
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
        await fetchS3Images();
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

  async function fetchS3Images() {
    try {
      const res = await fetch("/api/admin/s3-images");
      if (res.ok) {
        const data = await res.json();
        setS3Images(data.images || []);
      }
    } catch (err) {
      console.error("Failed to fetch S3 images:", err);
    }
  }

  async function updateUserAuthentication(userId: string, isAuthenticated: boolean) {
    try {
      const res = await fetch("/api/admin/users/authenticate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAuthenticated }),
      });

      if (res.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isAuthenticated }
            : user
        ));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update user status");
      }
    } catch (err) {
      setError("Failed to update user status");
    }
  }

  function handleLogout() {
    document.cookie =
      "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsAuthenticated(false);
    setUsers([]);
    setS3Images([]);
    adminForm.reset();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-cyan-400 via-sky-300 to-cyan-200">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center overflow-hidden p-6 bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90">
        <div className="w-full max-w-md mx-auto rounded-2xl border border-white/40 bg-white/30 backdrop-blur shadow-lg p-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h1>
            <p className="text-slate-600 text-sm">
              Enter admin credentials to continue
            </p>
          </div>

          <form
            className="rounded-2xl border border-white/40 bg-white/40 backdrop-blur p-6 pb-8 shadow relative"
            onSubmit={adminForm.handleSubmit(onAdminLogin)}
          >
            <div className="pointer-events-none absolute -top-3 -left-2 h-2 w-2 rounded-full bg-white/70 shadow" />
            <div className="pointer-events-none absolute -top-1 right-10 h-1.5 w-1.5 rounded-full bg-white/60 shadow" />
            <div className="pointer-events-none absolute bottom-3 left-6 h-1.5 w-1.5 rounded-full bg-white/70 shadow" />

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-1 text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  {...adminForm.register("username")}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400 text-slate-800"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  {...adminForm.register("password")}
                  className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400 text-slate-800"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}
            </div>
            <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white py-2.5 shadow-lg hover:shadow-xl transition-shadow">
              Login as Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 md:p-6 bg-gradient-to-b from-cyan-200/90 via-sky-200/80 to-cyan-200/90">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-600">
                Manage registered users ({users.length} total)
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-700 text-white border border-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-semibold text-slate-800">
              Registered Users
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <p className="text-lg">No users registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Email
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Employee ID
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Designation
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Department
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Region
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Photo ID
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Status
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Actions
                    </th>
                    <th className="text-left p-4 text-slate-700 font-medium">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/20 ${
                        index % 2 === 0 ? "bg-white/10" : ""
                      }`}
                    >
                      <td className="p-4 text-slate-800 font-medium">
                        {user.name}
                      </td>
                      <td className="p-4 text-slate-600">{user.email}</td>
                      <td className="p-4 text-slate-600">{user.employeeId}</td>
                      <td className="p-4 text-slate-600">{user.designation}</td>
                      <td className="p-4 text-slate-600">{user.department}</td>
                      <td className="p-4 text-slate-600">{user.region}</td>
                      <td className="p-4">
                        {user.photoIdUrl ? (
                          user.photoIdUrl.startsWith("mock-") ? (
                            <span className="text-yellow-600 text-xs">
                              Mock File
                            </span>
                          ) : (
                            (() => {
                              // Find the corresponding S3 image for this user
                              const userImage = s3Images.find(
                                (img) =>
                                  img.userId === user.id ||
                                  img.key.includes(user.id)
                              );

                              return userImage ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      setSelectedImage({
                                        url: userImage.signedUrl,
                                        name: `${user.name}'s Photo ID`,
                                      })
                                    }
                                    className="hover:opacity-80 transition-opacity"
                                  >
                                    <Image
                                      src={userImage.signedUrl}
                                      alt={`${user.name}'s ID`}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 object-cover rounded-lg border border-white/40 cursor-pointer"
                                      unoptimized
                                    />
                                  </button>
                                </div>
                              ) : (
                                <a
                                  href={user.photoIdUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-600 hover:text-cyan-700 text-sm underline"
                                >
                                  View File
                                </a>
                              );
                            })()
                          )
                        ) : (
                          <span className="text-slate-500 text-sm">
                            No file
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isAuthenticated 
                            ? "bg-green-500/20 text-green-700 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                        }`}>
                          {user.isAuthenticated ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {!user.isAuthenticated ? (
                            <button
                              onClick={() => updateUserAuthentication(user.id, true)}
                              className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-700 hover:bg-green-500/30 transition-colors text-xs"
                            >
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserAuthentication(user.id, false)}
                              className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-700 hover:bg-red-500/30 transition-colors text-xs"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <div className="rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/20">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedImage.name}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-slate-600 hover:text-slate-800 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
