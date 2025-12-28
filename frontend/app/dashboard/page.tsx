"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  Ticket,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Eye,
  Edit,
  Trash2,
  Bell,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only check authentication after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Show loading if not mounted or no user
  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "events", label: "Events", icon: Calendar },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 fixed h-full z-40`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold">EventHub</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-700 transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300`}>
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="font-medium text-sm text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "user"}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Events</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{events.length}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-blue-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Attendees</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                    </div>
                    <Users className="w-12 h-12 text-green-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Tickets Sold</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">856</p>
                    </div>
                    <Ticket className="w-12 h-12 text-purple-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$42.5K</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                    <Plus className="w-4 h-4" />
                    New Event
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading events...</div>
                ) : events.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Event Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Attendees
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {events.slice(0, 5).map((event: any) => (
                          <tr key={event._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {event.title}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(event.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {event.location}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {event.registeredUsers?.length || 0}
                            </td>
                            <td className="px-6 py-4 text-sm flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No events created yet</div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Events</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition">
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>
              </div>

              {loading ? (
                <div className="text-center text-gray-500 py-12">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: any) => (
                    <div key={event._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg"></div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>📍 {event.location}</p>
                          <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                          <p>👥 {event.registeredUsers?.length || 0} attendees</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition">
                            Edit
                          </button>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Tickets</h2>
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Ticket management coming soon</p>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Users</h2>
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">User management coming soon</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
              <div className="bg-white rounded-lg shadow p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      disabled
                      className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                      Save Changes
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
