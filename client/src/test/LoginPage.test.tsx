import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getMe: vi.fn().mockRejectedValue(new Error('unauthorized')),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with accessible labels and inputs', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty fields', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please provide both your email address and password/i)
      ).toBeInTheDocument();
    });
  });

  it('calls api.login with email and password upon valid submission', async () => {
    (api.login as any).mockResolvedValue({
      user: { id: 'u1', name: 'Jane Doe', email: 'jane@example.com' },
      csrfToken: 'mock-csrf-token',
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'Password123!',
      });
    });
  });
});
