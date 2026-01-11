"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
    Calendar, Map, MapPin, Users, Ticket, Clock,
    ChevronLeft, Loader2, CheckCircle, Info, CalendarDays,
    Share2, Heart, ShieldCheck, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
    capacity: number;
    registeredUsers: string[];
    waitlist: string[];
    ticketTypes: { name: string; price: number; quantity: number; sold: number }[];
    agenda: { title: string; startTime: string; endTime: string; description: string; speaker: string }[];
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'agenda' | 'tickets'>('info');

    useEffect(() => {
        if (id) fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data.data);
        } catch (err) {
            console.error("Error fetching event:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="font-black uppercase tracking-widest">Securing Intel...</p>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Intel Not Found</h2>
            <p className="text-slate-500 mb-8">This event record may have been reassigned or deleted.</p>
            <button onClick={() => router.back()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Return to Base</button>
        </div>
    );

    const isFull = event.registeredUsers.length >= event.capacity;
    const isRegistered = user && event.registeredUsers.includes(user.id);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="h-[50vh] relative overflow-hidden bg-slate-900 group">
                {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/5 opacity-50">
                        <Calendar size={200} strokeWidth={1} />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute top-10 left-10">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 group/back font-bold border border-white/10"
                    >
                        <ChevronLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" /> Back to Intelligence
                    </button>
                </div>

                <div className="absolute bottom-20 left-10 md:left-20 max-w-4xl space-y-4">
                    <div className="flex gap-4 items-center">
                        <span className="px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/50">
                            {event.category}
                        </span>
                        {isRegistered && (
                            <span className="px-5 py-2 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} /> Registered
                            </span>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left: Event Details */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 flex gap-4">
                                <button className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition hover:bg-rose-50"><Heart size={20} /></button>
                                <button className="p-4 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-2xl transition hover:bg-blue-50"><Share2 size={20} /></button>
                            </div>

                            <nav className="flex p-1 bg-slate-50 rounded-2xl w-fit mb-12">
                                <button onClick={() => setActiveTab('info')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'info' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>OVERVIEW</button>
                                <button onClick={() => setActiveTab('agenda')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'agenda' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>INTINERARY</button>
                                <button onClick={() => setActiveTab('tickets')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'tickets' ? 'bg-white text-amber-500 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>ADMISSION</button>
                            </nav>

                            {activeTab === 'info' && (
                                <div className="space-y-10 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                                                <CalendarDays size={32} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronology</p>
                                                <p className="text-lg font-black text-slate-800">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1"><Clock size={14} /> At {event.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-slate-100">
                                                <MapPin size={32} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geography</p>
                                                <p className="text-lg font-black text-slate-800">{event.location}</p>
                                                <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1">Strategic Venue</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-slate-900 border-l-8 border-l-blue-600 pl-6">Briefing</h3>
                                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'agenda' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                                    {event.agenda && event.agenda.length > 0 ? (
                                        <div className="relative border-l-4 border-slate-100 ml-6 space-y-10 py-6">
                                            {event.agenda.map((item, idx) => (
                                                <div key={idx} className="relative pl-12">
                                                    <div className="absolute top-0 left-[-14px] w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-lg" />
                                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h4 className="text-xl font-black text-slate-900">{item.title}</h4>
                                                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest px-3 py-1 bg-white border border-blue-100 rounded-lg">
                                                                {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <p className="text-slate-600 font-medium mb-6 leading-relaxed">{item.description}</p>
                                                        {item.speaker && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                                                                <p className="text-sm font-black text-slate-700">Lead: {item.speaker}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <Info size={48} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Agenda to be decrypted soon</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'tickets' && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                    <div className="grid grid-cols-1 gap-6">
                                        {event.ticketTypes.map((ticket, idx) => (
                                            <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-600 hover:bg-white transition-all shadow-hover duration-300">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Ticket size={28} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900">{ticket.name} Admission</h4>
                                                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                            {ticket.quantity - ticket.sold} Slots Available
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-slate-900 mb-1">${ticket.price}</p>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tax Included</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Status</h3>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {isFull ? 'At Capacity' : 'Operational'}
                                </span>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Occupancy</span>
                                    <span className="text-lg font-black text-slate-900">{(event.registeredUsers.length / event.capacity * 100).toFixed(0)}% Full</span>
                                </div>
                                <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Secure Slots</span>
                                    <span className="text-lg font-black text-slate-900">{event.capacity - event.registeredUsers.length} Left</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waitlist</span>
                                    <span className="text-lg font-black text-slate-900">{event.waitlist.length} Enlisted</span>
                                </div>
                            </div>

                            {isRegistered ? (
                                <button
                                    onClick={() => router.push('/dashboard/attendee')}
                                    className="w-full py-6 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <CheckCircle size={20} /> Access Admission Pack
                                </button>
                            ) : isFull ? (
                                <button className="w-full py-6 bg-slate-400 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed">
                                    <Users size={20} /> Join Strategic Waitlist
                                </button>
                            ) : (
                                <button className="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 group">
                                    Initiate Reservation <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            )}

                            <p className="mt-6 text-[10px] text-center font-black text-slate-400 uppercase tracking-widest">
                                Instant confirmation via secure token
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
