"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Shield, Users, DollarSign, Database } from "lucide-react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get("/analytics/admin");
                setStats(res.data.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-3xl font-bold">Admin Console</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">System Profit</p>
                        <h3 className="text-2xl font-bold text-green-400 mt-1">${stats?.profit || 0}</h3>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-blue-400 mt-1">${stats?.totalIncome || 0}</h3>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-red-400 mt-1">${stats?.totalExpenses || 0}</h3>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <p className="text-slate-400 text-sm">Total Events</p>
                        <h3 className="text-2xl font-bold text-purple-400 mt-1">{stats?.totalEvents || 0}</h3>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h2 className="text-xl font-bold mb-4">System Utilities</h2>
                    <div className="flex gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">Manage Users</button>
                        <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg">View Audit Logs</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
