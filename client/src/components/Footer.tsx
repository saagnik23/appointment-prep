import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print mt-auto border-t border-border bg-surface py-5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-text">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
            <span>
              <strong className="text-main-text">Private & Encrypted:</strong> All questions, medications, and notes are strictly confidential to your account.
            </span>
          </div>

          <div className="flex items-center space-x-2 text-secondary-text">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Organises patient-entered notes only. Does not diagnose, treat, or provide clinical advice.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
