'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Plus, Trash, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AgendaItem {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    speaker: string;
}

interface EventData {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    capacity: number;
    category: string;
    status: string;
    backupPlans: string;
    isTemplate: boolean;
    agenda: AgendaItem[];
    parentEvent?: string; // For branching
    templateId?: string; // For creating from template
}

const CATEGORIES = ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Other'];

export default function EventForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const [formData, setFormData] = useState<EventData>({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        capacity: 100,
        category: 'Other',
        status: 'upcoming',
        backupPlans: '',
        isTemplate: false,
        agenda: [],
        ...initialData
    });

    // Fetch templates when mounting (only for creation mode)
    useEffect(() => {
        if (!initialData) {
            const fetchTemplates = async () => {
                try {
                    const res = await fetchAPI('/api/events');
                    // Filter only templates
                    const templateList = res.data.filter((e: any) => e.isTemplate);
                    setTemplates(templateList);
                } catch (error) {
                    console.error('Error fetching templates:', error);
                }
            };
            fetchTemplates();
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // Agenda Management
    const addAgendaItem = () => {
        setFormData(prev => ({
            ...prev,
            agenda: [...prev.agenda, { title: '', startTime: '', endTime: '', description: '', speaker: '' }]
        }));
    };

    const removeAgendaItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            agenda: prev.agenda.filter((_, i) => i !== index)
        }));
    };

    const handleAgendaChange = (index: number, field: keyof AgendaItem, value: string) => {
        const newAgenda = [...formData.agenda];
        newAgenda[index] = { ...newAgenda[index], [field]: value };
        setFormData(prev => ({ ...prev, agenda: newAgenda }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...formData };
            if (selectedTemplate) {
                payload.templateId = selectedTemplate;
            }

            const url = initialData ? `/api/events/${initialData._id}` : '/api/events';
            const method = initialData ? 'PUT' : 'POST';

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload),
            });

            router.push('/events');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold">{initialData ? 'Edit Event' : 'Create New Event'}</h2>
                <Link href="/events" className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
                    <ArrowLeft size={18} /> Cancel
                </Link>
            </div>

            {/* Template Selection (Only Create Mode) */}
            {!initialData && templates.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-sm font-medium text-blue-800 mb-2">Start from a Template (Optional)</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                    >
                        <option value="">-- Select a Template --</option>
                        {templates.map(t => (
                            <option key={t._id} value={t._id}>{t.title} (Template)</option>
                        ))}
                    </select>
                    <p className="text-xs text-blue-600 mt-1">Selecting a template will pre-fill details and link this event as a branch.</p>
                </div>
            )}

            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Event Title</label>
                    <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input required type="date" name="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <input required type="text" name="time" value={formData.time} onChange={handleChange} className="w-full p-2 border rounded" placeholder="e.g. 10:00 AM" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Organizer</label>
                    <input required name="organizer" value={formData.organizer} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Capacity</label>
                    <input required type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded" />
                </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Advanced Planning</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">Backup Plans / Contingencies</label>
                    <textarea
                        name="backupPlans"
                        value={formData.backupPlans}
                        onChange={handleChange}
                        placeholder="What happens if it rains? Or speaker cancels?"
                        rows={2}
                        className="w-full p-2 border rounded bg-yellow-50 border-yellow-200"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isTemplate"
                        name="isTemplate"
                        checked={formData.isTemplate}
                        // @ts-ignore
                        onChange={handleChange}
                        className="w-4 h-4"
                    />
                    <label htmlFor="isTemplate" className="text-sm font-medium text-gray-700">Save this event as a Template</label>
                </div>
            </div>

            {/* Agenda Builder */}
            <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Agenda / Schedule</h3>
                    <button type="button" onClick={addAgendaItem} className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">
                        <Plus size={16} /> Add Session
                    </button>
                </div>

                {formData.agenda.length === 0 && <p className="text-gray-400 text-sm italic">No agenda items yet.</p>}

                <div className="space-y-4">
                    {formData.agenda.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 border rounded-lg relative group">
                            <button
                                type="button"
                                onClick={() => removeAgendaItem(index)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash size={18} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <div className="md:col-span-4">
                                    <input placeholder="Session Title" value={item.title} onChange={(e) => handleAgendaChange(index, 'title', e.target.value)} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <input type="time" value={item.startTime} onChange={(e) => handleAgendaChange(index, 'startTime', e.target.value)} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <input type="time" value={item.endTime} onChange={(e) => handleAgendaChange(index, 'endTime', e.target.value)} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="md:col-span-4">
                                    <input placeholder="Speaker" value={item.speaker} onChange={(e) => handleAgendaChange(index, 'speaker', e.target.value)} className="w-full p-1 border rounded text-sm" />
                                </div>
                                <div className="md:col-span-12">
                                    <input placeholder="Description" value={item.description} onChange={(e) => handleAgendaChange(index, 'description', e.target.value)} className="w-full p-1 border rounded text-sm" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Event'}
                </button>
            </div>
        </form>
    );
}
