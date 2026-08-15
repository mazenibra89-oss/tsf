import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';

interface RoleDetail {
  id: 'influencer' | 'ambassador';
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  description: string;
  benefits: string[];
}

const ROLES: RoleDetail[] = [
  {
    id: 'influencer',
    title: 'Campus Influencer',
    subtitle: 'Official ITS Student Representative 2026',
    badge: 'FOR ITS STUDENTS',
    icon: 'Sparkles',
    description: 'Campus Influencer (CI) adalah perwakilan mahasiswa ITS 2026 yang berperan dalam memperluas branding TDC Summit Fest 2026, baik di lingkungan kampus maupun kepada masyarakat luas, khususnya generasi muda sebaya. Campus Influencer berkontribusi dalam menyebarkan informasi dan inovasi TSF, membangun engagement dengan audiens, serta meningkatkan eksistensi dan semangat technopreneurship di kalangan generasi muda.',
    benefits: [
      'Coaching exclusive program',
      'Networking & exposure',
      'E-Certificate',
      'Experience',
      'Special Merchandise',
      'Awarding Appreciation'
    ]
  },
  {
    id: 'ambassador',
    title: 'Student Ambassador',
    subtitle: 'Official High School Representative (Surabaya)',
    badge: 'FOR SMA/SMK SURABAYA',
    icon: 'Award',
    description: 'Student Ambassador (SA) merupakan perwakilan siswa SMA/SMK sederajat di Surabaya yang menjadi jembatan antara TDC Summit Fest 2026 para pelajar. Selain memperoleh kesempatan memperluas exposure dan networking, Student Ambassador juga berperan dalam memperluas branding TSF, menyebarkan semangat inovasi dan technopreneurship, serta mengajak lebih banyak pelajar untuk mengenal TDC Summit Fest 2026.',
    benefits: [
      'Coaching exclusive program',
      'Networking & exposure',
      'E-Certificate',
      'Experience',
      'Special Merchandise',
      'Awarding Appreciation'
    ]
  }
];

const INITIAL_FORM_DATA = {
  // Page 1 - Shared & Role Specific Data Diri
  email: '',
  fullName: '',
  nrp: '',           // CI
  department: '',    // CI
  faculty: '',       // CI
  gradeClass: '',    // SA (Kelas)
  school: '',        // SA (Asal Sekolah)
  instagram: '',
  tiktok: '',
  whatsapp: '',

  // Page 2 - Pertanyaan Open Recruitment
  q1_tsfKnowledge: '',
  q2_roleKnowledge: '',
  q3_motivation: '',
  q4_commitmentScale: '10',
  q5_commitmentReason: '',
  q6_promotionStrategy: '',
  q7_contentTypeStrategy: '',
  q8_additionalBenefits: '',
  q9_infoSource: 'Instagram',
  q9_infoSourceFriend: '',

  // Page 3 - Berkas & Video
  driveFolderUrl: '',
  reelsVideoUrl: ''
};

