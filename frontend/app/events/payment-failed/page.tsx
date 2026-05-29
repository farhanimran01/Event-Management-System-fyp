"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { XCircle, Home, RefreshCw } from "lucide-react";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const ticketId = searchParams.get("ticketId");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/user");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="w-24 h-24 text-red-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Payment Failed</h1>
          <p className="text-gray-300 text-lg mb-8">
            Unfortunately, your payment could not be processed. Please try again or use a different payment method.
          </p>

          <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4">What to do next:</h2>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">•</span>
                <span>Check your internet connection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">•</span>
                <span>Verify your payment method has sufficient funds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">•</span>
                <span>Try the payment again with the same or different method</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">•</span>
                <span>Contact support if the problem persists</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition mb-3"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={() => router.push("/dashboard/user")}
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition border border-white/20"
            >
              <Home className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>

          <p className="text-gray-400 text-sm mt-8">
            If you need help, please contact our support team at support@eventmanagement.com
          </p>
        </div>
      </div>
    </div>
  );
}
