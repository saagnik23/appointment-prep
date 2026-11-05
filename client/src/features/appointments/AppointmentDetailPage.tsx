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
        <div className="h-6 bg-border/60 rounded-xl w-1/4"></div>
        <div className="h-32 bg-white rounded-2xl border border-border p-6"></div>
        <div className="h-64 bg-white rounded-2xl border border-border"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-border text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
        <h2 className="text-lg font-bold text-main-text mb-1">Appointment Not Found</h2>
        <p className="text-sm text-secondary-text mb-6">{error || 'This appointment does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Appointments</span>
        </button>
      </div>
    );
  }

  const formattedDate = formatDate(appointment.scheduledAt);
  const statusColors = {
    upcoming: 'bg-primary-soft text-primary border-primary/20',
    completed: 'bg-neutral-100 text-secondary-text border-border',
    cancelled: 'bg-error-soft text-error border-error-border',
  }[appointment.status] || 'bg-neutral-100 text-secondary-text border-border';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Navigation Breadcrumb & Generate Checklist CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-secondary-text hover:text-primary transition-colors bg-surface px-4 py-2 rounded-full border border-border shadow-subtle w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <Link
          to={`/appointments/${appointment.id}/checklist`}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] text-white text-xs font-bold rounded-2xl shadow-floating transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Printable Checklist</span>
        </Link>
      </div>

      {/* Appointment Hero Banner */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-main-text tracking-tight">
                {appointment.title}
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusColors}`}>
                {appointment.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-secondary-text mt-3">
              {appointment.providerName && (
                <div className="flex items-center space-x-1.5 bg-sage-50 px-3 py-1 rounded-full border border-border">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold text-main-text">{appointment.providerName}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center space-x-1.5 bg-sage-50 px-3 py-1 rounded-full border border-border">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-main-text">{formattedDate}</span>
                </div>
              )}
              {appointment.location && (
                <div className="flex items-center space-x-1.5 bg-sage-50 px-3 py-1 rounded-full border border-border">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-main-text">{appointment.location}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-main-text bg-sage-50 hover:bg-sage-100 border border-border rounded-2xl transition-colors cursor-pointer self-start"
          >
            <Edit2 className="w-3.5 h-3.5 text-secondary-text" />
            <span>Edit Details</span>
          </button>
        </div>

        {appointment.notes && (
          <div className="mt-5 pt-4 border-t border-border text-xs text-secondary-text bg-app/60 p-4 rounded-2xl border border-border/80">
            <span className="font-bold text-main-text block mb-1">Preparation Reminders & Notes:</span>
            <p className="whitespace-pre-line leading-relaxed text-main-text/90">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-2xl border border-border shadow-subtle overflow-x-auto">
        {[
          { id: 'all', label: 'All Preparation Sections' },
          { id: 'questions', label: `Questions to Ask (${appointment.questions?.length ?? 0})` },
          { id: 'medications', label: `Medications (${appointment.medications?.length ?? 0})` },
          { id: 'followUps', label: `Follow-up Actions (${appointment.followUps?.length ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary-text hover:text-main-text hover:bg-sage-50'
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
