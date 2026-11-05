import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AppointmentsListPage } from '../features/appointments/AppointmentsListPage';
import { AppointmentDetailPage } from '../features/appointments/AppointmentDetailPage';
import { ChecklistPreviewPage } from '../features/checklist/ChecklistPreviewPage';
import { HelpCircle } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-secondary-text font-medium">Loading Appointment Prep...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthenticatedWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <DashboardLayout
      searchQuery={globalSearch}
      onSearchChange={setGlobalSearch}
    >
      {React.cloneElement(children as React.ReactElement, { searchQuery: globalSearch })}
    </DashboardLayout>
  );
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app p-4">
      <div className="max-w-md w-full p-8 bg-surface rounded-3xl border border-border text-center shadow-card">
        <div className="w-14 h-14 rounded-2xl bg-sage-50 text-primary flex items-center justify-center mx-auto mb-4 border border-sage-200">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-main-text mb-1">Page Not Found</h1>
        <p className="text-xs text-secondary-text mb-6">The page you requested could not be found.</p>
        <a
          href="/"
          className="inline-flex px-5 py-2.5 bg-gradient-to-r from-[#7FD38C] to-[#43B574] text-white text-xs font-bold rounded-2xl shadow-floating transition-all hover:-translate-y-0.5"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <AppointmentsListPage />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <AppointmentDetailPage />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id/checklist"
        element={
          <ProtectedRoute>
            <AuthenticatedWrapper>
              <ChecklistPreviewPage />
            </AuthenticatedWrapper>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

