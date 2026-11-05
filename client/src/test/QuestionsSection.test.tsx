import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestionsSection } from '../features/questions/QuestionsSection';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  },
}));

describe('QuestionsSection Component', () => {
  const mockQuestions = [
    {
      id: 'q-1',
      text: 'What are the common side effects of this dosage?',
      status: 'not_asked' as const,
      order: 0,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    },
    {
      id: 'q-2',
      text: 'Should I schedule a follow-up test in six weeks?',
      status: 'asked' as const,
      order: 1,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    },
  ];

  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders questions and respects asked vs not asked states', () => {
    render(
      <QuestionsSection
        appointmentId="apt-123"
        questions={mockQuestions}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('Questions to Ask')).toBeInTheDocument();
    expect(screen.getByText('What are the common side effects of this dosage?')).toBeInTheDocument();
    expect(screen.getByText('Should I schedule a follow-up test in six weeks?')).toBeInTheDocument();
  });

  it('toggles question status between asked and not asked', async () => {
    (api.updateQuestion as any).mockResolvedValue({});

    render(
      <QuestionsSection
        appointmentId="apt-123"
        questions={mockQuestions}
        onRefresh={mockOnRefresh}
      />
    );

    const toggleButton = screen.getByLabelText('Mark question asked');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(api.updateQuestion).toHaveBeenCalledWith('apt-123', 'q-1', {
        status: 'asked',
      });
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('allows adding a new question', async () => {
    (api.addQuestion as any).mockResolvedValue({});

    render(
      <QuestionsSection
        appointmentId="apt-123"
        questions={mockQuestions}
        onRefresh={mockOnRefresh}
      />
    );

    const addBtn = screen.getByText('Add Question');
    fireEvent.click(addBtn);

    const textarea = screen.getByLabelText(/Your Question or Concern/i);
    fireEvent.change(textarea, { target: { value: 'How often should I monitor BP?' } });

    const saveBtn = screen.getByText('Save Question');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.addQuestion).toHaveBeenCalledWith('apt-123', {
        text: 'How often should I monitor BP?',
        order: 2,
      });
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });
});

