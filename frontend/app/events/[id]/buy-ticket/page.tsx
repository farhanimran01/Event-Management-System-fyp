"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from '@/lib/api';
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  Info,
  Zap,
  Users,
  Gift
} from "lucide-react";

type PaymentMethod = 'esewa' | 'stripe' | 'paypal' | 'cash' | null;

interface TicketCategory {
  name: string;
  price: number;
  quantity: number;
  sold?: number;
  features?: string[];
}

export default function BuyTicketPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const loadEventData = async () => {
      try {
        if (!user) {
          router.push(`/login?redirect=/events/${id}/buy-ticket`);
          return;
        }

        const res = await api.get(`/events/${id}`);
        const eventData = res.data.data;
        setEvent(eventData);

        // Set first category as selected
        if (eventData.ticketTypes?.length > 0) {
          setSelectedCategory(eventData.ticketTypes[0]);
          setQuantity(1);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadEventData();
  }, [id, user, router]);

  const handleContactOrganizer = async (method: 'email' | 'phone') => {
    try {
      await api.post('/contact/organizer', {
        organizerId: event.organizer?._id,
        eventId: id,
        userEmail: user?.email || 'guest@anonymous.com',
        userPhone: user?.phone || null,
        message: `Contact inquiry for event: ${event.title}`,
        contactMethod: method
      });
      alert(`Your inquiry has been logged. The organizer will be notified of your ${method} contact request.`);
      setShowContactModal(false);
    } catch (err: any) {
      console.error('Failed to log contact inquiry:', err);
      alert(`Opening ${method}. Your contact information is being processed.`);
    }
  };

  const handlePaymentGateway = async () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    setProcessingPayment(true);

    try {
      // Create pending ticket booking with payment method
      const bookingRes = await api.post('/tickets', {
        eventId: id,
        ticketTypeName: selectedCategory?.name,
        quantity: quantity,
        paymentMethod: selectedPayment
      });

      const ticketId = bookingRes.data.data?._id || id;
      const amount = (selectedCategory?.price || 0) * quantity;

      // Route to appropriate payment gateway
      if (selectedPayment === 'esewa') {
        router.push(
          `/esewa-payment?amount=${amount}&ticketId=${ticketId}&eventId=${id}`
        );
      } else if (selectedPayment === 'stripe') {
        router.push(
          `/payment/stripe?amount=${amount}&ticketId=${ticketId}&eventId=${id}`
        );
      } else if (selectedPayment === 'paypal') {
        router.push(
          `/payment/paypal?amount=${amount}&ticketId=${ticketId}&eventId=${id}`
        );
      } else if (selectedPayment === 'cash') {
        // For cash payment, booking is created and will be confirmed after organizer receives payment
        alert('Your booking has been created. Please arrange payment with the organizer. Check your email for booking details.');
        router.push('/dashboard/user');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  const availableSpots = selectedCategory 
    ? (selectedCategory.quantity - (selectedCategory.sold || 0))
    : 0;

  const totalPrice = selectedCategory 
    ? (selectedCategory.price * quantity)
    : 0;

  const canBuy = selectedCategory && quantity > 0 && quantity <= availableSpots && selectedPayment;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 max-w-xl mx-auto text-center bg-white rounded-3xl mt-12 shadow-sm border border-red-100">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  if (!event) {
    return <div className="p-10 text-center">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900">Purchase Tickets</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Ticket Selection & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Summary */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-slate-900 mb-3">{event.title}</h2>
                  <div className="space-y-3 text-slate-600">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-blue-600" />
                      <span>
                        {new Date(event.date).toLocaleDateString(undefined, { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {event.time && ` at ${event.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-blue-600" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-blue-600" />
                      <span>{event.registeredUsers?.length || 0} attendees registered</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold">
                    {event.category || 'Event'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Categories */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Zap className="text-blue-600" /> Select Ticket Type
              </h2>

              <div className="space-y-4">
                {event.ticketTypes?.map((category: TicketCategory) => {
                  const available = category.quantity - (category.sold || 0);
                  const isSelected = selectedCategory?.name === category.name;
                  const isSoldOut = available <= 0;

                  return (
                    <button
                      key={category.name}
                      onClick={() => {
                        if (!isSoldOut) {
                          setSelectedCategory(category);
                          setQuantity(1);
                        }
                      }}
                      disabled={isSoldOut}
                      className={`w-full p-6 rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50'
                          : isSoldOut
                          ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-left flex-1">
                          <h3 className={`text-lg font-bold mb-2 ${
                            isSelected ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {category.name}
                          </h3>

                          {/* Features */}
                          {category.features && category.features.length > 0 && (
                            <ul className="space-y-1 mb-3 text-sm text-slate-600">
                              {category.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Availability */}
                          <p className={`text-xs font-bold uppercase tracking-widest ${
                            isSelected ? 'text-blue-600' : 'text-slate-400'
                          }`}>
                            {isSoldOut 
                              ? '❌ Sold Out' 
                              : `✓ ${available} spots available`}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`text-2xl font-black ${
                            isSelected ? 'text-blue-600' : 'text-slate-900'
                          }`}>
                            NPR {category.price}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">per ticket</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            {selectedCategory && (
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Gift className="text-blue-600" /> Number of Tickets
                </h2>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max={availableSpots}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(val, availableSpots));
                      }}
                      className="w-full text-center text-2xl font-bold border-2 border-slate-200 rounded-xl p-4 focus:border-blue-600 focus:ring-0 outline-none"
                    />
                    <p className="text-xs text-slate-400 font-medium text-center mt-2">
                      Maximum available: {availableSpots}
                    </p>
                  </div>

                  <button
                    onClick={() => setQuantity(Math.min(quantity + 1, availableSpots))}
                    disabled={quantity >= availableSpots}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Organizer Details */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Organized By</h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 flex-shrink-0">
                    {event.organizer?.organizerLogo ? (
                      <img 
                        src={event.organizer.organizerLogo} 
                        alt="Logo" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      event.organizer?.name?.[0] || 'O'
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{event.organizer?.name || 'Organizer'}</h4>
                    <p className="text-sm text-slate-500">Verified Organizer <ShieldCheck size={14} className="inline text-blue-500 ml-1" /></p>
                    {event.organizer?.operatingLocations && event.organizer.operatingLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.organizer.operatingLocations.slice(0, 2).map((location: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {location}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition whitespace-nowrap"
                >
                  Contact Organizer
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{selectedCategory?.name}</span>
                    <span className="text-slate-900 font-bold">NPR {selectedCategory?.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Quantity</span>
                    <span className="text-slate-900 font-bold">x{quantity}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center font-black">
                    <span className="text-slate-900">Total</span>
                    <span className="text-2xl text-blue-600">NPR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Select Payment Method
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'esewa', name: '📱 eSewa', desc: 'Mobile Payment' },
                    { id: 'stripe', name: '💳 Stripe', desc: 'Credit/Debit Card' },
                    { id: 'paypal', name: '🅿️ PayPal', desc: 'PayPal Account' },
                    { id: 'cash', name: '💵 Cash', desc: 'Pay on Site' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                      className={`w-full p-3 rounded-xl border-2 transition text-left ${
                        selectedPayment === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <p className={`font-bold ${
                        selectedPayment === method.id ? 'text-blue-900' : 'text-slate-900'
                      }`}>
                        {method.name}
                      </p>
                      <p className={`text-xs ${
                        selectedPayment === method.id ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {method.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">What's Included</p>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    <span>Instant email confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    <span>Digital QR code ticket</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    <span>Support available 24/7</span>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePaymentGateway}
                disabled={!canBuy || processingPayment}
                className={`w-full py-4 rounded-2xl font-black text-lg transition flex items-center justify-center gap-3 shadow-lg ${
                  canBuy
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-slate-400 text-center">
                By clicking "Proceed to Payment", you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white rounded-t-3xl">
              <h3 className="text-2xl font-black mb-2">Contact Organizer</h3>
              <p className="text-blue-100">Get in touch with {event.organizer?.name}</p>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Organizer Info */}
              <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                  {event.organizer?.organizerLogo ? (
                    <img 
                      src={event.organizer.organizerLogo} 
                      alt="Logo" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    event.organizer?.name?.[0] || 'O'
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{event.organizer?.name}</h4>
                  <p className="text-sm text-slate-500">Verified Event Organizer</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                {/* Phone */}
                {event.organizer?.organizerContact && (
                  <div className="p-4 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</p>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 font-bold">{event.organizer.organizerContact}</p>
                      <button
                        onClick={() => {
                          handleContactOrganizer('phone');
                          window.location.href = `tel:${event.organizer.organizerContact}`;
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
                      >
                        <Phone size={16} /> Call
                      </button>
                    </div>
                  </div>
                )}

                {/* Email */}
                {event.organizer?.email && (
                  <div className="p-4 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900 font-bold text-sm">{event.organizer.email}</p>
                      <button
                        onClick={() => {
                          handleContactOrganizer('email');
                          window.location.href = `mailto:${event.organizer.email}?subject=Inquiry about ${event.title} event`;
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2 flex-shrink-0"
                      >
                        <Mail size={16} /> Email
                      </button>
                    </div>
                  </div>
                )}

                {/* Locations */}
                {event.organizer?.organizerLocations && event.organizer.organizerLocations.length > 0 && (
                  <div className="p-4 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operating Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {event.organizer.organizerLocations.map((location: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Note</p>
                <p className="text-sm text-blue-600">
                  Your contact information will be logged and the organizer will be notified of your inquiry.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  handleContactOrganizer('email');
                  if (event.organizer?.email) {
                    window.location.href = `mailto:${event.organizer.email}?subject=Inquiry about ${event.title} event`;
                  }
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Mail size={18} /> Email
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
