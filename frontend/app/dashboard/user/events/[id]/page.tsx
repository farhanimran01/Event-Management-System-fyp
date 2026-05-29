"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image?: string;
  ticketTypes: Array<{ name: string; price: number; quantity: number }>;
}

export default function EventDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading_page, setLoadingPage] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/user");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoadingPage(true);
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data.data || res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details");
    } finally {
      setLoadingPage(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const totalPrice = event?.ticketTypes?.[0]?.price ? event.ticketTypes[0].price * quantity : 0;

  const initiateESewaPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Create order/booking
      const bookingRes = await api.post("/tickets", {
        eventId: event?._id,
        quantity: quantity,
      });

      if (bookingRes.data.success) {
        const ticketId = bookingRes.data.data?._id;

        // Redirect to mock eSewa payment page
        router.push(
          `/esewa-payment?amount=${totalPrice}&ticketId=${ticketId}&eventId=${event?._id}`
        );
      }
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.response?.data?.error || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || loading_page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "User") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white mb-4 hover:text-blue-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 text-lg mb-6">{event.description}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span>Capacity: {event.capacity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-white mb-6">Book Tickets</h3>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Price Display */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 text-gray-300">
                    <DollarSign className="w-4 h-4" />
                    <span>Price per ticket:</span>
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-4">
                    NPR {event.ticketTypes[0].price}
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-semibold mb-3">
                      Select Number of Tickets:
                    </label>
                    <div className="flex items-center justify-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity === 1}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-xl transition ${
                          quantity === 1
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg"
                        }`}
                      >
                        −
                      </button>
                      <div className="px-8 py-2 bg-white/10 rounded-lg border border-white/20">
                        <span className="text-4xl font-bold text-cyan-400">{quantity}</span>
                      </div>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity === 10}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg font-bold text-xl transition ${
                          quantity === 10
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs text-center mt-2">Min: 1 | Max: 10 tickets</p>
                  </div>

                  {/* Total */}
                  <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Subtotal ({quantity} tickets):</span>
                      <span className="text-white font-semibold">
                        NPR {(event.ticketTypes[0].price * quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                      <span className="text-lg font-bold text-white">Total:</span>
                      <span className="text-2xl font-bold text-cyan-400">
                        NPR {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={initiateESewaPayment}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                      isProcessing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    }`}
                  >
                    {isProcessing ? "Processing..." : "Book Now (eSewa)"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
