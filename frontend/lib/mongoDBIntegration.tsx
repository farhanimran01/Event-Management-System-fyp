import React, { useState } from 'react';
import { Button } from '@/app/components/Button';

/**
 * Example integration file showing how to use MongoDB APIs in React components
 * This demonstrates API calls to the backend MongoDB endpoints
 */

// ============= API Service Functions =============

export const apiService = {
  // User endpoints
  async getUsers() {
    const res = await fetch('/api/users');
    return res.json();
  },

  async getUserById(id: string) {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    location?: string;
  }) {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async updateUser(id: string, userData: any) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Event endpoints
  async getEvents() {
    const res = await fetch('/api/events');
    return res.json();
  },

  async getEventById(id: string) {
    const res = await fetch(`/api/events/${id}`);
    return res.json();
  },

  async createEvent(eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    organizer: string;
    capacity: number;
    ticketTypes: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  }) {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  async updateEvent(id: string, eventData: any) {
    const res = await fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return res.json();
  },

  async deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Ticket endpoints
  async getTickets() {
    const res = await fetch('/api/tickets');
    return res.json();
  },

  async createTicket(ticketData: {
    eventId: string;
    userId: string;
    ticketType: string;
    price: number;
  }) {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return res.json();
  },

  // Registration endpoints
  async getRegistrations() {
    const res = await fetch('/api/registrations');
    return res.json();
  },

  async createRegistration(registrationData: {
    eventId: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    ticketType: string;
    quantity: number;
    totalPrice: number;
  }) {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    return res.json();
  },
};

// ============= Example React Component =============

export function MongoDBIntegrationExample() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getEvents();

      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const newEvent = {
        title: 'Sample Event',
        description: 'This is a sample event',
        date: new Date().toISOString(),
        time: '10:00 AM',
        location: 'Event Location',
        category: 'Technology',
        organizer: 'My Organization',
        capacity: 100,
        ticketTypes: [
          { name: 'Standard', price: 50, quantity: 100 },
        ],
      };

      const result = await apiService.createEvent(newEvent);

      if (result.success) {
        alert('Event created successfully!');
        loadEvents();
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">MongoDB Integration Example</h1>

      <div className="space-y-4 mb-8">
        <Button
          variant="primary"
          size="lg"
          onClick={loadEvents}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Events'}
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleCreateEvent}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Sample Event'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {events.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Events ({events.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event._id} className="p-6">
                <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {event.capacity}
                  </p>
                  <p>
                    <strong>Category:</strong> {event.category}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {event.organizer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && !loading && !error && (
        <div className="text-center text-gray-500 py-8">
          No events yet. Click "Load Events" to fetch from database.
        </div>
      )}
    </div>
  );
}

// ============= Custom Hook for API Calls =============

/**
 * Custom hook for simplified API interactions
 */
export function useApi<T>(
  initialData: T
): {
  data: T;
  loading: boolean;
  error: string | null;
  call: (fn: () => Promise<any>) => Promise<any>;
} {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (fn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fn();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'An error occurred');
      }
      return result;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, call };
}

// ============= Usage Example of Custom Hook =============

export function EventListWithHook() {
  const { data: events, loading, error, call } = useApi<any[]>([]);

  const loadEvents = () => {
    call(() => apiService.getEvents());
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      <Button onClick={loadEvents} disabled={loading}>
        {loading ? 'Loading...' : 'Load Events'}
      </Button>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      <div className="mt-6 grid gap-4">
        {events.map((event) => (
          <div key={event._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg">{event.title}</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
