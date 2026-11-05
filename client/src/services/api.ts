import {
  Appointment,
  ChecklistData,
  FollowUp,
  Medication,
  Question,
  User,
} from '../types';

const BASE_URL = '/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('appointment_prep_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('appointment_prep_token', token);
    } else {
      localStorage.removeItem('appointment_prep_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const error: any = new Error(errorMsg);
      error.status = response.status;
      error.code = data?.error?.code;
      error.details = data?.error?.details;
      throw error;
    }

    return data as T;
  }

  // Auth
  async register(payload: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload: { email: string; password: string }): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // Appointments
  async listAppointments(params?: { status?: string; search?: string }): Promise<Appointment[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/appointments${queryString}`);
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(payload: Partial<Appointment>): Promise<Appointment> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAppointment(id: string, payload: Partial<Appointment>): Promise<Appointment> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Checklist
  async getChecklist(appointmentId: string): Promise<ChecklistData> {
    return this.request(`/appointments/${appointmentId}/checklist`);
  }

  // Questions
  async addQuestion(appointmentId: string, payload: { text: string; order?: number }): Promise<Question> {
    return this.request(`/appointments/${appointmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateQuestion(
    appointmentId: string,
    questionId: string,
    payload: { text?: string; status?: 'not_asked' | 'asked'; order?: number }
  ): Promise<Question> {
    return this.request(`/appointments/${appointmentId}/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteQuestion(appointmentId: string, questionId: string): Promise<{ message: string }> {
    return this.request(`/appointments/${appointmentId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // Medications
  async addMedication(
    appointmentId: string,
    payload: { name: string; dose?: string; frequency?: string; notes?: string; order?: number }
  ): Promise<Medication> {
    return this.request(`/appointments/${appointmentId}/medications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateMedication(
    appointmentId: string,
    medicationId: string,
    payload: { name?: string; dose?: string; frequency?: string; notes?: string; order?: number }
  ): Promise<Medication> {
    return this.request(`/appointments/${appointmentId}/medications/${medicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteMedication(appointmentId: string, medicationId: string): Promise<{ message: string }> {
    return this.request(`/appointments/${appointmentId}/medications/${medicationId}`, {
      method: 'DELETE',
    });
  }

  // Follow-ups
  async addFollowUp(
    appointmentId: string,
    payload: { text: string; dueAt?: string | null }
  ): Promise<FollowUp> {
    return this.request(`/appointments/${appointmentId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateFollowUp(
    appointmentId: string,
    followUpId: string,
    payload: { text?: string; dueAt?: string | null; status?: 'pending' | 'completed' }
  ): Promise<FollowUp> {
    return this.request(`/appointments/${appointmentId}/follow-ups/${followUpId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteFollowUp(appointmentId: string, followUpId: string): Promise<{ message: string }> {
    return this.request(`/appointments/${appointmentId}/follow-ups/${followUpId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
