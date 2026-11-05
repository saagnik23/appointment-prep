import React, { useState } from 'react';
import { FollowUp } from '../../types';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface FollowUpsSectionProps {
  appointmentId: string;
  followUps: FollowUp[];
  onRefresh: () => Promise<void>;
}

export const FollowUpsSection: React.FC<FollowUpsSectionProps> = ({
  appointmentId,
  followUps,
  onRefresh,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      setError(null);
      await api.addFollowUp(appointmentId, {
        text: newText.trim(),
        dueAt: newDueDate ? new Date(newDueDate).toISOString() : null,
      });
      setNewText('');
      setNewDueDate('');
      setIsAdding(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add follow-up action');
    }
  };

  const handleToggleStatus = async (item: FollowUp) => {
    try {
      const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
      await api.updateFollowUp(appointmentId, item.id, {
        status: nextStatus,
      });
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update follow-up status');
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await api.updateFollowUp(appointmentId, id, {
        text: editText.trim(),
        dueAt: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      setEditingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update follow-up action');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteFollowUp(appointmentId, deletingId);
      setDeletingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete follow-up action');
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-sage-50 text-primary rounded-2xl flex items-center justify-center border border-sage-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-main-text tracking-tight">Follow-up Actions & To-Dos</h2>
          </div>
          <p className="text-xs text-secondary-text mt-1">
            Track lab tests to schedule, referrals, lifestyle notes, or upcoming re-checks.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-primary bg-sage-50 hover:bg-sage-100 rounded-2xl transition-all cursor-pointer self-start sm:self-auto border border-border shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action Item</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-error-soft border border-error-border text-error text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-6 p-6 rounded-3xl bg-sage-50/50 border border-border space-y-4"
        >
          <div>
            <label htmlFor="followup-text" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
              Action or Reminder <span className="text-error">*</span>
            </label>
            <input
              id="followup-text"
              type="text"
              autoFocus
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g., Schedule fasting lipid panel blood test, Call for MRI results"
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
            />
          </div>

          <div>
            <label htmlFor="followup-due" className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5">
              Target Due Date <span className="text-xs text-secondary-text font-normal lowercase">(optional)</span>
            </label>
            <input
              id="followup-due"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewText('');
                setNewDueDate('');
              }}
              className="px-4 py-2 text-xs font-semibold text-secondary-text hover:bg-neutral-100 rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newText.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] rounded-2xl shadow-floating disabled:opacity-50 transition-all cursor-pointer"
            >
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {followUps.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl bg-app/50">
          <p className="text-sm font-medium text-main-text mb-1">No follow-up items recorded</p>
          <p className="text-xs text-secondary-text max-w-sm mx-auto mb-4">
            After or before your visit, add any follow-up tests, referrals, or tasks you need to complete.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-primary bg-white border border-border rounded-xl hover:bg-primary-soft/50 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Follow-up Item</span>
          </button>
        </div>
      ) : (
        /* Follow-ups List */
        <ul className="space-y-2.5">
          {followUps.map((item) => {
            const isEditing = editingId === item.id;
            const formattedDue = formatDate(item.dueAt);

            return (
              <li
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  item.status === 'completed'
                    ? 'bg-neutral-50 border-border text-secondary-text'
                    : 'bg-white border-border text-main-text hover:border-primary/40'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="mt-0.5 text-secondary-text hover:text-primary transition-colors flex-shrink-0 cursor-pointer"
                    title={item.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-border hover:text-primary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-main-text"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="p-1.5 text-xs rounded-xl border border-border text-main-text"
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 text-success hover:bg-success-soft rounded-lg transition-colors cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-secondary-text hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-sm leading-relaxed ${
                            item.status === 'completed'
                              ? 'line-through text-secondary-text/70'
                              : 'text-main-text'
                          }`}
                        >
                          {item.text}
                        </p>
                        {formattedDue && (
                          <div className="inline-flex items-center space-x-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-soft text-warning border border-warning-border">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>Due: {formattedDue}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditText(item.text);
                        setEditDueDate(item.dueAt ? item.dueAt.slice(0, 10) : '');
                      }}
                      className="p-1.5 text-secondary-text hover:text-main-text hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit follow-up"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1.5 text-secondary-text hover:text-error hover:bg-error-soft rounded-lg transition-colors cursor-pointer"
                      title="Delete follow-up"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Follow-up Action"
        message="Are you sure you want to remove this follow-up action?"
        confirmLabel="Delete"
      />
    </div>
  );
};

