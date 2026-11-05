export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Question {
  id: string;
  text: string;
  status: 'not_asked' | 'asked';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose?: string;
  frequency?: string;
  notes?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUp {
  id: string;
  text: string;
  dueAt?: string | null;
  status: 'pending' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  title: string;
  providerName?: string;
  scheduledAt?: string | null;
  location?: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  questions: Question[];
  medications: Medication[];
  followUps: FollowUp[];
  questionsCount?: number;
  medicationsCount?: number;
  followUpsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChecklistAppointmentHeader {
  id: string;
  title: string;
  providerName: string;
  scheduledAt: string | null;
  location: string;
  status: string;
  notes: string;
}

export interface ChecklistSection<T> {
  id: 'questions' | 'medications' | 'follow_ups';
  title: string;
  items: T[];
}

export interface ChecklistData {
  appointment: ChecklistAppointmentHeader;
  sections: [
    ChecklistSection<Question>,
    ChecklistSection<Medication>,
    ChecklistSection<FollowUp>
  ];
  notesArea: boolean;
  disclaimer: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
