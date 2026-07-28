import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../components/Icon';
import tsfProfileLogo from '../tsfprofile.png';

interface InterviewResult {
  full_name: string;
  nim: string;
  division: string;
  status: 'accepted' | 'rejected';
  whatsapp_group_link: string | null;
}

// ─────────────────────────────────────────────
// GRAND CONFETTI — Container-relative particles
// ─────────────────────────────────────────────
const GrandConfetti: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const colors = ['#F6BB02', '#BD1B1F', '#2A4C9E', '#4CAF50', '#FF6B35', '#9C27B0'];
  const confettiParticles = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * width - width / 2,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 1,
    rotation: Math.random() * 540 - 270,
    duration: Math.random() * 2.5 + 2,
    isCircle: Math.random() > 0.5,
    wobble: Math.random() * 60 - 30,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {confettiParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-0"
          style={{
            width: p.size,
            height: p.isCircle ? p.size : p.size * 1.8,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '0%',
          }}
          initial={{ x: 0, y: -10, rotate: 0, opacity: 1, scale: 0 }}
          animate={{
            x: [0, p.wobble, p.x],
            y: [0, height * 0.3, height + 50],
            rotate: [0, p.rotation],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
            times: [0, 0.15, 0.7, 1],
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// FIREWORK BURSTS — Container-relative
// ─────────────────────────────────────────────
const FireworkBurst: React.FC<{ x: number; y: number; delay: number; color: string }> = ({ x, y, delay, color }) => {
  const sparkCount = 8;
  const sparks = Array.from({ length: sparkCount }).map((_, i) => {
    const angle = (i / sparkCount) * Math.PI * 2;
    const distance = 35 + Math.random() * 30;
    return {
      id: i,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
  });

  return (
    <>
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: x,
            top: y,
            width: 4,
            height: 4,
            backgroundColor: color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.tx, y: s.ty, opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay: delay, ease: 'easeOut' }}
        />
      ))}
    </>
  );
};

