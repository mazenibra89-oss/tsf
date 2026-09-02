import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';
import { AuthModal } from './AuthModal';
import tsfProfileLogo from '../tsfprofile.png';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { currentUser, logoutUser, myTeam } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  let ctaText = myTeam ? 'Dashboard Tim' : 'Daftar Competition';
  let ctaPage = myTeam ? 'dashboard' : 'competition';

  const menuItems = [
    { id: 'home', label: 'Home' },
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
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <img
              src={tsfProfileLogo}
              alt="TSF 2026 Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border-2 border-decor shadow-[2px_2px_0_0_#BD1B1F]"
            />
            <div className="flex flex-col">
              <span className="font-display font-black text-base sm:text-xl tracking-wider text-decor uppercase leading-none">
                TSF 2026
              </span>
              <span className="font-sans text-[9px] sm:text-[10px] text-ballroom/70 font-semibold tracking-widest uppercase">
                TDC Summit Festival
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              if (item.isComingSoon) {
                return (
                  <div
                    key={item.id}
                    className="relative group px-4 py-2 font-display font-bold text-xs uppercase tracking-wider text-ballroom/40 cursor-not-allowed select-none flex items-center space-x-1"
                  >
                    <span>{item.label}</span>
                    <span className="bg-red-inferno text-ballroom text-[8px] font-mono font-extrabold px-1 py-0.2 rounded-none uppercase tracking-wider skew-x-[-5deg] leading-none">
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
                  className={`relative px-4 py-2 font-display font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive ? 'text-decor' : 'text-ballroom hover:text-decor'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-3 right-3 h-1 bg-decor transition-all duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-70'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Right actions: User Profile & CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-3.5 py-2 text-xs font-display font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentPage === 'dashboard'
                      ? 'bg-decor text-blue-sail border-decor shadow-[2px_2px_0_0_#BD1B1F]'
                      : 'bg-blue-sail/40 text-decor border-decor hover:bg-decor hover:text-blue-sail'
                  }`}
                >
                  <Icon name="Trophy" size={14} />
                  <span>DASHBOARD TIM</span>
                </button>

                <div className="bg-ballroom/10 border border-ballroom/20 px-3 py-1.5 flex items-center gap-2">
                  <span className="font-display font-bold text-xs text-decor uppercase max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    title="Konfirmasi Logout Akun"
                    className="text-ballroom/70 hover:text-red-inferno transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Icon name="LogOut" size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-white hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-4 py-2 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer flex items-center gap-1.5"
              >
                <Icon name="LogIn" size={14} />
                <span>LOGIN / DAFTAR</span>
              </button>
            )}

            <button
              id="nav-cta"
              onClick={() => handleNavClick(ctaPage)}
              className="bg-decor hover:bg-decor/95 active:bg-decor text-blue-sail font-display font-extrabold text-xs uppercase px-4 py-2 border-2 border-blue-sail shadow-[2px_2px_0px_0px_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>{ctaText}</span>
              <Icon name="ArrowRight" size={14} className="stroke-[3px]" />
            </button>
          </div>

          {/* Mobile hamburger button & quick Dashboard button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {currentUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="bg-decor text-blue-sail font-display font-black text-[10px] sm:text-xs uppercase px-2.5 py-1.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] flex items-center gap-1 cursor-pointer"
              >
                <Icon name="Trophy" size={13} />
                <span>DASHBOARD TIM</span>
              </button>
            )}
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
            {currentUser && (
              <div className="px-4 py-3 bg-ballroom/10 border-b border-ballroom/10 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="User" size={16} className="text-decor" />
                    <span className="font-display font-bold text-xs text-decor uppercase truncate max-w-[150px]">
                      {currentUser.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="bg-red-inferno text-white text-[10px] font-display font-bold px-2 py-1 uppercase flex items-center gap-1 border border-blue-sail cursor-pointer"
                  >
                    <Icon name="LogOut" size={12} />
                    <span>LOGOUT</span>
                  </button>
                </div>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full bg-decor text-blue-sail font-display font-black text-xs uppercase py-2.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Icon name="Trophy" size={16} />
                  <span>MASUK DASHBOARD TIM</span>
                </button>
              </div>
            )}

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
                  className={`block w-full text-left px-4 py-3 text-base font-display font-bold uppercase tracking-wider rounded-none ${
                    isActive
                      ? 'bg-barbera text-decor border-l-4 border-decor'
                      : 'text-ballroom hover:bg-barbera/55 hover:text-decor'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {!currentUser && (
              <div className="pt-2 px-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full bg-white text-blue-sail font-display font-bold text-xs uppercase py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] flex items-center justify-center gap-1.5"
                >
                  <Icon name="LogIn" size={14} />
                  <span>LOGIN / DAFTAR AKUN</span>
                </button>
              </div>
            )}

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-sail/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-ballroom border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-6 text-center space-y-5 relative animate-fadeIn">
            <button
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="absolute top-3 right-3 bg-red-inferno text-ballroom p-1 border border-blue-sail hover:bg-red-700 cursor-pointer"
            >
              <Icon name="X" size={16} />
            </button>

            <div className="w-14 h-14 bg-red-50 text-red-inferno rounded-none border-2 border-red-400 flex items-center justify-center mx-auto shadow-[3px_3px_0_0_#BD1B1F]">
              <Icon name="LogOut" size={28} />
            </div>

            <div className="space-y-2">
              <span className="bg-decor text-blue-sail font-display font-black text-[9px] px-2 py-0.5 uppercase tracking-wider border border-blue-sail inline-block">
                LOGOUT CONFIRMATION
              </span>
              <h3 className="font-display font-black text-xl text-blue-sail uppercase tracking-tight">
                APAKAH INGIN LOGOUT?
              </h3>
              <p className="text-xs font-sans text-blue-sail/75">
                Anda akan keluar dari akun <span className="font-bold text-red-inferno uppercase">{currentUser?.name}</span>. Anda perlu login kembali untuk mengakses pendaftaran kompetisi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="w-full bg-white hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase py-3 border-2 border-blue-sail cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setIsLogoutConfirmOpen(false);
                  if (currentPage === 'dashboard') {
                    setCurrentPage('home');
                  }
                }}
                className="w-full bg-red-inferno hover:bg-red-700 text-ballroom font-display font-black text-xs uppercase py-3 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E] cursor-pointer"
              >
                YA, LOGOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
