import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';

interface SubEventPageProps {
  slug: 'pe1' | 'pe2';
}

export const SubEventPage: React.FC<SubEventPageProps> = ({ slug }) => {
  const { subEvents } = useApp();
  const event = subEvents.find(e => e.slug === slug);

  const [ticketQty, setTicketQty] = useState(1);
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showSuccessTicket, setShowSuccessTicket] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center asphalt-texture">
        <div className="bg-ballroom p-8 border-4 border-blue-sail text-center max-w-sm rounded-sm">
          <Icon name="AlertTriangle" size={48} className="text-red-inferno mx-auto mb-4 animate-bounce" />
          <h3 className="font-display font-black text-xl text-blue-sail uppercase">Sub-Event Tidak Ditemukan</h3>
          <p className="text-xs text-blue-sail/70 font-sans mt-2">Data sub-event dengan slug ini belum diunggah.</p>
        </div>
      </div>
    );
  }

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.name.trim() || !ticketForm.email.trim() || !ticketForm.phone.trim()) {
      setFormError('Semua formulir tiket wajib diisi!');
      return;
    }
    setFormError('');
    setShowSuccessTicket(true);
  };

  const resetTicketForm = () => {
    setShowTicketModal(false);
    setShowSuccessTicket(false);
    setTicketForm({ name: '', email: '', phone: '' });
    setTicketQty(1);
  };

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO BANNER */}
        <section className="bg-blue-sail text-ballroom rounded-sm border-4 border-decor p-8 sm:p-12 mb-12 relative overflow-hidden shadow-lg text-center md:text-left">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          {/* Status Ribbon */}
          <div className="absolute top-0 right-0 bg-red-inferno text-ballroom text-xs font-mono font-bold px-4 py-1.5 uppercase tracking-widest">
            {event.status === 'upcoming' && 'Akan Datang'}
            {event.status === 'active' && 'Berlangsung'}
            {event.status === 'completed' && 'Selesai'}
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <span className="inline-block bg-decor text-blue-sail font-mono font-black text-xs uppercase px-3 py-1 rounded-sm tracking-wider skew-x-[-10deg]">
              {slug === 'pe1' ? 'PRE-EVENT 01' : 'PRE-EVENT 02'}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight leading-none text-shadow-sm">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 font-mono text-xs text-decor font-bold">
              <span className="flex items-center space-x-1.5">
                <Icon name="Calendar" size={14} />
                <span>{event.date}</span>
              </span>
              <span className="flex items-center space-x-1.5 text-ballroom/80">
                <Icon name="MapPin" size={14} className="text-decor" />
                <span>{event.location}</span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. DESCRIPTION & INTRO */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-ballroom border-2 border-blue-sail/20 p-6 sm:p-8 rounded-sm shadow-sm space-y-4">
              <h3 className="font-display font-black text-xl text-blue-sail uppercase tracking-tight border-b-2 border-decor pb-2 flex items-center space-x-2">
                <Icon name="Info" size={18} className="text-decor" />
                <span>Deskripsi & Tujuan Acara</span>
              </h3>
              <p className="text-sm sm:text-base text-blue-sail/90 font-sans leading-relaxed">
                {event.description}
              </p>
              <p className="text-sm text-blue-sail/80 font-sans leading-relaxed">
                Aktivitas ini dirancang secara khusus untuk membangun momentum hangat, mengajak interaksi penuh komunitas, serta menghidupkan visual branding TSF yang tangguh dan elegan sebelum gelaran utama dimulai.
              </p>
            </div>

            {/* LINE-UP / TALENT SECTION */}
            <div className="space-y-4">
              <h3 className="font-display font-black text-xl text-blue-sail uppercase tracking-tight flex items-center space-x-2">
                <div className="w-6 h-1 bg-decor" />
                <span>GUEST STARS & SPEAKERS</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {event.lineup.map((star, idx) => (
                  <div key={idx} className="bg-ballroom rounded-sm border-2 border-blue-sail/25 overflow-hidden flex shadow-sm group hover:border-blue-sail transition-all">
                    <div className="w-28 sm:w-32 h-32 shrink-0 overflow-hidden relative">
                      <img 
                        src={star.imageUrl} 
                        alt={star.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                      <span className="bg-red-inferno text-ballroom font-mono text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest self-start">
                        GUEST
                      </span>
                      <h4 className="font-display font-bold text-base text-blue-sail uppercase tracking-tight mt-1">
                        {star.name}
                      </h4>
                      <p className="text-xs text-blue-sail/70 font-sans font-medium mt-0.5">
                        {star.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR: TICKETS & ACCESSIBILITY */}
          <div className="space-y-6">
            <div className="bg-barbera text-ballroom p-6 rounded-sm border-t-8 border-decor shadow-md space-y-6">
              <div className="space-y-1">
                <span className="font-mono text-[9px] font-black uppercase text-decor tracking-widest">// ACCESS & ENTRY</span>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight">INFORMASI TIKET</h3>
              </div>

              <div className="border-y border-ballroom/10 py-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-sans">
                  <span>Jenis Tiket:</span>
                  <span className="font-mono font-bold text-decor">PRE-EVENT PASS</span>
                </div>
                <div className="flex justify-between items-center text-sm font-sans">
                  <span>HTM / Biaya:</span>
                  <span className="font-display font-black text-2xl text-decor">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm font-sans">
                  <span>Kapasitas Venue:</span>
                  <span className="font-mono text-xs">Terbatas untuk 300 Pendaftar</span>
                </div>
              </div>

              {event.status === 'completed' ? (
                <div className="bg-blue-sail/30 p-4 rounded-sm border border-ballroom/10 text-center text-xs">
                  <Icon name="XCircle" size={24} className="mx-auto mb-2 text-decor" />
                  <p className="font-bold">EVENT TELAH SELESAI</p>
                  <p className="text-ballroom/70 mt-1">Sesi pendaftaran tiket untuk Pre-Event ini sudah ditutup.</p>
                </div>
              ) : (
                <button
                  id="pe-ticket-order-btn"
                  onClick={() => setShowTicketModal(true)}
                  className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 rounded-sm tracking-widest shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  PESAN TIKET GRATIS
                </button>
              )}

              {/* Venue Quick Card */}
              <div className="bg-blue-sail/20 p-4 rounded-sm border border-ballroom/10 space-y-2.5">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-decor flex items-center space-x-1.5">
                  <Icon name="MapPin" size={14} />
                  <span>Lokasi Fisik Venue</span>
                </h4>
                <p className="text-xs text-ballroom/85 font-sans leading-relaxed">
                  {event.location}. Area parkir aman, sirkulasi udara baik, dan ramah disabilitas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SUSUNAN ACARA / RUNDOWN */}
        <section className="mb-16">
          <div className="text-center space-y-2 mb-10">
            <span className="font-mono text-sm font-bold text-red-inferno tracking-widest uppercase">// SCHEDULE & RUNDOWN</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">AGENDA ACARA PRESISI</h2>
            <div className="w-16 h-1.5 bg-decor mx-auto rounded-sm" />
          </div>

          <div className="bg-ballroom rounded-sm border-2 border-blue-sail/25 overflow-hidden shadow-sm max-w-2xl mx-auto">
            <div className="bg-blue-sail text-ballroom px-6 py-4 font-display font-bold text-sm uppercase tracking-wider border-b border-decor">
              RUNDOWN {slug === 'pe1' ? 'TSF SPARK' : 'TSF REV-UP'}
            </div>
            <div className="divide-y divide-blue-sail/10 font-sans">
              {event.schedule.map((item, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 hover:bg-blue-sail/5 transition-colors">
                  <span className="font-mono text-xs font-bold text-red-inferno bg-red-inferno/5 px-2.5 py-1 rounded-sm self-start tracking-wider">
                    {item.time}
                  </span>
                  <p className="text-sm font-semibold text-blue-sail leading-snug">
                    {item.activity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PHOTO GALLERY */}
        <section className="mb-16">
          <div className="text-center space-y-2 mb-10">
            <span className="font-mono text-sm font-bold text-red-inferno tracking-widest uppercase">// IN PICTURES</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">SNEAK PEEK & DOKUMENTASI</h2>
            <div className="w-16 h-1.5 bg-decor mx-auto rounded-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {event.gallery.map((photo, i) => (
              <div key={i} className="bg-ballroom p-2 rounded-sm border-2 border-blue-sail/20 shadow-sm relative group overflow-hidden h-64">
                <img 
                  src={photo} 
                  alt={`Gallery TSF ${i+1}`} 
                  className="w-full h-full object-cover rounded-xs transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-blue-sail/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <p className="text-ballroom font-display font-black text-xs uppercase tracking-widest border border-ballroom/30 px-3 py-1.5">
                    TSF FESTIVAL 2026
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL CHECKOUT TIKET */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-ballroom w-full max-w-md rounded-sm border-4 border-blue-sail shadow-2xl overflow-hidden text-blue-sail">
            
            {/* Header Modal */}
            <div className="bg-blue-sail text-ballroom p-5 flex items-center justify-between border-b-2 border-decor">
              <h3 className="font-display font-bold text-base uppercase tracking-tight text-decor">
                REGISTRASI TIKET KEHADIRAN
              </h3>
              <button
                id="ticket-modal-close"
                onClick={resetTicketForm}
                className="text-ballroom hover:text-decor p-1 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            {showSuccessTicket ? (
              /* Ticket Success Receipt Box */
              <div className="p-6 text-center space-y-6">
                <div className="text-decor flex justify-center">
                  <div className="bg-blue-sail p-4 rounded-full">
                    <Icon name="CheckCircle2" size={40} className="stroke-[2.5px]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="font-mono text-[9px] font-bold text-red-inferno tracking-widest uppercase">BOOKING SUCCESSFUL</span>
                  <h4 className="font-display font-black text-xl uppercase tracking-tight">ETIKET BERHASIL DI-RESERVED</h4>
                  <p className="text-xs text-blue-sail/80 leading-relaxed max-w-sm mx-auto">
                    Terima kasih! Tiket untuk <strong>{ticketForm.name}</strong> ({ticketQty} Pax) telah resmi didaftarkan. E-ticket QR Code telah dikirim ke WhatsApp hotline Anda. Tunjukkan QR ini di gerbang registrasi venue.
                  </p>
                </div>

                {/* Simulated E-Ticket badge card */}
                <div className="bg-blue-sail text-ballroom p-4 rounded-sm border-l-4 border-decor text-left font-mono relative overflow-hidden">
                  <div className="absolute right-3 top-3 opacity-15">
                    <Icon name="Trophy" size={64} />
                  </div>
                  <div className="text-[9px] text-decor uppercase font-black tracking-widest mb-1.5">TSF E-TICKET RECEIPT</div>
                  <div className="text-xs font-bold font-display uppercase tracking-tight truncate">{event.title}</div>
                  <div className="text-[10px] text-ballroom/75 mt-1">{event.date}</div>
                  <div className="text-[10px] text-ballroom/75">{event.location.substring(0, 30)}...</div>
                  <div className="border-t border-ballroom/10 mt-3 pt-2 flex justify-between items-center text-[10px] text-decor">
                    <span>QTY: {ticketQty} PASS</span>
                    <span className="font-bold">CODE: TSF-PE-{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>

                <button
                  id="ticket-success-close-btn"
                  onClick={resetTicketForm}
                  className="w-full bg-blue-sail hover:bg-barbera text-ballroom font-display font-black text-xs uppercase py-3 rounded-sm tracking-wider"
                >
                  Selesai
                </button>
              </div>
            ) : (
              /* Ticket Form */
              <form onSubmit={handleTicketSubmit} className="p-6 space-y-4">
                <div className="bg-blue-sail/5 p-3 rounded-sm border border-blue-sail/10 mb-2">
                  <span className="text-[10px] font-mono text-red-inferno font-bold uppercase tracking-wider block">EVENT PILIHAN</span>
                  <p className="text-xs font-bold leading-normal">{event.title}</p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Nama Pendaftar *</label>
                  <input
                    id="ticket-name"
                    type="text"
                    required
                    value={ticketForm.name}
                    onChange={e => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama lengkap pendaftar"
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-sail/25 focus:border-blue-sail focus:ring-2 focus:ring-blue-sail/10 rounded-sm outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Alamat Email *</label>
                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={ticketForm.email}
                    onChange={e => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="mazen@student.ac.id"
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-sail/25 focus:border-blue-sail focus:ring-2 focus:ring-blue-sail/10 rounded-sm outline-none transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">No. WhatsApp *</label>
                  <input
                    id="ticket-phone"
                    type="text"
                    required
                    value={ticketForm.phone}
                    onChange={e => setTicketForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs bg-white border border-blue-sail/25 focus:border-blue-sail focus:ring-2 focus:ring-blue-sail/10 rounded-sm outline-none transition-all"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Jumlah Tiket (Max 3) *</label>
                  <div className="flex items-center space-x-3">
                    <button
                      id="ticket-qty-dec"
                      type="button"
                      onClick={() => setTicketQty(prev => Math.max(1, prev - 1))}
                      className="bg-blue-sail/10 hover:bg-blue-sail/20 text-blue-sail font-bold px-3 py-1 rounded-sm border border-blue-sail/20"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm w-8 text-center">{ticketQty}</span>
                    <button
                      id="ticket-qty-inc"
                      type="button"
                      onClick={() => setTicketQty(prev => Math.min(3, prev + 1))}
                      className="bg-blue-sail/10 hover:bg-blue-sail/20 text-blue-sail font-bold px-3 py-1 rounded-sm border border-blue-sail/20"
                    >
                      +
                    </button>
                    <span className="text-[10px] text-blue-sail/60">(Satu orang maksimal mendaftar 3 tiket)</span>
                  </div>
                </div>

                {formError && <p className="text-red-inferno text-[10px] font-bold uppercase mt-2">{formError}</p>}

                {/* Submit button */}
                <button
                  id="ticket-submit"
                  type="submit"
                  className="w-full bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase py-3.5 rounded-sm tracking-widest shadow-md transition-colors mt-4"
                >
                  KONFIRMASI PENDAFTARAN TIKET
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
