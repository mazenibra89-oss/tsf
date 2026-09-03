import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { AuthModal } from '../components/AuthModal';
import { motion, AnimatePresence } from 'motion/react';

interface MemberFields {
  fullName: string;
  institution: string; // Asal Sekolah / Asal Institusi
  domicile: string; // Domisili (Khusus SMA)
  studentId: string; // NRP/NIM (Khusus Mahasiswa)
  major: string; // Jurusan (Khusus Mahasiswa)
  grade: string; // Kelas 10/11/12 (Khusus SMA)
  year: string; // Angkatan (Khusus Mahasiswa)
  whatsapp: string;
  email: string;
  cardFileName: string; // Upload KTM / Kartu Pelajar (Max 3MB)
  cardFileUrl: string;
}

export const RegistCompetition: React.FC = () => {
  const { addCompetitionRegistration, currentUser, setCurrentPage, myTeam } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Scroll helper
  const scrollToForm = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const el = document.getElementById('competition-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const DRAFT_KEY = 'tsf_regist_competition_draft_v1';

  // Load initial draft from localStorage if available
  const initialDraft = (() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse draft:', e);
    }
    return null;
  })();

  // Step state: 1 | 2 | 3 | 4 | 5 | 'success'
  const [step, setStep] = useState<number | 'success'>(initialDraft?.step || 1);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(!!initialDraft);

  const defaultForm = {
    competitionType: '' as 'BPC' | 'BCC' | '',
    educationCategory: '' as 'SMA/Sederajat' | 'Mahasiswa' | '',
    teamName: '',
    teamSize: '3' as '3' | '4' | '5',
    leaderFullName: '',
    leaderInstitution: '',
    leaderDomicile: '',
    leaderStudentId: '',
    leaderMajor: '',
    leaderGrade: '10' as '10' | '11' | '12',
    leaderYear: '',
    leaderWhatsapp: '',
    leaderEmail: '',
    leaderCardFileName: '',
    leaderCardFileUrl: '',
    members: [
      { fullName: '', institution: '', domicile: '', studentId: '', major: '', grade: '10', year: '', whatsapp: '', email: '', cardFileName: '', cardFileUrl: '' },
      { fullName: '', institution: '', domicile: '', studentId: '', major: '', grade: '10', year: '', whatsapp: '', email: '', cardFileName: '', cardFileUrl: '' },
      { fullName: '', institution: '', domicile: '', studentId: '', major: '', grade: '10', year: '', whatsapp: '', email: '', cardFileName: '', cardFileUrl: '' },
      { fullName: '', institution: '', domicile: '', studentId: '', major: '', grade: '10', year: '', whatsapp: '', email: '', cardFileName: '', cardFileUrl: '' },
    ] as MemberFields[],
    igStoryFileName: '',
    igStoryFileUrl: '',
    twibbonFileName: '',
    twibbonFileUrl: '',
    igFollowFileName: '',
    igFollowFileUrl: '',
    agreeDataTrue: false,
    agreeGuidebook: false,
    agreeRangkaian: false,
  };

  const [form, setForm] = useState(initialDraft?.form || defaultForm);

  // Auto-save draft on form or step change
  React.useEffect(() => {
    if (step !== 'success') {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
      } catch (e) {
        console.error('Failed to save draft:', e);
      }
    }
  }, [form, step]);

  const resetFormDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
    setForm(defaultForm);
    setStep(1);
    setHasRestoredDraft(false);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSMA = form.educationCategory === 'SMA/Sederajat';

  // Non-leader members count = parseInt(teamSize) - 1
  const nonLeaderCount = Math.max(0, parseInt(form.teamSize, 10) - 1);

  const updateField = (field: string, val: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: val };
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

  // File inputs replaced by direct URL inputs to prevent server memory spikes

  // Step Validations
  const validateStep1 = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }
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
    if (!form.leaderInstitution.trim()) errs.leaderInstitution = isSMA ? 'Asal Sekolah wajib diisi' : 'Asal Institusi wajib diisi';
    
    if (isSMA) {
      if (!form.leaderDomicile.trim()) errs.leaderDomicile = 'Domisili wajib diisi';
      if (!form.leaderGrade) errs.leaderGrade = 'Kelas wajib dipilih';
    } else {
      if (!form.leaderStudentId.trim()) errs.leaderStudentId = 'NRP/NIM wajib diisi';
      if (!form.leaderMajor.trim()) errs.leaderMajor = 'Jurusan wajib diisi';
      if (!form.leaderYear.trim()) errs.leaderYear = 'Angkatan wajib diisi';
    }

    if (!form.leaderWhatsapp.trim()) errs.leaderWhatsapp = 'Nomor WhatsApp wajib diisi';
    if (!form.leaderEmail.trim()) {
      errs.leaderEmail = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.leaderEmail)) {
      errs.leaderEmail = 'Format email tidak valid';
    }

    if (!form.leaderCardFileUrl.trim()) {
      errs.leaderCardFileUrl = isSMA ? 'Link Google Drive Kartu Pelajar Ketua Tim wajib diisi' : 'Link Google Drive KTM Ketua Tim wajib diisi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    for (let i = 0; i < nonLeaderCount; i++) {
      const m = form.members[i];
      if (!m.fullName.trim()) errs[`member_${i}_fullName`] = `Nama Lengkap Anggota ${i + 1} wajib diisi`;
      if (!m.institution.trim()) errs[`member_${i}_institution`] = isSMA ? `Asal Sekolah Anggota ${i + 1} wajib diisi` : `Asal Institusi Anggota ${i + 1} wajib diisi`;
      
      if (isSMA) {
        if (!m.domicile.trim()) errs[`member_${i}_domicile`] = `Domisili Anggota ${i + 1} wajib diisi`;
        if (!m.grade) errs[`member_${i}_grade`] = `Kelas Anggota ${i + 1} wajib dipilih`;
      } else {
        if (!m.studentId.trim()) errs[`member_${i}_studentId`] = `NRP/NIM Anggota ${i + 1} wajib diisi`;
        if (!m.major.trim()) errs[`member_${i}_major`] = `Jurusan Anggota ${i + 1} wajib diisi`;
        if (!m.year.trim()) errs[`member_${i}_year`] = `Angkatan Anggota ${i + 1} wajib diisi`;
      }

      if (!m.whatsapp.trim()) errs[`member_${i}_whatsapp`] = `Nomor WhatsApp Anggota ${i + 1} wajib diisi`;
      if (!m.email.trim()) {
        errs[`member_${i}_email`] = `Email Anggota ${i + 1} wajib diisi`;
      } else if (!/\S+@\S+\.\S+/.test(m.email)) {
        errs[`member_${i}_email`] = `Format email Anggota ${i + 1} tidak valid`;
      }

      if (!m.cardFileUrl.trim()) {
        errs[`member_${i}_cardFileUrl`] = isSMA ? `Link Google Drive Kartu Pelajar Anggota ${i + 1} wajib diisi` : `Link Google Drive KTM Anggota ${i + 1} wajib diisi`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!form.igStoryFileUrl.trim()) {
      errs.igStoryFileUrl = 'Link Google Drive Bukti Upload Poster TSF 2026 di Instagram Story wajib diisi';
    }
    if (!form.twibbonFileUrl.trim()) {
      errs.twibbonFileUrl = 'Link Google Drive Bukti Upload Twibbon TSF 2026 di Feeds Instagram wajib diisi';
    }
    if (!form.igFollowFileUrl.trim()) {
      errs.igFollowFileUrl = 'Link Google Drive Bukti Follow Instagram @tdcsummitfest_its dan @tdcits wajib diisi';
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
      errs.agreeRangkaian = 'Anda harus menyatakan bersedia mengikuti seluruh rangkaian TDC Summit Fest 2026';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!validateStep5()) return;

    setIsSubmitting(true);
    (async () => {
      try {
        const memberNames = form.members.slice(0, nonLeaderCount).map(m => `${m.fullName} (${m.institution})`);
        const leaderObject = {
          fullName: form.leaderFullName,
          institution: form.leaderInstitution,
          domicile: form.leaderDomicile,
          studentId: form.leaderStudentId,
          major: form.leaderMajor,
          grade: form.leaderGrade,
          year: form.leaderYear,
          whatsapp: form.leaderWhatsapp,
          email: form.leaderEmail,
          cardFileName: form.leaderCardFileName,
          cardFileUrl: form.leaderCardFileUrl
        };
        const membersArray = form.members.slice(0, nonLeaderCount);

        await addCompetitionRegistration({
          user_id: currentUser.id,
          competition_type: form.competitionType as any,
          education_category: form.educationCategory as any,
          team_name: form.teamName,
          team_size: form.teamSize,
          leader_name: form.leaderFullName,
          leader_data: leaderObject,
          members: memberNames,
          members_data: membersArray,
          institution: form.leaderInstitution,
          contact: form.leaderWhatsapp,
          email: form.leaderEmail,
          category_id: `${form.competitionType} - ${form.educationCategory}`,
          payment_proof_url: form.leaderCardFileUrl || form.leaderCardFileName || 'Bukti_Identitas_Ketua',
          file_url: form.igStoryFileUrl || form.igStoryFileName || 'Bukti_Persyaratan',
          ig_story_file_url: form.igStoryFileUrl || form.igStoryFileName,
          twibbon_file_url: form.twibbonFileUrl || form.twibbonFileName,
          ig_follow_file_url: form.igFollowFileUrl || form.igFollowFileName,
          status_stage: 'preliminary',
          status_preliminary: 'pending'
        } as any);

        setIsSubmitting(false);
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        setStep('success');
      } catch (err: any) {
        setIsSubmitting(false);
        alert(err.message || 'Gagal mengirim pendaftaran kompetisi');
      }
    })();
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
        
        {myTeam ? (
          <div className="bg-ballroom border-4 border-blue-sail p-8 shadow-[10px_10px_0_0_#BD1B1F] space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-inferno text-white flex items-center justify-center mx-auto border-2 border-blue-sail shadow-[4px_4px_0_0_#000]">
              <Icon name="CheckCircle2" size={36} />
            </div>
            <div className="space-y-2">
              <span className="bg-decor text-blue-sail font-display font-black text-xs px-3 py-1 border border-blue-sail uppercase tracking-wider inline-block">
                AKUN TELAH TERDAFTAR
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">
                AKUN ANDA SUDAH MENDAFTARKAN TIM
              </h3>
              <p className="text-sm font-sans text-blue-sail/80 max-w-xl mx-auto leading-relaxed">
                Setiap akun pengguna hanya diperbolehkan mendaftarkan 1 tim di kompetisi TDC Summit Fest 2026. Akun Anda telah terdaftar sebagai ketua tim:
              </p>
            </div>

            <div className="bg-decor/20 border-2 border-blue-sail p-5 max-w-md mx-auto space-y-2 text-left shadow-[4px_4px_0_0_#000]">
              <div className="flex items-center justify-between border-b border-blue-sail/20 pb-2">
                <span className="font-display font-black text-base text-blue-sail uppercase">
                  TIM {myTeam.team_name.toUpperCase()}
                </span>
                <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2 py-0.5 uppercase">
                  CABANG {myTeam.competition_type || 'BPC'}
                </span>
              </div>
              <p className="text-xs font-sans text-blue-sail"><strong>Ketua Tim:</strong> {myTeam.leader_name}</p>
              <p className="text-xs font-sans text-blue-sail"><strong>Institusi:</strong> {myTeam.institution}</p>
              <p className="text-xs font-sans text-blue-sail"><strong>Tahap Kompetisi:</strong> {myTeam.status_stage?.toUpperCase() || 'PRELIMINARY'}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => { window.location.hash = '#/dashboard'; }}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs sm:text-sm uppercase px-8 py-4 border-2 border-blue-sail shadow-[5px_5px_0_0_#BD1B1F] cursor-pointer inline-flex items-center gap-2"
              >
                <Icon name="Trophy" size={18} />
                <span>MASUK KE DASHBOARD TIM SAYA</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {hasRestoredDraft && step !== 'success' && (
              <div className="bg-decor/20 border-3 border-blue-sail p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[4px_4px_0_0_#000] text-xs font-sans text-blue-sail animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Icon name="BookmarkCheck" size={20} className="text-blue-sail shrink-0" />
                  <div>
                    <span className="font-display font-black uppercase text-blue-sail block">DRAFT OTOMATIS DIPULIHKAN</span>
                    <span className="text-blue-sail/80">Jawaban pendaftaran Anda telah tersimpan otomatis dan dilanjutkan dari Halaman {step}.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetFormDraft}
                  className="bg-red-inferno hover:bg-red-700 text-white font-display font-bold text-[10px] uppercase px-3.5 py-2 border border-blue-sail shrink-0 cursor-pointer flex items-center gap-1 shadow-[2px_2px_0_0_#000]"
                >
                  <Icon name="RotateCcw" size={12} />
                  <span>Mulai Dari Awal (Hapus Draft)</span>
                </button>
              </div>
            )}

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
                    <span>SECTION 2 — DATA KETUA TIM ({form.educationCategory})</span>
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

                    {/* SMA vs Mahasiswa specific fields */}
                    {isSMA ? (
                      <>
                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Asal Sekolah *
                          </label>
                          <input
                            type="text"
                            value={form.leaderInstitution}
                            onChange={e => updateField('leaderInstitution', e.target.value)}
                            placeholder="SMA / SMK / MA Sederajat"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors.leaderInstitution && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderInstitution}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Domisili *
                          </label>
                          <input
                            type="text"
                            value={form.leaderDomicile}
                            onChange={e => updateField('leaderDomicile', e.target.value)}
                            placeholder="Kota / Daerah asal"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors.leaderDomicile && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderDomicile}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Kelas *
                          </label>
                          <select
                            value={form.leaderGrade}
                            onChange={e => updateField('leaderGrade', e.target.value)}
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none font-bold"
                          >
                            <option value="10">Kelas 10</option>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                          </select>
                          {errors.leaderGrade && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderGrade}</p>}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            Asal Institusi *
                          </label>
                          <input
                            type="text"
                            value={form.leaderInstitution}
                            onChange={e => updateField('leaderInstitution', e.target.value)}
                            placeholder="Universitas / Perguruan Tinggi"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors.leaderInstitution && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderInstitution}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            NRP / NIM *
                          </label>
                          <input
                            type="text"
                            value={form.leaderStudentId}
                            onChange={e => updateField('leaderStudentId', e.target.value)}
                            placeholder="NRP / NIM mahasiswa"
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
                            placeholder="Program Studi / Jurusan"
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
                            placeholder="Contoh: 2023"
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          {errors.leaderYear && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderYear}</p>}
                        </div>
                      </>
                    )}

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

                    {/* Upload KTM / Kartu Pelajar */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                        {isSMA ? 'Link GDrive Kartu Pelajar Ketua Tim *' : 'Link GDrive KTM Ketua Tim *'}
                      </label>
                      <input
                        type="url"
                        value={form.leaderCardFileUrl}
                        onChange={e => {
                          updateField('leaderCardFileUrl', e.target.value);
                          updateField('leaderCardFileName', 'Link GDrive');
                        }}
                        placeholder="https://drive.google.com/..."
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                      />
                      <p className="text-[10px] text-blue-sail/60 font-sans mt-1">
                        Pastikan akses link "Anyone with the link / Siapa saja yang memiliki tautan"
                      </p>
                      {errors.leaderCardFileUrl && <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors.leaderCardFileUrl}</p>}
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
                    Isi data lengkap untuk {nonLeaderCount} anggota tim selain Ketua sesuai jenjang <strong>{form.educationCategory}</strong>.
                  </p>
                </div>

                <div className="space-y-6">
                  {Array.from({ length: nonLeaderCount }).map((_, idx) => (
                    <div key={idx} className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-4">
                      <h4 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2 border-b border-blue-sail/20 pb-2">
                        <Icon name="User" size={16} className="text-red-inferno" />
                        <span>ANGGOTA TIM {idx + 1} ({form.educationCategory})</span>
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

                        {/* SMA vs Mahasiswa specific fields */}
                        {isSMA ? (
                          <>
                            <div>
                              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                                Asal Sekolah *
                              </label>
                              <input
                                type="text"
                                value={form.members[idx]?.institution || ''}
                                onChange={e => updateMember(idx, 'institution', e.target.value)}
                                placeholder="SMA / SMK / MA Sederajat"
                                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                              />
                              {errors[`member_${idx}_institution`] && (
                                <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_institution`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                                Domisili *
                              </label>
                              <input
                                type="text"
                                value={form.members[idx]?.domicile || ''}
                                onChange={e => updateMember(idx, 'domicile', e.target.value)}
                                placeholder="Kota / Daerah asal"
                                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                              />
                              {errors[`member_${idx}_domicile`] && (
                                <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_domicile`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                                Kelas *
                              </label>
                              <select
                                value={form.members[idx]?.grade || '10'}
                                onChange={e => updateMember(idx, 'grade', e.target.value)}
                                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none font-bold"
                              >
                                <option value="10">Kelas 10</option>
                                <option value="11">Kelas 11</option>
                                <option value="12">Kelas 12</option>
                              </select>
                              {errors[`member_${idx}_grade`] && (
                                <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_grade`]}</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                                Asal Institusi *
                              </label>
                              <input
                                type="text"
                                value={form.members[idx]?.institution || ''}
                                onChange={e => updateMember(idx, 'institution', e.target.value)}
                                placeholder="Universitas / Perguruan Tinggi"
                                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                              />
                              {errors[`member_${idx}_institution`] && (
                                <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_institution`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                                NRP / NIM *
                              </label>
                              <input
                                type="text"
                                value={form.members[idx]?.studentId || ''}
                                onChange={e => updateMember(idx, 'studentId', e.target.value)}
                                placeholder="NRP / NIM"
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
                                placeholder="Program Studi / Jurusan"
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
                                placeholder="Contoh: 2023"
                                className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                              />
                              {errors[`member_${idx}_year`] && (
                                <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_year`]}</p>
                              )}
                            </div>
                          </>
                        )}

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

                        {/* Upload KTM / Kartu Pelajar for Member */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-display font-bold text-blue-sail uppercase mb-1">
                            {isSMA ? `Link GDrive Kartu Pelajar Anggota ${idx + 1} *` : `Link GDrive KTM Anggota ${idx + 1} *`}
                          </label>
                          <input
                            type="url"
                            value={form.members[idx]?.cardFileUrl || ''}
                            onChange={e => {
                              updateMember(idx, 'cardFileUrl', e.target.value);
                              updateMember(idx, 'cardFileName', 'Link GDrive');
                            }}
                            placeholder="https://drive.google.com/..."
                            className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none"
                          />
                          <p className="text-[10px] text-blue-sail/60 font-sans mt-1">
                            Pastikan akses link "Anyone with the link / Siapa saja yang memiliki tautan"
                          </p>
                          {errors[`member_${idx}_cardFileUrl`] && (
                            <p className="text-red-500 text-xs font-sans font-semibold mt-1">{errors[`member_${idx}_cardFileUrl`]}</p>
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
                    Unggah berkas bukti persyaratan media sosial resmi TSF 2026.
                  </p>
                </div>

                <div className="space-y-6">
                  
                  {/* Task 1: IG Story Poster (Max 5MB PDF) */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 01</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti Upload Poster TSF 2026 di Instagram Story *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Bukti upload poster TSF 2026 di story akun pribadi utama Instagram masing-masing anggota dengan tag instagram <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong>.
                    </p>
                    
                    <div className="bg-decor/30 text-blue-sail p-3 border border-blue-sail/30 flex items-center justify-between text-xs font-display font-bold">
                      <span>Poster dapat diakses di:</span>
                      <span className="bg-blue-sail text-decor px-2.5 py-1 text-[10px] uppercase border border-blue-sail">
                        LINK MENYUSUL
                      </span>
                    </div>

                    <div className="bg-white border border-blue-sail/20 p-3.5 space-y-2">
                      <p className="text-[11px] text-red-inferno font-sans font-bold flex items-center gap-1.5">
                        <Icon name="AlertCircle" size={14} />
                        <span>Akun tidak boleh private dan SS digabung menjadi 1 file di dalam Google Drive.</span>
                      </p>
                      
                      <input
                        type="url"
                        value={form.igStoryFileUrl}
                        onChange={e => {
                          updateField('igStoryFileUrl', e.target.value);
                          updateField('igStoryFileName', 'Link GDrive');
                        }}
                        placeholder="Link Google Drive"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2 text-sm font-sans text-blue-sail outline-none"
                      />
                    </div>
                    {errors.igStoryFileUrl && <p className="text-red-500 text-xs font-sans font-semibold">{errors.igStoryFileUrl}</p>}
                  </div>

                  {/* Task 2: Twibbon IG Feeds (Max 5MB PDF) */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 02</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti Upload Twibbon TSF 2026 di Feeds Instagram *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Bukti upload feeds twibbon TSF 2026 melalui feeds akun pribadi utama Instagram masing-masing anggota dengan tag instagram <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong>.
                    </p>

                    <div className="bg-decor/30 text-blue-sail p-3 border border-blue-sail/30 flex items-center justify-between text-xs font-display font-bold">
                      <span>Twibbon dan caption dapat diakses di:</span>
                      <span className="bg-blue-sail text-decor px-2.5 py-1 text-[10px] uppercase border border-blue-sail">
                        LINK BELUM
                      </span>
                    </div>

                    <div className="bg-white border border-blue-sail/20 p-3.5 space-y-2">
                      <p className="text-[11px] text-red-inferno font-sans font-bold flex items-center gap-1.5">
                        <Icon name="AlertCircle" size={14} />
                        <span>Akun tidak boleh private dan SS digabung menjadi 1 file di dalam Google Drive.</span>
                      </p>

                      <input
                        type="url"
                        value={form.twibbonFileUrl}
                        onChange={e => {
                          updateField('twibbonFileUrl', e.target.value);
                          updateField('twibbonFileName', 'Link GDrive');
                        }}
                        placeholder="Link Google Drive"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2 text-sm font-sans text-blue-sail outline-none"
                      />
                    </div>
                    {errors.twibbonFileUrl && <p className="text-red-500 text-xs font-sans font-semibold">{errors.twibbonFileUrl}</p>}
                  </div>

                  {/* Task 3: Follow IG (Max 5MB PDF) */}
                  <div className="bg-blue-sail/5 border-2 border-blue-sail/30 p-5 space-y-3">
                    <span className="bg-red-inferno text-ballroom font-display font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider inline-block mb-1">SYARAT 03</span>
                    <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                      Bukti follow akun Instagram @tdcsummitfest_its dan @tdcits *
                    </h4>
                    <p className="text-xs font-sans text-blue-sail/80 leading-relaxed">
                      Screenshot bukti follow akun Instagram resmi <strong>@tdcsummitfest_its</strong> dan <strong>@tdcits</strong> untuk seluruh anggota tim.
                    </p>

                    <div className="bg-white border border-blue-sail/20 p-3.5 space-y-2">
                      <p className="text-[11px] text-red-inferno font-sans font-bold flex items-center gap-1.5">
                        <Icon name="AlertCircle" size={14} />
                        <span>SS digabung menjadi 1 file di dalam Google Drive.</span>
                      </p>

                      <input
                        type="url"
                        value={form.igFollowFileUrl}
                        onChange={e => {
                          updateField('igFollowFileUrl', e.target.value);
                          updateField('igFollowFileName', 'Link GDrive');
                        }}
                        placeholder="Link Google Drive"
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2 text-sm font-sans text-blue-sail outline-none"
                      />
                    </div>
                    {errors.igFollowFileUrl && <p className="text-red-500 text-xs font-sans font-semibold">{errors.igFollowFileUrl}</p>}
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

                <div className="pt-4 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { window.location.hash = '#/dashboard'; }}
                    className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs sm:text-sm uppercase px-8 py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] cursor-pointer flex items-center gap-2"
                  >
                    <Icon name="Trophy" size={18} />
                    <span>BUKA DASHBOARD TIM (SUBMIT PRELIMINARY)</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
        </>
        )}
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Silakan Login atau Daftar Akun Terlebih Dahulu untuk Mendaftar Kompetisi"
      />

    </div>
  );
};