export const Recruitment: React.FC = () => {
  // Overview Tab state (Independent from form)
  const [overviewRole, setOverviewRole] = useState<'influencer' | 'ambassador'>('influencer');

  // Form Role selection states
  const [selectedFormRole, setSelectedFormRole] = useState<'influencer' | 'ambassador'>('influencer'); // Candidate selection on Step 0
  const [formRole, setFormRole] = useState<'influencer' | 'ambassador'>('influencer');                   // Active role being filled
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);

  // Form Inputs State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form inputs completely when selecting/changing role
  const handleStartForm = () => {
    setFormRole(selectedFormRole);
    setFormData({ ...INITIAL_FORM_DATA });
    setErrorMessage('');
    setCurrentStep(1);
    window.scrollTo({ top: document.getElementById('recruitment-form-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleResetRoleChoice = () => {
    setFormData({ ...INITIAL_FORM_DATA });
    setErrorMessage('');
    setCurrentStep(0);
    window.scrollTo({ top: document.getElementById('recruitment-form-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');

    if (step === 1) {
      if (!formData.email || !formData.fullName || !formData.whatsapp) {
        setErrorMessage('Harap isi Email, Nama Lengkap, dan Nomor WhatsApp!');
        return false;
      }
      if (formRole === 'influencer') {
        if (!formData.nrp || !formData.department || !formData.faculty) {
          setErrorMessage('Harap isi NRP, Departemen, dan Fakultas!');
          return false;
        }
      } else {
        if (!formData.gradeClass || !formData.school) {
          setErrorMessage('Harap isi Kelas dan Asal Sekolah!');
          return false;
        }
      }
    }

    if (step === 2) {
      if (
        !formData.q1_tsfKnowledge ||
        !formData.q2_roleKnowledge ||
        !formData.q3_motivation ||
        !formData.q5_commitmentReason ||
        !formData.q6_promotionStrategy ||
        !formData.q7_contentTypeStrategy ||
        !formData.q8_additionalBenefits
      ) {
        setErrorMessage('Harap jawab seluruh pertanyaan esai pada Halaman 2!');
        return false;
      }
      if (formData.q9_infoSource === 'Teman' && !formData.q9_infoSourceFriend) {
        setErrorMessage('Harap sebutkan nama teman sumber informasi!');
        return false;
      }
    }

    if (step === 3) {
      // Allow optional folder/video links so submission is never blocked
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => (prev < 3 ? (prev + 1 as 1 | 2 | 3) : 3));
      window.scrollTo({ top: document.getElementById('recruitment-form-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      handleResetRoleChoice();
    } else {
      setCurrentStep(prev => (prev > 1 ? (prev - 1 as 0 | 1 | 2 | 3) : 0));
      window.scrollTo({ top: document.getElementById('recruitment-form-section')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  const { addAmbassadorApplication } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      await addAmbassadorApplication({
        role_choice: formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador',
        email: formData.email,
        full_name: formData.fullName,
        nrp: formData.nrp || undefined,
        department: formData.department || undefined,
        faculty: formData.faculty || undefined,
        grade_class: formData.gradeClass || undefined,
        school: formData.school || undefined,
        instagram: formData.instagram || undefined,
        tiktok: formData.tiktok || undefined,
        whatsapp: formData.whatsapp,
        q1_tsf_knowledge: formData.q1_tsfKnowledge,
        q2_role_knowledge: formData.q2_roleKnowledge,
        q3_motivation: formData.q3_motivation,
        q4_commitment_scale: formData.q4_commitmentScale,
        q5_commitment_reason: formData.q5_commitmentReason,
        q6_promotion_strategy: formData.q6_promotionStrategy,
        q7_content_type_strategy: formData.q7_contentTypeStrategy,
        q8_additional_benefits: formData.q8_additionalBenefits,
        q9_info_source: formData.q9_infoSource,
        q9_info_source_friend: formData.q9_infoSource === 'Teman' ? formData.q9_infoSourceFriend : undefined,
        drive_folder_url: formData.driveFolderUrl || '-',
        reels_video_url: formData.reelsVideoUrl || '-'
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      alert('Pendaftaran gagal tersimpan ke server: ' + (err?.message || 'Terjadi kesalahan. Coba lagi.'));
    }
  };

  return (
    <div className="asphalt-texture min-h-screen pt-12 pb-24 relative overflow-hidden">
      {/* Background decor accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-decor/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-red-inferno/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            className="inline-flex items-center space-x-2 bg-decor text-blue-sail text-xs font-mono font-bold px-4 py-1.5 uppercase tracking-widest border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] mb-6 skew-x-[-6deg]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>OPEN RECRUITMENT TSF 2026</span>
          </motion.div>

          <motion.h1
            className="font-display font-black text-4xl sm:text-6xl text-blue-sail uppercase tracking-tight leading-none mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CAMPUS INFLUENCER &<br />
            <span className="text-decor text-shadow-sm">STUDENT AMBASSADOR</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-blue-sail/80 font-sans leading-relaxed max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Jadilah representatif dan wajah resmi <strong>TDC Summit Fest 2026</strong>! Tingkatkan personal branding, perluas jejaring mahasiswa & pelajar, serta kembangkan potensi kepemimpinanmu.
          </motion.p>

          {/* Action Buttons: DAFTAR SEKARANG & Guidebook */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('recruitment-form-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-7 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all tracking-widest cursor-pointer"
            >
              <span>DAFTAR SEKARANG</span>
              <Icon name="ArrowRight" size={16} />
            </button>

            <a
              href="https://its.id/m/GuidebookAmbassadorTSF26"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2.5 bg-red-inferno hover:bg-red-600 text-ballroom font-display font-extrabold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] hover:shadow-[5px_5px_0_0_#F6BB02] active:translate-x-0.5 active:translate-y-0.5 transition-all tracking-wider"
            >
              <Icon name="FileText" size={16} />
              <span>UNDUH GUIDEBOOK PENDAFTARAN (PDF)</span>
              <Icon name="ExternalLink" size={12} />
            </a>
          </motion.div>
        </div>

        {/* Role Selector Tabs Overview (Informasi Detail Penjelasan Top Header) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-blue-sail p-1.5 border-4 border-blue-sail shadow-[6px_6px_0_0_#BD1B1F]">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setOverviewRole(role.id)}
                className={`px-6 py-3 font-display font-extrabold text-xs uppercase tracking-wider transition-all duration-200 ${
                  overviewRole === role.id
                    ? 'bg-decor text-blue-sail shadow-[2px_2px_0_0_#8B011A]'
                    : 'text-ballroom/75 hover:text-ballroom'
                }`}
              >
                {role.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Overview Grid */}
        <AnimatePresence mode="wait">
          {ROLES.filter(r => r.id === overviewRole).map((role) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
            >
              {/* Role Info Box */}
              <div className="bg-ballroom text-blue-sail p-8 sm:p-10 border-[3px] border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-red-inferno text-ballroom font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail mb-4">
                    {role.badge}
                  </span>
                  <h3 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight mb-2">
                    {role.title}
                  </h3>
                  <p className="font-mono text-xs font-bold text-red-inferno uppercase tracking-wider mb-6">
                    {role.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-blue-sail/85 leading-relaxed font-sans mb-6">
                    {role.description}
                  </p>
                </div>

                <div className="bg-blue-sail/5 p-4 border border-blue-sail/15 mt-4">
                  <p className="text-xs font-mono font-bold text-blue-sail uppercase tracking-wide mb-1">
                    ★ Status Pendaftaran:
                  </p>
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Terbuka Resmi untuk {role.id === 'influencer' ? 'Mahasiswa ITS 2026' : 'Pelajar SMA/SMK Surabaya'}</span>
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-decor text-blue-sail p-8 sm:p-10 border-[3px] border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="bg-red-inferno text-ballroom p-2 border border-blue-sail shrink-0">
                      <Icon name="Gift" size={20} />
                    </span>
                    <h4 className="font-display font-black text-xl uppercase tracking-tight text-blue-sail leading-snug">
                      Unlock Your Benefits as a TDC SUMMIT FEST Ambassador
                    </h4>
                  </div>
                  <div className="w-full h-1 bg-blue-sail/20 mb-6" />

                  <ul className="space-y-3.5 font-sans text-sm">
                    {role.benefits.map((b, i) => (
                      <li key={i} className="flex items-center space-x-3 bg-ballroom/80 p-3 border-2 border-blue-sail font-bold shadow-[2px_2px_0_0_#8B011A]">
                        <Icon name="Star" size={16} className="text-red-inferno shrink-0 fill-red-inferno" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        {/* REGISTRATION FORM SECTION */}
        <div id="recruitment-form-section" className="max-w-4xl mx-auto">
          <div className="bg-ballroom text-blue-sail p-6 sm:p-12 border-[4px] border-blue-sail shadow-[10px_10px_0_0_#BD1B1F] relative">

            {/* STEP 0: HALAMAN KHUSUS PILIH PERAN (CI ATAU SA) */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center max-w-xl mx-auto">
                  <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest block mb-2">
                    // LANGKAH 1 DARI FORMULIR PENDAFTARAN
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-blue-sail">
                    PILIH PERAN RECRUITMENT TSF 2026
                  </h2>
                  <p className="text-sm font-sans text-blue-sail/80 mt-2">
                    Klik salah satu peran di bawah ini untuk memilih, lalu klik tombol <strong>"LANJUT KE DATA DIRI"</strong> di bagian bawah:
                  </p>
                  <div className="w-24 h-1.5 bg-decor mx-auto mt-4" />
                </div>

                {/* Selectable Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Card 1: Campus Influencer */}
                  <div
                    onClick={() => setSelectedFormRole('influencer')}
                    className={`p-6 sm:p-8 border-4 border-blue-sail transition-all cursor-pointer flex flex-col justify-between relative ${
                      selectedFormRole === 'influencer'
                        ? 'bg-decor text-blue-sail shadow-[8px_8px_0_0_#BD1B1F] ring-4 ring-red-inferno scale-[1.02]'
                        : 'bg-ballroom text-blue-sail hover:bg-decor/15 shadow-[4px_4px_0_0_#8B011A]'
                    }`}
                  >
                    {selectedFormRole === 'influencer' && (
                      <div className="absolute -top-3.5 right-4 bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail shadow-[2px_2px_0_0_#000]">
                        ✓ TERPILIH
                      </div>
                    )}
                    <div>
                      <span className="inline-block bg-red-inferno text-ballroom font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail mb-4">
                        KHUSUS MAHASISWA ITS 2026
                      </span>
                      <h3 className="font-display font-black text-2xl uppercase tracking-tight mb-2">
                        Campus Influencer (CI)
                      </h3>
                      <p className="text-xs font-sans text-blue-sail/85 leading-relaxed">
                        Campus Influencer (CI) adalah perwakilan mahasiswa ITS 2026 yang berperan dalam memperluas branding TDC Summit Fest 2026, baik di lingkungan kampus maupun masyarakat luas.
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Student Ambassador */}
                  <div
                    onClick={() => setSelectedFormRole('ambassador')}
                    className={`p-6 sm:p-8 border-4 border-blue-sail transition-all cursor-pointer flex flex-col justify-between relative ${
                      selectedFormRole === 'ambassador'
                        ? 'bg-decor text-blue-sail shadow-[8px_8px_0_0_#BD1B1F] ring-4 ring-red-inferno scale-[1.02]'
                        : 'bg-ballroom text-blue-sail hover:bg-decor/15 shadow-[4px_4px_0_0_#8B011A]'
                    }`}
                  >
                    {selectedFormRole === 'ambassador' && (
                      <div className="absolute -top-3.5 right-4 bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail shadow-[2px_2px_0_0_#000]">
                        ✓ TERPILIH
                      </div>
                    )}
                    <div>
                      <span className="inline-block bg-red-inferno text-ballroom font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail mb-4">
                        KHUSUS PELAJAR SMA/SMK SURABAYA
                      </span>
                      <h3 className="font-display font-black text-2xl uppercase tracking-tight mb-2">
                        Student Ambassador (SA)
                      </h3>
                      <p className="text-xs font-sans text-blue-sail/85 leading-relaxed">
                        Student Ambassador (SA) merupakan perwakilan siswa SMA/SMK sederajat di Surabaya yang menjadi jembatan antara TDC Summit Fest 2026 dengan para pelajar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Single Action Button at Bottom */}
                <div className="pt-6 text-center">
                  <button
                    type="button"
                    onClick={handleStartForm}
                    className="w-full bg-blue-sail hover:bg-barbera text-decor font-display font-black text-xs sm:text-sm uppercase py-4.5 rounded-none border-2 border-blue-sail shadow-[5px_5px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 tracking-widest"
                  >
                    <span>LANJUT KE DATA DIRI ({selectedFormRole === 'influencer' ? 'CAMPUS INFLUENCER' : 'STUDENT AMBASSADOR'})</span>
                    <Icon name="ArrowRight" size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* FORM WIZARD FOR STEPS 1, 2, 3 */}
            {currentStep >= 1 && (
              <>
                {/* Form Title & Selected Role Indicator */}
                <div className="text-center mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      onClick={handleResetRoleChoice}
                      className="inline-flex items-center space-x-1.5 bg-blue-sail/10 hover:bg-blue-sail hover:text-decor text-blue-sail font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail transition-all"
                    >
                      <Icon name="ArrowLeft" size={14} />
                      <span>Ganti Peran</span>
                    </button>

                    <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest">
                      // FORMULIR PENDAFTARAN RESMI 2026
                    </span>
                  </div>

                  <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-blue-sail">
                    OPEN RECRUITMENT {formRole === 'influencer' ? 'CAMPUS INFLUENCER' : 'STUDENT AMBASSADOR'}
                  </h2>
                  <p className="text-xs font-mono font-bold text-blue-sail/70 uppercase tracking-widest mt-2">
                    [ PERAN PILIHAN: <span className="text-red-inferno">{formRole === 'influencer' ? 'CAMPUS INFLUENCER (MAHASISWA ITS)' : 'STUDENT AMBASSADOR (PELAJAR SMA/SMK)'}</span> ]
                  </p>
                  <div className="w-24 h-1.5 bg-decor mx-auto mt-4" />
                </div>

                {/* Step Wizard Progress Bar */}
                <div className="mb-10">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { step: 1, label: 'Page 1: Data Diri' },
                      { step: 2, label: 'Page 2: Pertanyaan' },
                      { step: 3, label: 'Page 3: Berkas & Video' }
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() => {
                          if (s.step < currentStep) setCurrentStep(s.step as 1 | 2 | 3);
                        }}
                        className={`p-3 text-center border-2 border-blue-sail transition-all cursor-pointer ${
                          currentStep === s.step
                            ? 'bg-blue-sail text-decor font-extrabold shadow-[3px_3px_0_0_#BD1B1F]'
                            : currentStep > s.step
                            ? 'bg-decor/40 text-blue-sail font-bold'
                            : 'bg-blue-sail/5 text-blue-sail/40'
                        }`}
                      >
                        <span className="block font-mono text-[10px] uppercase font-bold">Langkah {s.step}</span>
                        <span className="font-display text-xs uppercase truncate block">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submitted Success Confirmation Screen */}
            {isSubmitted ? (
              <motion.div
                className="bg-decor/20 border-4 border-decor p-8 sm:p-10 text-center space-y-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-decor text-blue-sail rounded-full flex items-center justify-center mx-auto border-4 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F]">
                  <Icon name="CheckCircle" size={44} />
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-blue-sail">
                  PENDAFTARAN BERHASIL DIKIRIM!
                </h3>
                <p className="text-sm font-sans text-blue-sail/90 max-w-lg mx-auto leading-relaxed">
                  Terima kasih <strong className="text-red-inferno">{formData.fullName}</strong>! Data pendaftaran Anda untuk posisi{' '}
                  <strong className="text-blue-sail uppercase">
                    {formRole === 'influencer' ? 'Campus Influencer (ITS)' : 'Student Ambassador (Surabaya)'}
                  </strong>{' '}
                  telah resmi terdata oleh panitia TDC Summit Fest 2026.
                </p>

                <div className="pt-4 flex justify-center items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      handleResetRoleChoice();
                    }}
                    className="inline-flex items-center justify-center space-x-2 bg-blue-sail text-decor font-display font-black text-xs uppercase px-8 py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] hover:bg-barbera transition-all cursor-pointer tracking-wider"
                  >
                    <span>ISI FORMULIR BARU</span>
                    <Icon name="ArrowRight" size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              currentStep >= 1 && (
                <form onSubmit={handleSubmit} className="space-y-6 font-sans">

                  {/* Error Banner */}
                  {errorMessage && (
                    <div className="bg-red-inferno text-ballroom p-4 text-xs font-mono font-bold uppercase tracking-wider border-2 border-blue-sail shadow-[3px_3px_0_0_#8B011A]">
                      ⚠ {errorMessage}
                    </div>
                  )}

                  {/* PAGE 1: DATA DIRI */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b-2 border-blue-sail/20 pb-3 mb-6">
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-tight text-blue-sail">
                          Page 1 — Data Diri Pendaftar
                        </h3>
                        <p className="text-xs font-mono text-blue-sail/70">
                          Isi data identitas diri Anda dengan tepat dan benar.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Email */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                            Email <span className="text-red-inferno">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contoh: email@domain.com"
                            className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                            required
                          />
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                            Nama Lengkap <span className="text-red-inferno">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Contoh: Aurelia Pradnyaswari"
                            className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* CI Specific Fields: NRP, Departemen, Fakultas */}
                      {formRole === 'influencer' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                              NRP <span className="text-red-inferno">*</span>
                            </label>
                            <input
                              type="text"
                              name="nrp"
                              value={formData.nrp}
                              onChange={handleChange}
                              placeholder="Contoh: 5026251001"
                              className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                              Departemen <span className="text-red-inferno">*</span>
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              placeholder="Contoh: Teknik Informatika"
                              className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                              Fakultas <span className="text-red-inferno">*</span>
                            </label>
                            <input
                              type="text"
                              name="faculty"
                              value={formData.faculty}
                              onChange={handleChange}
                              placeholder="Contoh: FTEIC"
                              className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        /* SA Specific Fields: Kelas, Asal Sekolah */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                              Kelas <span className="text-red-inferno">*</span>
                            </label>
                            <input
                              type="text"
                              name="gradeClass"
                              value={formData.gradeClass}
                              onChange={handleChange}
                              placeholder="Contoh: XI IPA 2 / XII IPS 1"
                              className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                              Asal Sekolah <span className="text-red-inferno">*</span>
                            </label>
                            <input
                              type="text"
                              name="school"
                              value={formData.school}
                              onChange={handleChange}
                              placeholder="Contoh: SMAN 5 Surabaya / SMKN 1 Surabaya"
                              className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Instagram */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                            Instagram <span className="text-blue-sail/60 font-mono text-[10px] lowercase">(contoh: instagram.com/@tdcsummitfest_its)</span>
                          </label>
                          <input
                            type="text"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            placeholder="instagram.com/@username"
                            className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          />
                        </div>

                        {/* TikTok */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                            TikTok <span className="text-blue-sail/60 font-mono text-[10px] lowercase">(contoh: tiktok.com/@tdcsummitsfest_its)</span>
                          </label>
                          <input
                            type="text"
                            name="tiktok"
                            value={formData.tiktok}
                            onChange={handleChange}
                            placeholder="tiktok.com/@username"
                            className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          />
                        </div>

                        {/* No. WhatsApp */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                            No. WhatsApp <span className="text-red-inferno">*</span> <span className="text-blue-sail/60 font-mono text-[10px] lowercase">(contoh: wa.me/62…)</span>
                          </label>
                          <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="wa.me/628123456789"
                            className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PAGE 2: PERTANYAAN RECRUITMENT */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b-2 border-blue-sail/20 pb-3 mb-6">
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-tight text-blue-sail">
                          Page 2 — Pertanyaan Open Recruitment {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'} TDC Summit Fest
                        </h3>
                        <p className="text-xs font-mono text-blue-sail/70">
                          Jawablah pertanyaan berikut secara jelas, jujur, dan komprehensif.
                        </p>
                      </div>

                      {/* Q1 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          1. Apa yang kamu ketahui tentang TDC Summit Fest 2026? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q1_tsfKnowledge"
                          value={formData.q1_tsfKnowledge}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Tuliskan pemahaman kamu tentang TDC Summit Fest 2026..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q2 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          2. Apa yang kamu ketahui tentang {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'} TDC Summit Fest 2026? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q2_roleKnowledge"
                          value={formData.q2_roleKnowledge}
                          onChange={handleChange}
                          rows={3}
                          placeholder={`Tuliskan pemahaman kamu mengenai peran ${formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'}...`}
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q3 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          3. Apa motivasi kamu mendaftar sebagai bagian dari {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'} TDC Summit Fest 2026? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q3_motivation"
                          value={formData.q3_motivation}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Jelaskan motivasi terbesarmu..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q4: Commitment Scale (1-10) */}
                      <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-3">
                          4. Seberapa besar komitmen kamu mengikuti {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'} TDC Summit Fest 2026? (Skala 1 - 10) <span className="text-red-inferno">*</span>
                        </label>
                        <div className="grid grid-cols-10 gap-1 text-center">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((scale) => (
                            <button
                              type="button"
                              key={scale}
                              onClick={() => setFormData(prev => ({ ...prev, q4_commitmentScale: scale }))}
                              className={`py-2.5 font-mono text-xs font-bold border-2 border-blue-sail transition-all ${
                                formData.q4_commitmentScale === scale
                                  ? 'bg-red-inferno text-ballroom scale-105 shadow-[2px_2px_0_0_#BD1B1F]'
                                  : 'bg-ballroom text-blue-sail hover:bg-decor/30'
                              }`}
                            >
                              {scale}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Q5 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          5. Jelaskan alasan memilih skala komitmen tersebut! <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q5_commitmentReason"
                          value={formData.q5_commitmentReason}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Jelaskan secara realistis komitmen waktu & tenaga Anda..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q6 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          6. Sebagai {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'}, bagaimana strategi kamu dalam mempromosikan TSF kepada lingkungan sekitar? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q6_promotionStrategy"
                          value={formData.q6_promotionStrategy}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Jelaskan ide & pendekatan strategi promosi Anda..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q7 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          7. Jenis konten seperti apa yang relevan dengan tujuan TSF dan bagaimana cara kamu menyusun pesan yang akan disampaikan dalam konten tersebut? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q7_contentTypeStrategy"
                          value={formData.q7_contentTypeStrategy}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Jelaskan konsep & pesan konten yang ingin dibuat..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q8 */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          8. Selain menjadi branding event dari TDC Summit Fest 2026, peran atau manfaat tambahan apa yang kamu harapkan dari program ini? <span className="text-red-inferno">*</span>
                        </label>
                        <textarea
                          name="q8_additionalBenefits"
                          value={formData.q8_additionalBenefits}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Sebutkan harapan & ekspetasi kamu..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Q9: Info Source */}
                      <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider">
                          9. Dari mana kamu mengetahui informasi Open Recruitment {formRole === 'influencer' ? 'Campus Influencer' : 'Student Ambassador'} TDC Summit Fest 2026? <span className="text-red-inferno">*</span>
                        </label>
                        <div className="flex flex-wrap gap-4 text-xs font-bold">
                          {['Instagram', 'TikTok', 'Teman'].map((source) => (
                            <label key={source} className="flex items-center space-x-2 cursor-pointer bg-ballroom px-4 py-2 border border-blue-sail/30">
                              <input
                                type="radio"
                                name="q9_infoSource"
                                value={source}
                                checked={formData.q9_infoSource === source}
                                onChange={handleChange}
                                className="accent-red-inferno"
                              />
                              <span>{source}</span>
                            </label>
                          ))}
                        </div>

                        {formData.q9_infoSource === 'Teman' && (
                          <div className="pt-2">
                            <input
                              type="text"
                              name="q9_infoSourceFriend"
                              value={formData.q9_infoSourceFriend}
                              onChange={handleChange}
                              placeholder="Sebutkan nama teman kamu..."
                              className="w-full bg-ballroom p-3 border-2 border-blue-sail text-xs font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* PAGE 3: PERSYARATAN BERKAS & VIDEO KREATIF */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="border-b-2 border-blue-sail/20 pb-3 mb-6">
                        <h3 className="font-display font-extrabold text-xl uppercase tracking-tight text-blue-sail">
                          Page 3 — Persyaratan Berkas & Video Kreatif
                        </h3>
                        <p className="text-xs font-mono text-blue-sail/70">
                          Unggah berkas persyaratan dalam satu link folder Drive dan cantumkan link reels video kreatif.
                        </p>
                      </div>

                      {/* Requirements Guide Box */}
                      <div className="bg-blue-sail text-ballroom p-6 border-3 border-blue-sail shadow-[5px_5px_0_0_#F6BB02]">
                        <h4 className="font-display font-black text-sm uppercase tracking-wider text-decor mb-3 flex items-center space-x-2">
                          <Icon name="FileText" size={18} />
                          <span>Panduan Persyaratan Berkas Google Drive</span>
                        </h4>

                        <div className="text-xs font-sans space-y-2 text-ballroom/90 leading-relaxed">
                          <p className="font-bold text-decor">Link folder drive persyaratan berkas wajib berisi:</p>
                          <ol className="list-decimal list-inside space-y-1 pl-1 text-ballroom/95">
                            <li>Foto KTM / KRSM / Kartu Pelajar (Format PDF)</li>
                            <li>CV ATS / Kreatif (Format PDF)</li>
                            <li>Screenshot share poster Open Recruitment di story Instagram pribadi</li>
                            <li>Screenshot insight profil Instagram (mencakup akun yang dijangkau & rentang usia pengikut)</li>
                            <li>
                              Screenshot follow sosial media resmi:
                              <ul className="list-disc list-inside pl-4 text-decor font-mono text-[11px] mt-0.5">
                                <li>IG: @tdcits & @tdcsummitfest_its</li>
                                <li>TikTok: @tdcits & @tdcsummitfest_its</li>
                              </ul>
                            </li>
                          </ol>

                          <div className="mt-3 pt-3 border-t border-ballroom/20 font-mono text-[11px] text-decor">
                            <strong>* Format Penamaan Folder Google Drive:</strong> <span className="bg-decor text-blue-sail px-2 py-0.5 font-bold">Departemen_Nama_BerkasTSF</span> (Pastikan akses folder publik / siapapun dapat melihat)
                          </div>
                        </div>
                      </div>

                      {/* Field 1: Drive Folder Link */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          1. Link Folder Google Drive Persyaratan Berkas <span className="text-red-inferno">*</span>
                        </label>
                        <input
                          type="url"
                          name="driveFolderUrl"
                          value={formData.driveFolderUrl}
                          onChange={handleChange}
                          placeholder="https://drive.google.com/drive/folders/..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>

                      {/* Field 2: Reels Video Link */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                          2. Link Video Perkenalan Kreatif pada Reels Instagram Akun Pribadi <span className="text-red-inferno">*</span>
                        </label>
                        <p className="text-[11px] font-mono text-red-inferno mb-2">
                          * Pastikan akun Instagram pribadi Anda TIDAK DIPRIVATE sehingga panitia dapat menilai video.
                        </p>
                        <input
                          type="url"
                          name="reelsVideoUrl"
                          value={formData.reelsVideoUrl}
                          onChange={handleChange}
                          placeholder="https://www.instagram.com/reel/..."
                          className="w-full bg-blue-sail/5 p-3.5 border-2 border-blue-sail text-sm font-sans focus:outline-none focus:bg-decor/10 transition-colors"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Form Buttons Navigation */}
                  <div className="pt-8 border-t-2 border-blue-sail/15 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-full sm:w-auto bg-ballroom hover:bg-decor/20 text-blue-sail font-display font-extrabold text-xs uppercase px-6 py-3.5 border-2 border-blue-sail transition-all flex items-center justify-center space-x-2"
                    >
                      <Icon name="ArrowLeft" size={14} />
                      <span>{currentStep === 1 ? 'Kembali Ke Pilih Peran' : `Kembali (Halaman ${currentStep - 1})`}</span>
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full sm:w-auto bg-blue-sail hover:bg-barbera text-decor font-display font-extrabold text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 tracking-wider"
                      >
                        <span>Lanjut ke Halaman {currentStep + 1}</span>
                        <Icon name="ArrowRight" size={14} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 tracking-widest"
                      >
                        {isSubmitting ? (
                          <span>MEMPROSES PENDAFTARAN...</span>
                        ) : (
                          <>
                            <span>KIRIM PENDAFTARAN SEKARANG</span>
                            <Icon name="CheckCircle" size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </form>
              )
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
