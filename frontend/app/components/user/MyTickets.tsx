import React from 'react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '../Button';

export function MyTickets() {
  const tickets = [
    {
      id: '1',
      event: 'Tech Conference 2024',
      date: 'Dec 15, 2024',
      ticketNumber: 'TC2024-001',
      status: 'confirmed',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{ticket.event}</h3>
                <p className="text-gray-600">{ticket.date}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {ticket.status}
              </span>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Ticket Number</p>
              <p className="text-lg font-mono font-bold">{ticket.ticketNumber}</p>
            </div>

            <div className="flex space-x-3">
              <Button variant="primary" size="md" className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>View QR Code</span>
              </Button>
              <Button variant="secondary" size="md" className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
