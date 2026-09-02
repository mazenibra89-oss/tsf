import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { AuthModal } from '../components/AuthModal';

export const ParticipantDashboard: React.FC = () => {
  const { currentUser, myTeam, fetchMyTeam, submitPreliminaryFile, submitSemiFinalPayment, submitSemiFinalFile, setCurrentPage } = useApp();

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

  const [semiFile, setSemiFile] = useState<File | null>(null);
  const [semiFileName, setSemiFileName] = useState('');
  const [semiFileUrl, setSemiFileUrl] = useState('');
  const [isSubmittingSemi, setIsSubmittingSemi] = useState(false);
  const [semiError, setSemiError] = useState('');
  const [semiSuccessMsg, setSemiSuccessMsg] = useState('');

  const [viewingFile, setViewingFile] = useState<{ url: string; title: string; fileName?: string } | null>(null);

  const SAMPLE_DOC_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%232A4C9E"/><rect x="20" y="20" width="560" height="360" fill="%23FFF" stroke="%23F6BB02" stroke-width="4"/><text x="50%" y="80" font-family="sans-serif" font-size="22" font-weight="bold" fill="%232A4C9E" text-anchor="middle">TDC SUMMIT FEST 2026</text><text x="50%" y="120" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23BD1B1F" text-anchor="middle">BERKAS PRATINJAU DOKUMEN PESERTA</text><line x1="50" y1="140" x2="550" y2="140" stroke="%232A4C9E" stroke-width="2"/><text x="60" y="180" font-family="sans-serif" font-size="14" fill="%23333">Status Berkas: Terverifikasi Sistem</text><text x="60" y="220" font-family="sans-serif" font-size="14" fill="%23333">Tipe Berkas: Kartu Identitas / KTM / Persyaratan Lomba</text><text x="60" y="260" font-family="sans-serif" font-size="14" fill="%23333">Status Validasi: Sesuai Ketentuan Pedoman</text><rect x="60" y="300" width="480" height="40" fill="%23F6BB02"/><text x="50%" y="325" font-family="sans-serif" font-size="14" font-weight="bold" fill="%232A4C9E" text-anchor="middle">DOC VERIFIED BY TDC COMMITTEE 2026</text></svg>`;

  const openDoc = (fileUrl?: string, docTitle?: string, fileName?: string) => {
    if (!fileUrl) {
      alert(`Berkas "${docTitle || 'Dokumen'}" belum diunggah.`);
      return;
    }
    setViewingFile({
      url: fileUrl,
      title: docTitle || 'Pratinjau Berkas',
      fileName: fileName || 'berkas_pendaftaran.pdf'
    });
  };

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

  const handleSemiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setSemiError('Ukuran berkas submission Semi Final maksimal 10MB.');
      return;
    }
    setSemiError('');
    setSemiFile(selected);
    setSemiFileName(selected.name);

    const reader = new FileReader();
    reader.onload = () => {
      setSemiFileUrl(reader.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleSemiUploadSubmit = async () => {
    if (!myTeam || (!semiFileUrl && !semiFileName)) {
      setSemiError('Pilih berkas submission Semi Final terlebih dahulu.');
      return;
    }
    setIsSubmittingSemi(true);
    setSemiError('');
    setSemiSuccessMsg('');

    try {
      await submitSemiFinalFile(myTeam.id, semiFileUrl || semiFileName, semiFileName);
      setIsSubmittingSemi(false);
      setSemiSuccessMsg('Berkas submission Semi Final berhasil dikumpulkan!');
    } catch (err: any) {
      setIsSubmittingSemi(false);
      setSemiError(err.message || 'Gagal mengunggah berkas Semi Final');
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

        {/* Preliminary Submission Action Box (Only visible when NOT passed preliminary) */}
        {myTeam.status_preliminary !== 'passed' && (
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
                  <button
                    type="button"
                    onClick={() => openDoc(myTeam.preliminary_file_url, myTeam.preliminary_file_name || 'Berkas Preliminary')}
                    className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="Eye" size={14} />
                    <span>LIHAT BERKAS</span>
                  </button>
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
        )}

        {/* Semi Final Portal Box (Appears when Preliminary is Passed) */}
        {myTeam.status_preliminary === 'passed' && (
          <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#BD1B1F] space-y-6">
            <div className="border-b-2 border-blue-sail/20 pb-4 flex items-center justify-between">
              <div>
                <span className="bg-emerald-600 text-white font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider inline-block mb-1">
                  STAGE 02 — BABAK SEMI FINAL
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-blue-sail">
                  PORTAL BABAK SEMI FINAL TIM {myTeam.team_name.toUpperCase()}
                </h3>
              </div>
              <span className="bg-decor text-blue-sail font-display font-black text-xs px-3 py-1 border border-blue-sail uppercase">
                STATUS: LOLOS PRELIMINARY
              </span>
            </div>

            {/* IF PAYMENT NOT VERIFIED YET */}
            {myTeam.payment_semifinal_status !== 'verified' ? (
              <div className="space-y-6">
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
                      <p>🔹 QRIS All Payment: Scan QRIS pada portal resmi</p>
                    </div>
                  </div>
                </div>

                {myTeam.payment_semifinal_status === 'pending' || myTeam.payment_semifinal_url ? (
                  <div className="bg-amber-500 text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-3">
                    <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                      <Icon name="Clock" size={22} />
                      <span>BUKTI PEMBAYARAN SUDAH DIKUMPULKAN — MENUNGGU VERIFIKASI ADMIN</span>
                    </h4>
                    <p className="text-xs font-sans opacity-90">
                      Bukti pembayaran Anda sedang diverifikasi oleh panitia. Setelah dikonfirmasi Admin, form submission berkas Semi Final akan otomatis terbuka di halaman ini.
                    </p>
                    {myTeam.payment_semifinal_url && (
                      <button
                        type="button"
                        onClick={() => openDoc(myTeam.payment_semifinal_url, `Bukti Pembayaran Semi Final - ${myTeam.team_name}`)}
                        className="bg-blue-sail text-decor font-display font-black text-xs uppercase px-4 py-2 border border-blue-sail inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon name="FileText" size={14} />
                        <span>LIHAT BUKTI TRANSFER SAYA</span>
                      </button>
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
            ) : (
              /* IF PAYMENT IS VERIFIED -> SHOW SEMI FINAL TASK SUBMISSION FORM! */
              <div className="space-y-6">
                <div className="bg-emerald-600 text-white p-5 border-2 border-blue-sail shadow-[4px_4px_0_0_#000] space-y-2">
                  <h4 className="font-display font-black text-lg uppercase flex items-center gap-2">
                    <Icon name="CheckCircle" size={22} />
                    <span>PEMBAYARAN DIVERIFIKASI — FORM SUBMISSION SEMI FINAL TERBUKA!</span>
                  </h4>
                  <p className="text-xs font-sans text-white/90">
                    Pembayaran registrasi Semi Final Anda telah diverifikasi oleh Panitia. Silakan unggah berkas proposal / solusi studi kasus Semi Final tim Anda di bawah ini.
                  </p>
                </div>

                {myTeam.semifinal_file_url ? (
                  <div className="bg-blue-sail/5 border-2 border-blue-sail p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xs text-emerald-700 bg-emerald-100 px-3 py-1 border border-emerald-300 uppercase flex items-center gap-1.5">
                        <Icon name="FileCheck" size={16} /> BERKAS SEMI FINAL SUDAH DIKUMPULKAN
                      </span>
                      <span className="text-[11px] font-sans text-blue-sail/60 font-semibold">
                        Status: Menunggu Penilaian Juri Semi Final
                      </span>
                    </div>

                    <div className="bg-white p-4 border border-blue-sail/30 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-display font-bold text-xs text-blue-sail uppercase block">
                          {myTeam.semifinal_file_name || `Proposal_SemiFinal_${myTeam.team_name}.pdf`}
                        </span>
                        <p className="text-[11px] font-sans text-blue-sail/70">
                          Format: PDF Document
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDoc(myTeam.semifinal_file_url, `Berkas Submission Semi Final - ${myTeam.team_name}`)}
                        className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon name="Eye" size={14} />
                        <span>LIHAT BERKAS SEMI FINAL</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-decor/20 border-2 border-blue-sail p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon name="Upload" size={20} className="text-red-inferno" />
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                        UNGGAH BERKAS SUBMISSION SEMI FINAL (PROPOSAL / FULL SOLUTION PDF)
                      </h4>
                    </div>

                    {semiError && (
                      <p className="text-red-600 text-xs font-sans font-semibold bg-red-50 p-2.5 border border-red-300">
                        {semiError}
                      </p>
                    )}

                    {semiSuccessMsg && (
                      <p className="text-emerald-700 text-xs font-sans font-semibold bg-emerald-50 p-2.5 border border-emerald-300">
                        {semiSuccessMsg}
                      </p>
                    )}

                    <div className="border-2 border-dashed border-blue-sail/40 p-6 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleSemiFileChange}
                        className="hidden"
                        id="semifinal-file-input"
                      />
                      <label htmlFor="semifinal-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                        <Icon name="FileText" size={36} className="text-blue-sail" />
                        <span className="text-xs font-display font-bold text-blue-sail uppercase">
                          {semiFileName ? `✓ FILE TERPILIH: ${semiFileName}` : 'Klik untuk Pilih File PDF Submission Semi Final (Maksimal 10MB)'}
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        disabled={isSubmittingSemi || !semiFileName}
                        onClick={handleSemiUploadSubmit}
                        className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingSemi ? (
                          <>
                            <Icon name="Loader2" size={16} className="animate-spin" />
                            <span>MENGIRIM BERKAS...</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Upload" size={16} />
                            <span>SUBMIT BERKAS SEMI FINAL</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={() => openDoc(myTeam.payment_proof_url, `KTM / Kartu Pelajar Ketua - ${myTeam.leader_name}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-inferno hover:underline pt-1 cursor-pointer"
                >
                  <Icon name="FileText" size={14} />
                  <span>KTM / Kartu Pelajar Ketua</span>
                </button>
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
                  <button
                    type="button"
                    onClick={() => openDoc(m.cardFileUrl, `KTM / Kartu Pelajar Anggota ${idx + 1} - ${m.fullName || m.name}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-sail hover:underline pt-1 cursor-pointer"
                  >
                    <Icon name="FileText" size={14} />
                    <span>KTM / Kartu Pelajar Anggota {idx + 1}</span>
                  </button>
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
                <button
                  type="button"
                  onClick={() => openDoc(myTeam.ig_story_file_url, `Bukti IG Story - ${myTeam.team_name}`)}
                  className="text-red-inferno hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Icon name="FileText" size={14} /> Bukti IG Story (PDF)
                </button>
              )}
              {myTeam.twibbon_file_url && (
                <button
                  type="button"
                  onClick={() => openDoc(myTeam.twibbon_file_url, `Bukti Twibbon Feeds - ${myTeam.team_name}`)}
                  className="text-red-inferno hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Icon name="FileText" size={14} /> Bukti Twibbon Feeds (PDF)
                </button>
              )}
              {myTeam.ig_follow_file_url && (
                <button
                  type="button"
                  onClick={() => openDoc(myTeam.ig_follow_file_url, `Bukti Follow IG - ${myTeam.team_name}`)}
                  className="text-red-inferno hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Icon name="FileText" size={14} /> Bukti Follow IG (PDF)
                </button>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* BERKAS FILE PREVIEW MODAL FOR PARTICIPANT DASHBOARD */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-sail/90 backdrop-blur-sm">
          <div className="bg-ballroom border-4 border-blue-sail p-5 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto space-y-4 shadow-[12px_12px_0_0_#BD1B1F]">
            <div className="flex items-center justify-between border-b-2 border-blue-sail/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-red-inferno text-white font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider border border-blue-sail">
                  PRATINJAU DOKUMEN TIM
                </span>
                <h3 className="font-display font-black text-lg uppercase text-blue-sail truncate max-w-md sm:max-w-xl">
                  {viewingFile.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="bg-red-inferno text-white p-1.5 border border-blue-sail hover:bg-red-700 cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Document Viewer Content */}
            <div className="bg-white border-2 border-blue-sail p-3">
              {viewingFile.url.startsWith('data:application/pdf') || viewingFile.url.endsWith('.pdf') ? (
                <iframe
                  src={viewingFile.url}
                  title={viewingFile.title}
                  className="w-full h-[70vh] border border-blue-sail/30 bg-gray-50"
                />
              ) : viewingFile.url.startsWith('data:image/') || viewingFile.url.match(/\.(jpg|jpeg|png|gif|svg)$/i) || viewingFile.url.startsWith('blob:') ? (
                <div className="bg-gray-900 border border-blue-sail/30 p-4 flex items-center justify-center min-h-[60vh]">
                  <img
                    src={viewingFile.url}
                    alt={viewingFile.title}
                    className="max-h-[70vh] max-w-full object-contain shadow-lg"
                  />
                </div>
              ) : (
                <div className="space-y-4 p-4 text-center">
                  <div className="bg-blue-sail/5 p-4 border border-blue-sail/20 inline-block text-left w-full">
                    <span className="bg-decor text-blue-sail font-display font-black text-[10px] px-2 py-0.5 uppercase border border-blue-sail inline-block mb-2">
                      INFORMASI BERKAS TIM
                    </span>
                    <p className="text-xs font-mono font-bold text-blue-sail">Nama Berkas: {viewingFile.url}</p>
                    <p className="text-xs font-sans text-blue-sail/70 mt-1">Status: Berkas telah tersimpan di sistem portal pendaftaran.</p>
                  </div>
                  <div className="border-2 border-dashed border-blue-sail/30 p-4 bg-gray-50 flex justify-center">
                    <img src={SAMPLE_DOC_SVG} alt="Pratinjau Berkas" className="max-h-[50vh] w-auto border-2 border-blue-sail shadow-md" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                {(viewingFile.url.startsWith('data:') || viewingFile.url.startsWith('http') || viewingFile.url.startsWith('blob:')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        if (viewingFile.url.startsWith('data:application/pdf')) {
                          win.document.write(`<html><head><title>${viewingFile.title}</title></head><body style="margin:0;"><iframe src="${viewingFile.url}" width="100%" height="100%" frameborder="0"></iframe></body></html>`);
                        } else if (viewingFile.url.startsWith('data:image/')) {
                          win.document.write(`<html><head><title>${viewingFile.title}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#111;"><img src="${viewingFile.url}" style="max-width:100%;max-height:100vh;"/></body></html>`);
                        } else {
                          win.location.href = viewingFile.url;
                        }
                      }
                    }}
                    className="bg-blue-sail hover:bg-barbera text-decor font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="ExternalLink" size={14} />
                    <span>BUKA DI TAB BARU</span>
                  </button>
                )}
                {viewingFile.url.startsWith('data:') && (
                  <a
                    href={viewingFile.url}
                    download={viewingFile.fileName || 'dokumen_pendaftaran'}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5"
                  >
                    <Icon name="Download" size={14} />
                    <span>UNDUH BERKAS</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-6 py-2 border-2 border-blue-sail cursor-pointer"
              >
                TUTUP PRATINJAU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
