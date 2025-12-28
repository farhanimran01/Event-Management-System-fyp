import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '../Button';

interface UserHomeProps {
  onEventClick: (eventId: string) => void;
}

export function UserHome({ onEventClick }: UserHomeProps) {
  const events = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      location: 'New York',
      attendees: 245,
      image: 'bg-blue-100',
    },
    {
      id: '2',
      title: 'Web Development Bootcamp',
      date: 'Dec 20, 2024',
      location: 'San Francisco',
      attendees: 156,
      image: 'bg-green-100',
    },
    {
      id: '3',
      title: 'Design Workshop',
      date: 'Dec 22, 2024',
      location: 'Los Angeles',
      attendees: 98,
      image: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div className={`${event.image} h-40`} />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span text-sm>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span text-sm>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span text-sm>{event.attendees} attending</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => onEventClick(event.id)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
