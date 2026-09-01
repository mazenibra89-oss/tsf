import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';

interface MemberData {
  name: string;
  idFileName: string;
  idFileUrl: string;
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
    // Page 1: Category
    educationCategory: '' as 'SMA/Sederajat' | 'Mahasiswa (D1–S1)' | '',

    // Page 2: Biodata Tim & Ketua
    teamName: '',
    institution: '',
    city: '',
    teamSize: '3' as '3' | '4' | '5',
    leaderName: '',
    leaderWhatsapp: '',
    leaderEmail: '',
    leaderIdFileName: '',
    leaderIdFileUrl: '',

    // Page 3: Data Anggota Tim (Anggota 1 to 4 max)
    members: [
      { name: '', idFileName: '', idFileUrl: '' },
      { name: '', idFileName: '', idFileUrl: '' },
      { name: '', idFileName: '', idFileUrl: '' },
      { name: '', idFileName: '', idFileUrl: '' },
    ] as MemberData[],

    // Page 4: Bukti Syarat Pendaftaran
    igStoryFileName: '',
    igStoryFileUrl: '',
    twibbonFileName: '',
    twibbonFileUrl: '',
    igFollowFileName: '',
    igFollowFileUrl: '',

    // Page 5: Upload File BMC & Konfirmasi
    bmcFileName: '',
    bmcFileUrl: '',
    isDataConfirmed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Non-leader members count = parseInt(teamSize) - 1
  const nonLeaderCount = Math.max(0, parseInt(form.teamSize, 10) - 1);

