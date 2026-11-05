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
        <div className="mb-4 p-3 rounded-lg bg-error-soft border border-error-border text-error text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apt-title" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
            Appointment Title <span className="text-error">*</span>
          </label>
          <input
            id="apt-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Annual Cardiology Review, Dental Cleaning"
            className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all bg-surface hover:border-sage-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="apt-provider" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
              Doctor or Clinic Name <span className="text-secondary-text font-normal lowercase">(optional)</span>
            </label>
            <input
              id="apt-provider"
              type="text"
              value={formData.providerName}
              onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
              placeholder="e.g., Dr. Sarah Hosten"
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all bg-surface hover:border-sage-300"
            />
          </div>

          <div>
            <label htmlFor="apt-date" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
              Date & Time <span className="text-secondary-text font-normal lowercase">(optional)</span>
            </label>
            <input
              id="apt-date"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all bg-surface hover:border-sage-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="apt-location" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
              Location / Room <span className="text-secondary-text font-normal lowercase">(optional)</span>
            </label>
            <input
              id="apt-location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Suite 204, Main Clinic"
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all bg-surface hover:border-sage-300"
            />
          </div>

          <div>
            <label htmlFor="apt-status" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
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
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all bg-surface hover:border-sage-300 cursor-pointer"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="apt-notes" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
            Preparation Notes <span className="text-secondary-text font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="apt-notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g., Fast 8 hours prior, bring current medication list and insurance card"
            className="w-full px-4 py-2.5 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all resize-none bg-surface hover:border-sage-300"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-main-text bg-surface border border-border rounded-2xl hover:bg-sage-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] rounded-2xl shadow-floating focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
