import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../Button';

interface RegistrationProps {
  eventId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function Registration({ eventId, onBack, onComplete }: RegistrationProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ticketType: 'standard',
    quantity: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-[#4A6CF7] hover:text-[#3a5ad6] mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Registration</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Type</label>
              <select
                name="ticketType"
                value={formData.ticketType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent"
              >
                <option value="standard">Standard - $50</option>
                <option value="vip">VIP - $100</option>
                <option value="premium">Premium - $150</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <select
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Complete Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
