"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Search, Calendar, MapPin, Users, ArrowRight, Loader2, SlidersHorizontal, Ticket } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/app/components/DashboardHeader";

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    image: string;
    capacity: number;
    registeredUsers: string[];
    ticketTypes: { name: string; price: number; quantity: number; sold: number }[];
}

export default function EventsBrowsePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const categories = ["All", "Technology", "Business", "Education", "Entertainment", "Sports", "Other"];

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async (search = "", category = "All", date = "") => {
        setLoading(true);
        try {
            let url = "/events?status=upcoming";
            if (search) url += `&search=${search}`;
            if (category !== "All") url += `&category=${category}`;
            if (date) url += `&date=${date}`;

            const res = await api.get(url);
            setEvents(res.data.data);
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEvents(searchTerm, categoryFilter);
    };

    const getAvailableSeats = (event: Event) => {
        return event.capacity - event.registeredUsers.length;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                <DashboardHeader
                    title="Browse Events"
                    subtitle="Discover upcoming experiences and reserve your spot today."
                />

                {/* Search and Filters */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                    <form onSubmit={handleSearch} className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by event name..."
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-initial">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="date"
                                className="pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-400 focus:text-slate-700 text-xs uppercase tracking-widest"
                                onChange={(e) => fetchEvents(searchTerm, categoryFilter, e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setCategoryFilter(cat);
                                        fetchEvents(searchTerm, cat);
                                    }}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Event Grid */}
                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <p className="font-bold uppercase tracking-widest">Loading Events...</p>
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => {
                            const available = getAvailableSeats(event);
                            return (
                                <div key={event._id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group border-b-8 border-b-blue-600">
                                    <div className="h-56 relative overflow-hidden bg-slate-200">
                                        {event.image ? (
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Calendar size={60} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-xl">
                                            {event.category}
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                {event.title}
                                            </h3>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <Calendar size={18} className="text-blue-500" />
                                                    <span className="text-sm font-bold">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <MapPin size={18} className="text-rose-500" />
                                                    <span className="text-sm font-bold truncate">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Users size={18} className="text-emerald-500" />
                                                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${available < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${(event.registeredUsers.length / event.capacity) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[60px]">
                                                        {available} Seats Left
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting From</p>
                                                <p className="text-xl font-black text-slate-900">NPR {event.ticketTypes[0]?.price || 0}</p>
                                            </div>
                                            <Link
                                                href={`/events/${event._id}`}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all hover:translate-x-1 flex items-center gap-2"
                                            >
                                                Details <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                            <Ticket size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">No events match your criteria</h3>
                        <p className="text-slate-500 mt-2 max-w-sm font-medium">Try adjusting your search terms or filters to discover other amazing experiences.</p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("All");
                                fetchEvents("", "All");
                            }}
                            className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
