"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Calendar, MapPin, Users, Ticket, Clock,
    ChevronLeft, Loader2, CheckCircle, Info,
    Layers, Plus, Trash2, ArrowRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "Technology",
        capacity: 100,
        ticketTypes: [
            { name: "General", price: 0, quantity: 100 }
        ]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTicketChange = (index: number, field: string, value: string | number) => {
        const updatedTickets = [...formData.ticketTypes];
        (updatedTickets[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, ticketTypes: updatedTickets }));
    };

    const addTicketType = () => {
        setFormData(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }]
        }));
    };

    const removeTicketType = (index: number) => {
        if (formData.ticketTypes.length > 1) {
            const updatedTickets = formData.ticketTypes.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, ticketTypes: updatedTickets }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/events", formData);
            alert("Event Strategic Initiative successfully launched!");
            router.push(`/dashboard/organizer`);
        } catch (err: any) {
            alert(err.response?.data?.error || "Strategic launch failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/organizer" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black uppercase tracking-widest text-[10px] transition-all group">
                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronLeft size={16} />
                        </div>
                        Back to Command
                    </Link>
                    <div className="flex gap-4">
                        <span className="px-5 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                            New Operation
                        </span>
                    </div>
                </div>

                <DashboardHeader
                    title="Initialize Event"
                    subtitle="Deploy a new strategic event initiative to the platform."
                />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Base Intel */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Layers size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Base Intelligence</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Title</label>
                                    <input
                                        type="text" name="title" required
                                        value={formData.title} onChange={handleInputChange}
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                        placeholder="e.g. Global Tech Summit 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description & Objective</label>
                                    <textarea
                                        name="description" required rows={5}
                                        value={formData.description} onChange={handleInputChange}
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                        placeholder="Outline the core goals and vision for this event..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="date" name="date" required
                                                value={formData.date} onChange={handleInputChange}
                                                className="w-full pl-14 p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activation Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="time" name="time" required
                                                value={formData.time} onChange={handleInputChange}
                                                className="w-full pl-14 p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" name="location" required
                                            value={formData.location} onChange={handleInputChange}
                                            className="w-full pl-14 p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                            placeholder="Physical Venue or Virtual HQ..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector / Category</label>
                                    <select
                                        name="category" value={formData.category} onChange={handleInputChange} required
                                        className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                                    >
                                        {['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Logistics */}
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <Ticket size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900">Admission Configuration</h3>
                                </div>
                                <button type="button" onClick={addTicketType} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all">
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.ticketTypes.map((ticket, index) => (
                                    <div key={index} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 relative group">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tier Name</label>
                                            <input
                                                type="text" required
                                                value={ticket.name} onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                                                className="w-full p-4 bg-white border border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                                placeholder="e.g. VIP Access"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Strategic Price</label>
                                            <input
                                                type="number" required min="0"
                                                value={ticket.price} onChange={(e) => handleTicketChange(index, "price", parseInt(e.target.value))}
                                                className="w-full p-4 bg-white border border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Slot Quantity</label>
                                            <input
                                                type="number" required min="1"
                                                value={ticket.quantity} onChange={(e) => handleTicketChange(index, "quantity", parseInt(e.target.value))}
                                                className="w-full p-4 bg-white border border-slate-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                            />
                                        </div>
                                        {formData.ticketTypes.length > 1 && (
                                            <button
                                                type="button" onClick={() => removeTicketType(index)}
                                                className="absolute -top-3 -right-3 p-2 bg-rose-100 text-rose-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Meta & Deploy */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Operative Capacity</label>
                                    <div className="relative">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="number" name="capacity" required min="1"
                                            value={formData.capacity} onChange={handleInputChange}
                                            className="w-full pl-14 p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                                <div className="flex items-center gap-3 text-blue-600">
                                    <Info size={20} />
                                    <p className="text-xs font-black uppercase tracking-widest">Deployment Brief</p>
                                </div>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                    Initializing this event will make it visible to all prospective attendees. Ensure all logistics are verified.
                                </p>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <>Activate Initiative <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
