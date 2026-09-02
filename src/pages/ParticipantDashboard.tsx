import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { AuthModal } from '../components/AuthModal';

export const ParticipantDashboard: React.FC = () => {
  const { currentUser, myTeam, fetchMyTeam, submitPreliminaryFile, submitSemiFinalPayment, setCurrentPage } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentFileName, setPaymentFileName] = useState('');
  const [paymentFileUrl, setPaymentFileUrl] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchMyTeam();
      const interval = setInterval(() => {
        fetchMyTeam();
      }, 3000);
      return () => clearInterval(interval);
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
            Anda harus login terlebih dahulu untuk mengakses Participant Dashboard dan memantau perjalanan tim kompetisi Anda.
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
            Halo <strong>{currentUser.name}</strong>, akun Anda belum mendaftarkan tim pada TDC Summit Fest 2026 Business Competition.
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileUrl(dataUrl);
      };
      reader.readAsDataURL(selectedFile);
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

  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setPaymentError('Ukuran file bukti pembayaran maksimal 10MB.');
      return;
    }
    setPaymentError('');
    setPaymentFile(selected);
    setPaymentFileName(selected.name);

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentFileUrl(reader.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handlePaymentUploadSubmit = async () => {
    if (!myTeam || (!paymentFileUrl && !paymentFileName)) {
      setPaymentError('Pilih file bukti pembayaran terlebih dahulu.');
      return;
    }
    setIsSubmittingPayment(true);
    setPaymentError('');
    setPaymentSuccessMsg('');

    try {
      await submitSemiFinalPayment(myTeam.id, paymentFileUrl || paymentFileName, paymentFileName);
      setIsSubmittingPayment(false);
      setPaymentSuccessMsg('Bukti pembayaran Semi Final berhasil dikirim! Menunggu verifikasi admin.');
    } catch (err: any) {
      setIsSubmittingPayment(false);
      setPaymentError(err.message || 'Gagal mengunggah bukti pembayaran');
    }
  };

  const leaderData = myTeam.leader_data || {};
  const membersList = Array.isArray(myTeam.members_data) ? myTeam.members_data : [];

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
                Cabang: <strong className="text-decor">{myTeam.competition_type || 'BPC'}</strong> | Kategori: <strong className="text-decor">{myTeam.education_category || 'Mahasiswa'}</strong> | Institusi: <strong>{myTeam.institution}</strong>
              </p>
            </div>

            <div className="bg-ballroom/10 border-2 border-ballroom/30 p-3.5 text-right">
              <span className="text-[10px] font-display font-bold text-decor uppercase block">KETUA TIM</span>
              <span className="font-display font-black text-base uppercase text-ballroom">{myTeam.leader_name}</span>
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
            <div className={`border-3 p-4 relative space-y-2 shadow-[3px_3px_0_0_#BD1B1F] ${
              myTeam.status_preliminary === 'passed'
                ? 'bg-emerald-50 border-emerald-600'
                : myTeam.status_preliminary === 'rejected'
                ? 'bg-red-50 border-red-500'
                : 'bg-decor/20 border-blue-sail'
            }`}>
              <div className="flex items-center justify-between">
                <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2.5 py-0.5 uppercase border border-decor">
                  STAGE 01
                </span>
                <span className={`font-display font-bold text-[10px] px-2 py-0.5 uppercase ${
                  myTeam.status_preliminary === 'passed'
                    ? 'bg-emerald-600 text-white'
                    : myTeam.status_preliminary === 'rejected'
                    ? 'bg-red-inferno text-white'
                    : myTeam.preliminary_file_url
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {myTeam.status_preliminary === 'passed'
                    ? '✓ LOLOS PRELIMINARY'
                    : myTeam.status_preliminary === 'rejected'
                    ? '✕ TIDAK LOLOS'
                    : myTeam.preliminary_file_url
                    ? 'DOKUMEN DITERIMA'
                    : 'PENILAIAN / PENDING'}
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
            <div className={`border-3 p-4 space-y-2 transition-all ${
              myTeam.status_preliminary === 'passed'
                ? myTeam.status_semifinal === 'passed'
                  ? 'bg-emerald-50 border-emerald-600 shadow-[3px_3px_0_0_#BD1B1F]'
                  : myTeam.status_semifinal === 'rejected'
                  ? 'bg-red-50 border-red-500 shadow-[3px_3px_0_0_#BD1B1F]'
                  : 'bg-decor/20 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-gray-100 border-blue-sail/30 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-display font-black text-[10px] px-2.5 py-0.5 uppercase border ${
                  myTeam.status_preliminary === 'passed'
                    ? 'bg-blue-sail text-decor border-decor'
                    : 'bg-gray-300 text-gray-700 border-gray-400'
                }`}>
                  STAGE 02
                </span>
                <span className={`font-display font-bold text-[10px] px-2 py-0.5 uppercase flex items-center gap-1 ${
                  myTeam.status_preliminary === 'passed'
                    ? myTeam.status_semifinal === 'passed'
                      ? 'bg-emerald-600 text-white'
                      : myTeam.status_semifinal === 'rejected'
                      ? 'bg-red-inferno text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {myTeam.status_preliminary === 'passed'
                    ? myTeam.status_semifinal === 'passed'
                      ? '✓ LOLOS SEMI FINAL'
                      : myTeam.status_semifinal === 'rejected'
                      ? '✕ TIDAK LOLOS SEMI FINAL'
                      : 'SEMI FINAL (PENDING)'
                    : '🔒 TERKUNCI'}
                </span>
              </div>
              <h4 className="font-display font-black text-base uppercase text-blue-sail">
                BABAK SEMI FINAL
              </h4>
              <p className="text-xs font-sans text-blue-sail/80">
                {myTeam.status_preliminary === 'passed'
                  ? myTeam.status_semifinal === 'passed'
                    ? 'Selamat! Tim Anda LOLOS ke babak Grand Final!'
                    : myTeam.status_semifinal === 'rejected'
                    ? 'Mohon maaf, perjalanan tim Anda terhenti di babak Semi Final.'
                    : 'Selamat! Tim Anda berhak mengikuti babak Semi Final.'
                  : 'Terbuka setelah pengumuman kelolosan babak Preliminary.'}
              </p>
            </div>

            {/* Stage 3: Grand Final */}
            <div className={`border-3 p-4 space-y-2 transition-all ${
              myTeam.status_semifinal === 'passed'
                ? myTeam.status_final === 'passed'
                  ? 'bg-purple-50 border-purple-600 shadow-[3px_3px_0_0_#BD1B1F]'
                  : myTeam.status_final === 'rejected'
                  ? 'bg-red-50 border-red-500 shadow-[3px_3px_0_0_#BD1B1F]'
                  : 'bg-decor/20 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-gray-100 border-blue-sail/30 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-display font-black text-[10px] px-2.5 py-0.5 uppercase border ${
                  myTeam.status_semifinal === 'passed'
                    ? 'bg-blue-sail text-decor border-decor'
                    : 'bg-gray-300 text-gray-700 border-gray-400'
                }`}>
                  STAGE 03
                </span>
                <span className={`font-display font-bold text-[10px] px-2 py-0.5 uppercase flex items-center gap-1 ${
                  myTeam.status_semifinal === 'passed'
                    ? myTeam.status_final === 'passed'
                      ? 'bg-purple-700 text-white'
                      : myTeam.status_final === 'rejected'
                      ? 'bg-red-inferno text-white'
                      : 'bg-amber-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {myTeam.status_semifinal === 'passed'
                    ? myTeam.status_final === 'passed'
                      ? '🏆 JUARA GRAND FINAL'
                      : myTeam.status_final === 'rejected'
                      ? '✕ TIDAK LOLOS FINAL'
                      : 'GRAND FINAL (PENDING)'
                    : '🔒 TERKUNCI'}
                </span>
              </div>
              <h4 className={`font-display font-black text-base uppercase ${myTeam.status_semifinal === 'passed' ? 'text-blue-sail' : 'text-gray-600'}`}>
                GRAND FINAL &amp; AWARDING
              </h4>
              <p className={`text-xs font-sans ${myTeam.status_semifinal === 'passed' ? 'text-blue-sail/80' : 'text-gray-500'}`}>
                {myTeam.status_semifinal === 'passed'
                  ? myTeam.status_final === 'passed'
                    ? 'Selamat! Tim Anda meraih Juara Grand Final TDC Summit Fest 2026!'
                    : 'Selamat! Tim Anda bertanding di babak Grand Final!'
                  : 'Presentasi akhir &amp; penganugerahan pemenang.'}
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
                <Icon name="Upload" size={20} className="text-red-inferno" />
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
                      <Icon name="Upload" size={16} />
                      <span>SUBMIT BERKAS PRELIMINARY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Semi Final Payment Box (Appears when Preliminary is Passed) */}
        {myTeam.status_preliminary === 'passed' && (
          <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#BD1B1F] space-y-6">
            <div className="border-b-2 border-blue-sail/20 pb-4">
              <span className="bg-emerald-600 text-white font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider inline-block mb-1">
                STAGE 02 — REGISTRASI SEMI FINAL
              </span>
              <h3 className="font-display font-black text-2xl uppercase text-blue-sail">
                PEMBAYARAN REGISTRASI BABAK SEMI FINAL
              </h3>
              <p className="text-xs text-blue-sail/80 font-sans mt-1">
                Selamat! Tim Anda <strong>LOLOS Seleksi Preliminary</strong>. Untuk melanjutkan ke babak Semi Final, silakan lakukan pembayaran registrasi Semi Final.
              </p>
            </div>

            {/* Payment Info Card */}
            <div className="bg-decor/20 border-2 border-blue-sail p-5 space-y-3 shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between border-b border-blue-sail/20 pb-2">
                <span className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-1.5">
                  <Icon name="CreditCard" size={16} /> BIAYA REGISTRASI SEMI FINAL
                </span>
                <span className="bg-blue-sail text-decor font-display font-black text-base px-3 py-1 border border-decor">
                  Rp 150.000 / Tim
                </span>
              </div>
              <div className="text-xs font-sans text-blue-sail space-y-1">
                <p><strong>Transfer Rekening Resmi Panitia TSF 2026:</strong></p>
                <div className="bg-white border border-blue-sail/30 p-3 font-mono space-y-1">
                  <p>🔹 Bank BCA: <strong>8290-1928-301</strong> a.n. Panitia TDC Summit Fest</p>
                  <p>🔹 Bank Mandiri: <strong>1400-0192-8301</strong> a.n. TDC SUMMIT FEST 2026</p>
                  <p>🔹 QRIS All Payment: Scan QRIS pada portal pembayaran resmi</p>
                </div>
              </div>
            </div>

            {/* Status alerts */}
            {myTeam.payment_semifinal_status === 'verified' ? (
              <div className="bg-emerald-600 text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-2">
                <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                  <Icon name="CheckCircle" size={22} />
                  <span>PEMBAYARAN DIVERIFIKASI — BERHAK BERTANDING DI SEMI FINAL!</span>
                </h4>
                <p className="text-xs font-sans opacity-90">
                  Pembayaran registrasi Semi Final Anda telah diverifikasi oleh Panitia. Tim Anda resmi bertanding di Babak Semi Final TDC Summit Fest 2026.
                </p>
              </div>
            ) : myTeam.payment_semifinal_status === 'pending' || myTeam.payment_semifinal_url ? (
              <div className="bg-amber-500 text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-2">
                <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                  <Icon name="Clock" size={22} />
                  <span>BUKTI PEMBAYARAN TERKIRIM — MENUNGGU VERIFIKASI ADMIN</span>
                </h4>
                <p className="text-xs font-sans opacity-90">
                  Bukti transfer registrasi Semi Final Anda sedang dalam proses verifikasi oleh panitia. Silakan cek berkala halaman ini.
                </p>
                {myTeam.payment_semifinal_file_name && (
                  <p className="text-xs font-mono font-bold bg-amber-600 px-3 py-1 inline-block border border-amber-400">
                    Berkas: {myTeam.payment_semifinal_file_name}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2">
                  <Icon name="Upload" size={16} className="text-red-inferno" />
                  <span>UNGGAH BUKTI TRANSFER REGISTRASI SEMI FINAL</span>
                </h4>

                {paymentError && (
                  <p className="bg-red-inferno text-white font-sans text-xs p-3 font-semibold border border-blue-sail">
                    {paymentError}
                  </p>
                )}
                {paymentSuccessMsg && (
                  <p className="bg-emerald-600 text-white font-sans text-xs p-3 font-semibold border border-blue-sail">
                    {paymentSuccessMsg}
                  </p>
                )}

                <div className="border-2 border-dashed border-blue-sail/40 p-6 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handlePaymentFileChange}
                    className="hidden"
                    id="semifinal-payment-file-input"
                  />
                  <label htmlFor="semifinal-payment-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <Icon name="FileText" size={36} className="text-blue-sail" />
                    <span className="text-xs font-display font-bold text-blue-sail uppercase">
                      {paymentFileName ? `✓ FILE TERPILIH: ${paymentFileName}` : 'Klik untuk Pilih File Bukti Transfer (PDF / Gambar, Maksimal 10MB)'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={isSubmittingPayment || !paymentFileName}
                    onClick={handlePaymentUploadSubmit}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        <span>MENGIRIM BUKTI...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={16} />
                        <span>SUBMIT BUKTI PEMBAYARAN SEMI FINAL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAIL TIM & ANGGOTA SECTION */}
        <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-8 shadow-[6px_6px_0_0_#2A4C9E] space-y-6">
          <div className="border-b-2 border-blue-sail/20 pb-4 flex items-center justify-between">
            <div>
              <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider inline-block mb-1">
                TEAM REGISTRATION DETAIL
              </span>
              <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                DATA ANGGOTA &amp; BERKAS SYARAT TIM
              </h3>
            </div>
            <span className="bg-decor text-blue-sail font-display font-bold text-xs px-3 py-1 uppercase border border-blue-sail">
              JUMLAH: {1 + membersList.length} PERSONIL
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Ketua Tim Card */}
            <div className="bg-white border-2 border-blue-sail p-5 space-y-3 shadow-[4px_4px_0_0_#BD1B1F]">
              <div className="flex items-center justify-between border-b pb-2 border-blue-sail/10">
                <span className="bg-red-inferno text-white font-display font-black text-[10px] px-2.5 py-0.5 uppercase">
                  KETUA TIM
                </span>
                <span className="text-[11px] font-mono text-blue-sail/60">
                  {myTeam.email}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-sans text-blue-sail">
                <p><strong className="font-display uppercase text-blue-sail">Nama Lengkap:</strong> {myTeam.leader_name}</p>
                <p><strong className="font-display uppercase text-blue-sail">Institusi:</strong> {myTeam.institution}</p>
                {leaderData.studentId && <p><strong className="font-display uppercase text-blue-sail">NRP / NIM:</strong> {leaderData.studentId}</p>}
                {leaderData.major && <p><strong className="font-display uppercase text-blue-sail">Jurusan:</strong> {leaderData.major}</p>}
                {leaderData.grade && <p><strong className="font-display uppercase text-blue-sail">Kelas:</strong> Kelas {leaderData.grade}</p>}
                {leaderData.domicile && <p><strong className="font-display uppercase text-blue-sail">Domisili:</strong> {leaderData.domicile}</p>}
                <p><strong className="font-display uppercase text-blue-sail">WhatsApp:</strong> {myTeam.contact}</p>
              </div>

              {myTeam.payment_proof_url && (
                <a
                  href={myTeam.payment_proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-inferno hover:underline pt-1"
                >
                  <Icon name="FileText" size={14} />
                  <span>KTM / Kartu Pelajar Ketua</span>
                </a>
              )}
            </div>

            {/* Anggota Tim Cards */}
            {membersList.map((m: any, idx: number) => (
              <div key={idx} className="bg-white border-2 border-blue-sail p-5 space-y-3 shadow-[4px_4px_0_0_#2A4C9E]">
                <div className="flex items-center justify-between border-b pb-2 border-blue-sail/10">
                  <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2.5 py-0.5 uppercase">
                    ANGGOTA {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-blue-sail/60">
                    {m.email || '-'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-sans text-blue-sail">
                  <p><strong className="font-display uppercase text-blue-sail">Nama Lengkap:</strong> {m.fullName || m.name || '-'}</p>
                  <p><strong className="font-display uppercase text-blue-sail">Institusi:</strong> {m.institution || '-'}</p>
                  {m.studentId && <p><strong className="font-display uppercase text-blue-sail">NRP / NIM:</strong> {m.studentId}</p>}
                  {m.major && <p><strong className="font-display uppercase text-blue-sail">Jurusan:</strong> {m.major}</p>}
                  {m.grade && <p><strong className="font-display uppercase text-blue-sail">Kelas:</strong> Kelas {m.grade}</p>}
                  {m.domicile && <p><strong className="font-display uppercase text-blue-sail">Domisili:</strong> {m.domicile}</p>}
                  {m.whatsapp && <p><strong className="font-display uppercase text-blue-sail">WhatsApp:</strong> {m.whatsapp}</p>}
                </div>

                {m.cardFileUrl && (
                  <a
                    href={m.cardFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-sail hover:underline pt-1"
                  >
                    <Icon name="FileText" size={14} />
                    <span>KTM / Kartu Pelajar Anggota {idx + 1}</span>
                  </a>
                )}
              </div>
            ))}

          </div>

          {/* Uploaded Requirement PDFs */}
          <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail/20 space-y-2">
            <h4 className="font-display font-black text-xs uppercase text-blue-sail">
              BERKAS SYARAT UMUM PENDAFTARAN TIM
            </h4>
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              {myTeam.ig_story_file_url && (
                <a href={myTeam.ig_story_file_url} target="_blank" rel="noreferrer" className="text-red-inferno hover:underline flex items-center gap-1 font-bold">
                  <Icon name="FileText" size={14} /> Bukti IG Story (PDF)
                </a>
              )}
              {myTeam.twibbon_file_url && (
                <a href={myTeam.twibbon_file_url} target="_blank" rel="noreferrer" className="text-red-inferno hover:underline flex items-center gap-1 font-bold">
                  <Icon name="FileText" size={14} /> Bukti Twibbon Feeds (PDF)
                </a>
              )}
              {myTeam.ig_follow_file_url && (
                <a href={myTeam.ig_follow_file_url} target="_blank" rel="noreferrer" className="text-red-inferno hover:underline flex items-center gap-1 font-bold">
                  <Icon name="FileText" size={14} /> Bukti Follow IG (PDF)
                </a>
              )}
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
