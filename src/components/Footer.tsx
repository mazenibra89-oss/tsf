import React from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const { phases } = useApp();

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePhase = phases.find(p => p.status === 'active');

  return (
    <footer className="bg-barbera text-ballroom border-t-8 border-decor py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h4 className="font-display font-extrabold text-xl text-decor uppercase tracking-widest border-b-2 border-decor pb-2 px-6">
            Hubungi Kami
          </h4>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-sans text-ballroom/95 w-full">
            <div className="flex items-center space-x-3 bg-blue-sail/20 px-5 py-3 border border-decor/20 max-w-xs w-full sm:w-auto">
              <Icon name="Phone" size={18} className="text-decor shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-decor text-xs uppercase tracking-wide">WhatsApp Hotline</p>
                <p className="font-mono text-xs mt-0.5">+62 812-3456-7890 (Mazen)</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-blue-sail/20 px-5 py-3 border border-decor/20 max-w-xs w-full sm:w-auto">
              <Icon name="Instagram" size={18} className="text-decor shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-decor text-xs uppercase tracking-wide">Instagram Resmi</p>
                <p className="font-mono text-xs mt-0.5">@tsf.festival2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
