"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { CheckCircle, Home, FileText } from "lucide-react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [error, setError] = useState("");

  const ticketId = searchParams.get("ticketId");
  const quantity = searchParams.get("quantity");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/user");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (ticketId) {
      verifyPayment();
    }
  }, [ticketId]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      
      // For mock payment, directly verify as successful
      const res = await api.post(`/esewa/verify`, {
        pidx: `mock-${ticketId}`,
        transaction_id: `mock-txn-${Date.now()}`,
        ticketId: ticketId,
      });
      
      if (res.data.success) {
        setVerified(true);
        setTicketDetails(res.data.data);
        console.log("Payment verification successful:", res.data.data);
      } else {
        setError("Payment verification failed. Please contact support.");
        console.error("Verification failed:", res.data);
      }
    } catch (err: any) {
      console.error("Error verifying payment:", err);
      setError(`Payment verification error: ${err.response?.data?.error || err.message}. Please contact support.`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Processing your payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-24 h-24 text-green-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-300 text-lg mb-8">
            {verified
              ? "Your payment has been processed successfully. Your tickets are ready!"
              : "Your payment is being verified. Please check your email shortly."}
          </p>

          {ticketDetails && (
            <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/10 text-left">
              <h2 className="text-xl font-bold text-white mb-4">Ticket Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className="text-green-400 font-semibold">{ticketDetails.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ticket Status:</span>
                  <span className="text-cyan-400 font-semibold">{ticketDetails.ticketStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Number of Tickets:</span>
                  <span className="text-white font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ticket ID:</span>
                  <span className="text-white font-mono text-sm">{ticketId?.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-8 text-yellow-200">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-6">
              A confirmation email has been sent to you with your ticket details.
            </p>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition mb-3"
            >
              <Home className="w-5 h-5" />
              View My Tickets
            </button>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition border border-white/20"
            >
              <FileText className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
