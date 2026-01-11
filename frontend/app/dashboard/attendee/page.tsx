"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Calendar, MapPin, Clock, Bell, Star, MessageSquare, CheckCircle, ExternalLink, Loader2, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DashboardHeader from "@/app/components/DashboardHeader";

interface TicketData {
    _id: string;
    event: {
        _id: string;
        title: string;
        date: string;
        location: string;
        image?: string;
    };
    ticketType: {
        name: string;
        price: number;
    };
    qrCode: string;
    paymentStatus: string;
    checkedIn: boolean;
}

interface NotificationData {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export default function AttendeeDashboard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'notifications'>('upcoming');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketsRes, notificationsRes] = await Promise.all([
                    api.get("/tickets/me"),
                    api.get("/notifications")
                ]);
                setTickets(ticketsRes.data.data);
                setNotifications(notificationsRes.data.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const upcomingTickets = tickets.filter(t => new Date(t.event.date) >= new Date());
    const pastTickets = tickets.filter(t => new Date(t.event.date) < new Date());

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                <DashboardHeader
                    title={`Welcome back, ${user?.name}!`}
                    subtitle="Manage your event registrations and stay updated."
                />

                {/* Profile Summary & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 shadow-lg mb-4">
                            {user?.picture ? (
                                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-slate-900">{user?.name}</h3>
                        <p className="text-sm text-slate-500 font-medium truncate w-full mb-6">{user?.email}</p>

                        <div className="w-full space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Role</span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">{user?.role}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</span>
                                <span className="text-xs font-bold text-slate-700">{user?.location || "Not set"}</span>
                            </div>
                        </div>

                        <Link href="/dashboard/profile" className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                            View Profile
                        </Link>
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-l-8 border-l-blue-600">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Tickets</p>
                            <h4 className="text-4xl font-black text-slate-900">{upcomingTickets.length}</h4>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-l-8 border-l-emerald-500">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Passed Events</p>
                            <h4 className="text-4xl font-black text-slate-900">{pastTickets.length}</h4>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-l-8 border-l-amber-500">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Notifications</p>
                            <h4 className="text-4xl font-black text-slate-900">{notifications.filter(n => !n.read).length}</h4>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit">
                            <button onClick={() => setActiveTab('upcoming')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>UPCOMING</button>
                            <button onClick={() => setActiveTab('past')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'past' ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>PAST</button>
                            <button onClick={() => setActiveTab('notifications')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'notifications' ? 'bg-white text-amber-500 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>ALERTS</button>
                        </div>
                    </div>

                    {(activeTab === 'upcoming' || activeTab === 'past') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {(activeTab === 'upcoming' ? upcomingTickets : pastTickets).map((ticket) => (
                                <div key={ticket._id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-2xl transition-all duration-500 group border-b-8 border-b-blue-600">
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                    {ticket.ticketType.name}
                                                </div>
                                                {ticket.checkedIn && (
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                                        <CheckCircle size={14} /> Verified Entry
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">{ticket.event.title}</h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Date</p>
                                                        <p className="text-sm font-bold text-slate-700">{new Date(ticket.event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                                        <p className="text-sm font-bold text-slate-700">{ticket.event.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <Link href={`/events/${ticket.event._id}`} className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                                Event Intel <ExternalLink size={14} />
                                            </Link>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID</p>
                                                <p className="text-xs font-mono font-bold text-slate-500">#{ticket._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === 'upcoming' && (
                                        <div className="bg-slate-900 p-10 flex flex-col items-center justify-center sm:w-64 text-white relative">
                                            <div className="bg-white p-4 rounded-3xl mb-4 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                {ticket.qrCode ? (
                                                    <img src={ticket.qrCode} alt="QR" className="w-32 h-32" />
                                                ) : (
                                                    <div className="w-32 h-32 flex items-center justify-center bg-slate-50 text-slate-200">
                                                        <Ticket size={40} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan to Enter</p>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {(activeTab === 'upcoming' ? upcomingTickets : pastTickets).length === 0 && (
                                <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                                        <Calendar size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">No events found</h3>
                                    <p className="text-slate-500 mt-2 max-w-sm font-medium">You don't have any {activeTab} registrations at the moment.</p>
                                    <Link href="/dashboard/events" className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                                        Explore Events
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-3xl space-y-4">
                            {notifications.length > 0 ? notifications.map((notif) => (
                                <div key={notif._id} onClick={() => !notif.read && markAsRead(notif._id)} className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex gap-6 ${!notif.read ? 'bg-white border-blue-100 shadow-xl shadow-blue-50' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                    <div className={`mt-2 w-3 h-3 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-black text-slate-900 leading-tight">{notif.title}</h4>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                                    <Bell size={48} className="text-slate-200 mb-6" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest">No alerts at this time</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
