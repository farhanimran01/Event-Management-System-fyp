import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            EventHub
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white hover:text-purple-400 transition font-medium">
              Login
            </Link>
            <Link 
              href="/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Gradient Text */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Manage Events
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Effortlessly
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create, manage, and sell tickets for your events. Connect with attendees and grow your audience with our powerful event management platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold transition"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-20">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <p className="text-3xl font-bold text-purple-400">10K+</p>
              <p className="text-gray-400 text-sm mt-2">Events Created</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <p className="text-3xl font-bold text-purple-400">500K+</p>
              <p className="text-gray-400 text-sm mt-2">Attendees</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
              <p className="text-3xl font-bold text-purple-400">50+</p>
              <p className="text-gray-400 text-sm mt-2">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black/40 backdrop-blur py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose EventHub?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Zap className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Easy to Use</h3>
              <p className="text-gray-400 text-sm">
                Create and manage events in minutes with our intuitive platform
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Shield className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Secure Payments</h3>
              <p className="text-gray-400 text-sm">
                Accept payments safely with industry-leading security standards
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Users className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Attendee Management</h3>
              <p className="text-gray-400 text-sm">
                Track registrations and manage attendees with detailed analytics
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition">
              <Calendar className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Schedule Events</h3>
              <p className="text-gray-400 text-sm">
                Plan events with flexible scheduling and automatic reminders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">EventHub</h4>
              <p className="text-gray-400 text-sm">The ultimate event management platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex items-center justify-between">
            <p className="text-gray-400 text-sm">&copy; 2025 EventHub. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
