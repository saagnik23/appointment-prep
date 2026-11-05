import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { AppointmentFormModal } from './AppointmentFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  CheckCircle2,
  HelpCircle,
  Pill,
  ArrowRight,
  Trash2,
  Edit2,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const AppointmentsListPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: { status?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await api.listAppointments(params);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, searchQuery]);

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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize questions, medications, and follow-ups for your doctor visits
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-100'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appointments..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4"
            >
              <div className="h-5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">No appointments found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search query or filter settings.'
              : 'Prepare for your upcoming doctor visit by adding an appointment. Record questions, your medication list, and follow-up items.'}
          </p>
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Appointment</span>
          </button>
        </div>
      ) : (
        /* Appointments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((apt) => {
            const formattedSchedule = formatDate(apt.scheduledAt);
            const statusColors = {
              upcoming: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              completed: 'bg-slate-100 text-slate-700 border-slate-200',
              cancelled: 'bg-red-50 text-red-700 border-red-200',
            }[apt.status] || 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                      <Link
                        to={`/appointments/${apt.id}`}
                        className="hover:text-brand-600 transition-colors"
                      >
                        {apt.title}
                      </Link>
                    </h2>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${statusColors}`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    {apt.providerName && (
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{apt.providerName}</span>
                      </div>
                    )}
                    {formattedSchedule && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{formattedSchedule}</span>
                      </div>
                    )}
                    {apt.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{apt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Preparation Indicators */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{apt.questionsCount ?? 0} Questions</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100">
                      <Pill className="w-3.5 h-3.5" />
                      <span>{apt.medicationsCount ?? 0} Meds</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{apt.followUpsCount ?? 0} Actions</span>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingAppointment(apt);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit appointment details"
                      aria-label="Edit appointment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingAppointmentId(apt.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete appointment"
                      aria-label="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/appointments/${apt.id}/checklist`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      title="View printable checklist"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-600" />
                      <span>Checklist</span>
                    </Link>
                    <Link
                      to={`/appointments/${apt.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      <span>Prepare</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
