"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Calendar, MapPin, DollarSign, Users, Type, Upload, X } from "lucide-react";
import { ImageUploadDragDrop } from "@/components/ImageUploadDragDrop";

export default function CreateEventPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "Other",
        capacity: 100,
        ticketName: "General Admission",
        ticketPrice: 0,
        ticketQuantity: 100,
    });

    const handleImageSelected = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];
            setImageFile(file);
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Create FormData to handle both JSON and file
            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('date', formData.date);
            formDataObj.append('time', formData.time);
            formDataObj.append('location', formData.location);
            formDataObj.append('category', formData.category);
            formDataObj.append('capacity', String(formData.capacity));
            formDataObj.append('ticketTypes', JSON.stringify([{
                name: formData.ticketName,
                price: Number(formData.ticketPrice),
                quantity: Number(formData.ticketQuantity)
            }]));
            formDataObj.append('budget', JSON.stringify({
                total: 0,
                expenses: []
            }));

            // Add image if selected
            if (imageFile) {
                formDataObj.append('image', imageFile);
            }

            const res = await api.post("/events", formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push(`/dashboard/organizer`); // Or to event detail page
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.role !== 'Organizer' && user.role !== 'Admin')) {
        return <div className="p-8 text-center text-red-600">You are not authorized to view this page.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center p-8">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                    <h1 className="text-2xl font-bold text-white">Create New Event</h1>
                    <p className="text-purple-100">Plan your next big experience</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Event Image Upload */}
                    <div className="border-t border-gray-100 my-6"></div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Event Image</h3>
                    
                    {!imagePreview ? (
                        <ImageUploadDragDrop 
                            onImagesSelected={handleImageSelected}
                            maxImages={1}
                            maxSizePerImage={5}
                        />
                    ) : (
                        <div className="relative inline-block">
                            <img 
                                src={imagePreview} 
                                alt="Event preview" 
                                className="w-full h-64 object-cover rounded-lg border-2 border-purple-300"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="border-t border-gray-100 my-6"></div>

                    {/* Capacity & Tickets */}
                    <h3 className="text-lg font-bold text-gray-800">Capacity & Ticketing</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Capacity</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                <option>Technology</option>
                                <option>Business</option>
                                <option>Education</option>
                                <option>Entertainment</option>
                                <option>Sports</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700 mb-4">Initial Ticket Type</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Ticket Name</label>
                                <input
                                    type="text"
                                    name="ticketName"
                                    value={formData.ticketName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Price (NPR)</label>
                                <input
                                    type="number"
                                    name="ticketPrice"
                                    value={formData.ticketPrice}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    name="ticketQuantity"
                                    value={formData.ticketQuantity}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-purple-200 transition disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Event"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
