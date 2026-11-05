import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChecklistPreviewPage } from '../features/checklist/ChecklistPreviewPage';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getChecklist: vi.fn(),
  },
}));

describe('ChecklistPreviewPage Component', () => {
  const mockChecklistData = {
    appointment: {
      id: 'apt-123',
      title: 'Annual Physical & Bloodwork',
      providerName: 'Dr. Jane Miller',
      scheduledAt: '2026-11-20T10:00:00.000Z',
      location: 'Main Clinic Rm 204',
      status: 'upcoming',
      notes: 'Fast 12 hours prior',
    },
    sections: [
      {
        id: 'questions',
        title: 'Questions to ask',
        items: [
          { id: 'q1', text: 'Should I decrease my sodium intake?', status: 'not_asked' },
          { id: 'q2', text: 'Is it safe to exercise while on this medication?', status: 'asked' },
        ],
      },
      {
        id: 'medications',
        title: 'Medication list entered by me',
        items: [
          {
            id: 'm1',
            name: 'Atorvastatin',
            dose: '20 mg',
            frequency: 'Daily at bedtime',
            notes: 'Take with water',
          },
        ],
      },
      {
        id: 'follow_ups',
        title: 'Follow-up actions and notes',
        items: [
          {
            id: 'f1',
            text: 'Schedule liver enzyme test in 3 months',
            dueAt: '2027-02-20T00:00:00.000Z',
            status: 'pending',
          },
        ],
      },
    ],
    notesArea: true,
    disclaimer: 'This checklist is generated exclusively from patient-recorded notes.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the checklist details, sections, and doctor notes area', async () => {
    (api.getChecklist as any).mockResolvedValue(mockChecklistData);

    render(
      <MemoryRouter initialEntries={['/appointments/apt-123/checklist']}>
        <Routes>
          <Route path="/appointments/:id/checklist" element={<ChecklistPreviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Annual Physical & Bloodwork')).toBeInTheDocument();
    });

    // Verify metadata
    expect(screen.getByText(/Dr\. Jane Miller/)).toBeInTheDocument();
    expect(screen.getByText(/Main Clinic Rm 204/)).toBeInTheDocument();

    // Verify questions
    expect(screen.getByText('Should I decrease my sodium intake?')).toBeInTheDocument();
    expect(screen.getByText('Is it safe to exercise while on this medication?')).toBeInTheDocument();

    // Verify medication details
    expect(screen.getByText('Atorvastatin')).toBeInTheDocument();
    expect(screen.getByText('20 mg')).toBeInTheDocument();
    expect(screen.getByText('Daily at bedtime')).toBeInTheDocument();

    // Verify follow-up
    expect(screen.getByText('Schedule liver enzyme test in 3 months')).toBeInTheDocument();

    // Verify notes area
    expect(screen.getByText(/Visit Notes & Doctor Recommendations/)).toBeInTheDocument();

    // Verify disclaimer
    expect(
      screen.getByText('This checklist is generated exclusively from patient-recorded notes.')
    ).toBeInTheDocument();
  });

  it('triggers window.print when clicking Print or Save as PDF button', async () => {
    (api.getChecklist as any).mockResolvedValue(mockChecklistData);
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/appointments/apt-123/checklist']}>
        <Routes>
          <Route path="/appointments/:id/checklist" element={<ChecklistPreviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Print or Save as PDF')).toBeInTheDocument();
    });

    const printButton = screen.getByText('Print or Save as PDF');
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});
