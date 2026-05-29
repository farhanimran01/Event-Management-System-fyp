"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Eye, Calendar, MapPin, Users, DollarSign, Ticket } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { ImageUploadDragDrop } from "@/components/ImageUploadDragDrop";

export default function OrganizerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Technology",
    capacity: "",
    status: "upcoming",
    image: "",
    images: [] as string[],
    ticketTypes: [{ name: "General", price: 0, quantity: 0 }],
  });

  // SECURITY: Check authentication and redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/organizer");
    }
  }, [user, loading, router]);

  // SECURITY: Check role and redirect if not authorized
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== "Organizer") {
        console.warn(`Access denied: User has role "${user.role}" but tried to access Organizer dashboard`);
        // Redirect to appropriate dashboard based on role
        if (user.role === "User") {
          router.push("/dashboard/user");
        } else if (user.role === "Admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard");
        }
        return;
      }
    }
  }, [user, loading, router]);

  // Fetch events when user is authorized
  useEffect(() => {
    if (user && user.role === "Organizer") {
      fetchEvents();
    }
  }, [user]);

  // If not authorized, show nothing while redirecting
  if (loading || (user && user.role !== "Organizer")) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/organizer");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updatedTickets = [...formData.ticketTypes];
    updatedTickets[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      ticketTypes: updatedTickets,
    }));
  };

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { name: "", price: 0, quantity: 0 }],
    }));
  };

  const removeTicketType = (index) => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
    }));
  };

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const formDataImg = new FormData();
        formDataImg.append("image", file);

        const res = await api.post("/profile/upload", formDataImg, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        uploadedUrls.push(res.data.data);
      }
    } catch (err: any) {
      setError("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let imageUrls = formData.images || [];

      // Upload new images if selected
      if (selectedImages.length > 0) {
        const uploadedUrls = await uploadImages(selectedImages);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Use first image as primary image
      const submitData = {
        ...formData,
        image: imageUrls[0] || formData.image,
        images: imageUrls,
      };

      if (editingEvent) {
        const res = await api.put(`/events/${editingEvent._id}`, submitData);
        if (res.data.success) {
          setSuccess("Event updated successfully!");
          fetchEvents();
          resetForm();
          setEditingEvent(null);
        }
      } else {
        const res = await api.post("/events", submitData);
        if (res.data.success) {
          setSuccess("Event created successfully!");
          fetchEvents();
          resetForm();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save event");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date?.split("T")[0] || "",
      time: event.time,
      location: event.location,
      category: event.category || "Technology",
      capacity: event.capacity,
      status: event.status,
      image: event.image || "",
      ticketTypes: event.ticketTypes || [{ name: "General", price: 0, quantity: 0 }],
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.data.success) {
        setSuccess("Event deleted successfully!");
        fetchEvents();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete event");
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "Technology",
      capacity: "",
      status: "upcoming",
      image: "",
      ticketTypes: [{ name: "General", price: 0, quantity: 0 }],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "Organizer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">EventHub</h1>
          </div>
          <UserProfileDropdown />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
            <p className="text-purple-100">Manage your events and bookings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard/organizer/tickets")}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition font-semibold"
            >
              <Ticket className="w-5 h-5" />
              View Tickets
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingEvent(null);
                setShowCreateForm(!showCreateForm);
              }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-green-200">
            {success}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  required
                />
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <textarea
                name="description"
                placeholder="Event Description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                required
              />

              {/* Image URL */}
              <div>
                <label className="block text-white font-semibold mb-3">Event Images (Drag & Drop)</label>
                <ImageUploadDragDrop
                  onImagesSelected={(files) => setSelectedImages(files)}
                  maxImages={4}
                  maxSizePerImage={5}
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wide">Event Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-white font-semibold appearance-none cursor-pointer shadow-lg hover:shadow-xl transition-all"
                    required
                  >
                    <option value="Technology" className="bg-purple-900">🖥️ Technology</option>
                    <option value="Business" className="bg-purple-900">💼 Business</option>
                    <option value="Education" className="bg-purple-900">📚 Education</option>
                    <option value="Entertainment" className="bg-purple-900">🎭 Entertainment</option>
                    <option value="Sports" className="bg-purple-900">⚽ Sports</option>
                    <option value="Other" className="bg-purple-900">✨ Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm uppercase tracking-wide">Event Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-white font-semibold appearance-none cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    <option value="upcoming" className="bg-purple-900">📅 Upcoming</option>
                    <option value="ongoing" className="bg-purple-900">🔴 Ongoing</option>
                    <option value="completed" className="bg-purple-900">✅ Completed</option>
                    <option value="cancelled" className="bg-purple-900">❌ Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Ticket Types */}
              <div>
                <h3 className="text-white font-semibold mb-3">Ticket Types</h3>
                {formData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Ticket Name (e.g., VIP)"
                      value={ticket.name}
                      onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={ticket.price}
                      onChange={(e) => handleTicketTypeChange(index, "price", e.target.value)}
                      className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={ticket.quantity}
                      onChange={(e) => handleTicketTypeChange(index, "quantity", e.target.value)}
                      className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                    />
                    {formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTicketType}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg transition text-sm"
                >
                  + Add Ticket Type
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition font-semibold"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Events ({events.length})</h2>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-white/10 backdrop-blur border border-white/20 rounded-lg">
              <p className="text-gray-300 text-lg">No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition"
                >
                  {/* Image */}
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{event.title}</h3>
                      <span className="text-xs bg-purple-500/20 border border-purple-500/50 text-purple-300 px-2 py-1 rounded capitalize">
                        {event.status}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{event.description?.substring(0, 60)}...</p>

                    {/* Details */}
                    <div className="space-y-1 mb-4 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Capacity: {event.capacity}
                      </div>
                    </div>

                    {/* Price */}
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-sm font-semibold text-pink-400">
                        <DollarSign className="w-4 h-4" />
                        Starting from NPR {event.ticketTypes[0].price}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-col">
                      <button
                        onClick={() => router.push(`/dashboard/organizer/tickets?event=${event._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 py-2 rounded transition text-sm"
                      >
                        <Ticket className="w-4 h-4" />
                        View Tickets
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="flex-1 flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 py-2 rounded transition text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 py-2 rounded transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
