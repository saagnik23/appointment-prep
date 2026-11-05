import React, { useState } from 'react';
import { Question } from '../../types';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  Plus,
  HelpCircle,
  CheckCircle2,
  Circle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

interface QuestionsSectionProps {
  appointmentId: string;
  questions: Question[];
  onRefresh: () => Promise<void>;
}

export const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  appointmentId,
  questions,
  onRefresh,
}) => {
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sort questions by order ascending
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      setError(null);
      await api.addQuestion(appointmentId, {
        text: newText.trim(),
        order: sortedQuestions.length,
      });
      setNewText('');
      setIsAdding(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add question');
    }
  };

  const handleToggleStatus = async (question: Question) => {
    try {
      const nextStatus = question.status === 'asked' ? 'not_asked' : 'asked';
      await api.updateQuestion(appointmentId, question.id, {
        status: nextStatus,
      });
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update question status');
    }
  };

  const handleSaveEdit = async (questionId: string) => {
    if (!editText.trim()) return;
    try {
      await api.updateQuestion(appointmentId, questionId, {
        text: editText.trim(),
      });
      setEditingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save question edit');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteQuestion(appointmentId, deletingId);
      setDeletingId(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedQuestions.length) return;

    const currentItem = sortedQuestions[index];
    const targetItem = sortedQuestions[targetIndex];

    try {
      // Swap orders
      await api.updateQuestion(appointmentId, currentItem.id, { order: targetItem.order });
      await api.updateQuestion(appointmentId, targetItem.id, { order: currentItem.order });
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder questions');
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-sage-50 text-primary rounded-2xl flex items-center justify-center border border-sage-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-main-text tracking-tight">Questions to Ask</h2>
          </div>
          <p className="text-xs text-secondary-text mt-1">
            Write down any concerns, symptoms, or clarifications in your own words.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-primary bg-sage-50 hover:bg-sage-100 rounded-2xl transition-all cursor-pointer self-start sm:self-auto border border-border shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
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
          className="mb-6 p-6 rounded-3xl bg-sage-50/50 border border-border space-y-3"
        >
          <label htmlFor="question-input" className="block text-xs font-bold text-main-text uppercase tracking-wider">
            Your Question or Concern
          </label>
          <textarea
            id="question-input"
            rows={2}
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g., What are the potential side effects of this dosage? When should I expect symptoms to improve?"
            className="w-full p-4 rounded-2xl border border-border text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-main-text placeholder-secondary-text/60"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewText('');
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
              Save Question
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {sortedQuestions.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl bg-app/50">
          <p className="text-sm font-medium text-main-text mb-1">No questions added yet</p>
          <p className="text-xs text-secondary-text max-w-sm mx-auto mb-4">
            Having 2–3 questions written down beforehand ensures you won't forget important points during the visit.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-primary bg-white border border-border rounded-xl hover:bg-primary-soft/50 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a Question</span>
          </button>
        </div>
      ) : (
        /* Questions List */
        <ul className="space-y-2.5">
          {sortedQuestions.map((q, idx) => {
            const isEditing = editingId === q.id;

            return (
              <li
                key={q.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  q.status === 'asked'
                    ? 'bg-neutral-50 border-border text-secondary-text'
                    : 'bg-white border-border text-main-text hover:border-primary/40'
                }`}
              >
                {/* Status Toggle & Text */}
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(q)}
                    className="mt-0.5 text-secondary-text hover:text-primary transition-colors flex-shrink-0 cursor-pointer"
                    title={q.status === 'asked' ? 'Mark as not asked' : 'Mark as asked'}
                    aria-label={q.status === 'asked' ? 'Mark question not asked' : 'Mark question asked'}
                  >
                    {q.status === 'asked' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-border hover:text-primary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 p-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-main-text"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(q.id)}
                          className="p-1.5 text-success hover:bg-success-soft rounded-lg transition-colors cursor-pointer"
                          title="Save edit"
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
                    ) : (
                      <p
                        className={`text-sm leading-relaxed select-text ${
                          q.status === 'asked' ? 'line-through text-secondary-text/70' : 'text-main-text'
                        }`}
                      >
                        {q.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reorder and Action Buttons */}
                {!isEditing && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-secondary-text hover:text-main-text hover:bg-neutral-100 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === sortedQuestions.length - 1}
                      className="p-1.5 text-secondary-text hover:text-main-text hover:bg-neutral-100 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(q.id);
                        setEditText(q.text);
                      }}
                      className="p-1.5 text-secondary-text hover:text-main-text hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(q.id)}
                      className="p-1.5 text-secondary-text hover:text-error hover:bg-error-soft rounded-lg transition-colors cursor-pointer"
                      title="Delete question"
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

      {/* Confirm Question Deletion */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to remove this question from your preparation list?"
        confirmLabel="Delete"
      />
    </div>
  );
};

