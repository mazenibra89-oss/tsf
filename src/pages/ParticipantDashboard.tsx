import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion } from 'motion/react';
import { AuthModal } from '../components/AuthModal';

export const ParticipantDashboard: React.FC = () => {
  const { currentUser, myTeam, fetchMyTeam, submitPreliminaryFile, setCurrentPage } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchMyTeam();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="asphalt-texture min-h-screen pb-20 font-sans flex items-center justify-center p-4">
        <div className="bg-ballroom border-4 border-blue-sail p-8 shadow-[8px_8px_0_0_#BD1B1F] max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-decor text-blue-sail flex items-center justify-center mx-auto border-2 border-blue-sail shadow-[3px_3px_0_0_#8B011A]">
            <Icon name="Lock" size={32} />
          </div>
          <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
            AKSES PORTAL PESERTA
          </h2>
          <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
            Anda harus login terlebih dahulu untuk mengakses Participant Dashboard dan mengumpulkan berkas kompetisi.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="LogIn" size={16} />
            <span>LOGIN / DAFTAR AKUN</span>
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => fetchMyTeam()}
          message="Silakan login untuk mengakses Dashboard Peserta"
        />
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div className="asphalt-texture min-h-screen pb-20 font-sans flex items-center justify-center p-4">
        <div className="bg-ballroom border-4 border-blue-sail p-8 shadow-[8px_8px_0_0_#2A4C9E] max-w-lg w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-inferno text-ballroom flex items-center justify-center mx-auto border-2 border-blue-sail shadow-[3px_3px_0_0_#F6BB02]">
            <Icon name="AlertCircle" size={32} />
          </div>
          <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
            BELUM TERDAFTAR DI KOMPETISI
          </h2>
          <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
            Halo <strong>{currentUser.name}</strong>, akun Anda belum memiliki tim yang terdaftar pada TDC Summit Fest 2026 Business Competition.
          </p>
          <button
            onClick={() => setCurrentPage('competition')}
            className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="Trophy" size={16} />
            <span>DAFTARKAN TIM KOMPETISI SEKARANG</span>
          </button>
        </div>
      </div>
    );
  }

  const isBPC = myTeam.competition_type === 'BPC' || myTeam.category_id?.includes('BPC');
  const requiredFileType = isBPC ? 'BMC (Business Model Canvas)' : 'Executive Summary';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccessMsg('');
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Ukuran berkas melebihi 10MB');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadSubmit = async () => {
    if (!fileName && !fileUrl) {
      setError(`Wajib memilih file PDF ${requiredFileType}`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await submitPreliminaryFile(
        myTeam.id,
        fileUrl || fileName,
        fileName || `Berkas_Preliminary_${myTeam.team_name}.pdf`,
        isBPC ? 'BMC' : 'Executive Summary'
      );
      setIsSubmitting(false);
      setSuccessMsg(`Berkas ${requiredFileType} berhasil dikumpulkan! Status tim diperbarui.`);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Gagal mengunggah berkas');
    }
  };

  return (
    <div className="asphalt-texture min-h-screen pb-20 font-sans">
      
      {/* Dashboard Banner Header */}
      <section className="bg-blue-sail text-ballroom border-b-8 border-decor pt-10 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="bg-decor text-blue-sail font-display font-black text-xs px-3 py-1 uppercase tracking-wider border border-blue-sail inline-block mb-2">
                COMPETITOR PORTAL
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-shadow-md">
                DASHBOARD TIM {myTeam.team_name.toUpperCase()}
              </h1>
              <p className="text-xs sm:text-sm font-sans text-ballroom/80 mt-1">
                Cabang: <strong className="text-decor">{myTeam.competition_type || 'BPC'}</strong> | Kategori: <strong className="text-decor">{myTeam.education_category || 'Mahasiswa'}</strong> | Asal Institusi: <strong>{myTeam.institution}</strong>
              </p>
            </div>

            <div className="bg-ballroom/10 border-2 border-ballroom/30 p-3 text-right">
              <span className="text-[10px] font-display font-bold text-decor uppercase block">KETUA TIM</span>
              <span className="font-display font-black text-sm uppercase">{myTeam.leader_name}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Step Progression Stepper */}
        <div className="bg-ballroom border-4 border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E] space-y-4">
          <h3 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2">
            <Icon name="Compass" size={18} className="text-red-inferno" />
            <span>ALUR STAGE PERJALANAN KOMPETISI</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            
            {/* Stage 1: Preliminary */}
            <div className="bg-decor/20 border-3 border-blue-sail p-4 relative space-y-2 shadow-[3px_3px_0_0_#BD1B1F]">
              <div className="flex items-center justify-between">
                <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2.5 py-0.5 uppercase border border-decor">
                  STAGE 01
                </span>
                <span className="bg-emerald-600 text-white font-display font-bold text-[10px] px-2 py-0.5 uppercase">
                  TAHAP AKTIF
                </span>
              </div>
              <h4 className="font-display font-black text-base uppercase text-blue-sail">
                BABAK PRELIMINARY
              </h4>
              <p className="text-xs font-sans text-blue-sail/80">
                Pengumpulan berkas {isBPC ? 'BMC (Business Model Canvas)' : 'Executive Summary'}
              </p>
            </div>

            {/* Stage 2: Semi Final */}
            <div className="bg-gray-100 border-2 border-blue-sail/30 p-4 space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <span className="bg-gray-300 text-gray-700 font-display font-black text-[10px] px-2.5 py-0.5 uppercase border border-gray-400">
                  STAGE 02
                </span>
                <span className="bg-gray-400 text-white font-display font-bold text-[10px] px-2 py-0.5 uppercase flex items-center gap-1">
                  <Icon name="Lock" size={12} /> TERKUNCI
                </span>
              </div>
              <h4 className="font-display font-black text-base uppercase text-gray-600">
                BABAK SEMI FINAL
              </h4>
              <p className="text-xs font-sans text-gray-500">
                Terbuka setelah pengumuman hasil seleksi Preliminary.
              </p>
            </div>

            {/* Stage 3: Grand Final */}
            <div className="bg-gray-100 border-2 border-blue-sail/30 p-4 space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <span className="bg-gray-300 text-gray-700 font-display font-black text-[10px] px-2.5 py-0.5 uppercase border border-gray-400">
                  STAGE 03
                </span>
                <span className="bg-gray-400 text-white font-display font-bold text-[10px] px-2 py-0.5 uppercase flex items-center gap-1">
                  <Icon name="Lock" size={12} /> TERKUNCI
                </span>
              </div>
              <h4 className="font-display font-black text-base uppercase text-gray-600">
                GRAND FINAL &amp; AWARDING
              </h4>
              <p className="text-xs font-sans text-gray-500">
                Presentasi akhir &amp; penganugerahan pemenang.
              </p>
            </div>

          </div>
        </div>

        {/* Preliminary Submission Action Box */}
        <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#BD1B1F] space-y-6">
          <div className="border-b-2 border-blue-sail/20 pb-4">
            <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider inline-block mb-1">
              SUBMISSION TASK PRELIMINARY
            </span>
            <h3 className="font-display font-black text-2xl uppercase text-blue-sail">
              PENGUMPULAN BERKAS PRELIMINARY — {isBPC ? 'BMC' : 'EXECUTIVE SUMMARY'}
            </h3>
            <p className="text-xs text-blue-sail/80 font-sans mt-1">
              Untuk cabang <strong>{myTeam.competition_type || 'BPC'}</strong>, tim Anda diwajibkan mengunggah berkas <strong>{requiredFileType}</strong> dalam format PDF.
            </p>
          </div>

          {/* Submission Status Alerts */}
          {myTeam.status_preliminary === 'passed' && (
            <div className="bg-emerald-500 text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-2">
              <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <Icon name="CheckCircle" size={22} />
                <span>SELAMAT! TIM ANDA DIBERITAKAN LOLOS KE BABAK SEMI FINAL!</span>
              </h4>
              <p className="text-xs font-sans text-white/90">
                Tim {myTeam.team_name} berhasil lolos seleksi babak Preliminary. Informasi pembayaran dan instruksi babak Semi Final akan segera diaktifkan.
              </p>
            </div>
          )}

          {myTeam.status_preliminary === 'rejected' && (
            <div className="bg-red-inferno text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-2">
              <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <Icon name="XCircle" size={22} />
                <span>APRESIASI PENUH UNTUK TIM ANDA</span>
              </h4>
              <p className="text-xs font-sans text-white/90">
                Terima kasih atas partisipasi karya luar biasa dari tim {myTeam.team_name}. Tetap semangat berkarya di kompetisi mendatang!
              </p>
            </div>
          )}

          {/* Current File Preview */}
          {myTeam.preliminary_file_url ? (
            <div className="bg-blue-sail/5 border-2 border-blue-sail p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-xs text-emerald-700 bg-emerald-100 px-3 py-1 border border-emerald-300 uppercase flex items-center gap-1.5">
                  <Icon name="FileCheck" size={16} /> BERKAS SUDAH DIKUMPULKAN
                </span>
                <span className="text-[11px] font-sans text-blue-sail/60 font-semibold">
                  Status: Menunggu Penilaian Dewan Juri
                </span>
              </div>

              <div className="bg-white p-4 border border-blue-sail/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-display font-bold text-xs text-blue-sail uppercase block">
                    {myTeam.preliminary_file_name || `Berkas_Preliminary_${myTeam.team_name}.pdf`}
                  </span>
                  <p className="text-[11px] font-sans text-blue-sail/70">
                    Tipe Berkas: {myTeam.preliminary_file_type || (isBPC ? 'BMC' : 'Executive Summary')}
                  </p>
                </div>
                <a
                  href={myTeam.preliminary_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] shrink-0 flex items-center gap-1.5"
                >
                  <Icon name="Eye" size={14} />
                  <span>LIHAT BERKAS</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-decor/20 border-2 border-blue-sail p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="UploadCloud" size={20} className="text-red-inferno" />
                <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                  UNGGAH BERKAS PRELIMINARY ({requiredFileType})
                </h4>
              </div>

              {error && (
                <p className="text-red-600 text-xs font-sans font-semibold bg-red-50 p-2.5 border border-red-300">
                  {error}
                </p>
              )}

              {successMsg && (
                <p className="text-emerald-700 text-xs font-sans font-semibold bg-emerald-50 p-2.5 border border-emerald-300">
                  {successMsg}
                </p>
              )}

              <div className="border-2 border-dashed border-blue-sail/40 p-6 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="preliminary-file-input"
                />
                <label htmlFor="preliminary-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <Icon name="FileText" size={36} className="text-blue-sail" />
                  <span className="text-xs font-display font-bold text-blue-sail uppercase">
                    {fileName ? `✓ FILE TERPILIH: ${fileName}` : `Klik untuk Pilih File PDF ${requiredFileType} (Maksimal 10MB)`}
                  </span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={isSubmitting || !fileName}
                  onClick={handleUploadSubmit}
                  className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      <span>MENGIRIM BERKAS...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} />
                      <span>SUBMIT BERKAS PRELIMINARY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </section>

    </div>
  );
};
