import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { Competition } from '../types';

export const RegistCompetition: React.FC = () => {
  const { phases, competitions, addCompetitionRegistration } = useApp();
  
  // Find competition phase status
  const compPhase = phases.find(p => p.name === 'competition') || {
    status: 'active',
    end_date: '2026-10-10'
  };

  const isClosed = compPhase.status !== 'active';

  // Active category tab state
  const [activeTabId, setActiveTabId] = useState<string>(competitions[0]?.id || 'c-1');
  const activeComp = competitions.find(c => c.id === activeTabId) || competitions[0];

  // Form registration states
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    membersText: '', // comma separated or list
    institution: '',
    contact: '',
    email: '',
    categoryId: competitions[0]?.id || 'c-1',
    paymentProofUrl: '',
    fileUrl: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Drag and drop payment proof simulator
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setFormData(prev => ({ ...prev, paymentProofUrl: `https://storage.tsf.id/payments/${file.name}` }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setFormData(prev => ({ ...prev, paymentProofUrl: `https://storage.tsf.id/payments/${file.name}` }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.teamName.trim()) errors.teamName = 'Nama tim atau nama individu wajib diisi';
    if (!formData.leaderName.trim()) errors.leaderName = 'Nama ketua atau pendaftar utama wajib diisi';
    if (!formData.institution.trim()) errors.institution = 'Asal instansi/sekolah/kampus wajib diisi';
    if (!formData.contact.trim()) {
      errors.contact = 'Nomor WhatsApp wajib diisi';
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.contact.replace(/[\s-]/g, ''))) {
      errors.contact = 'Format nomor WhatsApp tidak valid';
    }
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    if (!formData.paymentProofUrl) {
      errors.paymentProofUrl = 'Harap unggah bukti pembayaran biaya pendaftaran';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Split members by comma
    const membersList = formData.membersText
      ? formData.membersText.split(',').map(m => m.trim()).filter(m => m !== '')
      : [];

    setTimeout(() => {
      addCompetitionRegistration({
        team_name: formData.teamName,
        leader_name: formData.leaderName,
        members: membersList,
        institution: formData.institution,
        contact: formData.contact,
        email: formData.email,
        category_id: formData.categoryId,
        payment_proof_url: formData.paymentProofUrl,
        file_url: formData.fileUrl || undefined
      });
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        teamName: '',
        leaderName: '',
        membersText: '',
        institution: '',
        contact: '',
        email: '',
        categoryId: activeTabId,
        paymentProofUrl: '',
        fileUrl: ''
      });
      setUploadedFileName('');
    }, 1200);
  };

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO BANNER */}
        <section className="bg-blue-sail text-ballroom rounded-none border-4 border-decor p-8 sm:p-12 mb-12 relative overflow-hidden shadow-[8px_8px_0_0_#BD1B1F]">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 space-y-4 text-center md:text-left">
            <span className={`inline-block font-mono text-xs font-bold px-3 py-1 rounded-none border uppercase tracking-wider ${
              isClosed ? 'bg-red-inferno text-ballroom border-red-700' : 'bg-decor text-blue-sail border-decor animate-pulse'
            }`}>
              {isClosed ? 'Pendaftaran Ditutup' : 'Pendaftaran Kompetisi Dibuka'}
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight">
              TSF NATIONAL <span className="text-decor">COMPETITIONS</span>
            </h1>
            <p className="text-sm sm:text-base text-ballroom/80 max-w-2xl font-sans leading-relaxed">
              Tunjukkan talenta terbaikmu di ajang kompetisi berskala nasional! Perebutkan total hadiah puluhan juta rupiah, piala kejuaraan tetap, sertifikat resmi, serta kesempatan tampil langsung di panggung megah utama TSF Festival 2026.
            </p>
            <div className="pt-2 font-mono text-xs text-decor font-bold">
              <span>BATAS AKHIR PENDAFTARAN: {compPhase.end_date}</span>
            </div>
          </div>
        </section>

        {/* 2. CATEGORIES DETAILS TABS */}
        <section className="mb-16">
          {/* Tabs header list */}
          <div className="flex flex-wrap border-b-4 border-blue-sail mb-8 gap-2">
            {competitions.map(comp => (
              <button
                id={`comp-tab-${comp.id}`}
                key={comp.id}
                onClick={() => {
                  setActiveTabId(comp.id);
                  setFormData(prev => ({ ...prev, categoryId: comp.id }));
                }}
                className={`px-5 py-3.5 font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all relative top-[4px] border-2 border-b-0 rounded-none cursor-pointer ${
                  activeTabId === comp.id
                    ? 'bg-blue-sail border-blue-sail text-decor font-extrabold shadow-[4px_-4px_0_0_#F6BB02]'
                    : 'bg-ballroom/40 border-blue-sail/30 text-blue-sail/70 hover:bg-ballroom/80 hover:text-blue-sail'
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>

          {activeComp && (
            <div className="bg-ballroom rounded-none border-4 border-blue-sail p-6 sm:p-8 shadow-[8px_8px_0_0_#2A4C9E] grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Category Left details */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2 py-1 rounded-none border border-red-700 uppercase tracking-widest">
                    Kategori: {activeComp.category}
                  </span>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-blue-sail mt-2">
                    {activeComp.title}
                  </h3>
                  <p className="text-sm text-blue-sail/80 font-sans leading-relaxed mt-2.5">
                    {activeComp.description}
                  </p>
                </div>

                {/* Terms and conditions */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-sm uppercase text-blue-sail tracking-wide flex items-center space-x-1.5">
                    <div className="w-2.5 h-4 bg-decor border border-blue-sail" />
                    <span>Syarat & Ketentuan Umum</span>
                  </h4>
                  <ul className="space-y-1.5 font-sans text-xs sm:text-sm text-blue-sail/90">
                    {activeComp.terms.map((term, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Icon name="Check" size={14} className="text-decor shrink-0 mt-0.5 stroke-[3px]" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline and Dates */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-sm uppercase text-blue-sail tracking-wide flex items-center space-x-1.5">
                    <div className="w-2.5 h-4 bg-decor border border-blue-sail" />
                    <span>Timeline Penting</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeComp.timeline.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-none border-2 border-blue-sail text-center font-mono relative shadow-[3px_3px_0_0_#2A4C9E]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-sail" />
                        <span className="block text-[10px] font-bold text-blue-sail/60 uppercase">{item.step}</span>
                        <span className="block text-xs font-bold text-red-inferno mt-1.5">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Right Sidebar */}
              <div className="bg-blue-sail text-ballroom p-6 rounded-none border-4 border-decor flex flex-col justify-between shadow-[6px_6px_0_0_#BD1B1F]">
                <div className="space-y-6">
                  <div>
                    <span className="font-mono text-[9px] font-black uppercase text-decor tracking-widest">// PRIZE POOL</span>
                    <h4 className="font-display font-extrabold text-sm uppercase mt-1">TOTAL HADIAH UTAMA</h4>
                    <p className="font-display font-black text-2xl text-decor tracking-tight mt-1.5 leading-none">
                      {activeComp.prize.split('+')[0].trim()}
                    </p>
                    <p className="text-[10px] text-ballroom/75 font-mono mt-1">
                      {activeComp.prize.includes('+') ? `+ ${activeComp.prize.split('+').slice(1).join('+')}` : ''}
                    </p>
                  </div>

                  <div className="border-t-2 border-ballroom/20 pt-4 space-y-2 text-xs font-sans">
                    <p className="font-bold text-decor">Biaya Registrasi Kompetisi:</p>
                    <div className="bg-barbera/40 p-2.5 rounded-none border border-decor/20 flex justify-between items-center">
                      <span>Per Tim / Individu:</span>
                      <span className="font-mono font-bold text-decor text-sm">Rp 100.000,-</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold">Butuh Panduan Lengkap?</p>
                    <p className="text-[10px] text-ballroom/75 leading-relaxed">
                      Unduh berkas TOR (Terms of Reference) resmi berisi juknis lengkap pendaftaran, penilaian, lagu wajib, dan regulasi balap simulator.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={activeComp.guidebook_url}
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Mengunduh Guidebook (TOR) Kompetisi TSF.pdf... (Simulasi)');
                    }}
                    className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all tracking-wider flex items-center justify-center space-x-1.5 text-center cursor-pointer"
                  >
                    <Icon name="Download" size={14} className="stroke-[2.5px]" />
                    <span>DOWNLOAD GUIDEBOOK / TOR</span>
                  </a>
                </div>

              </div>

            </div>
          )}
        </section>

        {/* 3. QRIS/BANK DETAILS PANEL */}
        <section className="mb-16 max-w-4xl mx-auto">
          <div className="bg-barbera text-ballroom p-6 sm:p-8 rounded-none border-4 border-decor shadow-[8px_8px_0_0_#F6BB02] flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0 bg-white p-2.5 rounded-none border-4 border-blue-sail flex items-center justify-center w-28 h-28 relative shadow-[4px_4px_0_0_#2A4C9E]">
              <div className="absolute inset-0 bg-blue-sail/5" />
              {/* Simple mock QR code visual using HTML lines */}
              <div className="w-full h-full border-4 border-blue-sail/45 p-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-5 h-5 bg-blue-sail" />
                  <div className="w-5 h-5 bg-blue-sail" />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center py-1">
                  <span className="font-mono font-bold text-[9px] text-blue-sail tracking-tight">QRIS TSF</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-5 h-5 bg-blue-sail" />
                  <div className="w-5 h-5 border-2 border-blue-sail" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-center md:text-left">
              <h4 className="font-display font-black text-lg uppercase text-decor tracking-tight">INFORMASI BIAYA & PEMBAYARAN</h4>
              <p className="text-xs sm:text-sm text-ballroom/85 font-sans leading-relaxed">
                Biaya pendaftaran seluruh cabang kompetisi adalah sebesar <strong>Rp 100.000,- (Seratus Ribu Rupiah)</strong>. Silakan scan kode QRIS TSF di samping atau transfer ke rekening Bank Mandiri: <strong>140-00-21110-441</strong> a.n. <strong>Panitia TSF Festival</strong>. Simpan bukti transfer dalam format JPG/PNG untuk diunggah pada formulir pendaftaran.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FORM PENDAFTARAN KOMPETISI */}
        <section id="comp-form-section" className="max-w-4xl mx-auto scroll-mt-20">
          <div className="bg-ballroom rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden">
            
            {/* Header Form */}
            <div className="bg-blue-sail text-ballroom p-6 border-b-4 border-decor relative">
              <div className="absolute inset-0 grid-pattern opacity-10" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="bg-decor text-blue-sail p-3 rounded-none border-2 border-blue-sail">
                  <Icon name="Trophy" size={28} className="stroke-[2.5px]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-decor">
                    FORM PENDAFTARAN PESERTA KOMPETISI
                  </h3>
                  <p className="text-xs text-ballroom/85 font-sans mt-0.5">
                    Lengkapi seluruh berkas registrasi tim untuk mengamankan slot pertandingan cabang lomba pilihanmu.
                  </p>
                </div>
              </div>
            </div>

            {isClosed ? (
              /* CLOSED STATE BANNER */
              <div className="p-8 sm:p-12 text-center space-y-6">
                <div className="text-red-inferno flex justify-center mb-2">
                  <Icon name="XCircle" size={64} className="animate-pulse" />
                </div>
                <h4 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
                  PENDAFTARAN LOMBA TELAH DITUTUP
                </h4>
                <p className="text-sm text-blue-sail/80 max-w-md mx-auto font-sans leading-relaxed">
                  Mohon maaf, batas waktu pendaftaran seluruh cabang kompetisi TSF Festival 2026 sudah berakhir atau kuota tim peserta per kategori telah terpenuhi. Pantau terus lini masa sosial media kami untuk info technical meeting finalis.
                </p>
              </div>
            ) : (
              /* FORM COMPONENT */
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 font-sans text-blue-sail">
                
                {/* Section A: Identitas Tim */}
                <div className="space-y-4">
                  <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2">
                    A. Profil Tim / Kontestan
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Selection dropdown */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wide">Kategori Cabang Kompetisi *</label>
                      <select
                        id="comp-categoryId"
                        value={formData.categoryId}
                        onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E] rounded-none outline-none text-blue-sail font-medium transition-all"
                      >
                        {competitions.map(c => (
                          <option key={c.id} value={c.id}>{c.title} (Kategori: {c.category})</option>
                        ))}
                      </select>
                    </div>

                    {/* Team Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide">Nama Tim / Nama Panggung *</label>
                      <input
                        id="comp-teamName"
                        name="teamName"
                        type="text"
                        value={formData.teamName}
                        onChange={e => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                        placeholder="Contoh: Veloce Rock Band / Speedster Racing"
                        className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                          formErrors.teamName ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                        }`}
                      />
                      {formErrors.teamName && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.teamName}</p>}
                    </div>

                    {/* Leader Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide">Nama Ketua Tim / Individu *</label>
                      <input
                        id="comp-leaderName"
                        name="leaderName"
                        type="text"
                        value={formData.leaderName}
                        onChange={e => setFormData(prev => ({ ...prev, leaderName: e.target.value }))}
                        placeholder="Nama ketua/pendaftar penanggung jawab"
                        className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                          formErrors.leaderName ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                        }`}
                      />
                      {formErrors.leaderName && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.leaderName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Origin Institution */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wide">Asal Sekolah / Universitas / Umum *</label>
                      <input
                        id="comp-institution"
                        name="institution"
                        type="text"
                        value={formData.institution}
                        onChange={e => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="Contoh: Universitas Indonesia / Umum"
                        className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                          formErrors.institution ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                        }`}
                      />
                      {formErrors.institution && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.institution}</p>}
                    </div>

                    {/* Contacts */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide">No. HP / WhatsApp Ketua *</label>
                      <input
                        id="comp-contact"
                        name="contact"
                        type="text"
                        value={formData.contact}
                        onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        placeholder="Contoh: 08123456789"
                        className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                          formErrors.contact ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                        }`}
                      />
                      {formErrors.contact && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.contact}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wide">Alamat Email Ketua *</label>
                      <input
                        id="comp-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="mazen@student.ac.id"
                        className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                          formErrors.email ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                        }`}
                      />
                      {formErrors.email && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.email}</p>}
                    </div>

                    {/* Members List */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wide">Anggota Tim (Pisahkan Koma)</label>
                      <input
                        id="comp-membersText"
                        type="text"
                        value={formData.membersText}
                        onChange={e => setFormData(prev => ({ ...prev, membersText: e.target.value }))}
                        placeholder="Budi, Joko, Mazen, Rani"
                        className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E] rounded-none outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Upload Pembayaran */}
                <div className="space-y-4 pt-4">
                  <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2">
                    B. Bukti Pembayaran Registrasi
                  </h4>

                  {/* Payment proof Drag and Drop simulator */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wide">Unggah Gambar Bukti Transfer *</label>
                    
                    <div 
                      id="comp-file-dropzone"
                      className={`border-2 border-dashed rounded-none p-6 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-decor bg-decor/5' 
                          : formErrors.paymentProofUrl 
                            ? 'border-red-inferno bg-red-inferno/5' 
                            : 'border-blue-sail hover:border-decor bg-blue-sail/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        id="comp-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-decor text-blue-sail rounded-none border-2 border-blue-sail">
                          <Icon name="Upload" size={24} className="stroke-[2px]" />
                        </div>
                        {uploadedFileName ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold font-mono uppercase">{uploadedFileName}</p>
                            <p className="text-[10px] text-decor bg-blue-sail font-semibold px-2 py-0.5 rounded-none border border-decor inline-block uppercase">Bukti Terpasang</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase">Taruh bukti transfer di sini atau klik pilih berkas</p>
                            <p className="text-[10px] text-blue-sail/60">Format JPG, JPEG, PNG maksimal 3MB. Pastikan nominal transfer terekam jelas.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {formErrors.paymentProofUrl && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.paymentProofUrl}</p>}
                  </div>

                  {/* Optional Project Files link */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wide">Link Berkas Penilaian / Karya (Opsional)</label>
                    <input
                      id="comp-fileUrl"
                      type="url"
                      value={formData.fileUrl}
                      onChange={e => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                      placeholder="Masukkan link Google Drive (Karya, Video Latihan, Portofolio Lomba)"
                      className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E] rounded-none outline-none transition-all"
                    />
                    <span className="text-[10px] text-blue-sail/60 font-mono">Pastikan akses share link Google Drive diubah menjadi 'Anyone with the link can view'!</span>
                  </div>
                </div>

                {/* Section C: Submit */}
                <div className="pt-6 border-t border-blue-sail/10 space-y-4">
                  <div className="flex items-start space-x-2.5">
                    <input
                      id="comp-agreement"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 text-blue-sail border-2 border-blue-sail rounded-none focus:ring-0 cursor-pointer"
                    />
                    <label className="text-xs text-blue-sail/85 leading-relaxed select-none cursor-pointer">
                      Saya mewakili seluruh anggota tim menyatakan bahwa data registrasi yang kami berikan adalah benar, bersedia mentaati seluruh aturan teknis Guidebook (TOR) TSF, dan siap hadir pada hari H perlombaan jika lolos seleksi berkas.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="comp-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-decor hover:bg-decor/95 disabled:bg-decor/50 text-blue-sail font-display font-black text-sm uppercase py-4 rounded-none tracking-wider border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-sail border-t-transparent" />
                        <span>MEMPROSES PENDAFTARAN LOMBA...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="CheckCircle2" size={16} className="stroke-[2.5px]" />
                        <span>KIRIM DATA TIM LOMBA</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </section>

      </div>

      {/* MODAL: SUCCESS REGISTER LOMBA */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-ballroom w-full max-w-md rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-6 text-center space-y-6">
            
            <div className="text-decor flex justify-center">
              <div className="bg-blue-sail p-4 rounded-none border-2 border-blue-sail text-decor animate-bounce">
                <Icon name="Trophy" size={48} className="stroke-[2.5px]" />
              </div>
            </div>

            <div className="space-y-2 text-blue-sail">
              <span className="font-mono text-[10px] font-bold text-red-inferno tracking-widest uppercase">REGISTRATION SUCCESSFUL</span>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight">
                PENDAFTARAN LOMBA RECORDED!
              </h3>
              <p className="text-xs sm:text-sm text-blue-sail/80 leading-relaxed">
                Pendaftaran tim kontestan kompetisi TSF Festival 2026 Anda berhasil diinput. Tim kurator teknis akan memvalidasi bukti transaksi pembayaran dan keabsahan berkas tim Anda dalam <strong>1x24 jam</strong>. Status dan nomor urut kontestan TM (Technical Meeting) akan dikirimkan langsung ke email/WhatsApp Ketua Tim.
              </p>
            </div>

            <button
              id="modal-success-comp-close"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] tracking-widest transition-colors cursor-pointer"
            >
              KEMBALI KE HALAMAN KOMPETISI
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
