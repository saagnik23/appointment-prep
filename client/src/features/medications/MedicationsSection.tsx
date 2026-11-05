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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Pill className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Medication List (Self-Reported)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record current prescriptions, vitamins, or supplements you are taking so your doctor has an accurate picture.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Medication Entry / Edit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              {editingMedication ? 'Edit Medication' : 'Add Medication Entry'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Medication or Supplement Name <span className="text-red-500">*</span>
              </label>
              <input
                id="med-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Metformin, Lisinopril, Vitamin D3"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="med-dose" className="block text-xs font-semibold text-slate-700 mb-1">
                Dose or Strength <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="med-dose"
                type="text"
                value={formDose}
                onChange={(e) => setFormDose(e.target.value)}
                placeholder="e.g., 500 mg, 10 mcg, 1 tablet"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="med-frequency" className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency or Schedule <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="med-frequency"
                type="text"
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                placeholder="e.g., Twice daily with meals, As needed"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="med-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Instructions <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="med-notes"
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g., Started 2 weeks ago, causes mild upset"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preserves exactly what you enter. Never modified automatically.</span>
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formName.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {editingMedication ? 'Update Medication' : 'Save Medication'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Empty State */}
      {medications.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-sm font-medium text-slate-600 mb-1">No medications recorded</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Listing your medications helps prevent unintentional double-prescriptions and gives your provider the full context.
          </p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 cursor-pointer"
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
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{med.name}</h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(med)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Edit medication"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(med.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  {med.dose && (
                    <div>
                      <span className="font-semibold text-slate-700">Dose:</span> {med.dose}
                    </div>
                  )}
                  {med.frequency && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{med.frequency}</span>
                    </div>
                  )}
                  {med.notes && (
                    <div className="pt-1 text-slate-500 italic border-t border-slate-100 mt-1">
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
