import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicationsSection } from '../features/medications/MedicationsSection';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    addMedication: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
  },
}));

describe('MedicationsSection Component', () => {
  const mockMedications = [
    {
      id: 'med-1',
      name: 'Lisinopril',
      dose: '10 mg',
      frequency: 'Once daily in the morning',
      notes: 'Blood pressure medication',
      order: 0,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    },
  ];

  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders medication cards with dose, frequency, and self-reported disclaimer', () => {
    render(
      <MedicationsSection
        appointmentId="apt-123"
        medications={mockMedications}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('Medication List (Self-Reported)')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril')).toBeInTheDocument();
    expect(screen.getByText('10 mg')).toBeInTheDocument();
    expect(screen.getByText('Once daily in the morning')).toBeInTheDocument();
    expect(screen.getByText('"Blood pressure medication"')).toBeInTheDocument();
  });

  it('opens add form and submits a new medication', async () => {
    (api.addMedication as any).mockResolvedValue({ id: 'med-2', name: 'Metformin' });

    render(
      <MedicationsSection
        appointmentId="apt-123"
        medications={mockMedications}
        onRefresh={mockOnRefresh}
      />
    );

    const addButton = screen.getByText('Add Medication');
    fireEvent.click(addButton);

    expect(screen.getByText('Add Medication Entry')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Medication or Supplement Name/i);
    const doseInput = screen.getByLabelText(/Dose or Strength/i);
    const freqInput = screen.getByLabelText(/Frequency or Schedule/i);

    fireEvent.change(nameInput, { target: { value: 'Metformin' } });
    fireEvent.change(doseInput, { target: { value: '500 mg' } });
    fireEvent.change(freqInput, { target: { value: 'Twice daily' } });

    const submitBtn = screen.getByText('Save Medication');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.addMedication).toHaveBeenCalledWith('apt-123', {
        name: 'Metformin',
        dose: '500 mg',
        frequency: 'Twice daily',
        notes: '',
        order: 1,
      });
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('renders empty state when no medications are provided', () => {
    render(
      <MedicationsSection
        appointmentId="apt-123"
        medications={[]}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('No medications recorded')).toBeInTheDocument();
  });
});

