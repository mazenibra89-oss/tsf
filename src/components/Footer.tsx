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
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-8 text-sm font-sans text-ballroom/95 w-full max-w-2xl">
            <div className="flex items-center space-x-3 bg-blue-sail/20 px-5 py-3 border border-decor/20 flex-1">
              <Icon name="Phone" size={18} className="text-decor shrink-0" />
              <div className="text-left space-y-1">
                <p className="font-semibold text-decor text-xs uppercase tracking-wide">WhatsApp Hotline</p>
                <a
                  href="https://wa.me/6287812126693"
                  target="_blank"
                  rel="noreferrer"
                  className="block font-mono text-xs hover:text-decor transition-colors"
                >
                  +62 878-1212-6693 (Atar)
                </a>
                <a
                  href="https://wa.me/6285366050293"
                  target="_blank"
                  rel="noreferrer"
                  className="block font-mono text-xs hover:text-decor transition-colors"
                >
                  +62 853-6605-0293 (Reza)
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-blue-sail/20 px-5 py-3 border border-decor/20 flex-1">
              <Icon name="Instagram" size={18} className="text-decor shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-decor text-xs uppercase tracking-wide">Instagram Resmi</p>
                <a
                  href="https://instagram.com/tdcsummitfest_its"
                  target="_blank"
                  rel="noreferrer"
                  className="block font-mono text-xs mt-0.5 hover:text-decor transition-colors"
                >
                  @tdcsummitfest_its
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
