import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Appointment } from '../../types';
import { AlertCircle } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  initialData?: Appointment | null;
  title: string;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    providerName: '',
    scheduledAt: '',
    location: '',
    notes: '',
    status: 'upcoming' as 'upcoming' | 'completed' | 'cancelled',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Format scheduledAt to YYYY-MM-DDTHH:mm for datetime-local input
      let formattedDate = '';
      if (initialData.scheduledAt) {
        const d = new Date(initialData.scheduledAt);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().slice(0, 16);
        }
      }

      setFormData({
        title: initialData.title || '',
        providerName: initialData.providerName || '',
        scheduledAt: formattedDate,
        location: initialData.location || '',
        notes: initialData.notes || '',
        status: initialData.status || 'upcoming',
      });
    } else {
      setFormData({
        title: '',
        providerName: '',
        scheduledAt: '',
        location: '',
        notes: '',
        status: 'upcoming',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Appointment title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: formData.title.trim(),
        providerName: formData.providerName.trim(),
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save appointment. Please check the fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-xl">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apt-title" className="block text-sm font-semibold text-slate-700 mb-1">
            Appointment Title <span className="text-red-500">*</span>
          </label>
          <input
            id="apt-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Annual Cardiology Review, Dental Cleaning"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="apt-provider" className="block text-sm font-semibold text-slate-700 mb-1">
              Doctor or Clinic Name <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="apt-provider"
              type="text"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              placeholder="e.g., Dr. Sarah Smith"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
            />
          </div>

          <div>
            <label htmlFor="apt-date" className="block text-sm font-semibold text-slate-700 mb-1">
              Date & Time <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="apt-date"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="apt-location" className="block text-sm font-semibold text-slate-700 mb-1">
              Location / Room <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="apt-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Memorial Hospital, Suite 400"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all"
            />
          </div>

          <div>
            <label htmlFor="apt-status" className="block text-sm font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              id="apt-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'upcoming' | 'completed' | 'cancelled',
                })
              }
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all bg-white"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="apt-notes" className="block text-sm font-semibold text-slate-700 mb-1">
            General Preparation Notes <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="apt-notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g., Fasting 8 hours before appointment, bring insurance card and prior scans"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
