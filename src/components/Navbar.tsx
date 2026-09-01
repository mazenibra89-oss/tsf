import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';
import tsfProfileLogo from '../tsfprofile.png';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { phases } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic CTA button toggle
  const showCta = true;
  let ctaText = 'Daftar Competition';
  let ctaPage = 'competition';

  const menuItems = [
    { id: 'home', label: 'Home' },
    // Announcement is deactivated
    // { id: 'announcement', label: 'Announcement' },
    { id: 'pe1', label: 'PE1' },
    { id: 'pe2', label: 'PE2', isComingSoon: true },
    { id: 'competition', label: 'Competition' },
    { id: 'thrift', label: 'Thrift', isComingSoon: true },
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-sail text-ballroom border-b-4 border-decor shadow-[0_4px_0_0_#8B011A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <button
            id="nav-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 group focus:outline-none"
          >
            <div className="relative bg-decor px-3 py-1 rounded-none transform group-hover:scale-105 transition-transform skew-x-[-10deg] border-2 border-blue-sail flex items-center justify-center min-w-[80px] h-9">
              <img
                src={tsfProfileLogo}
                alt="TSF Logo"
                className="absolute h-12 w-auto object-contain skew-x-[10deg] z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-lg tracking-widest hidden sm:block uppercase text-shadow-sm group-hover:text-decor transition-colors">
              Festival 2026
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              if (item.isComingSoon) {
                return (
                  <div
                    key={item.id}
                    className="px-3 py-2 text-sm font-display font-semibold uppercase tracking-wider text-ballroom/40 cursor-not-allowed flex items-center select-none"
                    title="Coming Soon"
                  >
                    <span>{item.label}</span>
                    <span className="ml-1.5 inline-block bg-red-inferno text-ballroom text-[8px] font-mono font-extrabold px-1 py-0.5 rounded-none uppercase tracking-tighter skew-x-[-5deg] leading-none">
                      Soon
                    </span>
                  </div>
                );
              }
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 text-sm font-display font-semibold transition-all duration-200 uppercase tracking-wider relative group ${isActive
                      ? 'text-decor font-extrabold'
                      : 'text-ballroom/90 hover:text-decor'
                    }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-3 right-3 h-1 bg-decor transition-all duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-70'
                    }`} />
                </button>
              );
            })}
          </div>

          {/* Right actions: CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              id="nav-cta"
              onClick={() => handleNavClick(ctaPage)}
              className="bg-decor hover:bg-decor/95 active:bg-decor text-blue-sail font-display font-extrabold text-xs uppercase px-5 py-2.5 rounded-none tracking-widest border-2 border-blue-sail shadow-[2px_2px_0px_0px_#8B011A] hover:shadow-[3px_3px_0px_0px_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1"
            >
              <span>{ctaText}</span>
              <Icon name="ArrowRight" size={14} className="stroke-[3px]" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              id="nav-hamburger"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-ballroom hover:text-decor focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-blue-sail border-t border-ballroom/10 animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              if (item.isComingSoon) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 text-base font-display font-bold uppercase tracking-wider text-ballroom/40 cursor-not-allowed select-none bg-blue-sail/20 border-l-4 border-transparent"
                  >
                    <span>{item.label}</span>
                    <span className="bg-red-inferno text-ballroom text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-none uppercase tracking-wider skew-x-[-5deg] leading-none">
                      Coming Soon
                    </span>
                  </div>
                );
              }
              return (
                <button
                  id={`nav-mobile-link-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 text-base font-display font-bold uppercase tracking-wider rounded-none ${isActive
                      ? 'bg-barbera text-decor border-l-4 border-decor'
                      : 'text-ballroom hover:bg-barbera/55 hover:text-decor'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="pt-4 pb-2 px-4 border-t border-ballroom/10">
              <button
                id="nav-mobile-cta"
                onClick={() => handleNavClick(ctaPage)}
                className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-extrabold text-sm uppercase py-3 rounded-none tracking-widest text-center shadow-[3px_3px_0px_0px_#8B011A] border-2 border-blue-sail flex items-center justify-center space-x-2"
              >
                <span>{ctaText}</span>
                <Icon name="ArrowRight" size={16} className="stroke-[3px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
