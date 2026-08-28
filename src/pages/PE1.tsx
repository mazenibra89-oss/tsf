import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';
import qrisImg from '../qristsf.jpeg';
import cfadImg from '../cfad.png';

type FormStep = 'info' | 'form-data' | 'form-package' | 'form-ebook' | 'form-social' | 'form-payment' | 'success';

interface PE1FormData {
  fullName: string;
  email: string;
  whatsapp: string;
  statusCurrent: string;
  institution: string;
  major: string;
  city: string;
  packageChoice: string;
  selectedEbook: string;
  instagramUsername: string;
  socialProofDriveUrl: string;
  paymentMethod: string;
  paymentProofUrl: string;
}

const INITIAL_FORM: PE1FormData = {
  fullName: '', email: '', whatsapp: '', statusCurrent: '', institution: '',
  major: '', city: '', packageChoice: '', selectedEbook: '', instagramUsername: '',
  socialProofDriveUrl: '', paymentMethod: '', paymentProofUrl: ''
};

interface PackageItem {
  id: string;
  iconName: string;
  name: string;
  price: string;
  priceNum: number;
  badgeBg: string;
  popular?: boolean;
  perks: { iconName: string; text: string }[];
}

const PACKAGES: PackageItem[] = [
  {
    id: 'Aspiring CEO',
    iconName: 'Sprout',
    name: 'Aspiring CEO',
    price: 'Free!',
    priceNum: 0,
    badgeBg: 'bg-emerald-500 text-white',
    perks: [
      { iconName: 'CheckSquare', text: 'S&K: Complete Simple Tasks' },
    ]
  },
  {
    id: 'Rising CEO',
    iconName: 'TrendingUp',
    name: 'Rising CEO',
    price: 'Rp 22.000',
    priceNum: 22000,
    badgeBg: 'bg-blue-600 text-white',
    perks: [
      { iconName: 'Video', text: 'Exclusive Access to Full Zoom Recording' },
      { iconName: 'Presentation', text: "Speakers' Presentation Slides/Deck Learning Materials" },
    ]
  },
  {
    id: 'Strategic CEO',
    iconName: 'Target',
    name: 'Strategic CEO',
    price: 'Rp 39.000',
    priceNum: 39000,
    badgeBg: 'bg-purple-600 text-white',
    perks: [
      { iconName: 'ShieldCheck', text: 'Everything in Rising CEO' },
      { iconName: 'BookCheck', text: 'Exclusive Winning Formula E-Book (choose 1 of 2)' },
    ]
  },
  {
    id: 'Absolute CEO',
    iconName: 'Crown',
    name: 'Absolute CEO',
    price: 'Rp 49.000',
    priceNum: 49000,
    badgeBg: 'bg-amber-500 text-blue-sail',
    popular: true,
    perks: [
      { iconName: 'Star', text: 'Complete Package (Everything in Strategic CEO)' },
      { iconName: 'Library', text: 'Get Both Exclusive Winning Formula E-Books' },
    ]
  }
];

const BENEFITS = [
  { iconName: 'Award', text: 'Free E-Certificate' },
  { iconName: 'BookOpen', text: 'Exclusive E-Book (khusus peserta berbayar)' },
  { iconName: 'Trophy', text: 'Best Participant Prize' },
  { iconName: 'Compass', text: 'Discover Your Values & Leadership Potential' },
  { iconName: 'GraduationCap', text: "Learn from a Business Leader's Journey" },
  { iconName: 'RefreshCw', text: 'Turn Challenges into Opportunities' },
  { iconName: 'Zap', text: 'Understand Innovation & Sustainable Impact' },
];

