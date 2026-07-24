import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion } from 'motion/react';
import tdcLogo from '../tdcits.png';
import tsfLogo from '../tsfits2.png';

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const { phases, subEvents, competitions, divisions } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Find currently active phase
  const activePhase = phases.find(p => p.status === 'active') || phases[0];

  // Function to calculate time left from activePhase.end_date minus today
  const calculateTimeLeft = () => {
    if (activePhase && activePhase.name === 'staff_recruitment') {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    if (!activePhase || !activePhase.end_date) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    // const target = new Date(`${activePhase.end_date}T23:59:59`).getTime();
    const target = new Date(`2026-07-25T23:59:59`).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [activePhase]);

  const navigateToPhase = (page: string) => {
    if (activePhase && activePhase.name === 'staff_recruitment') {
      setCurrentPage('announcement');
      return;
    }
    const disabledPages = ['pe1', 'pe2', 'competition', 'thrift'];
    if (disabledPages.includes(page)) {
      setCurrentPage('staff');
    } else {
      setCurrentPage(page);
    }
  };

  const handleTimelineClick = (phaseName: string) => {
    if (phaseName === 'staff_recruitment') {
      setCurrentPage('announcement');
    }
    // Clicks on other phases are disabled/ignored because they are Coming Soon.
  };

  const faqs = [
    {
      question: "Apa itu TSF (TDC Summit Festival) 2026?",
      answer: "TDC Summit Fest (TSF) merupakan event besar yang diselenggarakan oleh UKM Technopreneurship Development Center (TDC) Institut Teknologi Sepuluh Nopember dengan tujuan untuk memperkuat eksistensi TDC baik dalam lingkup ITS maupun lingkup nasional serta sebagai bentuk upaya untuk menggelorakan jiwa usaha kepada generasi muda Indonesia. TDC Summit Fest 2026 mengusung tema 'From Innovation to Sustainable Impact' Melambangkan gagasan-gagasan yang telah diciptakan tidak hanya inovatif dan untuk dikembangkan saja, tetapi juga bagaimana inovasi tersebut bisa memberikan dampak dan nilai jangka panjang yang relevan dengan tantangan global sekarang."


    },
    {
      question: "Kapan dan di mana TSF diselenggarakan?",
      answer: "TDC Summit Fest akan diselenggarakan di Kota Surabaya secara daring dan luring yang akan berjalan dari Agustus hingga Nopember 2026."
    },
    {
      question: "Bagaimana cara mendaftar menjadi Staff Panitia TSF?",
      answer: "Anda dapat menuju ke halaman 'Staff Recruitment' di website ini, membaca detail tugas untuk masing-masing divisi (seperti Event, Public Relation, Branding and Marketing, dll), lalu mengisi form pendaftaran dengan melampirkan motivasi dan portofolio Anda sebelum batas waktu pendaftaran ditutup."
    },
    {
      question: "Apa saja kompetisi yang ada di TSF?",
      answer: "TDC Summit Fest menghadirkan Business Plan Competition (BPC) dan Business Case Competition (BCC) sebagai wadah bagi generasi muda untuk mengembangkan kemampuan problem solving, innovation thinking, dan strategic decision making. Melalui kedua kompetisi ini, peserta diajak untuk merancang solusi yang tidak hanya inovatif, tetapi juga mampu memberikan dampak yang berkelanjutan bagi masyarakat, industri, maupun lingkungan."
    },
    {
      question: "Bagaimana cara menyewa booth/tenant di Thrift TSF?",
      answer: "Sangat mudah! Buka halaman 'Thrift', gulir ke bawah ke bagian 'Pendaftaran Vendor Booth', lalu isi data brand thrift Anda. Tim logistik kami akan melakukan kurasi produk dan segera menghubungi Anda untuk koordinasi tata letak booth di area utama bazar."
    }
  ];

  return (
    <div className="asphalt-texture min-h-screen pb-16">

      {/* 1. HERO SECTION */}
      <section className="relative bg-blue-sail text-ballroom overflow-hidden border-b-8 border-decor pt-8 pb-16 lg:pt-12 lg:pb-24">
        <div className="absolute inset-0 grid-pattern opacity-15" />
        {/* Dynamic decorative race track lines */}
        <div className="absolute -bottom-10 left-0 right-0 h-2 bg-red-inferno transform skew-y-[-1.5deg]" />
        <div className="absolute -bottom-6 left-0 right-0 h-4 bg-decor transform skew-y-[-1.5deg]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="relative bg-decor w-32 h-12 border-2 border-blue-sail shadow-lg flex items-center justify-center rounded-none transform skew-x-[-6deg]">
                <img
                  src={tsfLogo}
                  alt="TSF Logo"
                  className="absolute h-20 w-auto object-contain transform skew-x-[6deg] z-10"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-none uppercase tracking-tighter text-shadow-md">
              TDC <span className="text-decor">SUMMIT</span> <br />
              FESTIVAL <span className="text-red-inferno">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-ballroom/90 max-w-xl font-sans leading-relaxed">
              Wadah bagi entrepreneur muda, baik pelajar maupun mahasiswa, TDC Summit Fest hadir untuk membantu mereka mengembangkan kemampuan melalui kompetisi berskala nasional. Melalui program ini, peserta diajak untuk berpikir kritis, merancang strategi, dan membangun solusi yang relevan dengan kebutuhan industri saat ini.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-primary-cta"
                onClick={() => navigateToPhase(activePhase.name === 'none' ? 'home' : activePhase.cta_link.substring(1))}
                className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-extrabold text-sm uppercase px-8 py-4 rounded-none tracking-widest border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] hover:shadow-[5px_5px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center space-x-2"
              >
                <span>{activePhase.status === 'active' ? (activePhase.name === 'staff_recruitment' ? 'CEK PENGUMUMAN BERKAS' : `IKUTI ${activePhase.label}`) : 'LIHAT JADWAL EVENT'}</span>
                <Icon name="ArrowRight" size={16} className="stroke-[3px]" />
              </button>

              <button
                id="hero-secondary-cta"
                onClick={() => {
                  const el = document.getElementById('event-roadmap');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent hover:bg-ballroom hover:text-blue-sail border-[3px] border-ballroom text-ballroom font-display font-bold text-sm uppercase px-8 py-4 rounded-none tracking-widest transition-all duration-150"
              >
                TIMELINE TSF
              </button>
            </div>
          </div>

          {/* Hero Right Visual: Sporty Badge style Card */}
          <div className="w-full max-w-md lg:max-w-none lg:w-[420px] shrink-0">
            <div className="bg-ballroom text-blue-sail p-6 rounded-none border-[3px] border-blue-sail shadow-[6px_6px_0_0_#BD1B1F] relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute top-0 right-0 bg-red-inferno text-ballroom text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-widest border-b-2 border-l-2 border-blue-sail">
                TSF LIVE
              </div>
              <p className="font-mono text-xs font-bold text-red-inferno tracking-wider mb-2">● HAPPENING NOW</p>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight leading-tight border-b-2 border-blue-sail/20 pb-3 mb-4">
                {activePhase.name === 'staff_recruitment' ? 'Pengumuman Seleksi Berkas' : activePhase.label}
              </h3>
              <p className="text-sm text-blue-sail/80 font-sans leading-relaxed mb-6">
                {activePhase.name === 'staff_recruitment'
                  ? 'Selamat bagi pendaftar yang lolos seleksi tahap berkas TDC Summit Fest 2026. Silakan cek status kelulusan Anda di halaman pengumuman.'
                  : `"${activePhase.description}"`}
              </p>

              {/* Countdown panel */}
              {activePhase.status === 'active' && (
                <div className="bg-blue-sail text-decor p-4 rounded-none border-l-4 border-red-inferno border-2 border-blue-sail mb-6">
                  <p className="text-[10px] text-ballroom/65 font-mono font-bold uppercase tracking-wider mb-2">Batas Waktu Fase Ini:</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-barbera/30 p-2 rounded-none border border-decor/25">
                      <span className="block font-display font-black text-xl text-ballroom">{timeLeft.days}</span>
                      <span className="text-[9px] font-mono uppercase text-ballroom/70">Hari</span>
                    </div>
                    <div className="bg-barbera/30 p-2 rounded-none border border-decor/25">
                      <span className="block font-display font-black text-xl text-ballroom">{timeLeft.hours}</span>
                      <span className="text-[9px] font-mono uppercase text-ballroom/70">Jam</span>
                    </div>
                    <div className="bg-barbera/30 p-2 rounded-none border border-decor/25">
                      <span className="block font-display font-black text-xl text-ballroom">{timeLeft.minutes}</span>
                      <span className="text-[9px] font-mono uppercase text-ballroom/70">Menit</span>
                    </div>
                    <div className="bg-barbera/30 p-2 rounded-none border border-decor/25 animate-pulse">
                      <span className="block font-display font-black text-xl text-decor">{timeLeft.seconds}</span>
                      <span className="text-[9px] font-mono uppercase text-decor/80">Detik</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                id="hero-banner-action"
                onClick={() => navigateToPhase(activePhase.cta_link.substring(1))}
                className="w-full bg-blue-sail hover:bg-barbera text-ballroom font-display font-extrabold text-xs uppercase py-3 rounded-none border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-wider transition-all text-center"
              >
                {activePhase.name === 'staff_recruitment' ? 'Cek Status Kelulusan Berkas' : `Kunjungi Halaman Utama ${activePhase.label}`}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC 'SEDANG BERLANGSUNG' BANNER / SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-decor p-1.5 rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#BD1B1F] transform -skew-y-1">
          <div className="bg-blue-sail text-ballroom p-6 sm:p-8 rounded-none flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Banner Left */}
            <div className="flex items-center space-x-4">
              <div className="bg-decor text-blue-sail p-4 rounded-none border-2 border-blue-sail animate-bounce">
                <Icon name="Trophy" size={32} className="stroke-[2.5px]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2 py-0.5 rounded-none border border-blue-sail uppercase tracking-widest animate-pulse">
                    Fase Terkini
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-decor mt-1">
                  {activePhase.name === 'staff_recruitment' && "Cek Pengumuman Lolos Berkas Staff TSF!"}
                  {activePhase.name === 'pe1' && "Pre-Event 1: TSF Spark Segera Hadir!"}
                  {activePhase.name === 'pe2' && "Pre-Event 2: TSF Rev-Up Otomotif Meet!"}
                  {activePhase.name === 'competition' && "Pendaftaran Kompetisi TSF Dibuka!"}
                  {activePhase.name === 'thrift' && "Thrift & Vintage Market Aktif!"}
                  {activePhase.name === 'none' && "Rangkaian TSF Bersiap Dimulai!"}
                </h3>
                <p className="text-sm text-ballroom/80 font-sans max-w-xl mt-1.5">
                  {activePhase.name === 'staff_recruitment'
                    ? "Gunakan NRP Anda untuk memverifikasi kelulusan seleksi berkas panitia TDC Summit Fest 2026."
                    : "Jangan lewatkan kesempatan emas ini untuk berpartisipasi langsung, bersenang-senang, dan meraih hadiah jutaan rupiah!"}
                </p>
              </div>
            </div>

            {/* Banner Right */}
            <button
              id="dynamic-banner-cta"
              onClick={() => navigateToPhase(activePhase.cta_link.substring(1))}
              className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-6 py-3.5 rounded-none tracking-widest shrink-0 border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {activePhase.name === 'staff_recruitment' ? "CEK PENGUMUMAN" : "IKUTI SEKARANG"}
            </button>

          </div>
        </div>
      </section>

      {/* 3. ROADMAP / TIMELINE STEPPER */}
      <section id="event-roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center space-y-3 mb-12">
          <span className="font-mono text-sm font-bold text-red-inferno tracking-widest uppercase">
            // MASTER TIMELINE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-blue-sail uppercase tracking-tight">
            ALUR RANGKAIAN EVENT TSF
          </h2>
          <div className="w-24 h-1.5 bg-decor mx-auto rounded-sm" />
          <p className="text-sm text-blue-sail/70 max-w-lg mx-auto font-sans">
            Klik pada masing-masing tahapan di bawah ini untuk melihat detail informasi dan langsung mengakses pendaftarannya.
          </p>
        </div>

        {/* Timeline Stepper Container */}
        <div className="bg-ballroom p-6 sm:p-10 rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-5" />

          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 z-10">
            {phases.map((phase, idx) => {
              const isActive = phase.status === 'active';
              const isClosed = phase.status === 'closed';
              const isUpcoming = phase.status === 'upcoming';

              return (
                <div
                  key={phase.id}
                  onClick={() => handleTimelineClick(phase.name)}
                  className={`cursor-pointer group flex flex-col justify-between p-5 rounded-none border-[3px] transition-all duration-200 relative hover:-translate-y-1 ${isActive
                    ? 'bg-blue-sail border-decor text-ballroom shadow-[4px_4px_0_0_#F6BB02]'
                    : isClosed
                      ? 'bg-ballroom/60 border-blue-sail/20 text-blue-sail/50'
                      : 'bg-ballroom border-blue-sail/40 text-blue-sail hover:border-decor hover:shadow-[4px_4px_0_0_#2A4C9E]'
                    }`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${isActive
                    ? 'bg-decor'
                    : isClosed
                      ? 'bg-blue-sail/10'
                      : 'bg-blue-sail/30'
                    }`} />

                  <div>
                    {/* Circle Badge with index */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-none border tracking-wider skew-x-[-10deg] ${isActive
                        ? 'bg-decor text-blue-sail border-blue-sail'
                        : isClosed
                          ? 'bg-blue-sail/10 text-blue-sail/40 border-blue-sail/10'
                          : 'bg-blue-sail/20 text-blue-sail border-blue-sail/20'
                        }`}>
                        FASE 0{idx + 1}
                      </span>

                      {/* Micro Badge Label Status */}
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                        {isActive && '• ACTIVE'}
                        {isClosed && 'CLOSED'}
                        {isUpcoming && 'UPCOMING'}
                      </span>
                    </div>

                    <h4 className="font-display font-extrabold text-lg uppercase tracking-tight group-hover:text-decor transition-colors">
                      {phase.label === 'Thrift' ? (
                        <span className="blur-[3px] group-hover:blur-none transition-all duration-300 select-none">
                          THRIFT
                        </span>
                      ) : (
                        phase.label
                      )}
                    </h4>

                    <p className={`text-xs mt-2 leading-relaxed font-sans ${isActive ? 'text-ballroom/80' : 'text-blue-sail/70'
                      }`}>
                      {phase.description.substring(0, 75)}...
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span>
                      {phase.name === 'thrift' ? (
                        <span className="blur-[3px] group-hover:blur-none transition-all duration-300 select-none">
                          THRIFT
                        </span>
                      ) : phase.name === 'staff_recruitment' ? (
                        'Recruitment'
                      ) : (
                        phase.name.toUpperCase()
                      )}
                    </span>
                    <Icon name="ArrowRight" size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* 5. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center space-y-2 mb-10">
          <span className="font-mono text-sm font-bold text-red-inferno tracking-widest uppercase">// NEED HELP?</span>
          <h2 className="font-display font-black text-3xl text-blue-sail uppercase tracking-tight">PERTANYAAN UMUM (FAQ)</h2>
          <div className="w-12 h-1 bg-decor mx-auto rounded-sm" />
        </div>

        <div className="space-y-4 font-sans">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-ballroom rounded-none border-[3px] border-blue-sail overflow-hidden shadow-[3px_3px_0_0_#2A4C9E] hover:shadow-[4px_4px_0_0_#2A4C9E] transition-all"
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none bg-ballroom/50 hover:bg-ballroom"
                >
                  <span className="font-display font-bold text-base text-blue-sail pr-4 uppercase tracking-tight">
                    {faq.question}
                  </span>
                  <Icon
                    name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                    size={20}
                    className="text-decor shrink-0 transition-transform duration-200"
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-blue-sail/80 border-t border-blue-sail/10 bg-ballroom/30 leading-relaxed animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
