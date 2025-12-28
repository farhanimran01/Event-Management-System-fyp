import React from 'react';
import { BarChart3, Users, Calendar, Ticket } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Total Events', value: '24', icon: Calendar, color: 'bg-blue-100' },
    { label: 'Total Users', value: '156', icon: Users, color: 'bg-green-100' },
    { label: 'Tickets Sold', value: '1,240', icon: Ticket, color: 'bg-purple-100' },
    { label: 'Revenue', value: '$12,450', icon: BarChart3, color: 'bg-orange-100' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
