"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Calendar, DollarSign, Users, TrendingUp, Plus } from "lucide-react";

export default function OrganizerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get("/analytics/organizer");
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {user?.name}</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create Event
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Income</p>
                                <h3 className="text-2xl font-bold text-gray-900">${stats?.totalIncome || 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-red-600 animate-pulse" />
                                {/* using TrendingUp for expense visual simplification */}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Expenses</p>
                                <h3 className="text-2xl font-bold text-gray-900">${stats?.totalExpenses || 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Net Profit</p>
                                <h3 className="text-2xl font-bold text-gray-900">${stats?.profit || 0}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Events</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.events?.length || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Your Events</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Event Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Income</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Profit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.events?.map((event: any) => (
                                    <tr key={event.eventId} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-900 font-medium">{event.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(event.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium">+${event.income}</td>
                                        <td className="px-6 py-4 text-blue-600 font-medium">${event.profit}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.events || stats.events.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No events found. Create your first event!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
