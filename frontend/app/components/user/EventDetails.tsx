import React from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '../Button';

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
  onRegister: (eventId: string) => void;
}

export function EventDetails({ eventId, onBack, onRegister }: EventDetailsProps) {
  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-[#4A6CF7] hover:text-[#3a5ad6] mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Events</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-100 h-64" />

        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Title</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-[#4A6CF7]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold">Dec 15, 2024</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-lg font-semibold">10:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-lg font-semibold">New York Convention Center</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendees</p>
                <p className="text-lg font-semibold">245 people</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">
              This is a great event where you can learn and network with industry professionals.
              Join us for an unforgettable experience.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => onRegister(eventId)}
            className="w-full md:w-auto"
          >
            Register Now
          </Button>
        </div>
      </div>
    </div>
  );
}
