"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, FileText } from "lucide-react";
import DashboardHeader from "@/app/components/DashboardHeader";

export default function VendorDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/vendors/me");
                setProfile(res.data.data);
            } catch (err) {
                console.error("Failed to fetch vendor profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader
                    title="Vendor Portal"
                    subtitle={`Managing for: ${profile?.businessName || user?.name}`}
                />

                {!profile ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-8">
                        <h3 className="text-lg font-bold text-yellow-800 mb-2">Complete Your Profile</h3>
                        <p className="text-yellow-700 mb-4">You need to set up your vendor profile to start receiving contracts.</p>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg">Set up Profile</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Contracts</h2>
                            {/* List contracts here */}
                            {profile.contracts && profile.contracts.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.contracts.map((contract: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-gray-900">{contract.event || "Event Contract"}</p>
                                                <p className="text-sm text-gray-500">Status: {contract.status}</p>
                                            </div>
                                            <span className="font-bold">${contract.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No active contracts</p>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
                            <div className="space-y-2">
                                <p className="text-gray-600"><span className="font-medium text-gray-900">Service:</span> {profile.serviceType}</p>
                                <p className="text-gray-600"><span className="font-medium text-gray-900">Description:</span> {profile.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
