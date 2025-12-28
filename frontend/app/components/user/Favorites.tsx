import React from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { Button } from '../Button';

interface FavoritesProps {
  onEventClick: (eventId: string) => void;
}

export function Favorites({ onEventClick }: FavoritesProps) {
  const favorites = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      location: 'New York',
      image: 'bg-blue-100',
    },
    {
      id: '2',
      title: 'Design Workshop',
      date: 'Dec 22, 2024',
      location: 'Los Angeles',
      image: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorite Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative">
              <div className={`${event.image} h-40`} />
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:shadow-lg">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
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
