"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
    Calendar, Package, Clock, MapPin,
    ChevronRight, Loader2, Activity, Plus,
    Trash2, AlertCircle, CheckCircle2,
    CalendarDays, Settings, History, Shield,
    ListTodo, FileText, Timer, ArrowUpRight
} from "lucide-react";
import DashboardHeader from "@/app/components/DashboardHeader";

export default function VendorDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [vendorProfile, setVendorProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("assignments");
    const [error, setError] = useState<string | null>(null);

    // Profile Setup Form
    const [setupData, setSetupData] = useState({ businessName: "", serviceType: "Catering" });

    // Resource/Availability States
    const [newResource, setNewResource] = useState({ name: "", quantity: 0, unitPrice: 0 });
    const [newAvailability, setNewAvailability] = useState({ date: "", status: "Available", note: "" });

    const fetchData = async () => {
        try {
            const [assignRes, meRes] = await Promise.all([
                api.get("/vendors/assignments"),
                api.get("/vendors/me")
            ]);
            setAssignments(assignRes.data.data);
            setVendorProfile(meRes.data.data);
            setError(null);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError("PROFILE_NOT_FOUND");
            } else {
                console.error("Tactical data acquisition failed", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleProfileSetup = async () => {
        if (!setupData.businessName) return;
        setLoading(true);
        try {
            const res = await api.post("/vendors", setupData);
            setVendorProfile(res.data.data);
            setError(null);
        } catch (err) {
            alert("Strategic profile deployment failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTaskStatus = async (eventId: string, taskId: string, status: string) => {
        try {
            await api.put(`/vendors/tasks/${eventId}/${taskId}`, { status });
            fetchData(); // Refresh to get updated task status
        } catch (err) {
            alert("Task status update unsuccessful.");
        }
    };

    const handleAddResource = async () => {
        if (!newResource.name) return;
        try {
            const updatedResources = [...(vendorProfile.resources || []), newResource];
            const res = await api.post("/vendors", { ...vendorProfile, resources: updatedResources });
            setVendorProfile(res.data.data);
            setNewResource({ name: "", quantity: 0, unitPrice: 0 });
        } catch (err) {
            alert("Resource mobilization failed.");
        }
    };

    const handleRemoveResource = async (index: number) => {
        try {
            const updatedResources = vendorProfile.resources.filter((_: any, i: number) => i !== index);
            const res = await api.post("/vendors", { ...vendorProfile, resources: updatedResources });
            setVendorProfile(res.data.data);
        } catch (err) {
            alert("Resource decommissioning failed.");
        }
    };

    const handleAddAvailability = async () => {
        if (!newAvailability.date) return;
        try {
            const updatedAvail = [...(vendorProfile.availability || []), newAvailability];
            const res = await api.put("/vendors/availability", { availability: updatedAvail });
            setVendorProfile(res.data.data);
            setNewAvailability({ date: "", status: "Available", note: "" });
        } catch (err) {
            alert("Availability protocol update failed.");
        }
    };

    const handleRemoveAvailability = async (index: number) => {
        try {
            const updatedAvail = vendorProfile.availability.filter((_: any, i: number) => i !== index);
            const res = await api.put("/vendors/availability", { availability: updatedAvail });
            setVendorProfile(res.data.data);
        } catch (err) {
            alert("Availability node deletion failed.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Activity className="w-10 h-10 text-amber-600 animate-spin" />
        </div>
    );

    if (error === "PROFILE_NOT_FOUND") return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/10 w-full max-w-xl shadow-2xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 rotate-3">
                        <Shield className="text-white" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-white">Initialize Headquarters</h2>
                    <p className="text-slate-400 font-medium tracking-wide">Establish your vendor operational protocol to begin receiving missions.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Business Designation</label>
                        <input
                            placeholder="e.g. Stellar AV Solutions"
                            value={setupData.businessName}
                            onChange={(e) => setSetupData({ ...setupData, businessName: e.target.value })}
                            className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-amber-500/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Strategic Sector</label>
                        <select
                            value={setupData.serviceType}
                            onChange={(e) => setSetupData({ ...setupData, serviceType: e.target.value })}
                            className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-amber-500/50 transition-all appearance-none"
                        >
                            {['Catering', 'Sound & Light', 'Logistics', 'Security', 'Venue', 'IT Support'].map(type => (
                                <option key={type} value={type} className="text-slate-900">{type}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleProfileSetup}
                        className="w-full py-6 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-amber-500/20 transform hover:-translate-y-1"
                    >
                        Deploy Profile Protocol
                    </button>
                </div>
            </div>
        </div>
    );

    // Aggregate Tasks
    const allTasks = assignments.flatMap(event =>
        (event.tasks || [])
            .filter((t: any) => t.assignedTo === user?.id)
            .map((t: any) => ({ ...t, eventTitle: event.title, eventId: event._id }))
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-32">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <DashboardHeader
                        title="Vendor Command"
                        subtitle={`Operational HQ for ${vendorProfile?.businessName || user?.name}`}
                    />
                    <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                        {[
                            { id: "assignments", label: "Assignments", icon: Shield },
                            { id: "tasks", label: "Tasks", icon: ListTodo },
                            { id: "schedules", label: "Schedules", icon: Timer },
                            { id: "contracts", label: "Contracts", icon: FileText },
                            { id: "resources", label: "Resources", icon: Package }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Workspace */}
                    <div className="lg:col-span-8 space-y-10">
                        {activeTab === "assignments" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                        <Shield size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Mission Assignments</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {assignments.map(event => (
                                        <div key={event._id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 group hover:scale-[1.01] transition-all">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        {event.category}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Clock size={12} /> {event.time}
                                                    </span>
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900">{event.title}</h4>
                                                <div className="flex items-center gap-6 text-slate-500 font-bold text-sm">
                                                    <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</div>
                                                    <div className="flex items-center gap-2"><MapPin size={16} /> {event.location}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Organizer</p>
                                                    <p className="text-sm font-black text-slate-700 mt-1">{event.organizer?.name}</p>
                                                </div>
                                                <button className="p-5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {assignments.length === 0 && (
                                        <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <AlertCircle size={48} className="mx-auto text-slate-200 mb-6" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active mission assignments detected.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "tasks" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                        <ListTodo size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Tactical Objectives</h3>
                                </div>
                                <div className="space-y-4">
                                    {allTasks.map((task: any) => (
                                        <div key={task._id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{task.eventTitle}</p>
                                                <h4 className="text-xl font-black text-slate-900">{task.title}</h4>
                                                <p className="text-slate-500 text-sm font-medium">{task.description}</p>
                                                {task.deadline && (
                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                                                        <Timer size={12} /> Deadline: {new Date(task.deadline).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {['Pending', 'In-Progress', 'Completed'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleUpdateTaskStatus(task.eventId, task._id, status)}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${task.status === status
                                                                ? (status === 'Completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-900 text-white shadow-lg')
                                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {allTasks.length === 0 && (
                                        <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tactical objectives assigned.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "schedules" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                        <Timer size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Operational Schedules</h3>
                                </div>
                                <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {assignments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                                                <tr key={event._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-black text-slate-900">{new Date(event.date).toLocaleDateString()}</td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-slate-800">{event.title}</p>
                                                        <p className="text-[9px] font-black text-indigo-500 uppercase">{event.category}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{event.time}</td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{event.location}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "contracts" && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Strategic Contracts</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {vendorProfile?.contracts?.map((contract: any, idx: number) => (
                                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 group">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Index</p>
                                                    <h4 className="text-lg font-black text-slate-900">Contract Alpha-{idx + 1}</h4>
                                                </div>
                                                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    {contract.status}
                                                </span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-sm py-3 border-b border-slate-50">
                                                    <span className="text-slate-500 font-bold">Total Valuation</span>
                                                    <span className="text-slate-900 font-black">{contract.amount?.toLocaleString()}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed italic">
                                                    "{contract.terms || "Standard operational terms apply to this engagement."}"
                                                </p>
                                            </div>
                                            <button className="w-full py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                View Documentation
                                            </button>
                                        </div>
                                    ))}
                                    {(!vendorProfile?.contracts || vendorProfile.contracts.length === 0) && (
                                        <div className="md:col-span-2 p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active strategic contracts detected.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "resources" && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                            <Package size={20} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Strategic Resources</h3>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <input
                                            placeholder="Resource Name"
                                            value={newResource.name}
                                            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                            className="p-5 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-amber-100 border-none"
                                        />
                                        <input
                                            placeholder="Quantity"
                                            type="number"
                                            value={newResource.quantity}
                                            onChange={(e) => setNewResource({ ...newResource, quantity: parseInt(e.target.value) })}
                                            className="p-5 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 ring-amber-100 border-none"
                                        />
                                        <button
                                            onClick={handleAddResource}
                                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-100"
                                        >
                                            <Plus size={18} /> Deploy Resource
                                        </button>
                                    </div>

                                    <div className="divide-y divide-slate-50 pt-4">
                                        {vendorProfile?.resources?.map((res: any, idx: number) => (
                                            <div key={idx} className="py-6 flex items-center justify-between group">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-slate-900">{res.name}</h5>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Available Quantity: {res.quantity}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveResource(idx)} className="p-4 text-rose-300 hover:text-rose-600 transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Tactical Panel */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 text-white space-y-8 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                                        <Settings size={20} />
                                    </div>
                                    <h3 className="text-xl font-black">Vendor Specs</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector</p>
                                        <p className="text-lg font-black text-amber-400 mt-1">{vendorProfile?.serviceType || "Unspecified"}</p>
                                    </div>
                                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Business</p>
                                        <p className="text-lg font-black text-white mt-1">{vendorProfile?.businessName || "Pending Setup"}</p>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 px-2">
                                            <span>Profile Readiness</span>
                                            <span className="text-amber-400">92%</span>
                                        </div>
                                        <div className="h-3 bg-slate-800 rounded-full p-1 overflow-hidden border border-slate-700">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Intel */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <h3 className="text-xl font-black text-slate-900">Summary Intel</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Missions</p>
                                    <p className="text-2xl font-black text-slate-900">{assignments.length}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Open Tasks</p>
                                    <p className="text-2xl font-black text-indigo-600">{allTasks.filter((t: any) => t.status !== 'Completed').length}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Growth</p>
                                    <p className="text-2xl font-black text-emerald-500">+12%</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                                    <p className="text-2xl font-black text-amber-500">98%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
