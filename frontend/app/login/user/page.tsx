"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLoginButton } from "@/app/components/GoogleLoginButton";
import Link from "next/link";

export default function UserLoginPage() {
  const { login, error: authError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Side - Welcome Section */}
          <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-300/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-5xl font-bold text-white mb-4">WELCOME</h1>
              <h2 className="text-2xl font-semibold text-blue-100 mb-6">Back to EventHub</h2>
              <p className="text-blue-100/80 text-lg leading-relaxed">
                Welcome back! Sign in to access your event dashboard, manage tickets, and stay connected with your favorite events.
              </p>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign in</h2>
              <p className="text-gray-600 text-sm mb-8">Enter your email and password to access your account</p>

              {/* Error Alert */}
              {(error || authError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error || authError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Name / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me and Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-sm text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Social Sign In */}
                <div>
                  <GoogleLoginButton />
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{" "}
                  <Link href="/register/user" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign up
                  </Link>
                </p>
              </form>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
