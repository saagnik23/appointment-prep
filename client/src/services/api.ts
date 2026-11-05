import {
  Appointment,
  ChecklistData,
  FollowUp,
  Medication,
  Question,
  User,
} from '../types';

const BASE_URL = '/api/v1';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

class ApiClient {
  private inMemoryCsrfToken: string | null = null;

  public setCsrfToken(token: string | null) {
    this.inMemoryCsrfToken = token;
  }

  public getCsrfToken(): string | null {
    return this.inMemoryCsrfToken || getCookie('XSRF-TOKEN');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Attach CSRF token on state-changing requests
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Ensures HttpOnly session cookies are transmitted
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
  async register(payload: { name: string; email: string; password: string }): Promise<{ user: User; csrfToken?: string }> {
    const res = await this.request<{ user: User; csrfToken?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.csrfToken) {
      this.setCsrfToken(res.csrfToken);
    }
    return res;
  }

  async login(payload: { email: string; password: string }): Promise<{ user: User; csrfToken?: string }> {
    const res = await this.request<{ user: User; csrfToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.csrfToken) {
      this.setCsrfToken(res.csrfToken);
    }
    return res;
  }

  async logout(): Promise<{ message: string }> {
    const res = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.setCsrfToken(null);
    return res;
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

  // Assistant / Chatbot
  async sendAssistantMessage(message: string): Promise<{ reply: string; suggestions?: string[] }> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const api = new ApiClient();
