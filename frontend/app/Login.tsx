"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { GoogleLoginButton } from "./components/GoogleLoginButton";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log('[AUTH] Login attempt:', { email });

    try {
      // Call backend API to verify credentials
      console.log('[API] Fetching users from /api/users');
      const response = await fetch("/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        console.log('[API] Users fetched successfully, status:', response.status);
        const users = await response.json();
        console.log('[AUTH] Checking credentials for email:', email);
        const user = users.find((u: any) => u.email === email);

        if (user) {
          // For demo: accept any password if email exists
          // In production: hash and compare passwords
          console.log('[AUTH] User found in database:', { email, userId: user._id });
          console.log('[AUTH] Login successful');
          login({ name: user.name, email: user.email, role: user.role });
          router.push("/dashboard");
        } else {
          // If user not found but no API error, use demo mode
          console.log('[AUTH] User not found in database, using demo mode');
          login({ name: email.split("@")[0], email: email, role: "user" });
          router.push("/dashboard");
        }
      } else {
        // API error - use demo mode for testing
        console.warn('[API] API error, status:', response.status, '- using demo mode');
        login({ name: email.split("@")[0], email: email, role: "user" });
        router.push("/dashboard");
      }
    } catch (err) {
      // Network error - use demo mode
      console.error('[API] Login network error:', err);
      console.log('[DEMO] Fallback to demo mode login');
      login({ name: email.split("@")[0], email: email, role: "user" });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-10">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-blue-100">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="text-red-600 mt-0.5">⚠</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-600 px-2">Or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Login Button */}
            <GoogleLoginButton />
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-center text-gray-700">
              Don't have an account?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white bg-opacity-60 backdrop-blur rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">🧪 Demo Mode:</p>
          <p>Use any email to login (database optional)</p>
          <p className="text-xs text-gray-600 mt-2">Example: demo@example.com</p>
        </div>
      </div>
    </div>
  );
}
