import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';

interface CIResultData {
  full_name: string;
  nrp: string;
  department?: string;
  faculty?: string;
  status: 'lolos' | 'tidak_lolos';
  wa_group_url?: string;
}

interface SAResultData {
  id: string;
  full_name: string;
  school: string;
  city: string;
  status: 'lolos' | 'tidak_lolos';
  wa_group_url?: string;
}

const BIANCA_WA_URL = 'https://wa.me/6281259824958';

// ─── 16 REAL PASSED CAMPUS INFLUENCER NRPS ───
const PASSED_CI_NRPS = new Set([
  '5005261031',
  '5012261113',
  '5005261056',
  '5051261012',
  '5031261097',
  '5031261019',
  '5026261026',
  '5021261002',
  '5008261206',
  '5004261051',
  '5028261079',
  '5049261031',
  '5026261125',
  '5030261002',
  '5051261043',
  '5033261092'
]);

// ─── REAL PASSED STUDENT AMBASSADOR DATA ───
const REAL_SA_PASSED: SAResultData[] = [
  { id: 'sa-1', full_name: 'JASMINE ANANDA SHANNITA', school: 'SMAN 9 SURABAYA', city: 'Surabaya', status: 'lolos', wa_group_url: BIANCA_WA_URL },
  { id: 'sa-2', full_name: 'AUREL NUR FITRIANA', school: 'MAN KOTA SURABAYA', city: 'Surabaya', status: 'lolos', wa_group_url: BIANCA_WA_URL },
  { id: 'sa-3', full_name: 'Valentya Dwi Fitrianti', school: 'SMAN 4 Surabaya', city: 'Surabaya', status: 'lolos', wa_group_url: BIANCA_WA_URL },
  { id: 'sa-4', full_name: 'DINI CAMILIA RAMADHANI', school: 'SMAN 19 Surabaya', city: 'Surabaya', status: 'lolos', wa_group_url: BIANCA_WA_URL }
];

