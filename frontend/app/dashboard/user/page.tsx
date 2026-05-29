"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Calendar, MapPin, CheckCircle, ExternalLink, Loader2, User, Download } from "lucide-react";
import Link from "next/link";
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
    paymentProvider?: string;
    checkedIn: boolean;
}

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<TicketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Get confirmation status badge styling based on payment method and status
    const getConfirmationStatus = (ticket: TicketData) => {
        const isOnlinePayment = ['esewa', 'stripe', 'paypal'].includes(ticket.paymentProvider || '');
        
        if (isOnlinePayment) {
            // Online payments: confirmed when payment is completed
            if (ticket.paymentStatus === 'completed') {
                return {
                    text: 'Confirmed',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-700',
                    borderColor: 'border-emerald-200'
                };
            } else if (ticket.paymentStatus === 'failed') {
                return {
                    text: 'Payment Failed',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-700',
                    borderColor: 'border-red-200'
                };
            } else {
                return {
                    text: 'Awaiting Payment',
                    bgColor: 'bg-amber-50',
                    textColor: 'text-amber-700',
                    borderColor: 'border-amber-200'
                };
            }
        } else {
            // Cash payments: pending until organizer marks as completed
            if (ticket.paymentStatus === 'completed') {
                return {
                    text: 'Confirmed',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-700',
                    borderColor: 'border-emerald-200'
                };
            } else {
                return {
                    text: 'Pending Confirmation',
                    bgColor: 'bg-slate-50',
                    textColor: 'text-slate-700',
                    borderColor: 'border-slate-200'
                };
            }
        }
    };

    // SECURITY: Check role and redirect if not authorized
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== "User") {
                console.warn(`Access denied: User has role "${user.role}" but tried to access User dashboard`);
                // Redirect to appropriate dashboard based on role
                if (user.role === "Organizer") {
                    router.push("/dashboard/organizer");
                } else if (user.role === "Admin") {
                    router.push("/dashboard/admin");
                } else {
                    router.push("/dashboard");
                }
                return;
            }
        }
    }, [user, authLoading, router]);

    // Fetch user's tickets
    useEffect(() => {
        const fetchData = async () => {
            try {
                const ticketsRes = await api.get("/tickets/me");
                setTickets(ticketsRes.data.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // If not authorized, show nothing while redirecting
    if (authLoading || (user && user.role !== "User")) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const downloadTicket = async (ticket: TicketData) => {
        try {
            setDownloadingId(ticket._id);
            // Create a canvas to generate PDF-like ticket
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Background
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // White border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
                
                // Title
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 32px Arial';
                ctx.fillText('Event Ticket', 40, 60);
                
                // Event name
                ctx.font = 'bold 24px Arial';
                ctx.fillText(ticket.event.title, 40, 120);
                
                // Details
                ctx.font = '16px Arial';
                ctx.fillStyle = '#e2e8f0';
                ctx.fillText(`Ticket Type: ${ticket.ticketType.name}`, 40, 180);
                ctx.fillText(`Date: ${new Date(ticket.event.date).toLocaleDateString()}`, 40, 220);
                ctx.fillText(`Location: ${ticket.event.location}`, 40, 260);
                ctx.fillText(`Price: NPR ${ticket.ticketType.price}`, 40, 300);
                ctx.fillText(`Ticket ID: ${ticket._id.slice(-8)}`, 40, 340);
                
                // QR Code placeholder
                ctx.fillStyle = '#ffffff';
                ctx.fillText('QR Code:', 40, 420);
                if (ticket.qrCode) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 550, 380, 200, 200);
                        downloadCanvas(canvas, ticket.event.title);
                    };
                    img.src = ticket.qrCode;
                } else {
                    downloadCanvas(canvas, ticket.event.title);
                }
            }
        } catch (err) {
            console.error("Error downloading ticket:", err);
            alert("Failed to download ticket");
            setDownloadingId(null);
        }
    };

    const downloadCanvas = (canvas: HTMLCanvasElement, eventTitle: string) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${eventTitle.replace(/\s+/g, '_')}_ticket.png`;
        link.click();
        setDownloadingId(null);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <DashboardHeader
                        title={`Welcome back, ${user?.name}!`}
                        subtitle="View and manage all your purchased tickets here."
                    />
                    <Link href="/dashboard/events" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                        <MapPin size={20} /> Browse Events
                    </Link>
                </div>

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

                        <Link href="/dashboard/user/profile" className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                            View Profile
                        </Link>
                    </div>

                    <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 border-l-8 border-l-blue-600">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Tickets</p>
                        <h4 className="text-5xl font-black text-slate-900 mb-4">{tickets.length}</h4>
                        <p className="text-slate-500 font-medium">All your purchased event tickets are displayed below. Download any ticket to view or share it.</p>
                    </div>
                </div>

                {/* My Tickets Section */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">My Tickets</h2>
                        <p className="text-slate-500 font-medium">View all your purchased tickets and download them as needed.</p>
                    </div>

                    {tickets.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {tickets.map((ticket) => {
                                const isUpcoming = new Date(ticket.event.date) >= new Date();
                                return (
                                    <div key={ticket._id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-2xl transition-all duration-500 group border-b-8 border-b-blue-600">
                                        <div className="p-8 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
                                                    <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                        {ticket.ticketType.name}
                                                    </div>
                                                    {/* Confirmation Status Badge */}
                                                    {(() => {
                                                        const status = getConfirmationStatus(ticket);
                                                        return (
                                                            <div className={`px-4 py-1.5 ${status.bgColor} ${status.textColor} rounded-full text-[10px] font-black uppercase tracking-widest border ${status.borderColor}`}>
                                                                {status.text}
                                                            </div>
                                                        );
                                                    })()}
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
                                                    Event Details <ExternalLink size={14} />
                                                </Link>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID</p>
                                                    <p className="text-xs font-mono font-bold text-slate-500">#{ticket._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900 p-8 flex flex-col items-center justify-between sm:w-64 text-white">
                                            <div className="bg-white p-4 rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500 relative">
                                                {ticket.qrCode ? (
                                                    <>
                                                        <img src={ticket.qrCode} alt="QR" className={`w-40 h-40 transition-all ${ticket.checkedIn ? 'opacity-20 grayscale scale-95' : ''}`} />
                                                        {ticket.checkedIn && (
                                                            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                                                                <CheckCircle className="text-emerald-500 w-20 h-20 drop-shadow-lg" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="w-40 h-40 flex items-center justify-center bg-slate-50 text-slate-200 rounded-2xl">
                                                        <Ticket size={50} />
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-4 ${ticket.checkedIn ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {ticket.checkedIn ? 'Entry Verified' : 'Scan to Enter'}
                                            </p>
                                            <button
                                                onClick={() => downloadTicket(ticket)}
                                                disabled={downloadingId === ticket._id}
                                                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                                            >
                                                {downloadingId === ticket._id ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" /> Downloading
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download size={16} /> Download
                                                    </>
                                                )}
                                            </button>
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
                            <h3 className="text-2xl font-black text-slate-900">No tickets yet</h3>
                            <p className="text-slate-500 mt-2 max-w-sm font-medium">You haven't purchased any tickets yet. Browse events and get your tickets now!</p>
                            <Link href="/dashboard/events" className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                                Explore Events
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
