import React from 'react';
import { Ticket, Heart, Calendar, User } from 'lucide-react';

interface UserDashboardProps {
  onNavigate: (view: string) => void;
  onEventClick: (eventId: string) => void;
}

export function UserDashboard({ onNavigate, onEventClick }: UserDashboardProps) {
  const stats = [
    { label: 'Registered Events', value: '3', icon: Calendar, color: 'bg-blue-100' },
    { label: 'My Tickets', value: '5', icon: Ticket, color: 'bg-green-100' },
    { label: 'Favorites', value: '8', icon: Heart, color: 'bg-red-100' },
    { label: 'Profile', value: 'View', icon: User, color: 'bg-purple-100' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={() => {
                if (stat.label === 'Profile') onNavigate('profile');
                else if (stat.label === 'My Tickets') onNavigate('my-tickets');
                else if (stat.label === 'Favorites') onNavigate('favorites');
              }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 text-left hover:translate-y-[-4px]"
            >
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activities</h2>
        <p className="text-gray-600">Your recent activities will appear here...</p>
      </div>
    </div>
  );
}
