import React, { useState } from 'react';
import { Medication } from '../../types';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Plus,
  Pill,
  Trash2,
  Edit2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface MedicationsSectionProps {
  appointmentId: string;
  medications: Medication[];
  onRefresh: () => Promise<void>;
}

export const MedicationsSection: React.FC<MedicationsSectionProps> = ({
  appointmentId,
  medications,
  onRefresh,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDose, setFormDose] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openAddForm = () => {
    setEditingMedication(null);
    setFormName('');
    setFormDose('');
    setFormFrequency('');
    setFormNotes('');
    setError(null);
    setIsAdding(true);
  };

  const openEditForm = (med: Medication) => {
    setEditingMedication(med);
    setFormName(med.name || '');
    setFormDose(med.dose || '');
    setFormFrequency(med.frequency || '');
    setFormNotes(med.notes || '');
    setError(null);
    setIsAdding(true);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingMedication(null);
    setFormName('');
    setFormDose('');
    setFormFrequency('');
    setFormNotes('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Medication name is required.');
      return;
    }

    try {
      setError(null);
      if (editingMedication) {
        await api.updateMedication(appointmentId, editingMedication.id, {
          name: formName.trim(),
          dose: formDose.trim(),
          frequency: formFrequency.trim(),
          notes: formNotes.trim(),
        });
      } else {
        await api.addMedication(appointmentId, {
          name: formName.trim(),
          dose: formDose.trim(),
          frequency: formFrequency.trim(),
          notes: formNotes.trim(),
          order: medications.length,
        });
      }
      closeForm();
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save medication entry');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteMedication(appointmentId, deletingId);
      setDeletingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete medication entry');
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-sage-50 text-primary rounded-2xl flex items-center justify-center border border-sage-200">
              <Pill className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-main-text tracking-tight">Medication List (Self-Reported)</h2>
          </div>
          <p className="text-xs text-secondary-text mt-1">
            Record current prescriptions, vitamins, or supplements you are taking so your doctor has an accurate picture.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-primary bg-sage-50 hover:bg-sage-100 rounded-2xl transition-all cursor-pointer self-start sm:self-auto border border-border shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-error-soft border border-error-border text-error text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Medication Entry / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-6 rounded-3xl bg-sage-50/50 border border-border space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-bold text-main-text uppercase tracking-wider">
              {editingMedication ? 'Edit Medication' : 'Add Medication Entry'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-name" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
                Medication or Supplement Name <span className="text-error">*</span>
              </label>
              <input
                id="med-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Metformin, Lisinopril, Vitamin D3"
                className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
              />
            </div>

            <div>
              <label htmlFor="med-dose" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
                Dose or Strength <span className="text-xs text-secondary-text font-normal lowercase">(optional)</span>
              </label>
              <input
                id="med-dose"
                type="text"
                value={formDose}
                onChange={(e) => setFormDose(e.target.value)}
                placeholder="e.g., 500 mg, 10 mcg, 1 tablet"
                className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-frequency" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
                Frequency or Schedule <span className="text-xs text-secondary-text font-normal lowercase">(optional)</span>
              </label>
              <input
                id="med-frequency"
                type="text"
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                placeholder="e.g., Twice daily with meals, As needed"
                className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
              />
            </div>

            <div>
              <label htmlFor="med-notes" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
                Notes / Instructions <span className="text-xs text-secondary-text font-normal lowercase">(optional)</span>
              </label>
              <input
                id="med-notes"
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g., Started 2 weeks ago, causes mild upset"
                className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
            <span className="text-xs text-secondary-text flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Preserves exactly what you enter. Never modified automatically.</span>
            </span>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-neutral-100 rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formName.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] rounded-2xl shadow-floating disabled:opacity-50 transition-all cursor-pointer"
              >
                {editingMedication ? 'Update Medication' : 'Save Medication'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Empty State */}
      {medications.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl bg-app/50">
          <p className="text-sm font-medium text-main-text mb-1">No medications recorded</p>
          <p className="text-xs text-secondary-text max-w-sm mx-auto mb-4">
            Listing your medications helps prevent unintentional double-prescriptions and gives your provider the full context.
          </p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-primary bg-white border border-border rounded-xl hover:bg-primary-soft/50 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication Entry</span>
          </button>
        </div>
      ) : (
        /* Medications Grid / Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {medications.map((med) => (
            <div
              key={med.id}
              className="p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-main-text">{med.name}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(med)}
                      className="p-1.5 text-secondary-text hover:text-main-text hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit medication"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(med.id)}
                      className="p-1.5 text-secondary-text hover:text-error hover:bg-error-soft rounded-lg transition-colors cursor-pointer"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-secondary-text">
                  {med.dose && (
                    <div>
                      <span className="font-semibold text-main-text">Dose:</span> {med.dose}
                    </div>
                  )}
                  {med.frequency && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-secondary-text/80 flex-shrink-0" />
                      <span>{med.frequency}</span>
                    </div>
                  )}
                  {med.notes && (
                    <div className="pt-2 text-secondary-text italic border-t border-border mt-2">
                      "{med.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Medication Entry"
        message="Are you sure you want to remove this medication from your appointment list?"
        confirmLabel="Delete"
      />
    </div>
  );
};