const CardFireworks: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const bursts = [
    { x: width * 0.15, y: height * 0.12, delay: 0.4, color: '#F6BB02' },
    { x: width * 0.85, y: height * 0.1, delay: 0.9, color: '#BD1B1F' },
    { x: width * 0.5, y: height * 0.08, delay: 1.4, color: '#2A4C9E' },
    { x: width * 0.7, y: height * 0.22, delay: 2.0, color: '#4CAF50' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {bursts.map((b, i) => (
        <FireworkBurst key={i} {...b} />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// FLOATING GOLDEN STARS — Container-relative
// ─────────────────────────────────────────────
const FloatingStars: React.FC = () => {
  const stars = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 14 + 6,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute text-decor/25"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.15, 0.6, 0.15],
            rotate: [0, 180, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon name="Star" size={s.size} />
        </motion.div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// PULSING GOLDEN GLOW RING
// ─────────────────────────────────────────────
const GlowRing: React.FC = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none z-10"
    style={{
      background: 'radial-gradient(circle at 50% 30%, rgba(246, 187, 2, 0.12) 0%, transparent 55%)',
    }}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  />
);

// ─────────────────────────────────────────────
// SPOTLIGHT BEAM SWEEP
// ─────────────────────────────────────────────
const SpotlightBeams: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
    <motion.div
      className="absolute top-0 w-24 h-full"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(246, 187, 2, 0.08), transparent)' }}
      animate={{ left: ['-15%', '115%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
    />
    <motion.div
      className="absolute top-0 w-20 h-full"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(42, 76, 158, 0.06), transparent)' }}
      animate={{ right: ['-10%', '110%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5, repeatDelay: 3 }}
    />
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export const InterviewAnnouncement: React.FC = () => {
  const [searchNrp, setSearchNrp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState(0);
  const [cardSize, setCardSize] = useState({ width: 600, height: 700 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Celebration sequence controller
  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    setCelebrationPhase(1);
    setTimeout(() => setCelebrationPhase(2), 600);
    setTimeout(() => setCelebrationPhase(3), 1200);
    setTimeout(() => setCelebrationPhase(4), 1800);
  }, []);

  // Measure card dimensions for effects
  useEffect(() => {
    if (cardRef.current && showCelebration) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardSize({ width: rect.width, height: rect.height });
    }
  }, [showCelebration, celebrationPhase]);

  useEffect(() => {
    if (result && result.status === 'accepted') {
      triggerCelebration();
    } else {
      setShowCelebration(false);
      setCelebrationPhase(0);
    }
  }, [result, triggerCelebration]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const nrp = searchNrp.trim();
    if (!nrp) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setShowCelebration(false);
    setCelebrationPhase(0);

    await new Promise((r) => setTimeout(r, 1200));

    // ── DUMMY DATA FOR LOCAL TESTING ──
    if (nrp === '5053251003') {
      setResult({
        full_name: 'Aurelia Pradnyaswari ',
        nim: '5053251003',
        division: 'Sub Divisi BnM - Marketing Strategist',
        status: 'accepted',
        whatsapp_group_link: 'https://chat.whatsapp.com/dummylink123',
      });
      setLoading(false);
      return;
    }

    if (nrp === '2222222222') {
      setResult({
        full_name: 'Budi Dummy Gagal',
        nim: '2222222222',
        division: 'Sub Divisi Event - Competition',
        status: 'rejected',
        whatsapp_group_link: null,
      });
      setLoading(false);
      return;
    }

    if (nrp === '99999999') {
      setResult({
        full_name: 'PUBLIC RELATION',
        nim: '99999999',
        division: 'Sub Divisi Public Relation',
        status: 'accepted',
        whatsapp_group_link: 'https://chat.whatsapp.com/dummylink123',
      });
      setLoading(false);
      return;
    }

    // ── REAL API CALL ──
    try {
      const response = await fetch(`/api/interview-announcement/${nrp}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NRP tidak terdaftar dalam data hasil wawancara TSF 2026.');
        } else {
          throw new Error('Terjadi kesalahan koneksi server. Silakan coba kembali.');
        }
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asphalt-texture min-h-screen pt-12 pb-24 relative overflow-hidden flex flex-col items-center">
      {/* Ambient track stripe */}
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-decor/5 transform skew-y-[-4deg] pointer-events-none" />

      <div className="max-w-3xl w-full px-4 relative z-30 flex-1 flex flex-col justify-center">
        {/* Header section */}
        <div className="text-center flex flex-col items-center mb-10">
          <motion.span
            className="bg-decor text-blue-sail text-[10px] font-mono font-bold px-4 py-1.5 uppercase tracking-widest border-2 border-blue-sail shadow-[2px_2px_0_0_#2A4C9E] mb-5 inline-flex items-center space-x-1.5"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Icon name="Crown" size={12} />
            <span>Pengumuman Hasil Wawancara</span>
          </motion.span>
          <motion.h1
            className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-blue-sail mt-2 mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            OFFICIAL <span className="text-decor">STAFF</span> RESULTS
          </motion.h1>
          <motion.div
            className="w-20 h-2 bg-decor mx-auto mb-3"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          />
          <motion.p
            className="text-xs sm:text-sm text-blue-sail/70 font-sans max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Masukkan NRP/NIM Anda untuk melihat hasil seleksi akhir wawancara panitia TDC Summit Fest 2026. Ini adalah pengumuman resmi penerimaan Staff TSF.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="search-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#2A4C9E] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-2 bg-decor w-full" />
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-sail">
                    NRP / NIM Pendaftar *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-blue-sail/40 pointer-events-none">
                      <Icon name="Search" size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      disabled={loading}
                      value={searchNrp}
                      onChange={(e) => setSearchNrp(e.target.value)}
                      placeholder="Contoh: 5026211001"
                      className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-blue-sail rounded-none outline-none font-mono text-blue-sail transition-all focus:shadow-[3px_3px_0_0_#F6BB02]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center space-x-2 text-red-inferno bg-red-inferno/5 border-l-4 border-red-inferno p-3 text-xs font-bold"
                  >
                    <Icon name="AlertTriangle" size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !searchNrp.trim()}
                  className="w-full bg-decor hover:bg-decor/95 disabled:bg-decor/50 disabled:cursor-not-allowed text-blue-sail font-display font-black text-xs uppercase px-8 py-4 rounded-none tracking-widest border-2 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-sail border-t-transparent" />
                      <span>MEMVERIFIKASI DATA...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Crown" size={14} />
                      <span>CEK HASIL WAWANCARA</span>
                      <Icon name="ArrowRight" size={14} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : result.status === 'accepted' ? (
            /* ═══════════════════════════════════════════════════
               ████  ACCEPTED — GRAND CELEBRATION CARD  ████
               ═══════════════════════════════════════════════════ */
            <motion.div
              key="result-accepted"
              ref={cardRef}
              initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 12, stiffness: 80, delay: 0.1 }}
              className="relative overflow-hidden"
            >
              {/* Outer golden glow border */}
              <motion.div
                className="absolute -inset-1 z-0"
                style={{
                  background: 'linear-gradient(135deg, #F6BB02, #BD1B1F, #2A4C9E, #F6BB02)',
                  backgroundSize: '300% 300%',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Inner card */}
              <div className="relative z-10 bg-ballroom border-[3px] border-blue-sail p-6 sm:p-10 shadow-[8px_8px_0_0_#8B011A] m-1 overflow-hidden">
                {/* ── ALL CELEBRATION EFFECTS INSIDE THE CARD ── */}
                {showCelebration && (
                  <>
                    <GrandConfetti width={cardSize.width} height={cardSize.height} />
                    <CardFireworks width={cardSize.width} height={cardSize.height} />
                    <FloatingStars />
                    <GlowRing />
                    <SpotlightBeams />
                  </>
                )}

                <div className="space-y-7 relative z-30">
                  {/* Decorative racing stripe header */}
                  <motion.div
                    className="h-8 w-full flex items-center overflow-hidden relative"
                    style={{ background: 'linear-gradient(90deg, #F6BB02, #BD1B1F, #2A4C9E)' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-ballroom font-display font-black text-[10px] uppercase tracking-[0.3em]">
                        ★ OFFICIAL STAFF TDC SUMMIT FEST 2026 ★
                      </span>
                    </div>
                  </motion.div>

                  {/* TSF Logo + Title */}
                  <div className="text-center space-y-3">
                    <motion.div
                      className="inline-block relative"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: 'spring', damping: 10 }}
                    >
                      <div className="bg-decor p-4 border-[3px] border-blue-sail transform -rotate-3 shadow-[4px_4px_0_0_#8B011A] flex items-center justify-center">
                        <img
                          src={tsfProfileLogo}
                          alt="TSF Logo"
                          className="h-16 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {/* Sparkle accents */}
                      <motion.div
                        className="absolute -top-2 -right-2 text-decor"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon name="Sparkles" size={16} />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -left-2 text-red-inferno"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      >
                        <Icon name="Sparkles" size={12} />
                      </motion.div>
                    </motion.div>

                    {celebrationPhase >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                      >
                        <h2 className="font-display font-black text-3xl sm:text-4xl tracking-wide uppercase leading-none">
                          <span className="text-decor">SELAMAT!</span>
                        </h2>
                        <p className="font-display font-extrabold text-lg sm:text-xl text-red-inferno uppercase tracking-wider mt-1">
                          Anda Resmi Menjadi Staff TSF!
                        </p>
                      </motion.div>
                    )}

                    {celebrationPhase >= 3 && (
                      <motion.p
                        className="text-[10px] font-mono font-bold text-blue-sail/50 uppercase tracking-wider"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Pengumuman Resmi Seleksi Akhir — TDC Summit Fest 2026
                      </motion.p>
                    )}
                  </div>

                  {/* Staff data card */}
                  {celebrationPhase >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <div className="bg-blue-sail/5 p-5 border-2 border-blue-sail/15 space-y-3 font-sans relative overflow-hidden">
                        {/* Gold accent corner */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-decor/10 transform rotate-45 translate-x-6 -translate-y-6" />

                        <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-3">
                          <span className="text-[10px] text-blue-sail/50 uppercase font-bold flex items-center space-x-1">
                            <Icon name="User" size={10} />
                            <span>Nama Lengkap</span>
                          </span>
                          <span className="col-span-2 text-sm font-bold text-blue-sail">{result.full_name}</span>
                        </div>
                        <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-3">
                          <span className="text-[10px] text-blue-sail/50 uppercase font-bold flex items-center space-x-1">
                            <Icon name="FileText" size={10} />
                            <span>NRP / NIM</span>
                          </span>
                          <span className="col-span-2 text-sm font-mono font-bold text-blue-sail">{result.nim}</span>
                        </div>
                        <div className="grid grid-cols-3">
                          <span className="text-[10px] text-blue-sail/50 uppercase font-bold flex items-center space-x-1">
                            <Icon name="Trophy" size={10} />
                            <span>Status</span>
                          </span>
                          <span className="col-span-2">
                            <span className="inline-flex items-center space-x-1.5 bg-decor text-blue-sail text-[10px] font-display font-black uppercase px-3 py-1.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#8B011A] tracking-wider">
                              <Icon name="CheckCircle2" size={12} />
                              <span>DITERIMA RESMI</span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* WhatsApp Group Link */}
                  {celebrationPhase >= 4 && result.whatsapp_group_link && (
                    <motion.div
                      className="bg-decor/10 p-5 border-[2px] border-decor/30 space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-red-inferno uppercase flex items-center space-x-1.5">
                          <Icon name="PartyPopper" size={14} />
                          <span>LANGKAH SELANJUTNYA:</span>
                        </h4>
                        <p className="text-xs text-blue-sail/70 font-sans pl-5 leading-relaxed">
                          Selamat bergabung! Segera masuk ke grup WhatsApp divisi Anda untuk informasi terbaru mengenai orientasi dan kegiatan staff.
                        </p>
                        <div className="pl-5 pt-1">
                          <a
                            href={result.whatsapp_group_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-[10px] uppercase px-5 py-3 rounded-none tracking-wider border-2 border-blue-sail shadow-[3px_3px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                          >
                            <span>GABUNG GRUP WHATSAPP</span>
                            <Icon name="ExternalLink" size={11} />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Celebration message */}
                  {celebrationPhase >= 4 && (
                    <motion.div
                      className="text-center bg-blue-sail/5 p-4 border border-blue-sail/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs sm:text-sm font-sans text-blue-sail/80 leading-relaxed italic">
                        "Perjalanan Anda sebagai panitia TDC Summit Fest 2026 resmi dimulai! Terima kasih atas dedikasi dan semangat Anda dalam setiap tahap seleksi. Bersama kita wujudkan acara yang luar biasa!"
                      </p>
                    </motion.div>
                  )}

                  {/* Back button */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => {
                        setResult(null);
                        setSearchNrp('');
                      }}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-sail hover:text-decor border-b-2 border-blue-sail/25 hover:border-decor pb-0.5 transition-all font-mono"
                    >
                      <Icon name="ArrowLeft" size={12} />
                      <span>Kembali ke Pencarian</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══════════════════════════════════════════════════
               ████  REJECTED — RESPECTFUL CARD  ████
               ═══════════════════════════════════════════════════ */
            <motion.div
              key="result-rejected"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#2A4C9E] relative overflow-hidden"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-block bg-blue-sail/10 p-4 border-2 border-blue-sail/20 text-blue-sail/50 transform rotate-3 mb-2">
                    <Icon name="XCircle" size={36} />
                  </div>
                  <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-wide leading-none">
                    TERIMA KASIH
                  </h2>
                  <p className="text-xs font-mono font-bold text-blue-sail/60 uppercase">
                    Seleksi Wawancara — TSF 2026
                  </p>
                </div>

                <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 space-y-3 font-sans">
                  <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-2">
                    <span className="text-[10px] text-blue-sail/50 uppercase font-bold">Nama Lengkap</span>
                    <span className="col-span-2 text-sm font-semibold text-blue-sail">{result.full_name}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-2">
                    <span className="text-[10px] text-blue-sail/50 uppercase font-bold">NRP / NIM</span>
                    <span className="col-span-2 text-sm font-mono font-semibold text-blue-sail">{result.nim}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-[10px] text-blue-sail/50 uppercase font-bold">Divisi</span>
                    <span className="col-span-2 text-sm font-semibold text-blue-sail/70">{result.division}</span>
                  </div>
                </div>

                <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 text-xs sm:text-sm font-sans text-blue-sail/80 leading-relaxed text-justify space-y-2">
                  <p>
                    Terima kasih banyak atas ketertarikan dan usaha Anda untuk bergabung sebagai Staff Panitia TDC Summit Fest 2026. Kami sangat mengapresiasi semangat dan dedikasi yang Anda tunjukkan hingga tahap wawancara.
                  </p>
                  <p>
                    Setelah melalui pertimbangan matang dari seluruh tim seleksi, mohon maaf kami belum dapat menerima Anda sebagai staff resmi pada kesempatan kali ini.
                  </p>
                  <p>
                    Jangan berkecil hati! Pengalaman ini adalah bagian dari perjalanan Anda. Kami sangat mengundang Anda untuk terus berpartisipasi meramaikan TDC Summit Fest 2026 sebagai pengunjung, peserta kompetisi, maupun partisipan sub-event seru lainnya. Sampai jumpa!
                  </p>
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      setResult(null);
                      setSearchNrp('');
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-sail hover:text-decor border-b-2 border-blue-sail/25 hover:border-decor pb-0.5 transition-all font-mono"
                  >
                    <Icon name="ArrowLeft" size={12} />
                    <span>Kembali ke Pencarian</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
