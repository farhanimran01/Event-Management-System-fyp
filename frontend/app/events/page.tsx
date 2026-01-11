'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Calendar, MapPin, Search, Filter, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Event {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    category: string;
    image?: string;
    ticketTypes: Array<{ name: string; price: number }>;
}

const CATEGORIES = ['All', 'Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'];

export default function ExploreEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data.data);
                setFilteredEvents(res.data.data);
            } catch (err) {
                console.error("Failed to load events", err);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    useEffect(() => {
        let result = events;

        if (selectedCategory !== 'All') {
            result = result.filter(e => e.category === selectedCategory);
        }

        if (searchQuery) {
            result = result.filter(e =>
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredEvents(result);
    }, [searchQuery, selectedCategory, events]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Explore Events</h1>
                            <p className="text-slate-500 mt-2 text-lg font-medium">Find and book the best events in your area.</p>
                        </div>
                        {user?.role === 'Organizer' && (
                            <Link
                                href="/events/create"
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                            >
                                <Plus size={20} strokeWidth={3} />
                                Host Event
                            </Link>
                        )}
                    </div>
                </header>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search events, venues, or keywords..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => (
                        <Link href={`/events/${event._id}`} key={event._id} className="group h-full flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition duration-500">
                            {/* Event Image Placeholder */}
                            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Calendar className="w-12 h-12 opacity-50 transition duration-500 group-hover:scale-110" />
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition">
                                    {event.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {event.description}
                                </p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-bold">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-bold truncate">{event.location}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Starting From</p>
                                        <p className="text-lg font-black text-slate-900">
                                            ${event.ticketTypes?.[0]?.price || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition duration-500 shadow-sm">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredEvents.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-8">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">No events match your search</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="mt-8 text-blue-600 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
