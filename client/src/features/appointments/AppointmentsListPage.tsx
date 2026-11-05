import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { AppointmentFormModal } from './AppointmentFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Calendar,
  MapPin,
  HelpCircle,
  Pill,
  ArrowRight,
  Trash2,
  Edit2,
  FileText,
  AlertCircle,
  MoreVertical,
  Send,
  Sparkles,
  Ban,
  RotateCcw,
} from 'lucide-react';

interface AppointmentsListPageProps {
  searchQuery?: string;
  onOpenCreate?: () => void;
}

export const AppointmentsListPage: React.FC<AppointmentsListPageProps> = ({
  searchQuery: externalSearchQuery,
  onOpenCreate: externalOpenCreate,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const activeSearch = externalSearchQuery || '';

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Support Chat / Preparation Assistant State
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'What questions should I ask?',
    'What should I bring to visit?',
    'How to list my medications?',
  ]);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>(() => [
    {
      sender: 'assistant',
      text: "Hello! I'm your Visit Prep Assistant. How can I help you prepare for your appointments today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.listAppointments();
      setAllAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateOrUpdate = async (data: Partial<Appointment>) => {
    if (editingAppointment) {
      await api.updateAppointment(editingAppointment.id, data);
    } else {
      await api.createAppointment(data);
    }
    await fetchAppointments();
  };

  const handleDelete = async () => {
    if (!deletingAppointmentId) return;
    try {
      await api.deleteAppointment(deletingAppointmentId);
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete appointment');
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const handleToggleStatus = async (apt: Appointment) => {
    const nextStatus = apt.status === 'completed' ? 'upcoming' : 'completed';
    try {
      await api.updateAppointment(apt.id, { status: nextStatus });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment status');
    }
  };

  const handleSetStatus = async (apt: Appointment, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    try {
      await api.updateAppointment(apt.id, { status: newStatus });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || `Failed to update status to ${newStatus}`);
    }
  };

  const sendPrompt = async (textToSend: string) => {
    const userText = textToSend.trim();
    if (!userText || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: userTime },
    ]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await api.sendAssistantMessage(userText);
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: res.reply, time: assistantTime },
      ]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestions(res.suggestions);
      }
    } catch {
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not connect to the assistant right now. Please try again or check your questions list.',
          time: assistantTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(chatInput);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return 'Anytime';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Anytime';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Metrics calculations across all user visits
  const totalVisits = allAppointments.length;
  const upcomingCount = allAppointments.filter((a) => a.status === 'upcoming').length;
  const completedCount = allAppointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = allAppointments.filter((a) => a.status === 'cancelled').length;
  const totalQuestions = allAppointments.reduce((sum, a) => sum + (a.questionsCount || 0), 0);
  const totalMeds = allAppointments.reduce((sum, a) => sum + (a.medicationsCount || 0), 0);

  // Real preparedness rate: percentage of visits that have user-recorded prep or are completed
  const preparedVisits = allAppointments.filter(
    (a) => (a.questionsCount || 0) > 0 || (a.medicationsCount || 0) > 0 || a.status === 'completed'
  ).length;
  const prepProgressRate = totalVisits > 0 ? Math.round((preparedVisits / totalVisits) * 100) : 0;

  // Filtered list for display below
  const displayedAppointments = allAppointments.filter((apt) => {
    const matchesStatus = statusFilter === 'all' ? true : apt.status === statusFilter;
    if (!matchesStatus) return false;

    if (!activeSearch.trim()) return true;
    const query = activeSearch.toLowerCase().trim();
    return (
      apt.title.toLowerCase().includes(query) ||
      (apt.providerName && apt.providerName.toLowerCase().includes(query)) ||
      (apt.location && apt.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Header Title & Date (from Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-main-text tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Organize questions, self-reported medications, and clinical checklists
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (externalOpenCreate) externalOpenCreate();
              else {
                setEditingAppointment(null);
                setIsCreateModalOpen(true);
              }
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] shadow-floating transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (3 Cards matching Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1: Circular Progress Ring ("784 Patients" style) */}
        <div className="md:col-span-4 bg-surface rounded-3xl p-6 border border-border shadow-card flex items-center justify-between">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-sage-100 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-primary stroke-current"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - prepProgressRate / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-main-text tracking-tight leading-none">
                {totalVisits}
              </span>
              <span className="text-[10px] text-secondary-text font-semibold uppercase mt-0.5">
                {totalVisits === 1 ? 'Visit' : 'Visits'}
              </span>
            </div>
          </div>

          <div className="pl-4 space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-secondary-text font-medium">Questions:</span>
              <span className="font-bold text-main-text">{totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-400" />
              <span className="text-secondary-text font-medium">Medications:</span>
              <span className="font-bold text-main-text">{totalMeds}</span>
            </div>
            <div className="pt-1 text-[11px] text-secondary-text font-medium">
              Prepared Rate: <strong className="text-primary">{prepProgressRate}%</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Stat Counters with Clear Upcoming, Completed & Cancelled Report */}
        <div className="md:col-span-3 bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-secondary-text block mb-1">
              Upcoming Visits
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-main-text tracking-tight">
                {upcomingCount}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-soft text-success">
                {upcomingCount > 0 ? `${upcomingCount} Scheduled` : 'None pending'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-2">
            <span className="text-xs font-semibold text-secondary-text block mb-1">
              Completed Visits
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-main-text tracking-tight">
                {completedCount}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-secondary-text">
                ✓ {completedCount} Done
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">
              Cancelled Visits
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm font-extrabold text-main-text">
                {cancelledCount}
              </span>
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                cancelledCount > 0 ? 'bg-error-soft text-error border border-error-border' : 'bg-app text-secondary-text border border-border'
              }`}>
                {cancelledCount > 0 ? 'Cancelled' : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Analytics Wave Chart */}
        <div className="md:col-span-5 bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-main-text">Readiness Analytics</span>
              <span className="text-[10px] text-secondary-text block">Visit preparedness</span>
            </div>
            <span className="text-[11px] font-semibold text-secondary-text bg-app px-2.5 py-1 rounded-full border border-border">
              {totalVisits} Total {totalVisits === 1 ? 'Visit' : 'Visits'}
            </span>
          </div>

          {/* SVG Smooth Wave Chart (matching Image 1 spline) */}
          <div className="relative h-20 w-full mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7FD38C" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7FD38C" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 65 Q 60 40 120 50 T 200 20 T 300 35 L 300 80 L 0 80 Z"
                fill="url(#curveGradient)"
              />
              <path
                d="M 0 65 Q 60 40 120 50 T 200 20 T 300 35"
                fill="none"
                stroke="#52B788"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="200" cy="20" r="4.5" fill="#52B788" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
            {/* Tooltip Pill */}
            <div className="absolute top-0 left-[62%] -translate-x-1/2 -translate-y-2 bg-main-text text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {prepProgressRate}% Ready
            </div>
          </div>

          {/* Status Breakdown Bar */}
          <div className="flex justify-between text-[10px] text-secondary-text font-semibold pt-2 border-t border-border">
            <span>{upcomingCount} Upcoming</span>
            <span>{completedCount} Completed</span>
            <span>{cancelledCount} Cancelled</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Content Grid (Left & Right Column like Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Appointments List & Events */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Tabs Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-main-text">Your Appointments</h2>
              <span className="text-xs text-secondary-text font-semibold bg-surface px-2.5 py-0.5 rounded-full border border-border">
                {displayedAppointments.length} {statusFilter === 'all' ? 'total' : statusFilter}
              </span>
            </div>

            {/* Filter Pills with real counts */}
            <div className="flex items-center space-x-1.5 bg-surface p-1 rounded-2xl border border-border shadow-subtle overflow-x-auto">
              {[
                { id: 'all', label: 'All', count: totalVisits },
                { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
                { id: 'completed', label: 'Completed', count: completedCount },
                { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    statusFilter === tab.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-secondary-text hover:bg-sage-50 hover:text-main-text'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      statusFilter === tab.id ? 'bg-white/25 text-white' : 'bg-app text-secondary-text'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-error-soft border border-error-border text-error text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface p-5 rounded-3xl border border-border animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-border/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-border/60 rounded w-1/3" />
                    <div className="h-3 bg-border/40 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedAppointments.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-surface rounded-3xl border border-dashed border-border shadow-subtle">
              <div className="w-14 h-14 bg-sage-50 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 border border-sage-200">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-main-text mb-1">
                {statusFilter !== 'all' ? `No ${statusFilter} appointments found` : 'No appointments found'}
              </h3>
              <p className="text-xs text-secondary-text max-w-sm mx-auto mb-6 leading-relaxed">
                {activeSearch
                  ? `No appointments found matching "${activeSearch}".`
                  : statusFilter !== 'all'
                  ? `You currently have 0 ${statusFilter} appointments recorded.`
                  : 'Start by adding an upcoming healthcare visit to record questions, medications, and generate a printable visit checklist.'}
              </p>
              {statusFilter !== 'all' ? (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-primary bg-sage-50 hover:bg-sage-100 border border-sage-200 transition-all cursor-pointer"
                >
                  <span>View All Appointments</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingAppointment(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] shadow-floating transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Appointment</span>
                </button>
              )}
            </div>
          ) : (
            /* Appointments List Cards */
            <div className="space-y-3">
              {displayedAppointments.map((apt) => {
                const timeString = formatTimeOnly(apt.scheduledAt);
                const fullDate = formatDate(apt.scheduledAt);
                const isMenuOpen = activeMenuId === apt.id;
                const isCancelled = apt.status === 'cancelled';

                return (
                  <div
                    key={apt.id}
                    className={`bg-surface rounded-3xl border p-5 shadow-card hover:shadow-elevated transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isCancelled ? 'border-error-border/60 bg-surface/70' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {/* Left: Time + Avatar + Details */}
                    <div className="flex items-start sm:items-center space-x-4 flex-1 min-w-0">
                      {/* Time pill */}
                      <div className="w-20 flex-shrink-0 text-left sm:text-center">
                        <span className={`text-xs font-extrabold block tracking-tight ${isCancelled ? 'line-through text-secondary-text' : 'text-main-text'}`}>
                          {timeString}
                        </span>
                        <span className="text-[10px] text-secondary-text font-medium block">
                          {fullDate ? fullDate.split(',')[0] : apt.status}
                        </span>
                      </div>

                      {/* Doctor / Provider Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-subtle border ${
                        isCancelled
                          ? 'bg-neutral-100 text-secondary-text border-border'
                          : 'bg-gradient-to-tr from-sage-100 to-sage-200 border-sage-300/60 text-primary'
                      }`}>
                        {apt.providerName ? apt.providerName.slice(0, 2).toUpperCase() : 'DR'}
                      </div>

                      {/* Appointment Title & Notes */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/appointments/${apt.id}`}
                            className={`text-sm font-bold transition-colors truncate block ${
                              isCancelled ? 'line-through text-secondary-text hover:text-main-text' : 'text-main-text hover:text-primary'
                            }`}
                          >
                            {apt.title}
                          </Link>
                          {apt.status === 'completed' && (
                            <span className="w-2 h-2 rounded-full bg-success flex-shrink-0" title="Completed" />
                          )}
                          {isCancelled && (
                            <span className="px-2 py-0.5 rounded-full bg-error-soft text-error text-[10px] font-bold border border-error-border flex-shrink-0">
                              Cancelled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary-text mt-1">
                          {apt.providerName && (
                            <span className="font-semibold text-main-text/80">{apt.providerName}</span>
                          )}
                          {apt.location && (
                            <span className="truncate flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-secondary-text/70" />
                              <span>{apt.location}</span>
                            </span>
                          )}
                        </div>

                        {/* Counts badges (Questions, Meds, Follow-ups) */}
                        <div className="flex items-center space-x-2 mt-2 text-[11px]">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sage-50 text-main-text font-medium border border-border">
                            <HelpCircle className="w-3 h-3 text-primary" />
                            <span>{apt.questionsCount ?? 0} questions</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sage-50 text-main-text font-medium border border-border">
                            <Pill className="w-3 h-3 text-primary" />
                            <span>{apt.medicationsCount ?? 0} meds</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Checklist Button */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0 relative">
                      {/* Status Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(apt)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          apt.status === 'completed' ? 'bg-primary' : 'bg-border'
                        }`}
                        title={apt.status === 'completed' ? 'Mark upcoming' : 'Mark completed'}
                      >
                        <span
                          className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                            apt.status === 'completed' ? 'left-4.5' : 'left-0.5'
                          }`}
                        />
                      </button>

                      {/* Direct Checklist Button */}
                      <Link
                        to={`/appointments/${apt.id}/checklist`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-main-text bg-sage-50 hover:bg-sage-100 border border-border transition-all cursor-pointer"
                        title="View & Print Checklist"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>Checklist</span>
                      </Link>

                      {/* Prepare Button with Chevron */}
                      <Link
                        to={`/appointments/${apt.id}`}
                        className="w-9 h-9 rounded-xl bg-primary-soft hover:bg-primary text-primary hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        title="Open appointment preparation editor"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {/* 3-dots Menu Button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : apt.id)}
                          className="w-8 h-8 rounded-xl hover:bg-app flex items-center justify-center text-secondary-text hover:text-main-text cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Floating dropdown */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-10 w-44 bg-surface rounded-2xl shadow-elevated border border-border p-1.5 z-20 space-y-1">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setEditingAppointment(apt);
                                setIsCreateModalOpen(true);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-main-text hover:bg-sage-50 rounded-xl transition-colors cursor-pointer text-left"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-secondary-text" />
                              <span>Edit Details</span>
                            </button>

                            {apt.status !== 'cancelled' ? (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleSetStatus(apt, 'cancelled');
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-warning hover:bg-warning-soft rounded-xl transition-colors cursor-pointer text-left"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Cancel Visit</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleSetStatus(apt, 'upcoming');
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-primary hover:bg-sage-50 rounded-xl transition-colors cursor-pointer text-left"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore to Upcoming</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeletingAppointmentId(apt.id);
                              }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-error hover:bg-error-soft rounded-xl transition-colors cursor-pointer text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): User Activity & Support Chat (from Image 1 right panel) */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Activity Today Card (Image 1 style) */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col items-center text-center relative">
            {/* User Avatar with circular dashed ring */}
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-sage-200 to-sage-100 flex items-center justify-center text-primary font-bold text-lg">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                </div>
              </div>
            </div>

            <span className="text-xs font-semibold text-secondary-text">Your activity today</span>
            <span className="text-4xl font-extrabold text-main-text tracking-tight my-1">
              {prepProgressRate}%
            </span>

            {/* Preparation Checklist Button (Fix: Functional button navigating to checklist) */}
            <div className="w-full pt-4 mt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  const targetApt =
                    allAppointments.find((a) => a.status === 'upcoming') || allAppointments[0];
                  if (targetApt) {
                    navigate(`/appointments/${targetApt.id}/checklist`);
                  } else {
                    setEditingAppointment(null);
                    setIsCreateModalOpen(true);
                  }
                }}
                className="w-full flex items-center justify-between text-xs font-bold text-main-text bg-app hover:bg-sage-100 hover:text-primary px-4 py-2.5 rounded-2xl border border-border transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-primary"
                title={
                  allAppointments.length > 0
                    ? 'Open preparation checklist for upcoming visit'
                    : 'Create an appointment to generate preparation checklist'
                }
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Preparation checklist</span>
                </div>
                <span className="w-6 h-6 rounded-full bg-primary group-hover:bg-primary-hover text-white flex items-center justify-center text-xs transition-colors shadow-xs">
                  ›
                </span>
              </button>
            </div>
          </div>

          {/* Support Chat / Preparation Helper (from Image 1 "Support Chat" card) */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-card flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-primary font-bold text-xs">
                    AP
                  </div>
                  <div>
                    <span className="text-xs font-bold text-main-text block leading-none">
                      Visit Prep Prompts
                    </span>
                    <span className="text-[10px] text-secondary-text">Personal reminders</span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>

              {/* Chat bubbles with auto-scroll */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#7FD38C] to-[#43B574] text-white rounded-tr-sm shadow-subtle'
                          : 'bg-app text-main-text rounded-tl-sm border border-border shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-secondary-text mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start animate-in fade-in">
                    <div className="bg-app text-secondary-text p-3 rounded-2xl rounded-tl-sm border border-border flex items-center space-x-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] text-secondary-text mt-1 px-1">
                      Prep Assistant is replying...
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            {suggestions.length > 0 && (
              <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendPrompt(sug)}
                    disabled={isTyping}
                    className="px-2.5 py-1 rounded-full bg-sage-50 hover:bg-sage-100 text-[10px] font-bold text-primary border border-sage-200 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-2 pt-3 border-t border-border flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isTyping}
                placeholder={isTyping ? 'Assistant is replying...' : 'Ask a question or type a note...'}
                className="flex-1 px-4 py-2.5 rounded-full bg-app border border-border text-xs text-main-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer flex-shrink-0 shadow-subtle"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Appointment Create/Edit Modal */}
      <AppointmentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingAppointment}
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!deletingAppointmentId}
        onClose={() => setDeletingAppointmentId(null)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone and will permanently remove all associated questions, medications, and follow-up items."
        confirmLabel="Delete Appointment"
      />
    </div>
  );
};