// Custom Festive Confetti Component
const Confetti: React.FC = () => {
  const colors = ['#BD1B1F', '#2A4C9E', '#FFC107', '#4CAF50', '#9C27B0', '#00BCD4', '#E91E63'];
  const confettiParticles = Array.from({ length: 110 }).map((_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth - window.innerWidth / 2,
    y: Math.random() * -700 - 100,
    size: Math.random() * 9 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.6,
    rotation: Math.random() * 360,
    duration: Math.random() * 2.5 + 2.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {confettiParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-0"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.45 ? '50%' : '0%',
          }}
          initial={{ x: 0, y: -20, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: window.innerHeight + 150, rotate: p.rotation + 1080, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

export const Announcement: React.FC = () => {
  const { ambassadorApplications } = useApp();

  // Active Category SubTab: 'ci' (Campus Influencer) | 'sa' (Student Ambassador)
  const [activeCategory, setActiveCategory] = useState<'ci' | 'sa'>('ci');

  // CI States
  const [searchNrp, setSearchNrp] = useState('');
  const [ciLoading, setCiLoading] = useState(false);
  const [ciResult, setCiResult] = useState<CIResultData | null>(null);
  const [ciErrorMsg, setCiErrorMsg] = useState('');

  // SA States
  const [searchSaQuery, setSearchSaQuery] = useState('');
  const [saLookupInput, setSaLookupInput] = useState('');
  const [saLoading, setSaLoading] = useState(false);
  const [saResult, setSaResult] = useState<SAResultData | null>(null);
  const [saErrorMsg, setSaErrorMsg] = useState('');

  // ─── SEARCH CI (NRP LOOKUP WITH REAL DATA MATCHING) ───
  const handleCiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const nrp = searchNrp.trim();
    if (!nrp) return;

    setCiLoading(true);
    setCiErrorMsg('');
    setCiResult(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const isPassed = PASSED_CI_NRPS.has(nrp);

    // 1. Check if applicant exists in AppContext / Database records
    const matchContext = (ambassadorApplications || []).find(
      app => app.role_choice === 'Campus Influencer' && (app.nrp === nrp || app.email?.includes(nrp) || app.whatsapp?.includes(nrp))
    );

    if (isPassed) {
      setCiResult({
        full_name: matchContext?.full_name || `Mahasiswa ITS (${nrp})`,
        nrp: nrp,
        status: 'lolos',
        wa_group_url: BIANCA_WA_URL
      });
      setCiLoading(false);
      return;
    }

    // 2. If NOT in passed NRP list, but exists in registered records -> TIDAK LOLOS
    if (matchContext) {
      setCiResult({
        full_name: matchContext.full_name,
        nrp: matchContext.nrp || nrp,
        status: 'tidak_lolos'
      });
      setCiLoading(false);
      return;
    }

    // 3. NRP not found in passed list and not in registration history
    setCiErrorMsg(`NRP ${nrp} tidak terdaftar dalam database hasil seleksi Campus Influencer TSF 2026. Pastikan NRP yang dimasukkan benar.`);
    setCiLoading(false);
  };

  // ─── SEARCH SA (INDIVIDUAL LOOKUP) ───
  const handleSaLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = saLookupInput.trim().toLowerCase();
    if (!q) return;

    setSaLoading(true);
    setSaErrorMsg('');
    setSaResult(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Match in REAL_SA_PASSED
    const matchReal = REAL_SA_PASSED.find(
      sa => sa.full_name.toLowerCase().includes(q) || sa.school.toLowerCase().includes(q)
    );

    if (matchReal) {
      setSaResult(matchReal);
      setSaLoading(false);
      return;
    }

    // Check AppContext
    const matchContext = (ambassadorApplications || []).find(
      app => app.role_choice === 'Student Ambassador' && (
        app.full_name.toLowerCase().includes(q) || app.school?.toLowerCase().includes(q) || app.whatsapp?.includes(q)
      )
    );

    if (matchContext) {
      setSaResult({
        id: matchContext.id,
        full_name: matchContext.full_name,
        school: matchContext.school || 'SMA/SMK Surabaya',
        city: 'Surabaya',
        status: matchContext.status === 'accepted' ? 'lolos' : 'tidak_lolos',
        wa_group_url: BIANCA_WA_URL
      });
      setSaLoading(false);
      return;
    }

    setSaErrorMsg(`Nama / Sekolah "${saLookupInput}" tidak terdaftar dalam daftar Student Ambassador yang lolos.`);
    setSaLoading(false);
  };

  // Combine Real SA Passed List + Accepted from Context
  const combinedSaList: SAResultData[] = [
    ...REAL_SA_PASSED,
    ...(ambassadorApplications || [])
      .filter(app => app.role_choice === 'Student Ambassador' && app.status === 'accepted')
      .map(app => ({
        id: app.id,
        full_name: app.full_name,
        school: app.school || 'SMA/SMK Surabaya',
        city: 'Surabaya',
        status: 'lolos' as const,
        wa_group_url: BIANCA_WA_URL
      }))
  ];

  // Remove duplicate entries by full_name
  const uniqueSaList = Array.from(new Map(combinedSaList.map(item => [item.full_name.toLowerCase(), item])).values());

  // Filter SA Table List
  const filteredSaList = uniqueSaList.filter(sa => {
    if (!searchSaQuery) return true;
    const q = searchSaQuery.toLowerCase();
    return sa.full_name.toLowerCase().includes(q) || sa.school.toLowerCase().includes(q) || sa.city.toLowerCase().includes(q);
  });

  return (
    <div className="asphalt-texture min-h-screen pt-12 pb-24 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-decor/5 transform skew-y-[-4deg] pointer-events-none" />

      {/* Trigger Confetti on Passed */}
      {((ciResult && ciResult.status === 'lolos') || (saResult && saResult.status === 'lolos')) && <Confetti />}

      <div className="max-w-4xl w-full px-4 relative z-10 flex-1 flex flex-col">
        {/* Header section */}
        <div className="text-center flex flex-col items-center mb-8">
          <span className="bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-3.5 py-1 uppercase tracking-widest border-2 border-blue-sail shadow-[2px_2px_0_0_#2A4C9E] mb-4">
            PENGUMUMAN HASIL SELEKSI AMBASSADOR
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-blue-sail mb-3">
            AMBASSADOR <span className="text-decor">RESULTS</span>
          </h1>
          <div className="w-20 h-1.5 bg-decor mx-auto mb-3" />
          <p className="text-xs sm:text-sm text-blue-sail/80 font-sans max-w-lg mx-auto">
            Hasil seleksi berkas <strong>Campus Influencer (ITS 2026)</strong> dan <strong>Student Ambassador (SMA/SMK)</strong> TDC Summit Fest 2026.
          </p>
        </div>

        {/* Sub-Tabs: Campus Influencer vs Student Ambassador */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-sail p-1 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] flex items-center gap-1">
            <button
              onClick={() => {
                setActiveCategory('ci');
                setCiResult(null);
                setCiErrorMsg('');
              }}
              className={`px-5 py-2.5 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'ci'
                  ? 'bg-decor text-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                  : 'bg-transparent text-ballroom/70 hover:text-ballroom'
              }`}
            >
              <Icon name="GraduationCap" size={16} />
              <span>Campus Influencer (ITS)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('sa');
                setSaResult(null);
                setSaErrorMsg('');
              }}
              className={`px-5 py-2.5 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeCategory === 'sa'
                  ? 'bg-decor text-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                  : 'bg-transparent text-ballroom/70 hover:text-ballroom'
              }`}
            >
              <Icon name="Users" size={16} />
              <span>Student Ambassador (SMA/SMK)</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB 1: CAMPUS INFLUENCER (NRP LOOKUP)
        ══════════════════════════════════════════════════ */}
        {activeCategory === 'ci' && (
          <AnimatePresence mode="wait">
            {!ciResult ? (
              <motion.div
                key="ci-form"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                className="bg-ballroom border-[4px] border-blue-sail p-6 sm:p-10 shadow-[10px_10px_0_0_#2A4C9E] relative max-w-2xl mx-auto w-full"
              >
                <div className="absolute top-0 right-0 h-2 bg-decor w-full" />
                
                <div className="mb-6 text-center">
                  <h3 className="font-display font-black text-2xl uppercase text-blue-sail tracking-tight">
                    Cek Status Kelulusan NRP
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-sail/70 font-sans mt-1">
                    Masukkan NRP ITS kamu di bawah ini untuk melihat hasil pengumuman resmi.
                  </p>
                </div>

                <form onSubmit={handleCiSearch} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-blue-sail">
                      NRP Mahasiswa ITS *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-blue-sail/40 pointer-events-none">
                        <Icon name="Search" size={18} />
                      </span>
                      <input
                        type="text"
                        required
                        disabled={ciLoading}
                        value={searchNrp}
                        onChange={(e) => setSearchNrp(e.target.value)}
                        placeholder="Contoh: 5005261031"
                        className="w-full pl-12 pr-4 py-4 text-base bg-white border-2 border-blue-sail rounded-none outline-none font-mono text-blue-sail transition-all focus:shadow-[3px_3px_0_0_#BD1B1F]"
                      />
                    </div>
                  </div>

                  {ciErrorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center space-x-2 text-red-inferno bg-red-inferno/5 border-l-4 border-red-inferno p-3.5 text-xs font-bold"
                    >
                      <Icon name="AlertTriangle" size={16} className="shrink-0" />
                      <span>{ciErrorMsg}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={ciLoading || !searchNrp.trim()}
                    className="w-full bg-decor hover:bg-decor/95 disabled:bg-decor/50 disabled:cursor-not-allowed text-blue-sail font-display font-black text-sm uppercase px-8 py-4.5 rounded-none tracking-widest border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {ciLoading ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        <span>MEMVERIFIKASI DATA...</span>
                      </>
                    ) : (
                      <>
                        <span>CEK STATUS KELULUSAN</span>
                        <Icon name="ArrowRight" size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* CI RESULT CARD */
              <motion.div
                key="ci-result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-ballroom border-[4px] border-blue-sail p-6 sm:p-10 shadow-[10px_10px_0_0_#2A4C9E] relative max-w-2xl mx-auto w-full overflow-hidden"
              >
                {ciResult.status === 'lolos' ? (
                  <div className="space-y-6 text-center">
                    {/* Festive Header Badge */}
                    <div className="relative">
                      <div className="inline-block bg-decor p-5 border-3 border-blue-sail text-blue-sail transform -rotate-2 mb-3 shadow-[4px_4px_0_0_#BD1B1F] animate-bounce">
                        <Icon name="Trophy" size={48} />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail">
                          ★ SELAMAT! KAMU RESMI LOLOS ★
                        </span>
                        <h2 className="font-display font-black text-3xl sm:text-4xl text-blue-sail tracking-wide uppercase leading-tight mt-2">
                          CAMPUS INFLUENCER TSF 2026
                        </h2>
                      </div>
                    </div>

                    {/* Participant Details: Display ONLY Nama Lengkap and NRP */}
                    <div className="bg-blue-sail text-ballroom p-6 border-3 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] space-y-4 text-left">
                      <div className="border-b border-ballroom/20 pb-3">
                        <span className="text-[10px] font-mono text-decor uppercase font-bold tracking-widest block mb-0.5">NAMA LENGKAP</span>
                        <p className="font-display font-black text-xl text-ballroom uppercase">{ciResult.full_name}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-decor uppercase font-bold tracking-widest block mb-0.5">NRP MAHASISWA</span>
                        <p className="font-mono font-bold text-lg text-decor tracking-wider">{ciResult.nrp}</p>
                      </div>
                    </div>

                    {/* Next Steps & CTA */}
                    <div className="bg-decor/20 p-5 border-2 border-blue-sail space-y-3 text-center">
                      <p className="text-xs font-display font-black text-blue-sail uppercase tracking-wide">
                        LANGKAH SELANJUTNYA UNTUK CAMPUS INFLUENCER:
                      </p>
                      <p className="text-xs text-blue-sail/80 font-sans leading-relaxed">
                        Selamat bergabung keluarga besar TDC Summit Fest 2026! Silakan konfirmasi dan hubungi Kak Bianca via WhatsApp untuk pembekalan dan koordinasi berikutnya.
                      </p>

                      <div className="pt-2 flex justify-center">
                        <a
                          href={BIANCA_WA_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#166534] tracking-widest transition-all"
                        >
                          <Icon name="MessageCircle" size={18} />
                          <span>HUBUNGI BIANCA (WA)</span>
                        </a>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => { setCiResult(null); setSearchNrp(''); }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-sail hover:text-decor cursor-pointer"
                      >
                        <Icon name="ArrowLeft" size={14} />
                        <span>Kembali & Cek NRP Lain</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CI NOT PASSED */
                  <div className="space-y-6 text-center">
                    <div className="space-y-2">
                      <div className="inline-block bg-blue-sail/10 p-4 border-2 border-blue-sail/20 text-blue-sail/50 transform rotate-3 mb-2">
                        <Icon name="XCircle" size={36} />
                      </div>
                      <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-wide leading-none">
                        TETAP SEMANGAT!
                      </h2>
                      <p className="text-xs font-mono font-bold text-blue-sail/60 uppercase">
                        Seleksi Campus Influencer TSF 2026
                      </p>
                    </div>

                    <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 text-left space-y-2 font-sans text-xs">
                      <p><strong>Nama:</strong> {ciResult.full_name}</p>
                      <p><strong>NRP:</strong> {ciResult.nrp}</p>
                    </div>

                    <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 text-xs font-sans text-blue-sail/80 leading-relaxed text-justify space-y-2">
                      <p>
                        Terima kasih banyak atas partisipasimu dalam seleksi Campus Influencer TDC Summit Fest 2026. Mohon maaf, kamu belum berhasil meloloskan diri pada kesempatan kali ini karena keterbatasan kuota.
                      </p>
                      <p>
                        Jangan berkecil hati! Kami sangat mengundangmu untuk tetap meramaikan TSF 2026 melalui event menarik lainnya. Sampai jumpa!
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => { setCiResult(null); setSearchNrp(''); }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-sail hover:text-decor cursor-pointer"
                      >
                        <Icon name="ArrowLeft" size={14} />
                        <span>Kembali & Cek NRP Lain</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: STUDENT AMBASSADOR (LOOKUP & ACCEPTED LIST)
        ══════════════════════════════════════════════════ */}
        {activeCategory === 'sa' && (
          <div className="space-y-6">
            {/* SA Individual Lookup Box */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-ballroom border-[3px] border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E]"
            >
              <h3 className="font-display font-black text-lg uppercase text-blue-sail mb-3">
                Cek Kelulusan Nama / Asal Sekolah
              </h3>

              <form onSubmit={handleSaLookup} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={saLookupInput}
                  onChange={(e) => setSaLookupInput(e.target.value)}
                  placeholder="Masukkan nama lengkap atau asal sekolah SMA/SMK..."
                  className="flex-1 bg-white border-2 border-blue-sail px-4 py-2.5 text-xs font-sans text-blue-sail outline-none"
                />
                <button
                  type="submit"
                  disabled={saLoading || !saLookupInput.trim()}
                  className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-6 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer"
                >
                  {saLoading ? 'MENCARI...' : 'CEK NAMA'}
                </button>
              </form>

              {saErrorMsg && (
                <p className="text-red-inferno font-mono text-xs font-bold mt-3">{saErrorMsg}</p>
              )}

              {/* SA Individual Result Card */}
              {saResult && (
                <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="bg-emerald-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      LOLOS STUDENT AMBASSADOR
                    </span>
                    <h4 className="font-display font-black text-base text-blue-sail uppercase mt-1">
                      {saResult.full_name}
                    </h4>
                    <p className="text-xs text-blue-sail/80 font-sans">
                      Sekolah: <strong>{saResult.school}</strong> | Kota: {saResult.city}
                    </p>
                  </div>
                  <a
                    href={BIANCA_WA_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5"
                  >
                    <Icon name="MessageCircle" size={14} />
                    <span>Konfirmasi</span>
                  </a>
                </div>
              )}
            </motion.div>

            {/* SA Full Accepted List Table */}
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-ballroom border-[3px] border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E]"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b-2 border-blue-sail/10 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    Daftar Peserta Lolos Student Ambassador
                  </h3>
                  <p className="text-xs text-blue-sail/60 font-sans mt-0.5">
                    Daftar perwakilan pelajar SMA/SMK Surabaya & sekitarnya yang berhasil lolos seleksi.
                  </p>
                </div>

                {/* Filter input for table */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchSaQuery}
                    onChange={(e) => setSearchSaQuery(e.target.value)}
                    placeholder="Filter nama / sekolah..."
                    className="w-full bg-white border-2 border-blue-sail text-xs p-2 pl-8 outline-none"
                  />
                  <Icon name="Search" size={14} className="absolute left-2.5 top-2.5 text-blue-sail/40" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-blue-sail text-ballroom font-mono text-[10px] uppercase tracking-wider border-b-2 border-blue-sail">
                      <th className="p-3">No</th>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3">Asal Sekolah</th>
                      <th className="p-3">Kota</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-sail/10">
                    {filteredSaList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-blue-sail/5 transition-colors">
                        <td className="p-3 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3 font-bold text-blue-sail">{item.full_name}</td>
                        <td className="p-3 font-semibold text-blue-sail/80">{item.school}</td>
                        <td className="p-3 text-blue-sail/60">📍 {item.city}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 uppercase border border-emerald-500">
                            LOLOS
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={BIANCA_WA_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold px-2.5 py-1 border border-blue-sail uppercase cursor-pointer"
                          >
                            <Icon name="MessageCircle" size={12} />
                            <span>Konfirmasi</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};
