"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from '@/lib/api';
import { useAuth } from "@/context/AuthContext";
import { Calendar, MapPin, Clock, Users, ArrowLeft, GitBranch, History, Ticket as TicketIcon, Star, CheckCircle2, ShieldCheck, Info, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticketType, setTicketType] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [eventFeedback, setEventFeedback] = useState<any[]>([]);

    useEffect(() => {
        const loadEventData = async () => {
            try {
                const [eventRes, feedbackRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/feedback/event/${id}`)
                ]);
                setEvent(eventRes.data.data);
                setEventFeedback(feedbackRes.data.data);

                if (eventRes.data.data.ticketTypes?.length > 0) {
                    setTicketType(eventRes.data.data.ticketTypes[0].name);
                }
            } catch (err: any) {
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadEventData();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            router.push(`/login?redirect=/events/${id}`);
            return;
        }

        setBookingLoading(true);
        try {
            const res = await api.post("/tickets", {
                eventId: id,
                ticketTypeName: ticketType
            });
            alert(res.data.message || "Action successful!");
            router.push("/dashboard/attendee");
        } catch (err: any) {
            alert(err.response?.data?.error || "Booking failed");
        } finally {
            setBookingLoading(false);
        }
    };

    const submitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackLoading(true);
        try {
            await api.post("/feedback", {
                eventId: id,
                rating: feedback.rating,
                comment: feedback.comment
            });
            alert("Feedback submitted! Thank you.");
            // Refresh feedback list
            const res = await api.get(`/feedback/event/${id}`);
            setEventFeedback(res.data.data);
            setFeedback({ rating: 5, comment: "" });
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to submit feedback");
        } finally {
            setFeedbackLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
    if (error) return <div className="p-10 text-red-500 max-w-xl mx-auto text-center bg-white rounded-3xl mt-12 shadow-sm border border-red-100">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-500">{error}</p>
    </div>;
    if (!event) return <div className="p-10 text-center">Event not found</div>;

    const isOrganizer = user?.role === 'Organizer' || user?.role === 'Admin';
    const isFull = event.registeredUsers?.length >= event.capacity;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header / Hero */}
            <div className="relative h-[450px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    {/* Mock Image Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center" />
                </div>

                <div className="relative z-20 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-12">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-8 left-6 flex items-center gap-2 text-white/80 hover:text-white transition bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/20"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30">
                            {event.category || 'General'}
                        </span>
                        {isFull && (
                            <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-amber-500/30">
                                <Info size={12} /> Waitlist Open
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                        {event.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-white/90 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <Calendar size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest">Date</p>
                                <p className="text-sm">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <MapPin size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest">Location</p>
                                <p className="text-sm truncate max-w-[200px]">{event.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <Users size={18} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-white/50 font-bold tracking-widest">Attendance</p>
                                <p className="text-sm">{event.registeredUsers?.length || 0} / {event.capacity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-30 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <Info className="text-blue-600" /> About the Event
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>

                        {/* Organizer Section */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">
                                    {event.organizer?.name?.[0] || 'O'}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Organized By</p>
                                    <h4 className="text-lg font-bold text-slate-900">{event.organizer?.name || 'Organizer'}</h4>
                                    <p className="text-sm text-slate-500">Verified Organizer <ShieldCheck size={14} className="inline text-blue-500 ml-1" /></p>
                                </div>
                            </div>
                            <button className="px-6 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                                Contact
                            </button>
                        </div>

                        {/* Feedback Section */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <Star className="text-yellow-500 fill-yellow-500" /> Attendee Feedback
                            </h2>

                            {user && !isOrganizer && (
                                <form onSubmit={submitFeedback} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 transition focus-within:ring-2 focus-within:ring-blue-500/20">
                                    <p className="text-sm font-bold text-slate-900 mb-4">Leave a rating</p>
                                    <div className="flex gap-2 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFeedback({ ...feedback, rating: s })}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${feedback.rating >= s ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : 'bg-white text-slate-300'}`}
                                            >
                                                <Star className={feedback.rating >= s ? 'fill-white' : ''} size={20} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-0 focus:border-blue-500 transition outline-none min-h-[100px]"
                                        placeholder="Tell us what you think about this event..."
                                        value={feedback.comment}
                                        onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                                        required
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={feedbackLoading}
                                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Comment'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-6">
                                {eventFeedback.length > 0 ? eventFeedback.map((f, i) => (
                                    <div key={i} className="flex gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-2xl transition">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {f.user?.name?.[0] || 'A'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="font-bold text-slate-900">{f.user?.name || 'Anonymous User'}</h5>
                                                <div className="flex gap-0.5 text-yellow-400">
                                                    {[...Array(f.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">{f.comment}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p>No feedback yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Registration</h3>
                                <p className="text-sm text-slate-500 font-medium">Secure your spot at this event today.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Access Level</label>
                                <div className="grid gap-3">
                                    {event.ticketTypes?.map((t: any) => (
                                        <button
                                            key={t.name}
                                            onClick={() => setTicketType(t.name)}
                                            className={`flex justify-between items-center p-4 rounded-2xl border-2 transition ${ticketType === t.name ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                                        >
                                            <div className="text-left">
                                                <p className={`font-bold ${ticketType === t.name ? 'text-blue-900' : 'text-slate-900'}`}>{t.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{t.quantity - t.sold} spots remaining</p>
                                            </div>
                                            <p className={`text-xl font-black ${ticketType === t.name ? 'text-blue-600' : 'text-slate-900'}`}>${t.price}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={bookingLoading}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 shadow-lg ${isFull ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white disabled:opacity-50`}
                            >
                                {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                                    <>
                                        <TicketIcon className="w-6 h-6" />
                                        {isFull ? "Join the Waitlist" : "Reserve Ticket"}
                                    </>
                                )}
                            </button>

                            <div className="flex flex-col gap-4 text-xs font-medium text-slate-500 bg-slate-50 p-6 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    <span>Instant confirmation via email</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    <span>Digital QR Code for faster entry</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                    <span>Cancel anytime before 24 hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
