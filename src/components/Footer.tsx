import React from 'react';
import { Profile } from '../types';

interface FooterProps {
  profile: Profile;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-transparent py-8 text-slate-600 dark:text-slate-400" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p>
            CFD, Energy & Microgrid Research · Bangladesh
          </p>
        </div>

      </div>
    </footer>
  );
};
