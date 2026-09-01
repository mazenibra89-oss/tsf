import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';

interface MemberFields {
  fullName: string;
  institution: string;
  studentId: string;
  major: string;
  year: string;
  whatsapp: string;
  email: string;
}

export const RegistCompetition: React.FC = () => {
  const { addCompetitionRegistration } = useApp();

  // Scroll helper
  const scrollToForm = () => {
    const el = document.getElementById('competition-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Step state: 1 | 2 | 3 | 4 | 5 | 'success'
  const [step, setStep] = useState<number | 'success'>(1);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Competition & Education Choice
    competitionType: '' as 'BPC' | 'BCC' | '',
    educationCategory: '' as 'SMA/Sederajat' | 'Mahasiswa' | '',

    // Section 1: Informasi Tim
    teamName: '',
    teamSize: '3' as '3' | '4' | '5',

    // Section 2: Data Ketua Tim
    leaderFullName: '',
    leaderInstitution: '',
    leaderStudentId: '',
    leaderMajor: '',
    leaderYear: '',
    leaderWhatsapp: '',
    leaderEmail: '',

    // Section 3: Data Anggota Tim (Anggota 1 to 4 max)
    members: [
      { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
      { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
      { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
      { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
    ] as MemberFields[],

    // Section 4: Upload Persyaratan Umum
    studentStatusFileName: '',
    studentStatusFileUrl: '',
    twibbonPosterFileName: '',
    twibbonPosterFileUrl: '',
    igFollowFileName: '',
    igFollowFileUrl: '',

    // Section 5: Checkboxes Konfirmasi
    agreeDataTrue: false,
    agreeGuidebook: false,
    agreeRangkaian: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Non-leader members count = parseInt(teamSize) - 1
  const nonLeaderCount = Math.max(0, parseInt(form.teamSize, 10) - 1);

  const updateField = (field: string, val: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      // Auto-detect Mahasiswa if BCC is chosen
      if (field === 'competitionType' && val === 'BCC') {
        updated.educationCategory = 'Mahasiswa';
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateMember = (index: number, field: keyof MemberFields, val: string) => {
    setForm(prev => {
      const updatedMembers = [...prev.members];
      updatedMembers[index] = { ...updatedMembers[index], [field]: val };
      return { ...prev, members: updatedMembers };
    });
    const errKey = `member_${index}_${field}`;
    if (errors[errKey]) {
      setErrors(prev => ({ ...prev, [errKey]: '' }));
    }
  };

  // Helper for File Inputs
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (fileName: string, fileUrl: string) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      onSuccess(file.name, fakeUrl);
    }
  };

  // Step Validations
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.competitionType) {
      errs.competitionType = 'Pilih cabang kompetisi (BPC atau BCC).';
    }
    if (form.competitionType === 'BPC' && !form.educationCategory) {
      errs.educationCategory = 'Pilih jenjang pendidikan tim Anda (SMA/Sederajat atau Mahasiswa).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.teamName.trim()) errs.teamName = 'Nama Tim wajib diisi';
    if (!form.leaderFullName.trim()) errs.leaderFullName = 'Nama Lengkap Ketua wajib diisi';
    if (!form.leaderInstitution.trim()) errs.leaderInstitution = 'Asal Institusi wajib diisi';
    if (!form.leaderStudentId.trim()) errs.leaderStudentId = 'NRP/NIM wajib diisi';
    if (!form.leaderMajor.trim()) errs.leaderMajor = 'Jurusan wajib diisi';
    if (!form.leaderYear.trim()) errs.leaderYear = 'Angkatan wajib diisi';
    if (!form.leaderWhatsapp.trim()) errs.leaderWhatsapp = 'Nomor WhatsApp wajib diisi';
    if (!form.leaderEmail.trim()) {
      errs.leaderEmail = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.leaderEmail)) {
      errs.leaderEmail = 'Format email tidak valid';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    for (let i = 0; i < nonLeaderCount; i++) {
      const m = form.members[i];
      if (!m.fullName.trim()) errs[`member_${i}_fullName`] = `Nama Lengkap Anggota ${i + 1} wajib diisi`;
      if (!m.institution.trim()) errs[`member_${i}_institution`] = `Asal Institusi Anggota ${i + 1} wajib diisi`;
      if (!m.studentId.trim()) errs[`member_${i}_studentId`] = `NRP/NIM Anggota ${i + 1} wajib diisi`;
      if (!m.major.trim()) errs[`member_${i}_major`] = `Jurusan Anggota ${i + 1} wajib diisi`;
      if (!m.year.trim()) errs[`member_${i}_year`] = `Angkatan Anggota ${i + 1} wajib diisi`;
      if (!m.whatsapp.trim()) errs[`member_${i}_whatsapp`] = `Nomor WhatsApp Anggota ${i + 1} wajib diisi`;
      if (!m.email.trim()) {
        errs[`member_${i}_email`] = `Email Anggota ${i + 1} wajib diisi`;
      } else if (!/\S+@\S+\.\S+/.test(m.email)) {
        errs[`member_${i}_email`] = `Format email Anggota ${i + 1} tidak valid`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!form.studentStatusFileName) {
      errs.studentStatusFileName = 'Wajib mengunggah Bukti Status Mahasiswa / Pelajar';
    }
    if (!form.twibbonPosterFileName) {
      errs.twibbonPosterFileName = 'Wajib mengunggah Bukti Upload Twibbon & Poster TDC Summit Fest 2026';
    }
    if (!form.igFollowFileName) {
      errs.igFollowFileName = 'Wajib mengunggah Bukti Follow @tdcsummitfest_its';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep5 = () => {
    const errs: Record<string, string> = {};
    if (!form.agreeDataTrue) {
      errs.agreeDataTrue = 'Anda harus mengonfirmasi bahwa seluruh data yang diberikan benar';
    }
    if (!form.agreeGuidebook) {
      errs.agreeGuidebook = 'Anda harus menyetujui bahwa Anda telah membaca guidebook';
    }
    if (!form.agreeRangkaian) {
      errs.agreeRangkaian = 'Anda harus menyatakan bersedia mengikuti seluruh rangkaian acara';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStep5()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Formatted members list for AppContext
      const memberNames = form.members.slice(0, nonLeaderCount).map(m => `${m.fullName} (${m.institution})`);
      addCompetitionRegistration({
        team_name: form.teamName,
        leader_name: form.leaderFullName,
        members: memberNames,
        institution: form.leaderInstitution,
        contact: form.leaderWhatsapp,
        email: form.leaderEmail,
        category_id: `${form.competitionType} - ${form.educationCategory}`,
        payment_proof_url: form.studentStatusFileUrl || form.studentStatusFileName || 'Bukti_Status_Mahasiswa',
        file_url: form.twibbonPosterFileUrl || form.twibbonPosterFileName || 'Bukti_Persyaratan'
      });

      setIsSubmitting(false);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  // Subthemes List
  const bpcSubthemes = [
    { title: 'Green Industry & Circular Business', icon: 'Leaf' },
    { title: 'Sustainable Food & Agri-Innovation', icon: 'Utensils' },
    { title: 'Social Innovation & Community Empowerment', icon: 'Users' },
    { title: 'Smart Industry & Digital Transformation', icon: 'Cpu' },
    { title: 'Clean & Efficient Energy Innovation', icon: 'Zap' },
    { title: 'Inclusive Digital Economy & Future Workforce', icon: 'Globe' }
  ];

  // Benefits List
  const benefits = [
    { title: 'Trophy & Sertifikat Eksklusif', icon: 'Trophy', desc: 'Penghargaan resmi nasional untuk pemenang' },
    { title: 'Uang Tunai Pemenang', icon: 'Coins', desc: 'Total hadiah apresiasi bagi tim juara' },
    { title: 'Proposal Review Langsung', icon: 'FileCheck', desc: 'Ulasan mendalam dari expert dan dewan juri' },
    { title: 'Mentoring Eksklusif', icon: 'UserCheck', desc: 'Bimbingan intensif bersama praktisi berpengalaman' },
    { title: 'Networking Komunitas', icon: 'Share2', desc: 'Koneksi dengan komunitas entrepreneur nasional' }
  ];

  // Timeline List
  const timelineEvents = [
    { date: '5 Sep – 10 Okt 2026', title: 'Open Registration & Submit BMC', status: 'Active', icon: 'Edit3' },
    { date: '18 Oktober 2026', title: 'Semi-Finalist Announcement', status: 'Upcoming', icon: 'Megaphone' },
    { date: '18 – 31 Oktober 2026', title: 'Semi-Final Stage', status: 'Upcoming', icon: 'Monitor' },
    { date: '22 November 2026', title: 'Final Stage & Awarding', status: 'Upcoming', icon: 'Award' }
  ];

  return (
    <div className="asphalt-texture min-h-screen pb-20 font-sans">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="bg-blue-sail text-ballroom overflow-hidden border-b-8 border-decor relative pt-10 pb-16 lg:pt-14 lg:pb-20">
        <div className="absolute inset-0 grid-pattern opacity-15" />
        <div className="absolute -bottom-6 left-0 right-0 h-4 bg-red-inferno transform skew-y-[-1.5deg]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center lg:text-left">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-decor text-blue-sail px-4 py-1.5 font-display font-black text-xs uppercase tracking-wider border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] skew-x-[-6deg]">
                <Icon name="Trophy" size={16} />
                <span>OFFICIAL REGISTRATION OPEN</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-shadow-md leading-tight">
                TDC SUMMIT FEST <br />
                <span className="text-decor">BUSINESS COMPETITION</span> <span className="text-red-inferno">2026</span>
              </h1>
              <p className="text-base sm:text-lg font-sans text-ballroom/90 max-w-2xl leading-relaxed">
                <span className="font-display font-extrabold text-decor">
                  Halo Future Innovator!
                </span> Punya ide inovatif atau solusi untuk menghadapi tantangan bisnis di masa depan? <strong className="text-decor">This is your time to make it happen!</strong>
              </p>
            </div>

            {/* Featured Hero Action CTA Card */}
            <div className="w-full max-w-sm shrink-0">
              <div className="bg-ballroom text-blue-sail p-6 border-4 border-blue-sail shadow-[6px_6px_0_0_#F6BB02] space-y-4 text-center transform rotate-1 hover:rotate-0 transition-transform">
                <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-3 py-1 uppercase tracking-wider inline-block border border-blue-sail">
                  FASE PENDAFTARAN
                </span>
                <h3 className="font-display font-black text-xl uppercase tracking-tight">
                  SIAPKAN TIM TERBAIKMU!
                </h3>
                <p className="text-xs text-blue-sail/80 leading-relaxed font-sans">
                  Pendaftaran dibuka untuk cabang <strong>BPC</strong> (SMA &amp; Mahasiswa) &amp; <strong>BCC</strong> (Mahasiswa).
                </p>

                {/* Prominent Featured CTA Button */}
                <button
                  onClick={scrollToForm}
                  className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-sm uppercase py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>DAFTAR SEKARANG</span>
                  <Icon name="ArrowRight" size={18} className="stroke-[3px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & COMPETITION BRIEF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Intro Cards: BPC & BCC */}
        <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-10 shadow-[8px_8px_0_0_#2A4C9E] space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-red-inferno/10 text-red-inferno px-3 py-1 border border-red-inferno/30">
              <Icon name="Layers" size={14} />
              <span className="font-display font-bold text-xs tracking-wider uppercase">COMPETITION OVERVIEW</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
              TDC SUMMIT FEST 2026 COMPETITION
            </h2>
            <p className="text-sm text-blue-sail/80 font-sans leading-relaxed">
              TDC Summit Fest 2026 kembali hadir dengan 2 kompetisi yang menjadi wadah untuk mengembangkan gagasan, menghadirkan solusi inovatif, dan menciptakan dampak berkelanjutan bagi masyarakat dan industri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Card BPC */}
            <div className="bg-blue-sail/5 border-3 border-blue-sail p-6 relative flex flex-col justify-between shadow-[4px_4px_0_0_#BD1B1F]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-decor text-blue-sail px-3 py-1 font-display font-black text-xs uppercase border border-blue-sail">BPC</span>
                  <Icon name="Briefcase" size={24} className="text-red-inferno" />
                </div>
                <h3 className="font-display font-black text-xl text-blue-sail uppercase tracking-tight">
                  Business Plan Competition (BPC)
                </h3>
                <p className="text-xs text-blue-sail/80 font-sans leading-relaxed">
                  Wadah bagi kamu untuk mengembangkan ide bisnis yang inovatif, relevan, dan berdampak bagi industri serta lingkungan.
                </p>
              </div>
            </div>

            {/* Card BCC */}
            <div className="bg-blue-sail/5 border-3 border-blue-sail p-6 relative flex flex-col justify-between shadow-[4px_4px_0_0_#F6BB02]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-sail text-decor px-3 py-1 font-display font-black text-xs uppercase border border-decor">BCC</span>
                  <Icon name="TrendingUp" size={24} className="text-blue-sail" />
                </div>
                <h3 className="font-display font-black text-xl text-blue-sail uppercase tracking-tight">
                  Business Case Competition (BCC)
                </h3>
                <p className="text-xs text-blue-sail/80 font-sans leading-relaxed">
                  Wadah bagi kamu untuk menganalisis permasalahan bisnis nyata dan merancang solusi strategis yang inovatif serta berdampak.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Banner Callout */}
          <div className="bg-blue-sail text-ballroom p-6 border-3 border-decor relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-decor/20 text-decor px-2.5 py-0.5 border border-decor/40">
                <Icon name="Compass" size={14} />
                <span className="font-display font-bold text-xs tracking-wider uppercase">TEMA UTAMA TSF 2026</span>
              </div>
              <h3 className="font-display font-black text-2xl text-decor uppercase tracking-tight">
                “From Innovation to Sustainable Impact”
              </h3>
              <p className="text-xs sm:text-sm text-ballroom/85 font-sans leading-relaxed max-w-4xl">
                TSF 2026 mengajak kamu untuk membawa inovasi lebih jauh dan bukan hanya menciptakan ide, tetapi mengubahnya menjadi solusi nyata yang mampu memberikan dampak berkelanjutan bagi masyarakat, lingkungan, dan perekonomian.
              </p>
            </div>
          </div>
        </div>

        {/* Subthemes BPC Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-red-inferno/10 text-red-inferno px-3 py-1 border border-red-inferno/30">
              <Icon name="Grid" size={14} />
              <span className="font-display font-bold text-xs tracking-wider uppercase">SUBTEMA PILIHAN BPC</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
              PILIH SUBTEMA INOVASI TIM KAMU
            </h2>
            <div className="w-16 h-1.5 bg-decor mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bpcSubthemes.map((st, idx) => (
              <div key={idx} className="bg-ballroom border-3 border-blue-sail p-4 flex items-start gap-3 shadow-[3px_3px_0_0_#2A4C9E]">
                <div className="bg-decor text-blue-sail p-2.5 border border-blue-sail shrink-0">
                  <Icon name={st.icon as any} size={18} />
                </div>
                <div>
                  <span className="font-display font-extrabold text-[10px] text-red-inferno uppercase">SUBTEMA 0{idx + 1}</span>
                  <h4 className="font-display font-extrabold text-sm text-blue-sail uppercase tracking-tight leading-snug mt-0.5">
                    {st.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits & Hadiah */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-decor/30 text-blue-sail px-3 py-1 border border-blue-sail/30">
              <Icon name="Gift" size={14} />
              <span className="font-display font-bold text-xs tracking-wider uppercase">BENEFITS &amp; HADIAH</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
              APA YANG AKAN KAMU DAPATKAN?
            </h2>
            <div className="w-16 h-1.5 bg-decor mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-ballroom border-3 border-blue-sail p-5 text-center flex flex-col justify-between shadow-[4px_4px_0_0_#BD1B1F]">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-decor text-blue-sail flex items-center justify-center mx-auto border-2 border-blue-sail shadow-[2px_2px_0_0_#8B011A]">
                    <Icon name={b.icon as any} size={22} />
                  </div>
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail tracking-tight pt-2">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-blue-sail/70 font-sans leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Singkat */}
        <div className="bg-blue-sail text-ballroom border-4 border-blue-sail p-6 sm:p-10 shadow-[8px_8px_0_0_#BD1B1F] space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-decor/20 text-decor px-2.5 py-0.5 border border-decor/40">
              <Icon name="Calendar" size={14} />
              <span className="font-display font-bold text-xs uppercase tracking-wider">TIMELINE SINGKAT</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-ballroom">
              JADWAL &amp; RANGKAIAN TAHAPAN KOMPETISI
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {timelineEvents.map((t, idx) => (
              <div key={idx} className="bg-ballroom/10 border-2 border-ballroom/30 p-4 space-y-2">
                <span className="font-display font-extrabold text-[11px] text-decor uppercase tracking-wider block">
                  FASE 0{idx + 1}
                </span>
                <p className="font-sans text-xs text-ballroom font-bold flex items-center gap-1.5">
                  <Icon name="Clock" size={14} className="text-decor" />
                  <span>{t.date}</span>
                </p>
                <h4 className="font-display font-black text-sm text-decor uppercase tracking-tight">
                  {t.title}
                </h4>
              </div>
            ))}
          </div>

          <div className="bg-ballroom text-blue-sail p-4 border-2 border-decor flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-display font-bold text-[10px] text-red-inferno uppercase">KATEGORI JENJANG PENDIDIKAN</span>
              <p className="text-xs font-sans font-bold flex items-center gap-2">
                <span className="bg-blue-sail text-decor px-2 py-0.5 font-display font-black text-[10px]">BPC</span> SMA/Sederajat &amp; Mahasiswa
                <span className="bg-blue-sail text-decor px-2 py-0.5 font-display font-black text-[10px]">BCC</span> Khusus Mahasiswa
              </p>
              <p className="text-[11px] text-blue-sail/70 font-sans">
                Pendaftaran hanya dilakukan oleh <strong>KETUA TIM</strong>. Sebelum mengisi, pastikan seluruh syarat pendaftaran sudah lengkap.
              </p>
            </div>
            <button
              onClick={scrollToForm}
              className="bg-red-inferno hover:bg-red-700 text-ballroom font-display font-black text-xs uppercase px-6 py-3 border-2 border-blue-sail shadow-[3px_3px_0_0_#000] shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Icon name="Edit3" size={14} />
              <span>MULAI PENDAFTARAN TIM</span>
            </button>
          </div>
        </div>

        {/* Motivational Callout */}
        <div className="text-center bg-decor p-8 border-4 border-blue-sail shadow-[6px_6px_0_0_#8B011A] space-y-3">
          <div className="w-12 h-12 bg-blue-sail text-decor flex items-center justify-center mx-auto border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
            <Icon name="Zap" size={24} />
          </div>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
            SIAPKAH KAMU MENGUBAH INNOVATION INTO IMPACT?
          </h3>
          <p className="text-sm font-sans text-blue-sail/90 max-w-xl mx-auto font-semibold">
            Yuk, buktikan idemu melalui TDC Summit Fest 2026 Business Competition!
          </p>
        </div>

      </section>

      {/* 3. MULTI-STEP REGISTRATION FORM SECTION */}
      <section id="competition-form-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Step Indicator Header */}
        <div className="bg-blue-sail text-ballroom border-4 border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E] mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-ballroom/20 pb-4">
            <div>
              <span className="font-display font-bold text-xs text-decor tracking-wider uppercase">FORM PENDAFTARAN TIM</span>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">
                COMPETITION REGISTRATION FORM
              </h2>
            </div>
            {step !== 'success' && (
              <span className="bg-decor text-blue-sail font-display font-black text-xs px-3.5 py-1.5 border border-blue-sail tracking-wider">
                HALAMAN {step} / 5
              </span>
            )}
          </div>

          {/* Stepper Progress Bar */}
          {step !== 'success' && (
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((sNum) => {
                const isActive = step === sNum;
                const isDone = (step as number) > sNum;
                return (
                  <div
                    key={sNum}
                    className={`h-2 transition-all ${
                      isActive
                        ? 'bg-decor shadow-[0_0_8px_#F6BB02]'
                        : isDone
                        ? 'bg-emerald-400'
                        : 'bg-ballroom/20'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Multi-Step Form Container */}
        <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-10 shadow-[8px_8px_0_0_#BD1B1F]">
          
          <AnimatePresence mode="wait">
            
            {/* ─── PAGE 1: KATEGORI KOMPETISI & JENJANG ─── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-blue-sail/20 pb-4">
                  <span className="font-display font-black text-xs text-red-inferno uppercase tracking-wider block">HALAMAN 1 dari 5</span>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    PILIH CABANG KOMPETISI &amp; JENJANG PENDIDIKAN
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Pilih jenis kompetisi yang ingin diikuti oleh tim Anda terlebih dahulu.
                  </p>
                </div>

                {/* Step 1A: Choose Competition Type (BPC or BCC) */}
                <div className="space-y-3">
                  <label className="block text-xs font-display font-bold text-blue-sail uppercase">
                    1. Cabang Kompetisi *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option BPC */}
                    <div
                      onClick={() => updateField('competitionType', 'BPC')}
                      className={`p-5 border-3 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        form.competitionType === 'BPC'
                          ? 'bg-blue-sail text-ballroom border-decor shadow-[4px_4px_0_0_#F6BB02]'
                          : 'bg-white border-blue-sail text-blue-sail hover:border-decor'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-display font-black text-xs px-2.5 py-1 border ${
                          form.competitionType === 'BPC' ? 'bg-decor text-blue-sail border-blue-sail' : 'bg-blue-sail/10 text-blue-sail border-blue-sail/20'
                        }`}>
                          BPC
                        </span>
                        <Icon name="Briefcase" size={24} className={form.competitionType === 'BPC' ? 'text-decor' : 'text-blue-sail'} />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-lg uppercase tracking-tight">
                          Business Plan Competition
                        </h4>
                        <p className={`text-xs font-sans mt-1 ${form.competitionType === 'BPC' ? 'text-ballroom/80' : 'text-blue-sail/70'}`}>
                          Pengembangan ide bisnis inovatif, relevan, &amp; berdampak.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-display font-bold">
                        <span>{form.competitionType === 'BPC' ? '✓ TERPILIH' : 'KLIK UNTUK MEMILIH'}</span>
                        <Icon name="ArrowRight" size={14} />
                      </div>
                    </div>

                    {/* Option BCC */}
                    <div
                      onClick={() => updateField('competitionType', 'BCC')}
                      className={`p-5 border-3 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        form.competitionType === 'BCC'
                          ? 'bg-blue-sail text-ballroom border-decor shadow-[4px_4px_0_0_#F6BB02]'
                          : 'bg-white border-blue-sail text-blue-sail hover:border-decor'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-display font-black text-xs px-2.5 py-1 border ${
                          form.competitionType === 'BCC' ? 'bg-decor text-blue-sail border-blue-sail' : 'bg-blue-sail/10 text-blue-sail border-blue-sail/20'
                        }`}>
                          BCC
                        </span>
                        <Icon name="TrendingUp" size={24} className={form.competitionType === 'BCC' ? 'text-decor' : 'text-blue-sail'} />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-lg uppercase tracking-tight">
                          Business Case Competition
                        </h4>
                        <p className={`text-xs font-sans mt-1 ${form.competitionType === 'BCC' ? 'text-ballroom/80' : 'text-blue-sail/70'}`}>
                          Analisis studi kasus bisnis nyata &amp; solusi strategis.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-display font-bold">
                        <span>{form.competitionType === 'BCC' ? '✓ TERPILIH (KHUSUS MAHASISWA)' : 'KLIK UNTUK MEMILIH'}</span>
                        <Icon name="ArrowRight" size={14} />
                      </div>
                    </div>
                  </div>
                  {errors.competitionType && (
                    <p className="text-red-600 font-sans text-xs font-semibold">{errors.competitionType}</p>
                  )}
                </div>

                {/* Step 1B: Choose Education Level (If BPC) OR Auto-Detected (If BCC) */}
                {form.competitionType === 'BPC' && (
                  <div className="space-y-3 pt-2 animate-fadeIn">
                    <label className="block text-xs font-display font-bold text-blue-sail uppercase">
                      2. Jenjang Pendidikan (BPC) *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* SMA */}
                      <div
                        onClick={() => updateField('educationCategory', 'SMA/Sederajat')}
                        className={`p-4 border-2 cursor-pointer transition-all flex items-center justify-between ${
                          form.educationCategory === 'SMA/Sederajat'
                            ? 'bg-blue-sail text-ballroom border-decor'
                            : 'bg-white border-blue-sail/40 text-blue-sail hover:border-decor'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon name="GraduationCap" size={20} className={form.educationCategory === 'SMA/Sederajat' ? 'text-decor' : 'text-blue-sail'} />
                          <span className="font-display font-black text-sm uppercase">SMA / Sederajat</span>
                        </div>
                        {form.educationCategory === 'SMA/Sederajat' && <Icon name="CheckCircle" size={18} className="text-decor" />}
                      </div>

                      {/* Mahasiswa */}
                      <div
                        onClick={() => updateField('educationCategory', 'Mahasiswa')}
                        className={`p-4 border-2 cursor-pointer transition-all flex items-center justify-between ${
                          form.educationCategory === 'Mahasiswa'
                            ? 'bg-blue-sail text-ballroom border-decor'
                            : 'bg-white border-blue-sail/40 text-blue-sail hover:border-decor'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon name="Award" size={20} className={form.educationCategory === 'Mahasiswa' ? 'text-decor' : 'text-blue-sail'} />
                          <span className="font-display font-black text-sm uppercase">Mahasiswa (D1–S1)</span>
                        </div>
                        {form.educationCategory === 'Mahasiswa' && <Icon name="CheckCircle" size={18} className="text-decor" />}
                      </div>
                    </div>
                    {errors.educationCategory && (
                      <p className="text-red-600 font-sans text-xs font-semibold">{errors.educationCategory}</p>
                    )}
                  </div>
                )}

                {/* If BCC selected: Auto notification */}
                {form.competitionType === 'BCC' && (
                  <div className="bg-decor/20 border-2 border-blue-sail p-4 flex items-center gap-3 animate-fadeIn">
                    <Icon name="Info" size={20} className="text-blue-sail shrink-0" />
                    <p className="text-xs font-sans text-blue-sail font-semibold">
                      Kategori <strong>Business Case Competition (BCC)</strong> secara otomatis terdeteksi untuk jenjang <strong>Mahasiswa</strong>.
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2"
                  >
                    <span>LANJUT KE HALAMAN 2</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 2: INFORMASI TIM & DATA KETUA TIM ─── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-blue-sail/20 pb-4">
                  <span className="font-display font-black text-xs text-red-inferno uppercase tracking-wider block">HALAMAN 2 dari 5</span>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    INFORMASI TIM &amp; DATA KETUA TIM [{form.competitionType} - {form.educationCategory}]
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Lengkapi informasi nama tim dan biodata ketua tim secara lengkap.
                  </p>
                </div>

                {/* SECTION 1: INFORMASI TIM */}
                <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                    <Icon name="Users" size={18} className="text-red-inferno" />
                    <span>SECTION 1 — INFORMASI TIM</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Nama Tim *
                      </label>
                      <input
                        type="text"
                        value={form.teamName}
                        onChange={e => updateField('teamName', e.target.value)}
                        placeholder="Contoh: Tim Inovasi Masa Depan"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.teamName && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.teamName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Jumlah Anggota Tim * (Termasuk Ketua)
                      </label>
                      <select
                        value={form.teamSize}
                        onChange={e => updateField('teamSize', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none font-bold"
                      >
                        <option value="3">3 Anggota (1 Ketua + 2 Anggota)</option>
                        <option value="4">4 Anggota (1 Ketua + 3 Anggota)</option>
                        <option value="5">5 Anggota (1 Ketua + 4 Anggota)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DATA KETUA TIM */}
                <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                    <Icon name="Crown" size={18} className="text-decor" />
                    <span>SECTION 2 — DATA KETUA TIM</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Nama Lengkap Ketua *
                      </label>
                      <input
                        type="text"
                        value={form.leaderFullName}
                        onChange={e => updateField('leaderFullName', e.target.value)}
                        placeholder="Nama lengkap ketua tim"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderFullName && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderFullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Asal Institusi *
                      </label>
                      <input
                        type="text"
                        value={form.leaderInstitution}
                        onChange={e => updateField('leaderInstitution', e.target.value)}
                        placeholder="SMA / Universitas"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderInstitution && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderInstitution}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        NRP / NIM / NISN *
                      </label>
                      <input
                        type="text"
                        value={form.leaderStudentId}
                        onChange={e => updateField('leaderStudentId', e.target.value)}
                        placeholder="NRP / NIM / Kartu Pelajar"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderStudentId && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderStudentId}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Jurusan *
                      </label>
                      <input
                        type="text"
                        value={form.leaderMajor}
                        onChange={e => updateField('leaderMajor', e.target.value)}
                        placeholder="Jurusan / Program Studi"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderMajor && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderMajor}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Angkatan *
                      </label>
                      <input
                        type="text"
                        value={form.leaderYear}
                        onChange={e => updateField('leaderYear', e.target.value)}
                        placeholder="Contoh: 2023 / Kelas 11"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderYear && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderYear}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="text"
                        value={form.leaderWhatsapp}
                        onChange={e => updateField('leaderWhatsapp', e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderWhatsapp && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderWhatsapp}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.leaderEmail}
                        onChange={e => updateField('leaderEmail', e.target.value)}
                        placeholder="ketua@email.com"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderEmail && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderEmail}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail/40 cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span>KEMBALI</span>
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2"
                  >
                    <span>LANJUT KE DATA ANGGOTA TIM</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 3: SECTION 3 - DATA ANGGOTA TIM ─── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-blue-sail/20 pb-4">
                  <span className="font-display font-black text-xs text-red-inferno uppercase tracking-wider block">HALAMAN 3 dari 5</span>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    SECTION 3 — DATA ANGGOTA TIM ({nonLeaderCount} ANGGOTA)
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Isi data lengkap untuk {nonLeaderCount} anggota tim selain Ketua sesuai jumlah anggota yang dipilih.
                  </p>
                </div>

                <div className="space-y-6">
                  {Array.from({ length: nonLeaderCount }).map((_, idx) => (
                    <div key={idx} className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                        <Icon name="User" size={16} className="text-red-inferno" />
                        <span>ANGGOTA TIM {idx + 1}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Nama Lengkap Anggota {idx + 1} *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.fullName || ''}
                            onChange={e => updateMember(idx, 'fullName', e.target.value)}
                            placeholder={`Nama lengkap anggota ${idx + 1}`}
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_fullName`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_fullName`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Asal Institusi *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.institution || ''}
                            onChange={e => updateMember(idx, 'institution', e.target.value)}
                            placeholder="SMA / Universitas"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_institution`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_institution`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            NRP / NIM / NISN *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.studentId || ''}
                            onChange={e => updateMember(idx, 'studentId', e.target.value)}
                            placeholder="NRP / NIM / Kartu Pelajar"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_studentId`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_studentId`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Jurusan *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.major || ''}
                            onChange={e => updateMember(idx, 'major', e.target.value)}
                            placeholder="Jurusan / Program Studi"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_major`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_major`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Angkatan *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.year || ''}
                            onChange={e => updateMember(idx, 'year', e.target.value)}
                            placeholder="Contoh: 2023 / Kelas 11"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_year`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_year`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Nomor WhatsApp *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.whatsapp || ''}
                            onChange={e => updateMember(idx, 'whatsapp', e.target.value)}
                            placeholder="081234567890"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_whatsapp`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_whatsapp`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={form.members[idx]?.email || ''}
                            onChange={e => updateMember(idx, 'email', e.target.value)}
                            placeholder="anggota@email.com"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_email`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_email`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail/40 cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span>KEMBALI</span>
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep3()) setStep(4);
                    }}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2"
                  >
                    <span>LANJUT KE PERSYARATAN UMUM</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 4: SECTION 4 - UPLOAD PERSYARATAN UMUM ─── */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-blue-sail/20 pb-4">
                  <span className="font-display font-black text-xs text-red-inferno uppercase tracking-wider block">HALAMAN 4 dari 5</span>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    SECTION 4 — UPLOAD PERSYARATAN UMUM
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Unggah seluruh dokumen bukti persyaratan umum pendaftaran.
                  </p>
                </div>

                <div className="space-y-5">
                  
                  {/* Document 1: Bukti Status Mahasiswa / Pelajar */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">DOKUMEN 01</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti Status Mahasiswa / Kartu Pelajar *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Unggah Kartu Tanda Mahasiswa (KTM) / Kartu Pelajar / Surat Keterangan Aktif untuk seluruh anggota tim.
                    </p>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('studentStatusFileName', fName);
                          updateField('studentStatusFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="student-status-file"
                      />
                      <label htmlFor="student-status-file" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="UploadCloud" size={16} />
                        <span>{form.studentStatusFileName ? `✓ ${form.studentStatusFileName}` : 'Upload Bukti Status (pdf/jpg/png)'}</span>
                      </label>
                    </div>
                    {errors.studentStatusFileName && <p className="text-red-500 text-xs font-sans font-semibold">{errors.studentStatusFileName}</p>}
                  </div>

                  {/* Document 2: Bukti Upload Twibbon dan Poster TSF 2026 */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">DOKUMEN 02</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti Upload Twibbon dan Poster TDC Summit Fest 2026 *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Screenshot bukti unggah twibbon dan poster TSF 2026 di media sosial utama anggota tim.
                    </p>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('twibbonPosterFileName', fName);
                          updateField('twibbonPosterFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="twibbon-poster-file"
                      />
                      <label htmlFor="twibbon-poster-file" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="UploadCloud" size={16} />
                        <span>{form.twibbonPosterFileName ? `✓ ${form.twibbonPosterFileName}` : 'Upload Bukti Twibbon & Poster'}</span>
                      </label>
                    </div>
                    {errors.twibbonPosterFileName && <p className="text-red-500 text-xs font-sans font-semibold">{errors.twibbonPosterFileName}</p>}
                  </div>

                  {/* Document 3: Bukti Follow @tdcsummitfest_its */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">DOKUMEN 03</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti Follow @tdcsummitfest_its *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Screenshot bukti follow akun Instagram resmi <strong>@tdcsummitfest_its</strong> untuk seluruh anggota tim.
                    </p>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('igFollowFileName', fName);
                          updateField('igFollowFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="ig-follow-file"
                      />
                      <label htmlFor="ig-follow-file" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="UploadCloud" size={16} />
                        <span>{form.igFollowFileName ? `✓ ${form.igFollowFileName}` : 'Upload Bukti Follow IG'}</span>
                      </label>
                    </div>
                    {errors.igFollowFileName && <p className="text-red-500 text-xs font-sans font-semibold">{errors.igFollowFileName}</p>}
                  </div>

                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail/40 cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span>KEMBALI</span>
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep4()) setStep(5);
                    }}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2"
                  >
                    <span>LANJUT KE KONFIRMASI AKHIR</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 5: CHECKBOXES KONFIRMASI & SUBMIT ─── */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b-2 border-blue-sail/20 pb-4">
                  <span className="font-display font-black text-xs text-red-inferno uppercase tracking-wider block">HALAMAN 5 dari 5</span>
                  <h3 className="font-display font-black text-xl uppercase text-blue-sail">
                    PERNYATAAN &amp; KONFIRMASI PENDAFTARAN
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Silakan centang seluruh pernyataan di bawah ini untuk menyelesaikan pendaftaran tim Anda.
                  </p>
                </div>

                {/* Final Checkboxes List */}
                <div className="space-y-4">
                  {/* Checkbox 1 */}
                  <div className="bg-white border-2 border-blue-sail p-4 space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeDataTrue}
                        onChange={e => updateField('agreeDataTrue', e.target.checked)}
                        className="mt-1 w-5 h-5 accent-red-inferno cursor-pointer"
                      />
                      <span className="font-display font-extrabold text-sm text-blue-sail uppercase tracking-wide">
                        Saya menyatakan seluruh data yang diberikan benar. *
                      </span>
                    </label>
                    {errors.agreeDataTrue && <p className="text-red-500 text-xs font-sans font-semibold pl-8">{errors.agreeDataTrue}</p>}
                  </div>

                  {/* Checkbox 2 */}
                  <div className="bg-white border-2 border-blue-sail p-4 space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeGuidebook}
                        onChange={e => updateField('agreeGuidebook', e.target.checked)}
                        className="mt-1 w-5 h-5 accent-red-inferno cursor-pointer"
                      />
                      <span className="font-display font-extrabold text-sm text-blue-sail uppercase tracking-wide">
                        Saya telah membaca guidebook dan memahami seluruh ketentuan kompetisi. *
                      </span>
                    </label>
                    {errors.agreeGuidebook && <p className="text-red-500 text-xs font-sans font-semibold pl-8">{errors.agreeGuidebook}</p>}
                  </div>

                  {/* Checkbox 3 */}
                  <div className="bg-white border-2 border-blue-sail p-4 space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agreeRangkaian}
                        onChange={e => updateField('agreeRangkaian', e.target.checked)}
                        className="mt-1 w-5 h-5 accent-red-inferno cursor-pointer"
                      />
                      <span className="font-display font-extrabold text-sm text-blue-sail uppercase tracking-wide">
                        Saya bersedia mengikuti seluruh rangkaian TDC Summit Fest 2026. *
                      </span>
                    </label>
                    {errors.agreeRangkaian && <p className="text-red-500 text-xs font-sans font-semibold pl-8">{errors.agreeRangkaian}</p>}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail/40 cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span>KEMBALI</span>
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        <span>MENGIRIM PENDAFTARAN...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} />
                        <span>SUBMIT PENDAFTARAN TIM</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── SUCCESS SCREEN (SETELAH SUBMIT) ─── */}
            {step === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="w-20 h-20 bg-decor text-blue-sail flex items-center justify-center mx-auto border-4 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] animate-bounce">
                  <Icon name="Check" size={44} className="stroke-[3px]" />
                </div>

                <div className="space-y-3 max-w-xl mx-auto">
                  <span className="bg-emerald-500 text-white font-display font-black text-xs px-3.5 py-1.5 uppercase tracking-wider border border-blue-sail inline-flex items-center gap-1.5">
                    <Icon name="CheckCircle" size={14} /> PENDAFTARAN BERHASIL DITERIMA
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
                    Terima Kasih telah mendaftar TDC Summit Fest 2026 Business Competition!
                  </h3>
                  <p className="text-sm font-sans text-blue-sail/80 leading-relaxed">
                    Data pendaftaran tim <strong>{form.teamName}</strong> ({form.competitionType} - {form.educationCategory}) telah tercatat secara resmi di database panitia TSF 2026.
                  </p>
                </div>

                {/* WhatsApp Group Link Box */}
                <div className="bg-blue-sail text-ballroom border-3 border-decor p-6 max-w-md mx-auto space-y-3 shadow-[6px_6px_0_0_#F6BB02]">
                  <p className="font-display font-black text-xs text-decor uppercase flex items-center justify-center gap-1.5">
                    <Icon name="Pin" size={14} /> KOORDINASI KETUA &amp; ANGGOTA TIM
                  </p>
                  <p className="text-xs font-sans text-ballroom/90">
                    Pastikan Anda bergabung ke grup WhatsApp resmi melalui tautan berikut:
                  </p>

                  <button
                    onClick={() => alert('Link Grup WhatsApp Resmi TSF 2026 Business Competition akan segera dikirimkan via WhatsApp / Email Ketua Tim!')}
                    className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Icon name="MessageCircle" size={18} />
                    <span>JOIN WHATSAPP GROUP (LINK MENYUSUL)</span>
                  </button>
                </div>

                <p className="font-display font-black text-base text-red-inferno uppercase tracking-wide">
                  Sampai jumpa di TSF 2026, Future Innovator!
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setForm({
                        competitionType: '',
                        educationCategory: '',
                        teamName: '',
                        teamSize: '3',
                        leaderFullName: '',
                        leaderInstitution: '',
                        leaderStudentId: '',
                        leaderMajor: '',
                        leaderYear: '',
                        leaderWhatsapp: '',
                        leaderEmail: '',
                        members: [
                          { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
                          { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
                          { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
                          { fullName: '', institution: '', studentId: '', major: '', year: '', whatsapp: '', email: '' },
                        ],
                        studentStatusFileName: '',
                        studentStatusFileUrl: '',
                        twibbonPosterFileName: '',
                        twibbonPosterFileUrl: '',
                        igFollowFileName: '',
                        igFollowFileUrl: '',
                        agreeDataTrue: false,
                        agreeGuidebook: false,
                        agreeRangkaian: false,
                      });
                    }}
                    className="bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3 border-2 border-blue-sail/40 cursor-pointer"
                  >
                    DAFTARKAN TIM LAINNYA
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </section>

    </div>
  );
};
