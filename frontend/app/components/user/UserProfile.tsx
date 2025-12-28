import React, { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../Button';

interface UserProfileProps {
  onLogout: () => void;
}

export function UserProfile({ onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
          <div className="w-20 h-20 bg-[#4A6CF7] rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
            <p className="text-gray-600">Premium Member</p>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <p className="text-gray-900 font-semibold">john@example.com</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </label>
            <p className="text-gray-900 font-semibold">+1 (555) 123-4567</p>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </label>
            <p className="text-gray-900 font-semibold">New York, USA</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button variant="primary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save' : 'Edit Profile'}
          </Button>
          <Button variant="danger" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
