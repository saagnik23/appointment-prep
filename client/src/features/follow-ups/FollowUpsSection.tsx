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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Follow-up Actions & To-Dos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track lab tests to schedule, referrals, lifestyle notes, or upcoming re-checks.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action Item</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-6 p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3"
        >
          <div>
            <label htmlFor="followup-text" className="block text-xs font-semibold text-slate-700 mb-1">
              Action or Reminder <span className="text-red-500">*</span>
            </label>
            <input
              id="followup-text"
              type="text"
              autoFocus
              required
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g., Schedule fasting lipid panel blood test, Call for MRI results"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
          </div>

          <div>
            <label htmlFor="followup-due" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Due Date <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="followup-due"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-amber-100">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewText('');
                setNewDueDate('');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newText.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Save Action
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {followUps.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-sm font-medium text-slate-600 mb-1">No follow-up items recorded</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            After or before your visit, add any follow-up tests, referrals, or tasks you need to complete.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer"
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
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="mt-0.5 text-slate-400 hover:text-amber-600 transition-colors flex-shrink-0 cursor-pointer"
                    title={item.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-amber-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-1.5 text-sm rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            className="p-1 text-xs rounded border border-slate-300"
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
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
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {item.text}
                        </p>
                        {formattedDue && (
                          <div className="flex items-center space-x-1 mt-1 text-xs text-amber-700">
                            <Calendar className="w-3 h-3" />
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
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Edit follow-up"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
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
