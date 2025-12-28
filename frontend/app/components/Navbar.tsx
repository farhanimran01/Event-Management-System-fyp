import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 lg:flex hidden" />

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <User className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </nav>
  );
}
