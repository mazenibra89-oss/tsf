import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { Staff } from './pages/Staff';
import { SubEventPage } from './pages/SubEventPage';
import { RegistCompetition } from './pages/RegistCompetition';
import { Thrift } from './pages/Thrift';
import { Admin } from './pages/Admin';

type PageType = 'home' | 'staff' | 'pe1' | 'pe2' | 'competition' | 'thrift' | 'admin';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  // Handle Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/staff') {
        setCurrentPage('staff');
      } else if (hash === '#/pe1') {
        setCurrentPage('pe1');
      } else if (hash === '#/pe2') {
        setCurrentPage('pe2');
      } else if (hash === '#/competition') {
        setCurrentPage('competition');
      } else if (hash === '#/thrift') {
        setCurrentPage('thrift');
      } else if (hash === '#/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
        // fallback hash
        if (!window.location.hash) {
          window.history.replaceState(null, '', '#/home');
        }
      }
      // Scroll to top on page change
      window.scrollTo(0, 0);
    };

    // Run on initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'staff':
        return <Staff />;
      case 'pe1':
        return <SubEventPage slug="pe1" />;
      case 'pe2':
        return <SubEventPage slug="pe2" />;
      case 'competition':
        return <RegistCompetition />;
      case 'thrift':
        return <Thrift />;
      case 'admin':
        return <Admin />;
      case 'home':
      default:
        return <Home setCurrentPage={(p) => { window.location.hash = '#/' + p; }} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ballroom font-sans antialiased text-blue-sail">
      
      {/* Dynamic Navbar */}
      <Navbar currentPage={currentPage} setCurrentPage={(p) => { window.location.hash = '#/' + p; }} />

      {/* Route Animation Wrapper */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Footer */}
      <Footer setCurrentPage={(p) => { window.location.hash = '#/' + p; }} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
