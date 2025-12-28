'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { Plus, Calendar, MapPin } from 'lucide-react';

interface Event {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    isTemplate: boolean;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchAPI('/api/events');
                setEvents(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading events...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Events</h1>
                <Link
                    href="/events/create"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Create Event
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Link href={`/events/${event._id}`} key={event._id} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition relative overflow-hidden">
                            {event.isTemplate && (
                                <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-bl-lg font-medium">
                                    Template
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">{event.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                            <div className="flex flex-col gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {events.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed">
                        <p className="text-gray-500 mb-4">No events found.</p>
                        <Link
                            href="/events/create"
                            className="text-blue-600 hover:underline"
                        >
                            Create your first event
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
