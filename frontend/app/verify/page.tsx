"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Check, AlertCircle, Copy } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "input" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    const emailParam = searchParams.get("email");

    if (codeParam && emailParam) {
      // Auto-verify from link
      verifyCode(codeParam, emailParam);
    } else {
      // Show input form
      setStatus("input");
    }
  }, [searchParams]);

  const verifyCode = async (verificationCode: string, userEmail: string) => {
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, email: userEmail }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to dashboard...");
        // Auto-login if user exists
        login({ name: "User", email: userEmail, role: "user" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleVerifyClick = async () => {
    if (!code || !email) {
      setMessage("Please enter both email and verification code");
      return;
    }

    setVerifying(true);
    await verifyCode(code, email);
    setVerifying(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">
            <h1 className="text-3xl font-bold text-white">Verify Email</h1>
            <p className="text-blue-100">Confirm your email address</p>
          </div>

          <div className="p-8">
            {status === "loading" && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
                <h2 className="text-xl font-bold text-gray-900 text-center">Verifying your email...</h2>
                <p className="text-gray-600 mt-2 text-center">Please wait while we confirm your email address</p>
              </>
            )}

            {status === "input" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-widest"
                    />
                    <button
                      onClick={copyToClipboard}
                      title="Copy code"
                      className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
                </div>

                <button
                  onClick={handleVerifyClick}
                  disabled={verifying || !code || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? "Verifying..." : "Verify Email"}
                </button>

                {message && status === "input" && (
                  <p className="text-sm text-red-600 text-center">{message}</p>
                )}
              </div>
            )}

            {status === "success" && (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">Email Verified!</h2>
                <p className="text-gray-600 mt-2 text-center">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">Verification Failed</h2>
                <p className="text-gray-600 mt-2 text-center">{message}</p>
                <button
                  onClick={() => {
                    setStatus("input");
                    setCode("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
