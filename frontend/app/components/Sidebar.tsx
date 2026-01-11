import React from 'react';
import { X, LayoutDashboard, Calendar, Ticket, Users, Bell, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#4A6CF7]">EMS</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === item.id
                    ? 'bg-[#4A6CF7] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
