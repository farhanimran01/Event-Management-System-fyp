"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import {
  Search,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Trash2,
} from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

interface Ticket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  ticketType: {
    name: string;
    price: number;
  };
  quantity: number;
  totalPrice: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentProvider: string;
  paymentDetails?: {
    transactionId?: string;
    pidx?: string;
    verifiedAt?: string;
  };
  createdAt: string;
  status: string;
  qrCode: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export default function EventTicketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams?.get("event");
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

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
        console.warn(`Access denied: User has role "${user.role}" but tried to access Organizer Tickets page`);
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

  // Load events and setup ticket management
  useEffect(() => {
    if (user && user.role === "Organizer") {
      fetchEvents();
    }
  }, [user]);

  // Auto-select event from URL query parameter
  useEffect(() => {
    if (eventIdFromUrl && events.length > 0) {
      const event = events.find((e) => e._id === eventIdFromUrl);
      if (event) {
        handleEventSelect(event);
      }
    }
  }, [eventIdFromUrl, events]);

  // If not authorized, show nothing while redirecting
  if (loading || (user && user.role !== "Organizer")) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Fetch organizer's events
  const fetchEvents = async () => {
    try {
      setLoading2(true);
      const res = await api.get("/events/organizer");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading2(false);
    }
  };

  // Fetch tickets for selected event
  const fetchTickets = async (eventId: string) => {
    try {
      setLoading2(true);
      setError("");
      const res = await api.get(`/tickets/event/${eventId}`);
      setTickets(res.data.data || []);
      setFilteredTickets(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets");
    } finally {
      setLoading2(false);
    }
  };

  // Handle event selection
  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setSearchTerm("");
    fetchTickets(event._id);
  };

  // Search tickets
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const filtered = tickets.filter((ticket) => {
      const searchLower = term.toLowerCase();
      return (
        ticket.user.name.toLowerCase().includes(searchLower) ||
        ticket.user.email.toLowerCase().includes(searchLower) ||
        ticket.ticketType.name.toLowerCase().includes(searchLower)
      );
    });
    setFilteredTickets(filtered);
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (
    ticketId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingTicket(ticketId);
      setError("");
      const res = await api.put(`/tickets/${ticketId}/payment-status`, {
        paymentStatus: newStatus,
      });

      if (res.data.success) {
        setSuccess(
          `Payment status updated to ${newStatus} successfully!`
        );
        // Update local state
        setTickets((prev) =>
          prev.map((t) =>
            t._id === ticketId ? { ...t, paymentStatus: newStatus as any } : t
          )
        );
        setFilteredTickets((prev) =>
          prev.map((t) =>
            t._id === ticketId ? { ...t, paymentStatus: newStatus as any } : t
          )
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update payment status");
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      setUpdatingTicket(ticketId);
      setError("");
      const res = await api.delete(`/tickets/${ticketId}`);

      if (res.data.success) {
        setSuccess("Ticket deleted successfully!");
        // Remove from local state
        setTickets((prev) => prev.filter((t) => t._id !== ticketId));
        setFilteredTickets((prev) => prev.filter((t) => t._id !== ticketId));
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete ticket");
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 border-green-500/50 text-green-300";
      case "pending":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-300";
      case "failed":
        return "bg-red-500/20 border-red-500/50 text-red-300";
      case "refunded":
        return "bg-blue-500/20 border-blue-500/50 text-blue-300";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "refunded":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get confirmation status (Confirmed/Pending) based on payment method and status
  const getConfirmationStatus = (ticket: Ticket) => {
    const isOnlinePayment = ['esewa', 'stripe', 'paypal'].includes(ticket.paymentProvider || '');
    
    if (isOnlinePayment) {
      // Online payments: confirmed when payment is completed
      if (ticket.paymentStatus === 'completed') {
        return { text: 'Confirmed', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
      } else if (ticket.paymentStatus === 'failed') {
        return { text: 'Payment Failed', color: 'text-red-400', bgColor: 'bg-red-500/10' };
      } else {
        return { text: 'Awaiting Payment', color: 'text-amber-400', bgColor: 'bg-amber-500/10' };
      }
    } else {
      // Cash payments: pending until organizer marks as completed
      if (ticket.paymentStatus === 'completed') {
        return { text: 'Confirmed', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
      } else {
        return { text: 'Pending', color: 'text-slate-400', bgColor: 'bg-slate-500/10' };
      }
    }
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
          <h1 className="text-3xl font-bold text-white">EventHub</h1>
          <UserProfileDropdown />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-pink-300 transition"
          >
            <ChevronLeft className="w-6 h-6" />
            Back
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Manage Ticket Sales
            </h1>
            <p className="text-purple-100">
              View and manage customer tickets and payments
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Event Selection Sidebar */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-4">Your Events</h2>

            {loading2 ? (
              <div className="text-gray-300 text-sm">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-gray-300 text-sm">No events yet</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <button
                    key={event._id}
                    onClick={() => handleEventSelect(event)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedEvent?._id === event._id
                        ? "bg-purple-500/50 border border-purple-400 text-white"
                        : "hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedEvent ? (
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-12 text-center">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Select an Event
                </h3>
                <p className="text-gray-300">
                  Choose an event from the list to view and manage its tickets
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Event Info */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedEvent.title}
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      📅 {new Date(selectedEvent.date).toLocaleDateString()} at{" "}
                      {selectedEvent.time}
                    </p>
                    <p>📍 {selectedEvent.location}</p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by customer name, email, or ticket type..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* Tickets Table */}
                {loading2 ? (
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-12 text-center">
                    <p className="text-gray-300">Loading tickets...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-12 text-center">
                    <p className="text-gray-300">
                      {tickets.length === 0
                        ? "No tickets sold for this event yet"
                        : "No results matching your search"}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20 bg-white/5">
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Ticket Type
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Payment Method
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Payment Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-white">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr
                            key={ticket._id}
                            className="border-b border-white/10 hover:bg-white/5 transition"
                          >
                            <td className="px-4 py-3 text-white font-medium">
                              {ticket.user.name}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {ticket.user.email}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {ticket.ticketType.name}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              {ticket.quantity}
                            </td>
                            <td className="px-4 py-3 text-white font-semibold">
                              NPR {ticket.totalPrice}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              <span className="capitalize">
                                {ticket.paymentProvider}
                              </span>
                              {ticket.paymentProvider === "cash" && " 💵"}
                              {ticket.paymentProvider === "esewa" && " 🏦"}
                            </td>
                            <td className="px-4 py-3">
                              <div
                                className={`flex items-center gap-2 px-2 py-1 rounded border ${getStatusColor(
                                  ticket.paymentStatus
                                )} w-fit`}
                              >
                                {getStatusIcon(ticket.paymentStatus)}
                                <span className="capitalize text-xs font-medium">
                                  {ticket.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {(() => {
                                const status = getConfirmationStatus(ticket);
                                return (
                                  <div className={`px-3 py-1 rounded text-xs font-semibold w-fit ${status.bgColor} ${status.color}`}>
                                    {status.text}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {/* Payment Status Dropdown */}
                                <select
                                  value={ticket.paymentStatus}
                                  onChange={(e) =>
                                    handleUpdatePaymentStatus(ticket._id, e.target.value)
                                  }
                                  disabled={updatingTicket === ticket._id}
                                  className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(
                                    ticket.paymentStatus
                                  )}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                  <option value="refunded">Refunded</option>
                                </select>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteTicket(ticket._id)}
                                  disabled={updatingTicket === ticket._id}
                                  className="p-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete ticket"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary */}
                {filteredTickets.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Tickets</p>
                      <p className="text-3xl font-bold text-white">
                        {filteredTickets.length}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-400">
                        NPR{" "}
                        {filteredTickets.reduce(
                          (sum, t) => sum + (Number(t.totalPrice) || 0),
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">
                        Payments Completed
                      </p>
                      <p className="text-3xl font-bold text-green-400">
                        {filteredTickets.filter((t) => t.paymentStatus === "completed").length}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">
                        Pending Payments
                      </p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {filteredTickets.filter((t) => t.paymentStatus === "pending").length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
