import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Appointment Prep...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
        <HelpCircle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page Not Found</h1>
      <p className="text-sm text-slate-500 mb-6">The page you requested could not be found.</p>
      <a
        href="/"
        className="inline-flex px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700"
      >
        Go to Home
      </a>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppointmentsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id/checklist"
            element={
              <ProtectedRoute>
                <ChecklistPreviewPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
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
