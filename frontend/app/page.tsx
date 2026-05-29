'use client';

import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Calendar, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToFooter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/front.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none"></div>
      
      <div className="relative z-10 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur z-50">
        <div className="max-w-full mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            EventHub
          </Link>

          {/* Menu Items - Desktop */}
          <div className="hidden lg:flex items-center gap-8 mx-auto">
            <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium">
              ABOUT US
            </a>
            <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium">
              POLICY
            </a>
            <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium">
              INFORMATION
            </a>
            <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium">
              CONTACT
            </a>
            <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium">
              FOLLOW US
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login/user"
              className="hidden sm:flex text-white hover:text-pink-400 transition font-medium"
            >
              Login
            </Link>
            <Link
              href="/login/user"
              className="hidden sm:flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-semibold transition"
            >
              Sign Up
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white hover:text-pink-400 transition">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/90 backdrop-blur border-t border-white/10 px-8 py-4">
            <div className="flex flex-col gap-3">
              <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium py-2 block">
                ABOUT US
              </a>
              <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium py-2 block">
                POLICY
              </a>
              <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium py-2 block">
                INFORMATION
              </a>
              <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium py-2 block">
                CONTACT
              </a>
              <a href="#footer" onClick={scrollToFooter} className="text-white hover:text-pink-400 transition font-medium py-2 block">
                FOLLOW US
              </a>
            </div>
          </div>
        )}
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
              href="/dashboard/events"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 transition transform hover:scale-105"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
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
      <footer id="footer" className="bg-gradient-to-r from-purple-700 to-purple-900 relative pt-20 px-6 scroll-smooth">
        {/* Decorative Wave with Event Icons */}
        <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
            <path
              d="M0,40 Q300,10 600,40 T1200,40 L1200,0 L0,0 Z"
              fill="url(#waveGradient)"
              opacity="0.3"
            />
            <path
              d="M0,60 Q300,30 600,60 T1200,60 L1200,0 L0,0 Z"
              fill="url(#waveGradient)"
              opacity="0.5"
            />
          </svg>
          
          {/* Event Icons */}
          <div className="absolute inset-0 flex items-center justify-center gap-8 px-4">
            <div className="text-white/40 text-2xl">🎪</div>
            <div className="text-white/40 text-2xl">🎭</div>
            <div className="text-white/40 text-2xl">🎵</div>
            <div className="text-white/40 text-2xl">🎉</div>
            <div className="text-white/40 text-2xl">🎫</div>
            <div className="text-white/40 text-2xl">🎊</div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="max-w-6xl mx-auto pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* About Us */}
            <div>
              <h4 className="text-white font-bold mb-4">About Us</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                EventHub is a comprehensive event management platform designed to help organizers create, manage, and promote events seamlessly. With integrated ticket sales, attendee management, and payment processing, we empower event creators to focus on delivering amazing experiences. Join thousands of event organizers worldwide who trust EventHub to bring their events to life.
              </p>
            </div>

            {/* Terms and Conditions */}
            <div>
              <h4 className="text-white font-bold mb-4">Policy</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Return Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cancellation Policy</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-white font-bold mb-4">Information</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-white transition">About EventHub</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="text-white font-semibold">EventHub Inc.</li>
                <li>📞 +1 (800) 123-4567</li>
                <li>✉️ support@eventhub.com</li>
                <li className="text-white/80 text-xs mt-4">New York, USA</li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-white/70 hover:text-white transition text-2xl">f</a>
                <a href="#" className="text-white/70 hover:text-white transition text-2xl">📷</a>
                <a href="#" className="text-white/70 hover:text-white transition text-2xl">𝕏</a>
                <a href="#" className="text-white/70 hover:text-white transition text-2xl">in</a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/70 text-sm">&copy; 2025 EventHub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-white/70 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
