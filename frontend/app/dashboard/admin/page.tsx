"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Search, Trash2, Edit2, Users, Activity, DollarSign, Calendar, Plus } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Organizer creation form state
  const [organizerForm, setOrganizerForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    organizerContact: "",
    organizerLocations: "",
    organizerLogo: ""
  });
  const [createdOrganizer, setCreatedOrganizer] = useState(null);
  const [organizerLoading, setOrganizerLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // SECURITY: Check authentication and redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login/admin");
    }
  }, [user, authLoading, router]);

  // SECURITY: Check role and redirect if not authorized
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== "Admin") {
        console.warn(`Access denied: User has role "${user.role}" but tried to access Admin dashboard`);
        // Redirect to appropriate dashboard based on role
        if (user.role === "Organizer") {
          router.push("/dashboard/organizer");
        } else if (user.role === "User") {
          router.push("/dashboard/user");
        } else {
          router.push("/dashboard");
        }
        return;
      }
    }
  }, [user, authLoading, router]);

  // Fetch admin data
  useEffect(() => {
    if (user && user.role === "Admin") {
      fetchData();
    }
  }, [user]);

  // If not authorized, show nothing while redirecting
  if (authLoading || (user && user.role !== "Admin")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/stats"),
      ]);
      setUsers(usersRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load data");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setSuccess("User deleted successfully!");
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setSuccess("User role updated successfully!");
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update user role");
    }
  };

  const createOrganizerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizerForm.name || !organizerForm.email || !organizerForm.password) {
      setError("Please fill required fields (name, email, password)");
      return;
    }

    if (organizerForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setOrganizerLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: any = {
        name: organizerForm.name,
        email: organizerForm.email,
        password: organizerForm.password
      };

      if (organizerForm.organizerContact) {
        payload.organizerContact = organizerForm.organizerContact;
      }

      if (organizerForm.organizerLocations) {
        // Convert comma-separated locations to array
        payload.organizerLocations = organizerForm.organizerLocations
          .split(',')
          .map((loc: string) => loc.trim())
          .filter((loc: string) => loc);
      }

      if (organizerForm.organizerLogo) {
        payload.organizerLogo = organizerForm.organizerLogo;
      }

      const res = await api.post("/admin/organizers", payload);

      if (res.data.success) {
        setSuccess(`Organizer "${res.data.data.name}" created successfully!`);
        setCreatedOrganizer(res.data.data);
        setOrganizerForm({ name: "", email: "", password: "", organizerContact: "", organizerLocations: "", organizerLogo: "" });
        setLogoPreview(null);
        fetchData();

        // Clear success message after 8 seconds
        setTimeout(() => setSuccess(""), 8000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to create organizer";
      setError(errorMsg);
    } finally {
      setOrganizerLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to get URL (simple base64 for now, or use endpoint)
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await api.post("/profile/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (uploadRes.data.success) {
        setOrganizerForm({ 
          ...organizerForm, 
          organizerLogo: uploadRes.data.data 
        });
      }
    } catch (err) {
      setError("Failed to upload logo");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Navbar */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">EventHub Admin</h1>
          </div>
          <UserProfileDropdown />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/50 to-red-600/50 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">System Management</h1>
          <p className="text-orange-100">Welcome, {user?.name} - Full system access</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-green-200">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "overview"
                ? "bg-orange-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "users"
                ? "bg-orange-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("add-organizer")}
            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "add-organizer"
                ? "bg-orange-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Organizer
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-2">Total Users</p>
                    <h3 className="text-3xl font-bold text-white">{users.length}</h3>
                  </div>
                  <Users className="w-10 h-10 text-orange-400" />
                </div>
              </div>

              {/* Organizers */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-2">Organizers</p>
                    <h3 className="text-3xl font-bold text-white">
                      {users.filter((u) => u.role === "Organizer").length}
                    </h3>
                  </div>
                  <Calendar className="w-10 h-10 text-purple-400" />
                </div>
              </div>

              {/* Regular Users */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-2">Regular Users</p>
                    <h3 className="text-3xl font-bold text-white">
                      {users.filter((u) => u.role === "User").length}
                    </h3>
                  </div>
                  <Activity className="w-10 h-10 text-cyan-400" />
                </div>
              </div>

              {/* Admins */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm mb-2">Admins</p>
                    <h3 className="text-3xl font-bold text-white">
                      {users.filter((u) => u.role === "Admin").length}
                    </h3>
                  </div>
                  <DollarSign className="w-10 h-10 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Role Distribution</h3>
              <div className="space-y-4">
                {[
                  { role: "Admin", count: users.filter((u) => u.role === "Admin").length, color: "bg-orange-500" },
                  { role: "Organizer", count: users.filter((u) => u.role === "Organizer").length, color: "bg-purple-500" },
                  { role: "User", count: users.filter((u) => u.role === "User").length, color: "bg-cyan-500" },
                ].map((item) => {
                  const percentage = users.length > 0 ? (item.count / users.length) * 100 : 0;
                  return (
                    <div key={item.role}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{item.role}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div>
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto bg-white/10 backdrop-blur border border-white/20 rounded-lg">
              <table className="w-full">
                <thead className="border-b border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                              <span className="text-orange-400 font-bold">{u.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-white font-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u._id, e.target.value)}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="User">User</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Organizer Tab */}
        {activeTab === "add-organizer" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Create New Organizer Account</h3>
              <p className="text-gray-300 mb-6">
                Add a new organizer to the system. Share the organizer ID and credentials with them.
              </p>

              <form onSubmit={createOrganizerAccount} className="space-y-6 mb-8">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Organizer Name *
                  </label>
                  <input
                    type="text"
                    value={organizerForm.name}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, name: e.target.value })}
                    placeholder="e.g., John Event Organizer"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={organizerForm.email}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, email: e.target.value })}
                    placeholder="e.g., john@events.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    value={organizerForm.password}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, password: e.target.value })}
                    placeholder="Must be at least 6 characters"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-2">Organizer should change this after first login</p>
                </div>

                {/* Contact Details Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Contact Details
                  </label>
                  <input
                    type="text"
                    value={organizerForm.organizerContact}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, organizerContact: e.target.value })}
                    placeholder="e.g., +1-800-000-0000 or contact@organizer.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* Locations Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Operating Locations
                  </label>
                  <textarea
                    value={organizerForm.organizerLocations}
                    onChange={(e) => setOrganizerForm({ ...organizerForm, organizerLocations: e.target.value })}
                    placeholder="e.g., New York, Los Angeles, Chicago (comma-separated)"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Logo Upload Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Organizer Logo
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={organizerLoading}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-300 file:text-white file:bg-orange-600 file:border-0 file:rounded file:px-3 file:py-2 cursor-pointer"
                    />
                    {logoPreview && (
                      <div className="w-20 h-20 rounded-lg border border-white/20 overflow-hidden">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={organizerLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {organizerLoading ? "Creating..." : "Create Organizer Account"}
                </button>
              </form>

              {/* Created Organizer Details */}
              {createdOrganizer && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-bold text-green-300 mb-4">✓ Organizer Created Successfully!</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400">Organizer ID:</p>
                      <p className="text-white font-mono bg-black/30 p-2 rounded mt-1 break-all">
                        {createdOrganizer._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Name:</p>
                      <p className="text-white font-semibold">{createdOrganizer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email:</p>
                      <p className="text-white font-semibold">{createdOrganizer.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Login URL:</p>
                      <p className="text-cyan-400 font-mono break-all">
                        /login/organizer
                      </p>
                    </div>
                    <div className="mt-4 p-4 bg-black/30 rounded">
                      <p className="text-gray-300 text-xs mb-2">Share these credentials:</p>
                      <p className="text-white text-sm">
                        Email: <span className="font-mono">{createdOrganizer.email}</span>
                      </p>
                      <p className="text-yellow-300 text-sm mt-1">
                        Password: (as you set above)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
