import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Private & Encrypted:</strong> All questions, medications, and notes are strictly confidential to your account.
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Does not provide medical advice or diagnosis. Always consult a licensed healthcare professional.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
