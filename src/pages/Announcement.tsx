import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../components/Icon';

interface ApplicantData {
  full_name: string;
  nim: string;
  division_priority_1: string;
  division_priority_2?: string;
  status_berkas: 'pending' | 'lolos' | 'gagal';
  interview_schedule: string | null;
  whatsapp_group_link: string | null;
}

// Custom Confetti Component using framer motion particles
const Confetti: React.FC = () => {
  const colors = ['#BD1B1F', '#2A4C9E', '#FFC107', '#4CAF50', '#9C27B0', '#00BCD4'];
  const confettiParticles = Array.from({ length: 90 }).map((_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth - window.innerWidth / 2,
    y: Math.random() * -700 - 100,
    size: Math.random() * 8 + 6,
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
          initial={{
            x: 0,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: p.x,
            y: window.innerHeight + 150,
            rotate: p.rotation + 1080,
            opacity: 0,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export const Announcement: React.FC = () => {
  const [searchNrp, setSearchNrp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicantData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Mock or API Lookup
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const nrp = searchNrp.trim();
    if (!nrp) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    // Simulate networking delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 1. Mock Check Interception
    if (nrp === '5026211001') {
      setResult({
        full_name: 'Muhammad Fadhil',
        nim: '5026211001',
        division_priority_1: 'Sub Divisi Event - Competition',
        division_priority_2: 'Sub Divisi Event - Non Competition',
        status_berkas: 'lolos',
        interview_schedule: 'https://docs.google.com/spreadsheets/d/1RiUmpaCUrvYAiKw6uiWbX9xkeVUkVAH_',
        whatsapp_group_link: null,
      });
      setLoading(false);
      return;
    }

    if (nrp === '5026211002') {
      setResult({
        full_name: 'Siti Rahma',
        nim: '5026211002',
        division_priority_1: 'Sub Divisi Branding and Marketing - Social Media Content',
        division_priority_2: 'Sub Divisi Branding and Marketing - Visual Design & Creative',
        status_berkas: 'gagal',
        interview_schedule: null,
        whatsapp_group_link: null,
      });
      setLoading(false);
      return;
    }

    // Direct Frontend Interceptions (Bypasses API fetch for 5028251084 and 5028251017)
    if (['5028251084', '028251084', '28251084', '05028251084'].includes(nrp)) {
      setResult({
        full_name: "Aeesha Na'ilah Syifa'",
        nim: '5028251084',
        division_priority_1: 'Sub Divisi BnM - Creative Design',
        status_berkas: 'lolos',
        interview_schedule: 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0',
        whatsapp_group_link: null
      });
      setLoading(false);
      return;
    }

    if (['5028251017', '028251017', '28251017', '050251017', '05028251017'].includes(nrp)) {
      setResult({
        full_name: 'Dava Febriansyah',
        nim: '5028251017',
        division_priority_1: 'Sub Divisi BnM - Creative Design',
        status_berkas: 'lolos',
        interview_schedule: 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0',
        whatsapp_group_link: null
      });
      setLoading(false);
      return;
    }

    // 2. Real API Lookup Fallback
    try {
      const response = await fetch(`/api/announcement/${nrp}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('NRP tidak terdaftar dalam database pendaftaran staff TSF 2026.');
        } else {
          throw new Error('Terjadi kesalahan koneksi server. Silakan coba kembali.');
        }
      }
      const data = await response.json();
      
      // Frontend Override Fallback for BnM - Creative Design NRP typos to bypass backend cache/delay
      if (
        nrp === '5028251084' || nrp === '028251084' || nrp === '28251084' || nrp === '05028251084' ||
        data.nim === '5028251084'
      ) {
        data.status_berkas = 'lolos';
        data.division_priority_1 = 'Sub Divisi BnM - Creative Design';
        data.interview_schedule = 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0';
      } else if (
        nrp === '5028251017' || nrp === '028251017' || nrp === '28251017' || nrp === '05028251017' ||
        data.nim === '5028251017'
      ) {
        data.status_berkas = 'lolos';
        data.division_priority_1 = 'Sub Divisi BnM - Creative Design';
        data.interview_schedule = 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0';
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencari data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asphalt-texture min-h-screen pt-12 pb-24 relative overflow-hidden flex flex-col items-center">
      {/* Background track visual element */}
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-decor/5 transform skew-y-[-4deg] pointer-events-none" />

      {/* Conditionally trigger Confetti on Passed */}
      {result && result.status_berkas === 'lolos' && <Confetti />}

      <div className="max-w-3xl w-full px-4 relative z-10 flex-1 flex flex-col justify-center">
        {/* Header section */}
        <div className="text-center flex flex-col items-center mb-10">
          <span className="bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-widest border-2 border-blue-sail shadow-[2px_2px_0_0_#2A4C9E] mb-5">
            Pengumuman Seleksi Berkas
          </span>
          <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-blue-sail mt-2 mb-3">
            STAFF <span className="text-decor">SELECTION</span> RESULTS
          </h1>
          <div className="w-16 h-1.5 bg-decor mx-auto mb-3" />
          <p className="text-xs sm:text-sm text-blue-sail/70 font-sans max-w-md mx-auto">
            Masukkan NRP/NIM Anda untuk memverifikasi kelulusan seleksi tahap pertama (berkas) panitia TDC Summit Fest 2026.
          </p>
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
                      className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border-2 border-blue-sail rounded-none outline-none font-mono text-blue-sail transition-all focus:shadow-[3px_3px_0_0_#BD1B1F]"
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
                  className="w-full bg-decor hover:bg-decor/95 disabled:bg-decor/50 disabled:cursor-not-allowed text-ballroom font-display font-black text-xs uppercase px-8 py-4 rounded-none tracking-widest border-2 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-ballroom border-t-transparent" />
                      <span>MEMVERIFIKASI DATA...</span>
                    </>
                  ) : (
                    <>
                      <span>CEK KELULUSAN</span>
                      <Icon name="ArrowRight" size={14} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result-card"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#2A4C9E] relative overflow-hidden"
            >
              {result.status_berkas === 'lolos' ? (
                /* PASSED RESULTS CARD */
                <div className="space-y-6">
                  {/* Decorative checkerboard header */}
                  <div className="h-6 bg-blue-sail w-full flex items-center overflow-hidden opacity-10">
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                    <div className="h-full w-4 bg-ballroom rotate-12 mx-2 shrink-0" />
                  </div>

                  <div className="text-center space-y-2">
                    <div className="inline-block bg-decor p-4 border-2 border-blue-sail text-ballroom transform -rotate-3 mb-2 animate-bounce">
                      <Icon name="CheckCircle2" size={36} className="text-ballroom" />
                    </div>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-decor tracking-wide uppercase leading-none">
                      CONGRATULATIONS!
                    </h2>
                    <p className="text-xs font-mono font-bold text-blue-sail/60 uppercase">
                      Seleksi Tahap Berkas - TSF 2026
                    </p>
                  </div>

                  <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 space-y-3 font-sans">
                    <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-2">
                      <span className="text-[10px] text-blue-sail/50 uppercase font-bold">Nama Lengkap</span>
                      <span className="col-span-2 text-sm font-bold text-blue-sail">{result.full_name}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-2">
                      <span className="text-[10px] text-blue-sail/50 uppercase font-bold">NRP / NIM</span>
                      <span className="col-span-2 text-sm font-mono font-bold text-blue-sail">{result.nim}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-[10px] text-blue-sail/50 uppercase font-bold">Lolos Divisi</span>
                      <span className="col-span-2 text-sm font-bold text-red-inferno uppercase tracking-wide">
                        {result.division_priority_1}
                      </span>
                    </div>
                  </div>

                  {/* Interview schedule */}
                  <div className="bg-decor/5 p-4 border-[2px] border-decor/20 space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-red-inferno uppercase flex items-center space-x-1.5">
                        <Icon name="Clock" size={13} />
                        <span>JADWAL WAWANCARA:</span>
                      </h4>
                      <p className="text-xs text-blue-sail/70 font-sans pl-5 leading-relaxed">
                        Harap periksa jadwal wawancara Anda melalui tautan Google Sheets berikut.
                      </p>
                      <div className="pl-5 pt-1">
                        {result.interview_schedule ? (
                          <a
                            href={result.interview_schedule.startsWith('http') ? result.interview_schedule : `https://${result.interview_schedule}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 bg-decor hover:bg-decor/95 text-black font-display font-black text-[10px] uppercase px-4 py-2.5 rounded-none tracking-wider border-2 border-blue-sail shadow-[2px_2px_0_0_#2A4C9E] active:translate-x-0.5 active:translate-y-0.5 transition-all text-center"
                          >
                            <span>CEK JADWAL WAWANCARA</span>
                            <Icon name="ExternalLink" size={10} />
                          </a>
                        ) : (
                          <span className="text-blue-sail/40 text-xs italic">Tautan jadwal wawancara belum tersedia</span>
                        )}
                      </div>
                    </div>
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
              ) : (
                /* FAILED RESULTS CARD */
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-block bg-blue-sail/10 p-4 border-2 border-blue-sail/20 text-blue-sail/50 transform rotate-3 mb-2">
                      <Icon name="XCircle" size={36} />
                    </div>
                    <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-wide leading-none">
                      TETAP SEMANGAT!
                    </h2>
                    <p className="text-xs font-mono font-bold text-blue-sail/60 uppercase">
                      Seleksi Tahap Berkas - TSF 2026
                    </p>
                  </div>

                  <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 space-y-3 font-sans">
                    <div className="grid grid-cols-3 border-b border-blue-sail/10 pb-2">
                      <span className="text-[10px] text-blue-sail/50 uppercase font-bold">Nama Lengkap</span>
                      <span className="col-span-2 text-sm font-semibold text-blue-sail">{result.full_name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-[10px] text-blue-sail/50 uppercase font-bold">NRP / NIM</span>
                      <span className="col-span-2 text-sm font-mono font-semibold text-blue-sail">{result.nim}</span>
                    </div>
                  </div>

                  <div className="bg-blue-sail/5 p-4 border border-blue-sail/10 text-xs sm:text-sm font-sans text-blue-sail/80 leading-relaxed text-justify space-y-2">
                    <p>
                      Terima kasih banyak atas ketertarikan Anda untuk bergabung sebagai Staff Panitia TDC Summit Fest 2026. Kami sangat mengapresiasi waktu dan usaha yang Anda tuangkan dalam formulir pendaftaran.
                    </p>
                    <p>
                      Setelah melakukan kurasi berkas secara mendalam terhadap ratusan pendaftar, mohon maaf kami belum dapat meloloskan Anda ke seleksi tahap berikutnya. Kuota tiap divisi yang terbatas memaksa kami membuat keputusan yang sulit.
                    </p>
                    <p>
                      Jangan berkecil hati, perjalanan Anda masih panjang! Kami sangat mengundang Anda untuk terus berpartisipasi meramaikan TSF 2026 sebagai pengunjung bazar, peserta kompetisi, maupun partisipan sub-event seru lainnya. Sampai jumpa di keseruan TDC Summit Fest!
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
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
