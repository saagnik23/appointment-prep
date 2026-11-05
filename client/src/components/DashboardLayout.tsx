import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  HelpCircle,
  Pill,
  CheckSquare,
  LogOut,
  Calendar,
  Bell,
  Search,
  Activity,
  Plus,
  Menu,
  X,
  User,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onOpenCreateModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutGrid,
      active: location.pathname === '/' || location.pathname.startsWith('/appointments'),
    },
    {
      to: '/',
      label: 'Questions',
      icon: HelpCircle,
      active: false,
    },
    {
      to: '/',
      label: 'Medications',
      icon: Pill,
      active: false,
    },
    {
      to: '/',
      label: 'Follow-ups',
      icon: CheckSquare,
      active: false,
    },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-app flex overflow-x-hidden font-sans">
      {/* 1. Desktop Vertical Sage Green Sidebar (Image 1 style) */}
      <aside className="hidden lg:flex w-20 bg-sidebar flex-col items-center justify-between py-6 px-3 flex-shrink-0 z-30 select-none shadow-subtle">
        {/* Top: Logo Icon in soft rounded pill */}
        <div className="flex flex-col items-center space-y-8 w-full">
          <Link
            to="/"
            className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all shadow-subtle cursor-pointer group"
            title="Appointment Prep Dashboard"
          >
            <Activity className="w-6 h-6 stroke-[2.5] group-hover:scale-110 transition-transform" />
          </Link>

          {/* Nav Icons */}
          <nav className="flex flex-col items-center space-y-4 w-full">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.to}
                  title={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    item.active
                      ? 'bg-white text-sidebar shadow-card font-bold scale-105'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User avatar & Logout icon */}
        <div className="flex flex-col items-center space-y-4 w-full pt-4 border-t border-white/20">
          <div
            className="w-10 h-10 rounded-full bg-white/25 border-2 border-white/40 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-default"
            title={user?.name || user?.email}
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
          </div>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar & Drawer Toggle */}
      <div className="lg:hidden fixed top-0 inset-x-0 bg-sidebar text-white z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight">Appointment Prep</span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
              title="New Appointment"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-white hover:bg-white/20"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-14 inset-x-0 bg-surface border-b border-border p-4 z-40 shadow-elevated space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2 text-xs text-main-text font-semibold">
              <User className="w-4 h-4 text-primary" />
              <span>{user?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-error font-semibold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-main-text hover:bg-sage-50"
            >
              Dashboard / Appointments
            </Link>
          </nav>
        </div>
      )}

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        {/* Top Search & Date Utility Bar (Image 1 style) */}
        <header className="px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 bg-transparent">
          {/* Rounded-full Search Pill */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search appointments, doctors, notes..."
              className="w-full pl-5 pr-11 py-2.5 rounded-full bg-surface border border-border/80 text-xs text-main-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-subtle transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-secondary-text">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Right Header: Date + Notification + Quick Action */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Date Display (from Image 1) */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-secondary-text bg-surface px-4 py-2 rounded-full border border-border shadow-subtle">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Notification Bell */}
            <div className="w-9 h-9 rounded-full bg-surface border border-border shadow-subtle flex items-center justify-center text-secondary-text hover:text-main-text transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-primary absolute top-2 right-2 ring-2 ring-white" />
            </div>

            {/* Top Quick Create Button */}
            {onOpenCreateModal && (
              <button
                onClick={onOpenCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] shadow-floating transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </button>
            )}
          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 px-4 sm:px-8 py-6">{children}</main>
      </div>
    </div>
  );
};