  const updateField = (field: string, val: any) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateMember = (index: number, field: keyof MemberData, val: string) => {
    setForm(prev => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, members: updated };
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
    if (!form.educationCategory) {
      errs.educationCategory = 'Pilih salah satu kategori jenjang pendidikan (SMA/Sederajat atau Mahasiswa).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.teamName.trim()) errs.teamName = 'Nama Tim wajib diisi';
    if (!form.institution.trim()) errs.institution = 'Asal Institusi wajib diisi';
    if (!form.city.trim()) errs.city = 'Kota/Daerah wajib diisi';
    if (!form.leaderName.trim()) errs.leaderName = 'Nama Ketua wajib diisi';
    if (!form.leaderWhatsapp.trim()) {
      errs.leaderWhatsapp = 'Nomor WhatsApp wajib diisi';
    }
    if (!form.leaderEmail.trim()) {
      errs.leaderEmail = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.leaderEmail)) {
      errs.leaderEmail = 'Format email tidak valid';
    }
    if (!form.leaderIdFileName) {
      errs.leaderIdFileName = 'Wajib mengunggah Kartu Identitas Ketua Tim (KTP/SIM/KTM/Kartu Pelajar)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    for (let i = 0; i < nonLeaderCount; i++) {
      if (!form.members[i].name.trim()) {
        errs[`member_${i}_name`] = `Nama Lengkap Anggota Tim ${i + 1} wajib diisi`;
      }
      if (!form.members[i].idFileName) {
        errs[`member_${i}_idFileName`] = `Wajib mengunggah Kartu Identitas Anggota Tim ${i + 1}`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!form.igStoryFileName) {
      errs.igStoryFileName = 'Wajib upload bukti PDF Instagram Story poster TSF 2026';
    }
    if (!form.twibbonFileName) {
      errs.twibbonFileName = 'Wajib upload bukti PDF Instagram Feeds Twibbon TSF 2026';
    }
    if (!form.igFollowFileName) {
      errs.igFollowFileName = 'Wajib upload bukti PDF Follow Instagram @tdcsummitfest_its & @tdcits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep5 = () => {
    const errs: Record<string, string> = {};
    if (!form.bmcFileName) {
      errs.bmcFileName = 'Wajib mengunggah file BMC (format PDF dengan nama: BMC_Nama Tim)';
    }
    if (!form.isDataConfirmed) {
      errs.isDataConfirmed = 'Anda harus mengonfirmasi bahwa seluruh data sudah benar sebelum mengirimkan pendaftaran';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStep5()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Pass formatted data to AppContext
      const memberNames = form.members.slice(0, nonLeaderCount).map(m => m.name);
      addCompetitionRegistration({
        team_name: form.teamName,
        leader_name: form.leaderName,
        members: memberNames,
        institution: form.institution,
        contact: form.leaderWhatsapp,
        email: form.leaderEmail,
        category_id: form.educationCategory,
        payment_proof_url: form.leaderIdFileUrl || form.leaderIdFileName || 'Kartu_Identitas_Ketua',
        file_url: form.bmcFileUrl || form.bmcFileName || 'File_BMC'
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
                  Pendaftaran dibuka untuk kategori <strong>SMA/Sederajat</strong> &amp; <strong>Mahasiswa (D1–S1)</strong>.
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
                <span className="bg-blue-sail text-decor px-2 py-0.5 font-display font-black text-[10px]">1</span> SMA/Sederajat
                <span className="bg-blue-sail text-decor px-2 py-0.5 font-display font-black text-[10px]">2</span> Mahasiswa (D1–S1)
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
            Yuk, buktikan idemu melalui TDC Summit Fest 2026 Business Plan Competition!
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
            
            {/* ─── PAGE 1: KATEGORI PENDIRIKAN ─── */}
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
                    PILIH KATEGORI JENJANG PENDIDIKAN TIM
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Silakan memilih kategori sesuai dengan jenjang pendidikan seluruh anggota tim Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Option 1: SMA / Sederajat */}
                  <div
                    onClick={() => updateField('educationCategory', 'SMA/Sederajat')}
                    className={`p-6 border-3 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      form.educationCategory === 'SMA/Sederajat'
                        ? 'bg-blue-sail text-ballroom border-decor shadow-[6px_6px_0_0_#F6BB02]'
                        : 'bg-white border-blue-sail text-blue-sail hover:border-decor hover:shadow-[4px_4px_0_0_#2A4C9E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-display font-bold text-xs px-2.5 py-1 border ${
                        form.educationCategory === 'SMA/Sederajat' ? 'bg-decor text-blue-sail border-blue-sail' : 'bg-blue-sail/10 text-blue-sail border-blue-sail/20'
                      }`}>
                        KATEGORI 01
                      </span>
                      <Icon name="GraduationCap" size={28} className={form.educationCategory === 'SMA/Sederajat' ? 'text-decor' : 'text-blue-sail'} />
                    </div>

                    <div>
                      <h4 className="font-display font-black text-xl uppercase tracking-tight">
                        SMA / Sederajat
                      </h4>
                      <p className={`text-xs font-sans mt-1 ${form.educationCategory === 'SMA/Sederajat' ? 'text-ballroom/80' : 'text-blue-sail/70'}`}>
                        Khusus pelajar aktif tingkat SMA/SMK/MA/Sederajat di Indonesia.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-display font-bold">
                      <span className="flex items-center gap-1.5">
                        {form.educationCategory === 'SMA/Sederajat' ? (
                          <><Icon name="CheckCircle" size={14} className="text-decor" /> TERPILIH</>
                        ) : (
                          'KLIK UNTUK MEMILIH'
                        )}
                      </span>
                      <Icon name="ArrowRight" size={14} />
                    </div>
                  </div>

                  {/* Option 2: Mahasiswa (D1-S1) */}
                  <div
                    onClick={() => updateField('educationCategory', 'Mahasiswa (D1–S1)')}
                    className={`p-6 border-3 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      form.educationCategory === 'Mahasiswa (D1–S1)'
                        ? 'bg-blue-sail text-ballroom border-decor shadow-[6px_6px_0_0_#F6BB02]'
                        : 'bg-white border-blue-sail text-blue-sail hover:border-decor hover:shadow-[4px_4px_0_0_#2A4C9E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-display font-bold text-xs px-2.5 py-1 border ${
                        form.educationCategory === 'Mahasiswa (D1–S1)' ? 'bg-decor text-blue-sail border-blue-sail' : 'bg-blue-sail/10 text-blue-sail border-blue-sail/20'
                      }`}>
                        KATEGORI 02
                      </span>
                      <Icon name="Award" size={28} className={form.educationCategory === 'Mahasiswa (D1–S1)' ? 'text-decor' : 'text-blue-sail'} />
                    </div>

                    <div>
                      <h4 className="font-display font-black text-xl uppercase tracking-tight">
                        Mahasiswa (D1–S1)
                      </h4>
                      <p className={`text-xs font-sans mt-1 ${form.educationCategory === 'Mahasiswa (D1–S1)' ? 'text-ballroom/80' : 'text-blue-sail/70'}`}>
                        Khusus mahasiswa aktif jenjang D1, D2, D3, D4, maupun S1 perguruan tinggi.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs font-display font-bold">
                      <span className="flex items-center gap-1.5">
                        {form.educationCategory === 'Mahasiswa (D1–S1)' ? (
                          <><Icon name="CheckCircle" size={14} className="text-decor" /> TERPILIH</>
                        ) : (
                          'KLIK UNTUK MEMILIH'
                        )}
                      </span>
                      <Icon name="ArrowRight" size={14} />
                    </div>
                  </div>

                </div>

                {errors.educationCategory && (
                  <p className="text-red-600 font-sans text-xs font-semibold bg-red-50 p-3 border border-red-300 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={16} />
                    <span>{errors.educationCategory}</span>
                  </p>
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

            {/* ─── PAGE 2: BIODATA TIM & KETUA TIM ─── */}
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
                    BIODATA TIM &amp; KETUA TIM [{form.educationCategory}]
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Lengkapi data resmi identitas tim dan ketua kelompok pendaftar.
                  </p>
                </div>

                {/* BIODATA TIM */}
                <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                    <Icon name="Users" size={18} className="text-red-inferno" />
                    <span>BIODATA TIM</span>
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
                        Jumlah Anggota Tim *
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Asal Institusi (SMA/Universitas) *
                      </label>
                      <input
                        type="text"
                        value={form.institution}
                        onChange={e => updateField('institution', e.target.value)}
                        placeholder="Contoh: Institut Teknologi Sepuluh Nopember / SMAN 1 Surabaya"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      <p className="text-[11px] text-blue-sail/60 font-sans italic mt-1">
                        *Jika anggota tim berasal dari institusi berbeda, tuliskan asal institusi Ketua Tim.
                      </p>
                      {errors.institution && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.institution}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Kota / Daerah *
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => updateField('city', e.target.value)}
                        placeholder="Contoh: Surabaya, Jawa Timur"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.city && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.city}</p>}
                    </div>
                  </div>
                </div>

                {/* BIODATA KETUA TIM */}
                <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                    <Icon name="Crown" size={18} className="text-decor" />
                    <span>BIODATA KETUA TIM</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Nama Ketua *
                      </label>
                      <input
                        type="text"
                        value={form.leaderName}
                        onChange={e => updateField('leaderName', e.target.value)}
                        placeholder="Nama lengkap ketua tim"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      {errors.leaderName && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Nomor WhatsApp * (wa.me/62xxxxx)
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Email Aktif *
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        Upload Kartu Identitas Ketua Tim (KTP/SIM/KTM/Kartu Pelajar) *
                      </label>
                      <div className="border-2 border-dashed border-blue-sail/40 p-4 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => handleFileSelect(e, (fName, fUrl) => {
                            updateField('leaderIdFileName', fName);
                            updateField('leaderIdFileUrl', fUrl);
                          })}
                          className="hidden"
                          id="leader-id-file"
                        />
                        <label htmlFor="leader-id-file" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <Icon name="UploadCloud" size={24} className="text-red-inferno" />
                          <span className="text-xs font-display font-bold text-blue-sail uppercase flex items-center gap-1.5">
                            {form.leaderIdFileName ? (
                              <><Icon name="CheckCircle" size={14} className="text-emerald-600" /> TERPILIH: {form.leaderIdFileName}</>
                            ) : (
                              'Klik untuk Pilih File (pdf/jpg/png)'
                            )}
                          </span>
                        </label>
                      </div>
                      {errors.leaderIdFileName && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderIdFileName}</p>}
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

            {/* ─── PAGE 3: DATA ANGGOTA TIM ─── */}
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
                    DATA ANGGOTA TIM ({nonLeaderCount} ANGGOTA NON-KETUA)
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Isi data nama lengkap dan kartu identitas untuk {nonLeaderCount} anggota tim selain Ketua.
                  </p>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: nonLeaderCount }).map((_, idx) => (
                    <div key={idx} className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                        <Icon name="User" size={16} className="text-red-inferno" />
                        <span>ANGGOTA TIM {idx + 1}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Nama Lengkap Anggota Tim {idx + 1} *
                          </label>
                          <input
                            type="text"
                            value={form.members[idx]?.name || ''}
                            onChange={e => updateMember(idx, 'name', e.target.value)}
                            placeholder={`Nama lengkap anggota ${idx + 1}`}
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors[`member_${idx}_name`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Kartu Identitas Anggota Tim {idx + 1} *
                          </label>
                          <div className="border-2 border-dashed border-blue-sail/40 p-2.5 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={e => handleFileSelect(e, (fName, fUrl) => {
                                updateMember(idx, 'idFileName', fName);
                                updateMember(idx, 'idFileUrl', fUrl);
                              })}
                              className="hidden"
                              id={`member-file-${idx}`}
                            />
                            <label htmlFor={`member-file-${idx}`} className="cursor-pointer flex items-center justify-center gap-2">
                              <Icon name="UploadCloud" size={16} className="text-blue-sail" />
                              <span className="text-xs font-display font-bold text-blue-sail uppercase truncate flex items-center gap-1.5">
                                {form.members[idx]?.idFileName ? (
                                  <><Icon name="CheckCircle" size={14} className="text-emerald-600" /> {form.members[idx].idFileName}</>
                                ) : (
                                  'Pilih File Identitas'
                                )}
                              </span>
                            </label>
                          </div>
                          {errors[`member_${idx}_idFileName`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_idFileName`]}</p>
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
                    <span>LANJUT KE BUKTI SYARAT</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 4: BUKTI SYARAT PENDAFTARAN ─── */}
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
                    BUKTI SYARAT PENDAFTARAN TIM
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Unggah seluruh bukti dokumen persyaratan media sosial dalam format <strong>PDF</strong>.
                  </p>
                </div>

                <div className="space-y-5">
                  
                  {/* Task 1: IG Story Poster */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 01</span>
                        <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                          Bukti Upload Poster TSF 2026 di Instagram Story *
                        </h4>
                        <p className="text-xs font-sans text-blue-sail/80 leading-relaxed mt-1">
                          Bukti upload poster TSF 2026 di story akun pribadi utama Instagram masing-masing anggota dengan tag instagram <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong>.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] font-display font-bold text-blue-sail/60">Poster dapat diakses di:</span>
                          <span className="bg-decor/40 text-blue-sail font-display font-bold text-[10px] px-2 py-0.5 border border-blue-sail/30 uppercase">
                            LINK Menyusul
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <p className="text-[11px] text-red-inferno font-sans font-bold mb-2 flex items-center gap-1.5">
                        <Icon name="AlertTriangle" size={14} />
                        <span>Akun tidak boleh private dan SS digabung menjadi 1 file PDF.</span>
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('igStoryFileName', fName);
                          updateField('igStoryFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="ig-story-pdf"
                      />
                      <label htmlFor="ig-story-pdf" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="FileText" size={16} />
                        <span>{form.igStoryFileName ? `✓ ${form.igStoryFileName}` : 'Upload PDF Story (1 PDF)'}</span>
                      </label>
                    </div>
                    {errors.igStoryFileName && <p className="text-red-500 text-xs font-sans font-semibold">{errors.igStoryFileName}</p>}
                  </div>

                  {/* Task 2: Twibbon IG Feeds */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <div>
                      <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 02</span>
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                        Bukti Upload Twibbon TSF 2026 di Feeds Instagram *
                      </h4>
                      <p className="text-xs font-sans text-blue-sail/80 leading-relaxed mt-1">
                        Bukti upload feeds twibbon TSF 2026 melalui feeds akun pribadi utama Instagram masing-masing anggota dengan tag instagram <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong>.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] font-display font-bold text-blue-sail/60">Twibbon &amp; Caption dapat diakses di:</span>
                        <span className="bg-decor/40 text-blue-sail font-display font-bold text-[10px] px-2 py-0.5 border border-blue-sail/30 uppercase">
                          LINK BELUM
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <p className="text-[11px] text-red-inferno font-sans font-bold mb-2 flex items-center gap-1.5">
                        <Icon name="AlertTriangle" size={14} />
                        <span>Akun tidak boleh private dan SS digabung menjadi 1 file PDF.</span>
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('twibbonFileName', fName);
                          updateField('twibbonFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="twibbon-pdf"
                      />
                      <label htmlFor="twibbon-pdf" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="FileText" size={16} />
                        <span>{form.twibbonFileName ? `✓ ${form.twibbonFileName}` : 'Upload PDF Twibbon (1 PDF)'}</span>
                      </label>
                    </div>
                    {errors.twibbonFileName && <p className="text-red-500 text-xs font-sans font-semibold">{errors.twibbonFileName}</p>}
                  </div>

                  {/* Task 3: Follow IG */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <div>
                      <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 03</span>
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                        Bukti follow akun Instagram @tdcsummitfest_its dan @tdcits *
                      </h4>
                      <p className="text-xs font-sans text-blue-sail/80 leading-relaxed mt-1">
                        Screenshot bukti follow akun Instagram resmi <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong> untuk seluruh anggota tim.
                      </p>
                    </div>

                    <div className="bg-white border border-blue-sail/20 p-3">
                      <p className="text-[11px] text-red-inferno font-sans font-bold mb-2 flex items-center gap-1.5">
                        <Icon name="AlertTriangle" size={14} />
                        <span>SS digabung menjadi 1 file PDF.</span>
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={e => handleFileSelect(e, (fName, fUrl) => {
                          updateField('igFollowFileName', fName);
                          updateField('igFollowFileUrl', fUrl);
                        })}
                        className="hidden"
                        id="ig-follow-pdf"
                      />
                      <label htmlFor="ig-follow-pdf" className="cursor-pointer inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                        <Icon name="FileText" size={16} />
                        <span>{form.igFollowFileName ? `✓ ${form.igFollowFileName}` : 'Upload PDF Follow IG (1 PDF)'}</span>
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
                    <span>LANJUT KE UPLOAD BMC</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── PAGE 5: UPLOAD FILE BMC & KONFIRMASI ─── */}
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
                    UPLOAD FILE BMC &amp; KONFIRMASI AKHIR
                  </h3>
                  <p className="text-xs text-blue-sail/70 font-sans mt-1">
                    Unggah dokumen Business Model Canvas (BMC) tim Anda sesuai format resmi.
                  </p>
                </div>

                {/* BMC Template Download Button */}
                <div className="bg-decor/30 border-2 border-blue-sail p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-display font-bold text-[10px] text-red-inferno uppercase">TEMPLATE OFFICIAL BMC</span>
                    <h4 className="font-display font-bold text-sm text-blue-sail uppercase">
                      Unduh Template BMC TSF 2026
                    </h4>
                    <p className="text-[11px] text-blue-sail/80 font-sans">
                      Gunakan template resmi untuk pengerjaan Business Model Canvas tim Anda.
                    </p>
                  </div>
                  <a
                    href="https://intip.in/BMCTSF2026"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-5 py-3 border border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] shrink-0 flex items-center gap-2"
                  >
                    <Icon name="ExternalLink" size={14} />
                    <span>DOWNLOAD TEMPLATE BMC</span>
                  </a>
                </div>

                {/* File BMC Upload Input */}
                <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                  <label className="block text-xs font-display font-bold text-blue-sail uppercase">
                    Upload File BMC * (Format PDF dengan nama file: BMC_Nama Tim)
                  </label>
                  <p className="text-xs font-sans text-blue-sail/70">
                    Contoh penamaan file: <code className="bg-white border px-1.5 py-0.5 font-sans text-red-inferno font-bold">BMC_Tim Inovasi Masa Depan.pdf</code>
                  </p>

                  <div className="border-2 border-dashed border-blue-sail/40 p-5 bg-white text-center cursor-pointer hover:border-decor transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => handleFileSelect(e, (fName, fUrl) => {
                        updateField('bmcFileName', fName);
                        updateField('bmcFileUrl', fUrl);
                      })}
                      className="hidden"
                      id="bmc-pdf-file"
                    />
                    <label htmlFor="bmc-pdf-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <Icon name="UploadCloud" size={32} className="text-red-inferno" />
                      <span className="text-xs font-display font-bold text-blue-sail uppercase flex items-center gap-1.5">
                        {form.bmcFileName ? (
                          <><Icon name="CheckCircle" size={14} className="text-emerald-600" /> FILE TERPILIH: {form.bmcFileName}</>
                        ) : (
                          'Klik untuk Unggah File BMC (Format PDF)'
                        )}
                      </span>
                    </label>
                  </div>
                  {errors.bmcFileName && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.bmcFileName}</p>}
                </div>

                {/* Final Confirmation Checkbox */}
                <div className="bg-white border-2 border-blue-sail p-4 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isDataConfirmed}
                      onChange={e => updateField('isDataConfirmed', e.target.checked)}
                      className="mt-1 w-5 h-5 accent-red-inferno cursor-pointer"
                    />
                    <span className="font-display font-extrabold text-sm text-blue-sail uppercase tracking-wide">
                      Apakah semua data yang Anda isi sudah benar? (Iya) *
                    </span>
                  </label>
                  {errors.isDataConfirmed && <p className="text-red-500 text-xs font-sans font-semibold pl-8">{errors.isDataConfirmed}</p>}
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
                        <span>SUBMIT PENDAFTARAN BPC</span>
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
                    Terima Kasih telah mendaftar Business Plan Competition TDC Summit Fest 2026!
                  </h3>
                  <p className="text-sm font-sans text-blue-sail/80 leading-relaxed">
                    Data pendaftaran tim <strong>{form.teamName}</strong> telah tercatat secara resmi di database panitia TSF 2026.
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
                    onClick={() => alert('Link Grup WhatsApp Resmi BPC TSF 2026 akan segera dikirimkan via WhatsApp / Email Ketua Tim!')}
                    className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Icon name="MessageCircle" size={18} />
                    <span>JOIN WHATSAPP GROUP (LINK MENYUSUL)</span>
                  </button>
                </div>

                <p className="font-display font-black text-base text-red-inferno uppercase tracking-wide">
                  Sampai jumpa di BPC TSF 2026, Future Innovator!
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setForm({
                        educationCategory: '',
                        teamName: '',
                        institution: '',
                        city: '',
                        teamSize: '3',
                        leaderName: '',
                        leaderWhatsapp: '',
                        leaderEmail: '',
                        leaderIdFileName: '',
                        leaderIdFileUrl: '',
                        members: [
                          { name: '', idFileName: '', idFileUrl: '' },
                          { name: '', idFileName: '', idFileUrl: '' },
                          { name: '', idFileName: '', idFileUrl: '' },
                          { name: '', idFileName: '', idFileUrl: '' },
                        ],
                        igStoryFileName: '',
                        igStoryFileUrl: '',
                        twibbonFileName: '',
                        twibbonFileUrl: '',
                        igFollowFileName: '',
                        igFollowFileUrl: '',
                        bmcFileName: '',
                        bmcFileUrl: '',
                        isDataConfirmed: false,
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
