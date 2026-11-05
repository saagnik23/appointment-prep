import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ChecklistData } from '../../types';
import {
  ArrowLeft,
  Printer,
  Clock,
  MapPin,
  User,
  Square,
  HelpCircle,
  Pill,
  CheckSquare,
  AlertCircle,
  PenTool,
} from 'lucide-react';

export const ChecklistPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChecklist() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getChecklist(id);
        setChecklist(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load checklist');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChecklist();
  }, [id]);

  const handlePrint = () => {
    window.print();
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
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-48 bg-white rounded-2xl border border-slate-200"></div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Checklist Not Available</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Unable to retrieve checklist for this appointment.'}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Appointments</span>
        </Link>
      </div>
    );
  }

  const { appointment, sections, notesArea, disclaimer } = checklist;
  const questionsSection = sections.find((s) => s.id === 'questions');
  const medicationsSection = sections.find((s) => s.id === 'medications');
  const followUpsSection = sections.find((s) => s.id === 'follow_ups');

  const formattedDate = formatDate(appointment.scheduledAt);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between gap-4 mb-6">
        <Link
          to={`/appointments/${appointment.id}`}
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Appointment Editor</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="print-container bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-slate-900 space-y-8">
        {/* Header Block */}
        <div className="border-b-2 border-slate-900 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
                Appointment Preparation Checklist
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {appointment.title}
              </h1>
            </div>
            <div className="text-right text-xs text-slate-400">
              Printed: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs text-slate-700">
            {appointment.providerName && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">Provider:</strong> {appointment.providerName}
                </span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">Date:</strong> {formattedDate}
                </span>
              </div>
            )}
            {appointment.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  <strong className="text-slate-900">Location:</strong> {appointment.location}
                </span>
              </div>
            )}
          </div>

          {appointment.notes && (
            <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <strong className="text-slate-900">Preparation Reminder:</strong> {appointment.notes}
            </div>
          )}
        </div>

        {/* Section 1: Questions to Ask */}
        <section className="avoid-break space-y-3">
          <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Questions to Ask
            </h2>
          </div>

          {questionsSection && questionsSection.items.length > 0 ? (
            <ul className="space-y-2">
              {questionsSection.items.map((q: any) => (
                <li
                  key={q.id}
                  className="flex items-start space-x-3 text-xs sm:text-sm text-slate-800"
                >
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{q.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No questions recorded for this appointment.</p>
          )}
        </section>

        {/* Section 2: Medication List */}
        <section className="avoid-break space-y-3">
          <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
            <Pill className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Medication List (Self-Reported by Patient)
            </h2>
          </div>

          {medicationsSection && medicationsSection.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Medication Name</th>
                    <th className="py-2 px-3">Dose / Strength</th>
                    <th className="py-2 px-3">Frequency / Schedule</th>
                    <th className="py-2 px-3">Patient Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicationsSection.items.map((m: any) => (
                    <tr key={m.id} className="text-slate-800">
                      <td className="py-2 px-3 font-semibold text-slate-900">{m.name}</td>
                      <td className="py-2 px-3">{m.dose || '—'}</td>
                      <td className="py-2 px-3">{m.frequency || '—'}</td>
                      <td className="py-2 px-3 text-slate-600">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No medications recorded.</p>
          )}
        </section>

        {/* Section 3: Follow-up Actions and Notes */}
        <section className="avoid-break space-y-3">
          <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Follow-up Actions & Reminders
            </h2>
          </div>

          {followUpsSection && followUpsSection.items.length > 0 ? (
            <ul className="space-y-2">
              {followUpsSection.items.map((f: any) => (
                <li
                  key={f.id}
                  className="flex items-start space-x-3 text-xs sm:text-sm text-slate-800"
                >
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{f.text}</span>
                    {f.dueAt && (
                      <span className="text-xs text-amber-700 font-medium ml-2">
                        (Target: {new Date(f.dueAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No follow-up actions recorded.</p>
          )}
        </section>

        {/* Section 4: Blank Notes Area for the Appointment Visit (FR-06) */}
        {notesArea && (
          <section className="avoid-break space-y-3 pt-2">
            <div className="flex items-center space-x-2 pb-1 border-b border-slate-200">
              <PenTool className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                4. Visit Notes & Doctor Recommendations (Write during appointment)
              </h2>
            </div>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/30 min-h-[140px] space-y-6">
              <div className="border-b border-slate-200 pb-4 text-xs text-slate-400">
                Doctor's advice / discussion points:
              </div>
              <div className="border-b border-slate-200 pb-4"></div>
              <div className="border-b border-slate-200 pb-4"></div>
              <div className="border-b border-slate-200 pb-4"></div>
            </div>
          </section>
        )}

        {/* Disclaimer (Mandatory per PRD Non-Goals) */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 leading-tight">
          <p>{disclaimer}</p>
        </div>
      </div>
    </div>
  );
};
