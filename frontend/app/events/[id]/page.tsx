'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Calendar, MapPin, Clock, Users, ArrowLeft, GitBranch, History } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const data = await fetchAPI(`/api/events/${id}`);
                setEvent(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) loadEvent();
    }, [id]);

    const createBranch = async () => {
        if (!confirm('Create an alternative plan (Branch) from this event?')) return;

        try {
            const payload = {
                title: `${event.title} (Alternative)`,
                templateId: event._id,
                // Inherit other fields automatically via backend logic or pre-fill here if needed
            };

            const res = await fetchAPI('/api/events', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            router.push(`/events/${res.data._id}`);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading event details...</div>;
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
    if (!event) return <div className="p-10">Event not found</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Link href="/events" className="inline-flex items-center gap-2 text-gray-500 mb-6 hover:text-blue-600">
                <ArrowLeft size={20} /> Back to Events
            </Link>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="bg-blue-600 p-8 text-white relative">
                    {event.isTemplate && (
                        <span className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                            Template
                        </span>
                    )}
                    {event.parentEvent && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <GitBranch size={14} /> Alternative Plan
                        </div>
                    )}

                    <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                    <div className="flex flex-wrap gap-6 text-blue-100">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} />
                            {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            Capacity: {event.capacity}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Description</h2>
                        <p className="text-gray-600 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Backup Plans</h2>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-gray-700">
                            {event.backupPlans || 'No backup plans specified.'}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Agenda</h2>
                        <div className="space-y-4">
                            {event.agenda.length === 0 ? (
                                <p className="text-gray-400 italic">No agenda items.</p>
                            ) : (
                                event.agenda.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition">
                                        <div className="w-32 flex-shrink-0 text-center border-r pr-4">
                                            <div className="text-sm font-bold text-blue-600">{item.startTime}</div>
                                            <div className="text-xs text-gray-400">to</div>
                                            <div className="text-sm font-bold text-gray-500">{item.endTime}</div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <p className="text-sm text-blue-600 mb-1">{item.speaker}</p>
                                            <p className="text-gray-600 text-sm">{item.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Lineage / History */}
                    {event.lineage && event.lineage.length > 0 && (
                        <div className="border-t pt-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                                <History size={20} /> Version History
                            </h2>
                            <div className="space-y-3">
                                {event.lineage.map((log: any, idx: number) => (
                                    <div key={idx} className="text-sm text-gray-500 flex gap-2">
                                        <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                        <span>Updated by System</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-6 border-t flex justify-end gap-4">
                    {!event.parentEvent && (
                        <button
                            onClick={createBranch}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                            <GitBranch size={18} />
                            Create Alternative (Branch)
                        </button>
                    )}
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        Register for Event
                    </button>
                </div>
            </div>
        </div>
    );
}
