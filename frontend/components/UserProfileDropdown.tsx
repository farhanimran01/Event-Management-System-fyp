'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User } from 'lucide-react';

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Force image reload when user picture changes
    if (user?.profileImage || user?.picture) {
      setImageKey(prev => prev + 1);
    }
  }, [user?.profileImage, user?.picture]);

  const handleLogout = () => {
    logout();
    router.push('/login/user');
  };

  if (!user) return null;

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const profileImage = user.profileImage || user.picture;
  const organizerLogo = (user as any).organizerLogo;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition text-white font-bold text-sm shadow-lg overflow-hidden"
        title={user.name}
      >
        {organizerLogo ? (
          <img
            key={imageKey}
            src={`${organizerLogo}?t=${Date.now()}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : profileImage ? (
          <img
            key={imageKey}
            src={`${profileImage}?t=${Date.now()}`}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* DropdoworganizerLogo ? (
                  <img
                    key={imageKey}
                    src={`${organizerLogo}?t=${Date.now()}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : n Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg overflow-hidden flex-shrink-0">
                {profileImage ? (
                  <img
                    key={imageKey}
                    src={`${profileImage}?t=${Date.now()}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <p className="text-xs text-cyan-300 mt-1 capitalize font-semibold">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push('/dashboard/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-white/10 hover:text-white transition text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                router.push('/dashboard/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-gray-300 hover:bg-white/10 hover:text-white transition text-sm"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