export const PE1: React.FC = () => {
  const { addPE1Registration } = useApp();
  const [step, setStep] = useState<FormStep>('info');
  const [form, setForm] = useState<PE1FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  const updateField = (key: keyof PE1FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateDataDiri = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email tidak valid';
    if (!form.whatsapp.trim()) errs.whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!form.statusCurrent) errs.statusCurrent = 'Pilih status saat ini';
    if (!form.institution.trim()) errs.institution = 'Asal instansi wajib diisi';
    if ((form.statusCurrent === 'Siswa SMA' || form.statusCurrent === 'Mahasiswa') && !form.major.trim()) {
      errs.major = 'Jurusan/Prodi wajib diisi';
    }
    if (!form.city.trim()) errs.city = 'Kota domisili wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSocial = () => {
    const errs: Record<string, string> = {};
    if (!form.instagramUsername.trim()) errs.instagramUsername = 'Instagram username wajib diisi';
    if (!form.socialProofDriveUrl.trim()) errs.socialProofDriveUrl = 'Link bukti follow wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (!form.paymentMethod) errs.paymentMethod = 'Pilih metode pembayaran';
    if (!form.paymentProofUrl.trim()) errs.paymentProofUrl = 'Link bukti pembayaran wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addPE1Registration({
        full_name: form.fullName,
        email: form.email,
        whatsapp: form.whatsapp,
        status_current: form.statusCurrent as any,
        institution: form.institution,
        major: (form.statusCurrent === 'Siswa SMA' || form.statusCurrent === 'Mahasiswa') ? form.major : undefined,
        city: form.city,
        package_choice: form.packageChoice as any,
        selected_ebook: form.selectedEbook || undefined,
        instagram_username: form.instagramUsername || undefined,
        social_proof_drive_url: form.socialProofDriveUrl || undefined,
        payment_method: (form.packageChoice === 'Aspiring CEO' ? undefined : (form.paymentMethod || 'Bank Transfer')) as any,
        payment_proof_url: form.paymentProofUrl || undefined,
      });
      setStep('success');
      scrollToFormSection();
    } catch (err: any) {
      alert('Pendaftaran gagal: ' + (err?.message || 'Terjadi kesalahan. Coba lagi.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToFormSection = () => {
    setTimeout(() => {
      const el = document.getElementById('pe1-form-section');
      if (el) {
        const yOffset = -20;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToForm = () => {
    setStep('form-data');
    scrollToFormSection();
  };

  const selectedPkg = PACKAGES.find(p => p.id === form.packageChoice);

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══════════════════════════════════════════════════
            SECTION A: LANDING PAGE
        ══════════════════════════════════════════════════ */}

        {/* 1. HERO BANNER WITH EVENT POSTER */}
        <motion.section
          className="relative bg-blue-sail text-ballroom border-4 border-decor p-5 sm:p-10 lg:p-12 mb-12 overflow-hidden shadow-[6px_6px_0_0_#BD1B1F]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="absolute top-0 right-0 bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-4 py-1.5 uppercase tracking-widest border-b-2 border-l-2 border-blue-sail z-20">
            PRE-EVENT 1
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 text-center lg:text-left pt-6 sm:pt-0">
              <motion.h1
                className="font-display font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-ballroom leading-none mb-3"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              >
                CEO FOR A DAY
              </motion.h1>

              <motion.p
                className="font-display font-extrabold text-lg sm:text-xl text-decor uppercase tracking-wide mb-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              >
                "Brand Yourself, Lead the Future"
              </motion.p>

              <motion.p
                className="text-sm sm:text-base text-ballroom/85 font-sans leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              >
                HI, Future Innovators! Pernah kepikiran, gimana caranya membangun <strong>personal branding</strong> yang kuat sekaligus jadi pemimpin yang menciptakan <strong>dampak berkelanjutan</strong>?
                <br /><br />
                Webinar ini akan membahas bagaimana membangun personal branding, hingga leadership dan inovasi yang berdampak di bidang bisnis, dipandu oleh pembicara yang berpengalaman di bidangnya.
              </motion.p>

              {/* Event Info Badges (Compact 3-column Grid on Mobile, Flex on Desktop) */}
              <motion.div
                className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center lg:justify-start gap-2 sm:gap-3.5 mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              >
                {/* Tanggal */}
                <div className="bg-barbera/40 border border-decor/40 sm:border-2 px-2 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 shadow-[2px_2px_0_0_#BD1B1F] sm:shadow-[3px_3px_0_0_#BD1B1F] text-center sm:text-left">
                  <div className="bg-decor text-blue-sail p-1.5 sm:p-2 border border-blue-sail shrink-0">
                    <Icon name="Calendar" size={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-mono text-ballroom/70 uppercase font-bold leading-none">Tanggal</p>
                    <p className="font-display font-black text-[10px] sm:text-xs lg:text-sm text-decor uppercase tracking-tight mt-0.5 sm:mt-0">5 Sept 2026</p>
                  </div>
                </div>

                {/* Waktu */}
                <div className="bg-barbera/40 border border-decor/40 sm:border-2 px-2 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 shadow-[2px_2px_0_0_#BD1B1F] sm:shadow-[3px_3px_0_0_#BD1B1F] text-center sm:text-left">
                  <div className="bg-decor text-blue-sail p-1.5 sm:p-2 border border-blue-sail shrink-0">
                    <Icon name="Clock" size={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-mono text-ballroom/70 uppercase font-bold leading-none">Waktu</p>
                    <p className="font-display font-black text-[10px] sm:text-xs lg:text-sm text-decor uppercase tracking-tight mt-0.5 sm:mt-0">09.00 WIB</p>
                  </div>
                </div>

                {/* Platform */}
                <div className="bg-barbera/40 border border-decor/40 sm:border-2 px-2 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 shadow-[2px_2px_0_0_#BD1B1F] sm:shadow-[3px_3px_0_0_#BD1B1F] text-center sm:text-left">
                  <div className="bg-decor text-blue-sail p-1.5 sm:p-2 border border-blue-sail shrink-0">
                    <Icon name="Video" size={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-mono text-ballroom/70 uppercase font-bold leading-none">Platform</p>
                    <p className="font-display font-black text-[10px] sm:text-xs lg:text-sm text-decor uppercase tracking-tight mt-0.5 sm:mt-0">Zoom</p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                onClick={scrollToForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-sm uppercase px-8 py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all tracking-widest cursor-pointer"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              >
                <span>DAFTAR SEKARANG</span>
                <Icon name="ArrowRight" size={18} />
              </motion.button>
            </div>

            {/* Right Column: Official Poster Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                onClick={() => setShowPosterModal(true)}
                className="w-full max-w-sm bg-ballroom p-3 border-4 border-blue-sail shadow-[6px_6px_0_0_#F6BB02] relative group cursor-pointer hover:-translate-y-1 transition-transform"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {/* Ribbon Tag */}
                <div className="absolute -top-3 left-4 bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-widest border border-blue-sail z-10 shadow-[2px_2px_0_0_#000]">
                  OFFICIAL EVENT POSTER
                </div>

                {/* Poster Graphic Container */}
                <div className="relative bg-blue-sail border-2 border-blue-sail overflow-hidden flex flex-col items-center justify-center text-ballroom">
                  <img
                    src={cfadImg}
                    alt="Official Event Poster CEO FOR A DAY"
                    className="w-full h-auto object-cover"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-sail/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20 p-4 text-center">
                    <div className="bg-decor text-blue-sail p-3 rounded-full border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]">
                      <Icon name="Maximize2" size={20} />
                    </div>
                    <span className="font-display font-black text-xs uppercase text-decor tracking-wider">
                      KLIK UNTUK MEMPERBESAR POSTER
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono font-bold text-blue-sail px-1">
                  <span className="flex items-center gap-1"><Icon name="ZoomIn" size={12} /> Lihat Detail Poster</span>
                  <span className="text-red-inferno uppercase font-extrabold">HD PREVIEW</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 2. SPEAKER CARDS */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <span className="font-mono text-xs font-bold text-red-inferno tracking-widest uppercase">// SPEAKERS</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight mt-1">MATERI & PEMBICARA</h2>
            <div className="w-20 h-1.5 bg-decor mx-auto mt-2" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Speaker 1 */}
            <motion.div
              className="bg-ballroom border-[3px] border-blue-sail p-6 shadow-[5px_5px_0_0_#2A4C9E] hover:-translate-y-1 transition-transform"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-sail text-decor p-3.5 border-2 border-decor shrink-0 shadow-[2px_2px_0_0_#F6BB02]">
                  <Icon name="Presentation" size={24} />
                </div>
                <div>
                  <span className="inline-block bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider mb-2">
                    MATERI 01
                  </span>
                  <h3 className="font-display font-black text-lg text-blue-sail uppercase leading-tight mb-2">
                    Personal Branding for Future Innovators
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-blue-sail/5 px-3 py-1 border border-blue-sail/20 text-xs text-blue-sail font-sans font-semibold">
                    <Icon name="UserCheck" size={14} className="text-red-inferno" />
                    <span className="font-bold">Muhammad Zaki Raihansyah</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Speaker 2 */}
            <motion.div
              className="bg-ballroom border-[3px] border-blue-sail p-6 shadow-[5px_5px_0_0_#2A4C9E] hover:-translate-y-1 transition-transform"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-blue-sail text-decor p-3.5 border-2 border-decor shrink-0 shadow-[2px_2px_0_0_#F6BB02]">
                  <Icon name="Lightbulb" size={24} />
                </div>
                <div>
                  <span className="inline-block bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider mb-2">
                    MATERI 02
                  </span>
                  <h3 className="font-display font-black text-lg text-blue-sail uppercase leading-tight mb-2">
                    Leading Innovation, Creating Impact
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-blue-sail/5 px-3 py-1 border border-blue-sail/20 text-xs text-blue-sail font-sans font-semibold">
                    <Icon name="UserCheck" size={14} className="text-red-inferno" />
                    <span className="font-bold">Singgih Ardiansyah, S.T.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. WHAT YOU'LL GAIN */}
        <section className="mb-12">
          <div className="bg-decor p-1.5 border-4 border-blue-sail shadow-[6px_6px_0_0_#BD1B1F]">
            <div className="bg-blue-sail p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="font-display font-black text-2xl text-decor uppercase tracking-tight">WHAT YOU'LL GAIN</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BENEFITS.map((b, i) => (
                  <motion.div
                    key={i}
                    className="bg-barbera/20 border border-decor/25 p-3.5 flex items-center gap-3.5 hover:bg-barbera/40 hover:border-decor hover:-translate-y-0.5 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i }}
                  >
                    <div className="bg-decor text-blue-sail p-2 border-2 border-blue-sail shrink-0 shadow-[2px_2px_0_0_#BD1B1F]">
                      <Icon name={b.iconName} size={16} />
                    </div>
                    <span className="text-xs sm:text-sm text-ballroom font-sans font-semibold leading-tight">{b.text}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-xs text-ballroom/70 font-sans mt-5 font-medium flex items-center justify-center gap-1.5">
                <Icon name="Award" size={14} className="text-decor" />
                <span>All registrants receive a CFAD 2026 E-Certificate.</span>
              </p>
            </div>
          </div>
        </section>

        {/* 4. CONTACT PERSON */}
        <section className="mb-12">
          <div className="bg-ballroom border-[3px] border-blue-sail p-6 shadow-[5px_5px_0_0_#2A4C9E] max-w-2xl mx-auto text-center">
            <p className="font-mono text-xs font-bold text-red-inferno tracking-widest uppercase mb-3">HAVE ANY QUESTIONS? CONTACT US!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/6285882044945" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs px-5 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#166534] transition-all">
                <Icon name="MessageCircle" size={14} />
                <span>Anca — 085882044945</span>
              </a>
              <a href="https://wa.me/628873356296" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs px-5 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#166534] transition-all">
                <Icon name="MessageCircle" size={14} />
                <span>Echa — 08873356296</span>
              </a>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════
            SECTION B: MULTI-STEP FORM
        ══════════════════════════════════════════════════ */}
        <section id="pe1-form-section" className="scroll-mt-20">
          {step !== 'info' && step !== 'success' && (
            <div className="text-center mb-6">
              <span className="font-mono text-xs font-bold text-red-inferno tracking-widest uppercase">// REGISTRATION FORM</span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight mt-1">FORMULIR PENDAFTARAN</h2>
              <div className="w-20 h-1.5 bg-decor mx-auto mt-2" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ─── STEP 1: DATA DIRI ─── */}
            {step === 'form-data' && (
              <motion.div
                key="form-data"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[5px_5px_0_0_#2A4C9E]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-sail text-decor px-3 py-1.5 font-display font-black text-sm border border-decor">1</div>
                    <h3 className="font-display font-black text-lg text-blue-sail uppercase">Data Diri Peserta</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                      <input type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="Nama lengkap kamu" />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Email Aktif *</label>
                      <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="email@example.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Nomor WhatsApp Aktif *</label>
                      <input type="tel" value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="08xxxxxxxxxx" />
                      {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                    </div>
                    {/* Status */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Status Saat Ini *</label>
                      <select value={form.statusCurrent} onChange={e => updateField('statusCurrent', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors">
                        <option value="">— Pilih status —</option>
                        <option value="Siswa SMA">Siswa SMA</option>
                        <option value="Mahasiswa">Mahasiswa</option>
                        <option value="Fresh Graduate">Fresh Graduate</option>
                        <option value="Umum">Umum</option>
                      </select>
                      {errors.statusCurrent && <p className="text-red-500 text-xs mt-1">{errors.statusCurrent}</p>}
                    </div>
                    {/* Instansi */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Asal Instansi *</label>
                      <input type="text" value={form.institution} onChange={e => updateField('institution', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="Sekolah / Kampus / Perusahaan" />
                      {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                    </div>
                    {/* Major (conditional) */}
                    {(form.statusCurrent === 'Siswa SMA' || form.statusCurrent === 'Mahasiswa') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Jurusan / Prodi *</label>
                        <input type="text" value={form.major} onChange={e => updateField('major', e.target.value)}
                          className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                          placeholder="Jurusan / Fakultas / Prodi" />
                        {errors.major && <p className="text-red-500 text-xs mt-1">{errors.major}</p>}
                      </motion.div>
                    )}
                    {/* City */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Kota Domisili *</label>
                      <input type="text" value={form.city} onChange={e => updateField('city', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="Kota tempat tinggal kamu" />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => {
                        if (validateDataDiri()) {
                          setStep('form-package');
                          scrollToFormSection();
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-widest transition-all cursor-pointer"
                    >
                      <span>LANJUTKAN</span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: PACKAGE SELECTION ─── */}
            {step === 'form-package' && (
              <motion.div
                key="form-package"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[5px_5px_0_0_#2A4C9E]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-sail text-decor px-3 py-1.5 font-display font-black text-sm border border-decor">2</div>
                    <h3 className="font-display font-black text-lg text-blue-sail uppercase">Pilih Bundling Package</h3>
                  </div>
                  <p className="text-xs text-blue-sail/60 font-sans mb-6">Pilih satu dari 4 paket yang sesuai dengan kebutuhanmu.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => updateField('packageChoice', pkg.id)}
                        className={`relative text-left p-4 sm:p-5 border-[3px] flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                          form.packageChoice === pkg.id
                            ? 'border-decor bg-blue-sail/5 shadow-[4px_4px_0_0_#F6BB02] -translate-y-1'
                            : 'border-blue-sail/30 hover:border-blue-sail/60 hover:shadow-[3px_3px_0_0_#2A4C9E]'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 right-3 bg-red-inferno text-ballroom text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border border-blue-sail">
                            BEST VALUE
                          </div>
                        )}

                        <div>
                          <div className="bg-blue-sail text-decor p-2.5 border-2 border-blue-sail inline-block mb-3 shadow-[2px_2px_0_0_#F6BB02]">
                            <Icon name={pkg.iconName} size={22} />
                          </div>

                          <h4 className="font-display font-black text-base text-blue-sail uppercase mb-1">{pkg.name}</h4>
                          <p className={`font-display font-black text-xl mb-4 ${pkg.priceNum === 0 ? 'text-emerald-600' : 'text-red-inferno'}`}>
                            {pkg.price}
                          </p>

                          <p className="text-[9px] font-mono font-bold text-blue-sail/50 uppercase tracking-wider mb-2">Package Perks</p>
                          <ul className="space-y-2">
                            {pkg.perks.map((perk, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-blue-sail/80 font-sans">
                                <Icon name={perk.iconName} size={14} className="text-red-inferno shrink-0 mt-0.5" />
                                <span>{perk.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {form.packageChoice === pkg.id && (
                          <div className="absolute top-3 left-3 bg-decor text-blue-sail p-1 border border-blue-sail">
                            <Icon name="Check" size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Prominent Bold Certificate Banner Note */}
                  <p className="text-center text-xs font-bold text-blue-sail font-sans mt-6 uppercase tracking-wider bg-decor/20 border-2 border-blue-sail p-3 max-w-lg mx-auto shadow-[3px_3px_0_0_#BD1B1F]">
                    ✨ All registrants receive a CFAD 2026 E-Certificate. ✨
                  </p>

                  <div className="flex justify-between mt-8">
                    <button onClick={() => { setStep('form-data'); scrollToFormSection(); }}
                      className="inline-flex items-center gap-2 bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3 border-2 border-blue-sail/40 tracking-widest transition-all cursor-pointer">
                      <Icon name="ArrowLeft" size={14} /> <span>KEMBALI</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!form.packageChoice) {
                          alert('Pilih salah satu paket terlebih dahulu!');
                          return;
                        }
                        if (form.packageChoice === 'Aspiring CEO') {
                          updateField('selectedEbook', '');
                          setStep('form-social');
                        } else if (form.packageChoice === 'Strategic CEO') {
                          setStep('form-ebook');
                        } else if (form.packageChoice === 'Rising CEO') {
                          updateField('selectedEbook', '');
                          updateField('paymentMethod', 'Bank Transfer');
                          setStep('form-payment');
                        } else {
                          updateField('selectedEbook', 'Both E-Books (BPC x BCC & Pitch Deck Edition)');
                          updateField('paymentMethod', 'Bank Transfer');
                          setStep('form-payment');
                        }
                        scrollToFormSection();
                      }}
                      className="inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-widest transition-all cursor-pointer"
                    >
                      <span>LANJUTKAN</span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3C: E-BOOK SELECTION (Strategic CEO) ─── */}
            {step === 'form-ebook' && (
              <motion.div
                key="form-ebook"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[5px_5px_0_0_#2A4C9E]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-sail text-decor px-3 py-1.5 font-display font-black text-sm border border-decor">3</div>
                    <h3 className="font-display font-black text-lg text-blue-sail uppercase">Pick Your Winning Formula</h3>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-blue-sail/85 font-sans leading-relaxed mb-6 bg-blue-sail/5 p-4 border border-blue-sail/20">
                    You're one step closer to level up! Since you've chosen the <strong>Strategic CEO</strong> package, you get to pick <strong>1 exclusive Winner Formula E-Book</strong> to help you prep for competition season.
                  </p>

                  <div className="space-y-4 mb-6">
                    {[
                      {
                        id: 'TSF Winner Formula BPC × BCC Edition',
                        title: 'TSF Winner Formula BPC × BCC Edition',
                        desc: 'Panduan lengkap & strategi memenangkan Business Plan Competition (BPC) dan Business Case Competition (BCC).',
                        icon: 'BookOpen'
                      },
                      {
                        id: 'TSF Winner Formula Pitch Deck Edition: Smart Tricks to Nail Your Winning BPC and BCC Deck!',
                        title: 'TSF Winner Formula Pitch Deck Edition: Smart Tricks to Nail Your Winning BPC and BCC Deck!',
                        desc: 'Trik pintar merancang pitch deck yang memikat juri dan investor untuk kompetisi BPC/BCC.',
                        icon: 'Presentation'
                      }
                    ].map((ebook) => (
                      <button
                        key={ebook.id}
                        type="button"
                        onClick={() => updateField('selectedEbook', ebook.id)}
                        className={`w-full p-4 text-left border-[3px] transition-all cursor-pointer flex items-start gap-4 ${
                          form.selectedEbook === ebook.id
                            ? 'border-decor bg-blue-sail/5 shadow-[4px_4px_0_0_#F6BB02] -translate-y-0.5'
                            : 'border-blue-sail/30 hover:border-blue-sail/60 hover:bg-white'
                        }`}
                      >
                        <div className="bg-blue-sail text-decor p-3 border border-blue-sail shrink-0 mt-0.5">
                          <Icon name={ebook.icon} size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-black text-xs sm:text-sm text-blue-sail uppercase pr-2 leading-snug">{ebook.title}</h4>
                            {form.selectedEbook === ebook.id && (
                              <span className="bg-decor text-blue-sail font-mono text-[9px] font-bold px-2 py-0.5 uppercase border border-blue-sail shrink-0">
                                DIPILIH
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-sail/70 font-sans mt-1.5">{ebook.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {errors.selectedEbook && (
                    <p className="text-red-500 text-xs font-bold mb-4">{errors.selectedEbook}</p>
                  )}

                  <div className="flex justify-between mt-8">
                    <button onClick={() => { setStep('form-package'); scrollToFormSection(); }}
                      className="inline-flex items-center gap-2 bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3 border-2 border-blue-sail/40 tracking-widest transition-all cursor-pointer">
                      <Icon name="ArrowLeft" size={14} /> <span>KEMBALI</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!form.selectedEbook) {
                          setErrors({ selectedEbook: 'Silakan pilih 1 E-Book Formula terlebih dahulu!' });
                          return;
                        }
                        updateField('paymentMethod', 'Bank Transfer');
                        setStep('form-payment');
                        scrollToFormSection();
                      }}
                      className="inline-flex items-center gap-2 bg-blue-sail hover:bg-barbera text-ballroom font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-widest transition-all cursor-pointer"
                    >
                      <span>LANJUT KE PEMBAYARAN</span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3A: SOCIAL TASKS (Aspiring CEO / Free) ─── */}
            {step === 'form-social' && (
              <motion.div
                key="form-social"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[5px_5px_0_0_#2A4C9E]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-sail text-decor px-3 py-1.5 font-display font-black text-sm border border-decor">3</div>
                    <h3 className="font-display font-black text-lg text-blue-sail uppercase">Social Tasks — Aspiring CEO</h3>
                  </div>
                  <p className="text-xs text-blue-sail/60 font-sans mb-6">Sebagai syarat paket gratis, lengkapi tugas sosial berikut.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Instagram Username *</label>
                      <input type="text" value={form.instagramUsername} onChange={e => updateField('instagramUsername', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="@username_kamu" />
                      {errors.instagramUsername && <p className="text-red-500 text-xs mt-1">{errors.instagramUsername}</p>}
                    </div>

                    {/* Social proof instructions */}
                    <div className="bg-blue-sail/5 border-2 border-blue-sail/20 p-4 space-y-3">
                      <p className="text-xs font-mono font-bold text-blue-sail uppercase tracking-wider flex items-center gap-2">
                        <Icon name="FileCheck" size={16} className="text-red-inferno" />
                        <span>Upload screenshot bukti (dalam satu folder Google Drive):</span>
                      </p>
                      <ul className="space-y-2 text-sm text-blue-sail/80 font-sans">
                        <li className="flex items-center gap-2.5">
                          <Icon name="Instagram" size={16} className="text-pink-600 shrink-0" />
                          <span>Screenshot bukti follow Instagram <a href="https://instagram.com/tdcsummitfest_its" target="_blank" rel="noreferrer" className="text-red-inferno font-bold underline">@tdcsummitfest_its</a></span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <Icon name="Video" size={16} className="text-slate-800 shrink-0" />
                          <span>Screenshot bukti follow TikTok <a href="https://tiktok.com/@tdcsummitfest_its" target="_blank" rel="noreferrer" className="text-red-inferno font-bold underline">@tdcsummitfest_its</a></span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Icon name="MessageSquareShare" size={16} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>Screenshot bukti komen &amp; tag 3 teman pada poster CEO FOR A DAY di Instagram <a href="https://www.instagram.com/p/DclNVH_JpU-/?igsi=ZzFsd2M0cGpvYW9l" target="_blank" rel="noreferrer" className="text-red-inferno font-bold underline break-all">https://www.instagram.com/p/DclNVH_JpU-/?igsi=ZzFsd2M0cGpvYW9l</a></span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Icon name="Share2" size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>Screenshot bukti repost Instastory poster CEO FOR A DAY di Instagram <a href="https://www.instagram.com/p/DclNVH_JpU-/?igsi=ZzFsd2M0cGpvYW9l" target="_blank" rel="noreferrer" className="text-red-inferno font-bold underline break-all">https://www.instagram.com/p/DclNVH_JpU-/?igsi=ZzFsd2M0cGpvYW9l</a></span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">Link Google Drive (satu folder) *</label>
                      <input type="url" value={form.socialProofDriveUrl} onChange={e => updateField('socialProofDriveUrl', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="https://drive.google.com/drive/folders/..." />
                      {errors.socialProofDriveUrl && <p className="text-red-500 text-xs mt-1">{errors.socialProofDriveUrl}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button onClick={() => { setStep('form-package'); scrollToFormSection(); }}
                      className="inline-flex items-center gap-2 bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3 border-2 border-blue-sail/40 tracking-widest transition-all cursor-pointer">
                      <Icon name="ArrowLeft" size={14} /> <span>KEMBALI</span>
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => { if (validateSocial()) handleSubmit(); }}
                      className="inline-flex items-center gap-2 bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-widest transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <><Icon name="Loader2" size={16} className="animate-spin" /> <span>MENGIRIM...</span></> : <><Icon name="Send" size={16} /> <span>KIRIM PENDAFTARAN</span></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3B: PAYMENT (Rising / Strategic / Absolute CEO) ─── */}
            {step === 'form-payment' && (
              <motion.div
                key="form-payment"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-ballroom border-[3px] border-blue-sail p-6 sm:p-8 shadow-[5px_5px_0_0_#2A4C9E]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-sail text-decor px-3 py-1.5 font-display font-black text-sm border border-decor">
                      {form.packageChoice === 'Strategic CEO' ? '4' : '3'}
                    </div>
                    <h3 className="font-display font-black text-lg text-blue-sail uppercase">Pembayaran — {form.packageChoice}</h3>
                  </div>
                  <p className="text-xs text-blue-sail/60 font-sans mb-6">Pilih metode pembayaran (Bank Transfer / QRIS) lalu upload bukti pembayaran.</p>

                  {/* Selected Package Nominal Summary Card */}
                  {selectedPkg && (
                    <div className="bg-blue-sail/5 border-2 border-blue-sail p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-blue-sail/60 uppercase tracking-widest block">PAKET PILIHAN KAMU</span>
                        <h4 className="font-display font-black text-lg text-blue-sail uppercase flex items-center gap-2">
                          <Icon name={selectedPkg.iconName} size={20} className="text-red-inferno" />
                          <span>{selectedPkg.name}</span>
                        </h4>
                        {(form.packageChoice === 'Strategic CEO' || form.packageChoice === 'Absolute CEO') && form.selectedEbook && (
                          <p className="text-xs text-blue-sail/80 font-sans mt-1">📚 <strong>E-Book:</strong> {form.selectedEbook}</p>
                        )}
                      </div>
                      <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-blue-sail/20 pt-2 sm:pt-0 sm:pl-4">
                        <span className="font-mono text-[10px] font-bold text-red-inferno uppercase tracking-widest block">TOTAL NOMINAL TRANSFER</span>
                        <p className="font-display font-black text-2xl text-red-inferno">
                          {selectedPkg.price}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection (Bank Transfer & QRIS) */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-2">
                        Metode Pembayaran *
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {(['Bank Transfer', 'QRIS'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => updateField('paymentMethod', method)}
                            className={`p-3 border-2 text-center font-display font-bold text-xs uppercase transition-all cursor-pointer ${
                              form.paymentMethod === method || (!form.paymentMethod && method === 'Bank Transfer')
                                ? 'border-decor bg-blue-sail/5 shadow-[2px_2px_0_0_#F6BB02] text-blue-sail font-extrabold'
                                : 'border-blue-sail/30 hover:border-blue-sail/60 text-blue-sail/70'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>

                      {/* Details: Bank Transfer */}
                      {(form.paymentMethod === 'Bank Transfer' || !form.paymentMethod) && (
                        <div className="bg-blue-sail text-ballroom p-5 border-3 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] space-y-3">
                          <div className="flex items-center justify-between border-b border-ballroom/20 pb-3">
                            <span className="font-display font-black text-sm text-decor uppercase tracking-wider flex items-center gap-2">
                              <Icon name="Briefcase" size={18} />
                              <span>BANK JAGO</span>
                            </span>
                            <span className="bg-decor text-blue-sail font-mono text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                              OFFICIAL ACCOUNT
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-decor uppercase font-bold tracking-wider block">NOMOR REKENING</span>
                            <div className="flex items-center justify-between bg-ballroom/10 p-2.5 border border-ballroom/20">
                              <span className="font-mono font-black text-xl text-ballroom tracking-widest">06265590338</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('06265590338');
                                  alert('Nomor rekening berhasil disalin!');
                                }}
                                className="bg-decor hover:bg-decor/90 text-blue-sail font-mono text-[10px] font-bold px-3 py-1.5 border border-blue-sail cursor-pointer transition-all uppercase"
                              >
                                Salin Rekening
                              </button>
                            </div>
                          </div>

                          <div className="pt-1">
                            <span className="text-[10px] font-mono text-decor uppercase font-bold tracking-wider block">ATAS NAMA</span>
                            <p className="font-display font-extrabold text-sm text-ballroom uppercase">Ahmad Andra Rizky Maulana</p>
                          </div>
                        </div>
                      )}

                      {/* Details: QRIS */}
                      {form.paymentMethod === 'QRIS' && (
                        <div className="bg-blue-sail text-ballroom p-5 border-3 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] text-center space-y-3">
                          <div className="border-b border-ballroom/20 pb-2">
                            <span className="font-display font-black text-sm text-decor uppercase tracking-wider">
                              SCAN QRIS PEMBAYARAN
                            </span>
                            <p className="text-xs text-ballroom/80 font-sans mt-0.5">Total Nominal: <strong>{selectedPkg?.price}</strong></p>
                          </div>

                          <div className="bg-white p-3 inline-block border-2 border-blue-sail shadow-[2px_2px_0_0_#000]">
                            <img src={qrisImg} alt="QRIS TSF 2026" className="w-56 sm:w-64 h-auto mx-auto border border-gray-200" />
                          </div>

                          <p className="text-[11px] font-mono text-decor font-bold uppercase tracking-wider">
                            Silakan scan QRIS di atas menggunakan E-Wallet atau M-Banking kamu
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Proof of Payment */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-blue-sail/80 uppercase tracking-wider mb-1">
                        Proof of Payment (Link Google Drive) *
                      </label>
                      <p className="text-[10px] text-blue-sail/50 font-sans mb-2">
                        Format nama file: <strong>NamaLengkap_NamaPaket</strong>
                      </p>
                      <input type="url" value={form.paymentProofUrl} onChange={e => updateField('paymentProofUrl', e.target.value)}
                        className="w-full bg-white border-2 border-blue-sail/30 focus:border-decor px-4 py-2.5 text-sm font-sans text-blue-sail outline-none transition-colors"
                        placeholder="https://drive.google.com/..." />
                      {errors.paymentProofUrl && <p className="text-red-500 text-xs mt-1">{errors.paymentProofUrl}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button onClick={() => {
                      if (form.packageChoice === 'Strategic CEO') {
                        setStep('form-ebook');
                      } else {
                        setStep('form-package');
                      }
                      scrollToFormSection();
                    }}
                      className="inline-flex items-center gap-2 bg-ballroom hover:bg-gray-100 text-blue-sail font-display font-bold text-xs uppercase px-6 py-3 border-2 border-blue-sail/40 tracking-widest transition-all cursor-pointer">
                      <Icon name="ArrowLeft" size={14} /> <span>KEMBALI</span>
                    </button>
                    <button
                      disabled={isSubmitting}
                      onClick={() => { if (validatePayment()) handleSubmit(); }}
                      className="inline-flex items-center gap-2 bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-widest transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <><Icon name="Loader2" size={16} className="animate-spin" /> <span>MENGIRIM...</span></> : <><Icon name="Send" size={16} /> <span>KIRIM PENDAFTARAN</span></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── SUCCESS ─── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-blue-sail border-[3px] border-decor p-8 sm:p-10 shadow-[6px_6px_0_0_#F6BB02] text-center">
                  <div className="bg-decor text-blue-sail w-16 h-16 flex items-center justify-center mx-auto mb-5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F]">
                    <Icon name="CheckCircle2" size={36} />
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-ballroom uppercase mb-3">
                    Pendaftaran Kamu Berhasil!
                  </h3>
                  <p className="text-sm text-ballroom/85 font-sans leading-relaxed max-w-md mx-auto mb-6">
                    Satu langkah lagi sebelum menjadi <strong>Future Innovators</strong>!
                    Yuk bergabung ke <strong>WhatsApp Community Group TDC Summit Fest 2026</strong> biar nggak ketinggalan informasi terbaru.
                  </p>

                  <div className="bg-barbera/20 border-2 border-decor/30 p-4 mb-6">
                    <p className="text-xs text-ballroom/70 font-sans mb-2">
                      📢 Semua info penting seperti link Zoom, koordinasi, sampai pengumuman bakal disampaikan di grup ini secara langsung. Jadi pastikan kamu join, ya!
                    </p>
                  </div>

                  <p className="text-sm text-ballroom/70 font-sans mb-6">
                    Sampai ketemu di <strong>CEO For A Day</strong>, dan... stay tuned terus buat keseruan berikutnya!
                  </p>

                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href="https://chat.whatsapp.com/CiP3Gm7vDedC7WcEBsL1wi?mode=gi_t"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase px-6 py-3.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#166534] tracking-widest transition-all"
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>JOIN GRUP WHATSAPP</span>
                    </a>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'CEO For A Day — TDC Summit Fest 2026',
                            text: 'Yuk daftar webinar CEO For A Day: Brand Yourself, Lead the Future! 🚀',
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link berhasil disalin!');
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-ballroom/10 hover:bg-ballroom/20 text-ballroom font-display font-bold text-xs uppercase px-6 py-3 border-2 border-ballroom/30 tracking-widest transition-all cursor-pointer"
                    >
                      <Icon name="Share2" size={14} />
                      <span>SHARE KE TEMAN</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════
          POSTER LIGHTBOX MODAL
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPosterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-sail/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowPosterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-ballroom border-4 border-blue-sail p-4 sm:p-6 max-w-lg w-full shadow-[12px_12px_0_0_#F6BB02] relative"
            >
              <div className="flex items-center justify-between border-b-2 border-blue-sail/20 pb-3 mb-4">
                <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest flex items-center gap-1.5">
                  <Icon name="Image" size={16} />
                  <span>OFFICIAL EVENT POSTER</span>
                </span>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="bg-red-inferno text-ballroom p-1.5 border border-blue-sail hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>

              {/* Poster Full View Artwork Container */}
              <div className="relative bg-blue-sail border-2 border-blue-sail overflow-hidden flex items-center justify-center text-ballroom shadow-inner max-h-[75vh]">
                <img
                  src={cfadImg}
                  alt="Official Event Poster CEO FOR A DAY"
                  className="w-full max-h-[75vh] object-contain"
                />
              </div>

              <div className="mt-4 flex justify-between items-center gap-2">
                <a
                  href={cfadImg}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-extrabold text-xs uppercase px-4 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Icon name="ExternalLink" size={14} /> BUKA GAMBAR PENUH
                </a>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-bold text-xs uppercase px-5 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer transition-all"
                >
                  Tutup Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
