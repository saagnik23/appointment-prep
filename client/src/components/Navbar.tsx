import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="no-print bg-surface border-b border-border sticky top-0 z-30 shadow-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-3 text-primary hover:text-primary-hover transition-colors focus-visible:rounded"
        >
          <div className="bg-primary-soft p-2 rounded-lg text-primary border border-border">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-main-text block leading-tight">
              Appointment Prep
            </span>
            <span className="text-xs text-secondary-text font-medium hidden sm:block">
              Private Medical Visit Organizer
            </span>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs font-medium text-main-text bg-app px-3 py-1.5 rounded-lg border border-border">
              <UserIcon className="w-3.5 h-3.5 text-secondary-text" />
              <span className="max-w-[140px] truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-secondary-text hover:text-error hover:bg-error-soft rounded-lg transition-colors cursor-pointer"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
