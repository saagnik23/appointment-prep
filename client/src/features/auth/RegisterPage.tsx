import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-surface rounded-4xl shadow-elevated border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branded Showcase Panel (Image 2 style) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sage-50 via-sage-100/60 to-app p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
          {/* Decorative background glow circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-soft/80 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6EB887] to-[#4DBB7E] flex items-center justify-center text-white shadow-subtle">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-main-text text-base tracking-tight block">
                Appointment Prep
              </span>
              <span className="text-[10px] text-secondary-text font-medium block -mt-0.5">
                Private Health Workspace
              </span>
            </div>
          </div>

          {/* Center Graphic Illustration Card (from Image 2) */}
          <div className="my-8 relative z-10 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-white/80 backdrop-blur-sm border-4 border-sage-200/80 p-5 flex flex-col justify-center items-center shadow-subtle relative">
              <div className="w-full bg-sage-50 rounded-2xl p-4 border border-sage-200/70 shadow-sm space-y-2.5">
                <div className="h-2.5 w-20 bg-primary/70 rounded-full" />
                <div className="flex items-center space-x-2 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <div className="h-2 w-16 bg-main-text/40 rounded-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <div className="h-2 w-20 bg-main-text/40 rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-8 text-center max-w-xs">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-main-text tracking-tight">
                Sign up
              </h1>
              <p className="text-xs text-secondary-text mt-2 leading-relaxed">
                Create your private, secure account to organize questions, medication lists, and visit checklists.
              </p>
            </div>
          </div>

          {/* Bottom Security Reassurance */}
          <div className="relative z-10 pt-4 flex items-center space-x-2 text-xs text-secondary-text border-t border-border/80">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Encrypted, strictly private multi-tenant storage.</span>
          </div>
        </div>

        {/* Right Form Panel (Image 2 style) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-surface">
          {/* Top Switcher */}
          <div className="flex items-center justify-end space-x-3 mb-4">
            <span className="text-xs text-secondary-text">Already have an account?</span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-xl border border-border text-xs font-semibold text-main-text hover:bg-sage-50 transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Main Form Area */}
          <div className="max-w-md w-full mx-auto my-auto space-y-5">
            <div>
              <h2 className="text-xl font-bold text-main-text tracking-tight">
                Get started for free
              </h2>
              <p className="text-xs text-secondary-text mt-1">
                Your preparation information is private and never shared.
              </p>
            </div>

            {error && (
              <div
                className="p-3.5 rounded-2xl bg-error-soft border border-error-border text-error text-xs flex items-start space-x-2.5 animate-in fade-in"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="name-input"
                  className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5"
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-text">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="name-input"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-surface hover:border-sage-300"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email-input"
                  className="block text-xs font-bold text-main-text uppercase tracking-wider mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-text">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-surface hover:border-sage-300"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-bold text-main-text uppercase tracking-wider"
                  >
                    Password (min. 8 characters)
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-text">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-border text-main-text placeholder-secondary-text/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all bg-surface hover:border-sage-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-text hover:text-main-text cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Vibrant Gradient Submit Button (Image 2 style) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#7FD38C] to-[#43B574] hover:from-[#72CA80] hover:to-[#3BA367] shadow-floating transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3"
              >
                <span>{isSubmitting ? 'Creating account...' : 'Sign up'}</span>
              </button>
            </form>
          </div>

          {/* Privacy Footnote */}
          <div className="text-center pt-6 text-[11px] text-secondary-text">
            <span>By signing up, you agree to our </span>
            <span className="text-primary hover:underline cursor-pointer">Terms</span>
            <span> and </span>
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
