"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Calendar, MapPin, Clock, Bell, Star, MessageSquare, CheckCircle, ExternalLink, Loader2, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    const [activeTab, setActiveTab] = useState<'tickets' | 'notifications' | 'feedback'>('tickets');

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

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-outfit">Welcome back, {user?.name}!</h1>
                        <p className="text-slate-500">Manage your event registrations and stay updated.</p>
                    </div>
                    <Link
                        href="/dashboard/attendee/profile"
                        className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition shadow-sm group"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                            {user?.picture ? (
                                <img src={user.picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                        <div className="pr-2">
                            <p className="text-sm font-bold text-slate-800">My Profile</p>
                            <p className="text-xs text-slate-500">Edit account settings</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
                    </Link>
                </header>

                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        My Tickets ({tickets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Notifications ({notifications.filter(n => !n.read).length})
                    </button>
                </div>

                {activeTab === 'tickets' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-relaxed">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition group">
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${ticket.checkedIn ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {ticket.checkedIn ? 'Checked In' : ticket.ticketType.name}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-900 mt-2 line-clamp-1">{ticket.event.title}</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-sm font-medium">{new Date(ticket.event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-sm font-medium">{ticket.event.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <Link
                                            href={`/events/${ticket.event._id}`}
                                            className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                        >
                                            Event Details <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ticket ID</p>
                                            <p className="text-xs font-mono text-slate-600">#{ticket._id.slice(-8)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-8 flex flex-col items-center justify-center sm:w-56 text-white relative border-l border-dashed border-slate-700/50">
                                    <div className="w-8 h-8 bg-slate-50 rounded-full absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:block shadow-inner" />

                                    <div className="bg-white p-3 rounded-xl mb-4 group-hover:scale-105 transition duration-300">
                                        {ticket.qrCode && (
                                            <img
                                                src={ticket.qrCode}
                                                alt="Ticket QR Code"
                                                className="w-32 h-32"
                                            />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Entry Pass</p>
                                    {ticket.checkedIn && (
                                        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm">
                                            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                                            <span className="text-sm font-bold text-green-500 uppercase tracking-widest">Verified</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {tickets.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Ticket className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Tickets Yet</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Discover amazing events and book your spot to see tickets here.</p>
                                <Link
                                    href="/events"
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition inline-block"
                                >
                                    Explore Events
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {notifications.length > 0 ? notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`p-6 hover:bg-slate-50 transition cursor-default flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => !notif.read && markAsRead(notif._id)}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center">
                                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">No notifications yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
