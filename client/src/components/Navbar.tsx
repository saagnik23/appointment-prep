import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-3 text-brand-700 hover:text-brand-800 transition-colors focus-visible:rounded"
        >
          <div className="bg-brand-50 p-2 rounded-lg text-brand-600 border border-brand-100">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              Appointment Prep
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              Private Medical Visit Organizer
            </span>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium max-w-[140px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign out of your account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
