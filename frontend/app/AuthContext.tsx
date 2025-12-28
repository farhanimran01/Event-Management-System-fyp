"use client";
import React, { useState } from 'react';
import { createContext, useContext, useEffect } from "react";
import { Sidebar } from '@/app/components/Sidebar';
import { Navbar } from '@/app/components/Navbar';
import { Dashboard } from '@/app/components/views/Dashboard';
import { Events } from '@/app/components/views/Events';
import { Tickets } from '@/app/components/views/Tickets';
import { Users } from '@/app/components/views/Users';
import { Notifications } from '@/app/components/views/Notifications';
import { Analytics } from '@/app/components/views/Analytics';
import { Settings } from '@/app/components/views/Settings';
import { Login } from '@/app/components/auth/Login';
import { Signup } from '@/app/components/auth/Signup';
import { UserHome } from '@/app/components/user/UserHome';
import { EventDetails } from '@/app/components/user/EventDetails';
import { Registration } from '@/app/components/user/Registration';
import { MyTickets } from '@/app/components/user/MyTickets';
import { UserProfile } from '@/app/components/user/UserProfile';
import { UserNavbar } from '@/app/components/user/UserNavbar';
import { UserDashboard } from '@/app/components/user/UserDashboard';
import { Favorites } from '@/app/components/user/Favorites';
import { Button } from '@/app/components/Button';
import { Users as UsersIcon, Shield } from 'lucide-react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ems_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem("ems_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ems_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMode, setUserMode] = useState<'admin' | 'user'>('admin');
  
  // User mode states
  const [userView, setUserView] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUserMode('user'); // Start in user mode by default
    setUserView('dashboard'); // Start with dashboard
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setUserMode('user'); // Start in user mode by default
    setUserView('dashboard'); // Start with dashboard
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('login');
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setUserView('event-details');
  };

  const handleRegister = (eventId: string) => {
    setShowRegistration(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    setUserView('my-tickets');
  };

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <Signup 
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  // User Mode
  if (userMode === 'user') {
    if (showRegistration && selectedEventId) {
      return (
        <Registration
          eventId={selectedEventId}
          onBack={() => setShowRegistration(false)}
          onComplete={handleRegistrationComplete}
        />
      );
    }

    if (userView === 'event-details' && selectedEventId) {
      return (
        <>
          <UserNavbar 
            activeView={userView}
            onViewChange={setUserView}
            onLogout={handleLogout}
          />
          <EventDetails
            eventId={selectedEventId}
            onBack={() => setUserView('home')}
            onRegister={handleRegister}
          />
        </>
      );
    }

    return (
      <>
        <UserNavbar 
          activeView={userView}
          onViewChange={setUserView}
          onLogout={handleLogout}
        />
        {userView === 'home' && <UserHome onEventClick={handleEventClick} />}
        {userView === 'dashboard' && <UserDashboard onNavigate={setUserView} onEventClick={handleEventClick} />}
        {userView === 'my-tickets' && <MyTickets />}
        {userView === 'profile' && <UserProfile onLogout={handleLogout} />}
        {userView === 'favorites' && <Favorites onEventClick={handleEventClick} />}
        
        {/* Mode Switcher FAB */}
        <button
          onClick={() => setUserMode('admin')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#4A6CF7] text-white rounded-full shadow-lg hover:bg-[#3a5ad6] transition-colors flex items-center justify-center z-50"
          title="Switch to Admin Mode"
        >
          <Shield className="w-6 h-6" />
        </button>
      </>
    );
  }

  // Admin Mode
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <Events />;
      case 'tickets':
        return <Tickets />;
      case 'users':
        return <Users />;
      case 'notifications':
        return <Notifications />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F7FB] overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      {/* Mode Switcher FAB */}
      <button
        onClick={() => setUserMode('user')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#4A6CF7] text-white rounded-full shadow-lg hover:bg-[#3a5ad6] transition-colors flex items-center justify-center z-50"
        title="Switch to User Mode"
      >
        <UsersIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
