import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  message
}) => {
  const { registerUser, loginUser, googleLoginUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email dan Password wajib diisi');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Nama Lengkap wajib diisi');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        await registerUser(name, email, password);
      }
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Terjadi kesalahan autentikasi');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // Prompt for name/email if in local simulation or auto sign in
      const simName = name.trim() || 'Peserta Innovator';
      const simEmail = email.trim() || `user.${Date.now()}@gmail.com`;
      await googleLoginUser(simName, simEmail);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Gagal login menggunakan Google');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-sail/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-ballroom border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-6 sm:p-8 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-inferno text-ballroom p-1.5 border border-blue-sail hover:bg-red-700 cursor-pointer"
        >
          <Icon name="X" size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <span className="bg-decor text-blue-sail font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider border border-blue-sail inline-block">
            TSF 2026 ACCOUNT AUTH
          </span>
          <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
            {mode === 'login' ? 'MASUK KE AKUN TSF' : 'DAFTAR AKUN BARU'}
          </h2>
          {message ? (
            <p className="text-xs font-sans text-red-inferno font-bold bg-red-50 p-2.5 border border-red-200">
              {message}
            </p>
          ) : (
            <p className="text-xs font-sans text-blue-sail/70">
              Silakan login atau buat akun terlebih dahulu untuk melanjutkan pendaftaran kompetisi.
            </p>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-6 border-b-2 border-blue-sail/20 pb-4">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 text-xs font-display font-black uppercase transition-all border-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-blue-sail text-decor border-blue-sail shadow-[2px_2px_0_0_#F6BB02]'
                : 'bg-white text-blue-sail border-blue-sail/30 hover:border-decor'
            }`}
          >
            LOGIN AKUN
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 text-xs font-display font-black uppercase transition-all border-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-blue-sail text-decor border-blue-sail shadow-[2px_2px_0_0_#F6BB02]'
                : 'bg-white text-blue-sail border-blue-sail/30 hover:border-decor'
            }`}
          >
            DAFTAR AKUN
          </button>
        </div>

        {/* Google 1-Click Auth Button */}
        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-blue-sail font-display font-black text-xs uppercase py-3 px-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#4285F4] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{mode === 'login' ? 'MASUK DENGAN GMAIL' : 'DAFTAR DENGAN GMAIL'}</span>
          </button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-blue-sail/20" /></div>
            <span className="relative bg-ballroom px-3 text-[10px] font-display font-bold text-blue-sail/60 uppercase">
              ATAU DENGAN EMAIL
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-300 p-3 text-xs font-sans font-semibold text-red-600 flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-3.5 py-2 text-sm font-sans text-blue-sail outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
              Alamat Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-3.5 py-2 text-sm font-sans text-blue-sail outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
              Kata Sandi (Password) *
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-3.5 py-2 text-sm font-sans text-blue-sail outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <Icon name="LogIn" size={16} />
                <span>{mode === 'login' ? 'MASUK KE AKUN' : 'BUAT AKUN BARU'}</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
