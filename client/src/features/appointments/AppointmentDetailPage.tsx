import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { QuestionsSection } from '../questions/QuestionsSection';
import { MedicationsSection } from '../medications/MedicationsSection';
import { FollowUpsSection } from '../follow-ups/FollowUpsSection';
import { AppointmentFormModal } from './AppointmentFormModal';
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  FileText,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'medications' | 'followUps'>('all');

  const fetchAppointment = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getAppointment(id);
      setAppointment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleUpdateAppointment = async (data: Partial<Appointment>) => {
    if (!id) return;
    await api.updateAppointment(id, data);
    await fetchAppointment();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-32 bg-white rounded-2xl border border-slate-200 p-6"></div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Appointment Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This appointment does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Appointments</span>
        </button>
      </div>
    );
  }

  const formattedDate = formatDate(appointment.scheduledAt);
  const statusColors = {
    upcoming: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }[appointment.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Appointments</span>
        </Link>

        <Link
          to={`/appointments/${appointment.id}/checklist`}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Checklist</span>
        </Link>
      </div>

      {/* Appointment Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {appointment.title}
              </h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${statusColors}`}>
                {appointment.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 mt-2">
              {appointment.providerName && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">{appointment.providerName}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {appointment.location && (
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Details</span>
          </button>
        </div>

        {appointment.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl">
            <span className="font-semibold text-slate-700 block mb-0.5">Preparation Notes:</span>
            <p className="whitespace-pre-line leading-relaxed">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Preparation Sections' },
          { id: 'questions', label: `Questions (${appointment.questions?.length ?? 0})` },
          { id: 'medications', label: `Medications (${appointment.medications?.length ?? 0})` },
          { id: 'followUps', label: `Follow-ups (${appointment.followUps?.length ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'questions') && (
          <QuestionsSection
            appointmentId={appointment.id}
            questions={appointment.questions || []}
            onRefresh={fetchAppointment}
          />
        )}

        {(activeTab === 'all' || activeTab === 'medications') && (
          <MedicationsSection
            appointmentId={appointment.id}
            medications={appointment.medications || []}
            onRefresh={fetchAppointment}
          />
        )}

        {(activeTab === 'all' || activeTab === 'followUps') && (
          <FollowUpsSection
            appointmentId={appointment.id}
            followUps={appointment.followUps || []}
            onRefresh={fetchAppointment}
          />
        )}
      </div>

      {/* Edit Appointment Modal */}
      <AppointmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateAppointment}
        initialData={appointment}
        title="Edit Appointment Details"
      />
    </div>
  );
};
