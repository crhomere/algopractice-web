'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="flex space-x-4">
        <Link 
          href="/login" 
          className="bg-gray-700 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700"
        >
          Register
        </Link>
      </div>
    );
  }

  const getInitials = (username: string, name?: string) => {
    if (name) {
      return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {getInitials(user.username, user.name)}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
            <div className="font-medium">{user.username}</div>
            {user.name && <div className="text-xs text-gray-400">{user.name}</div>}
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}