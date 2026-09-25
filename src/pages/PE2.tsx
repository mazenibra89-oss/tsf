import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';

type FormStep = 'info' | 'form-set' | 'form-data' | 'form-payment' | 'success';

interface PE2FormData {
  setType: 'Single Set' | 'Couple Set' | '';
  p1_name: string;
  p1_email: string;
  p1_whatsapp: string;
  p1_institution: string;
  p2_name: string;
  p2_email: string;
  p2_whatsapp: string;
  p2_institution: string;
  paymentMethod: 'Transfer Bank' | 'QRIS' | '';
  paymentProofUrl: string;
}

const INITIAL_FORM: PE2FormData = {
  setType: '',
  p1_name: '', p1_email: '', p1_whatsapp: '', p1_institution: '',
  p2_name: '', p2_email: '', p2_whatsapp: '', p2_institution: '',
  paymentMethod: '', paymentProofUrl: ''
};

export const PE2: React.FC = () => {
  const { addPE2Registration, systemSettings } = useApp();
  const [step, setStep] = useState<FormStep>('info');
  const [form, setForm] = useState<PE2FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // We can add a custom toggle in admin later, for now we will hardcode to true or use systemSettings
  // Wait, the prompt asked to add open/close toggle. Let's use systemSettings['pe2_registration_open']
  const isRegistrationOpen = systemSettings?.['pe2_registration_open'] === 'true';

  const updateField = (key: keyof PE2FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateSet = () => {
    if (!form.setType) {
      setErrors({ setType: 'Pilih paket yang diinginkan' });
      return false;
    }
    return true;
  };

  const validateDataDiri = () => {
    const errs: Record<string, string> = {};
    if (!form.p1_name.trim()) errs.p1_name = 'Nama Peserta 1 wajib diisi';
    if (!form.p1_email.trim() || !/\S+@\S+\.\S+/.test(form.p1_email)) errs.p1_email = 'Email tidak valid';
    if (!form.p1_whatsapp.trim()) errs.p1_whatsapp = 'Nomor WhatsApp Peserta 1 wajib diisi';
    if (!form.p1_institution.trim()) errs.p1_institution = 'Asal instansi Peserta 1 wajib diisi';

    if (form.setType === 'Couple Set') {
      if (!form.p2_name.trim()) errs.p2_name = 'Nama Peserta 2 wajib diisi';
      if (!form.p2_email.trim() || !/\S+@\S+\.\S+/.test(form.p2_email)) errs.p2_email = 'Email Peserta 2 tidak valid';
      if (!form.p2_whatsapp.trim()) errs.p2_whatsapp = 'Nomor WhatsApp Peserta 2 wajib diisi';
      if (!form.p2_institution.trim()) errs.p2_institution = 'Asal instansi Peserta 2 wajib diisi';
    }

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
      await addPE2Registration({
        set_type: form.setType as any,
        p1_name: form.p1_name,
        p1_email: form.p1_email,
        p1_whatsapp: form.p1_whatsapp,
        p1_institution: form.p1_institution,
        p2_name: form.setType === 'Couple Set' ? form.p2_name : undefined,
        p2_email: form.setType === 'Couple Set' ? form.p2_email : undefined,
        p2_whatsapp: form.setType === 'Couple Set' ? form.p2_whatsapp : undefined,
        p2_institution: form.setType === 'Couple Set' ? form.p2_institution : undefined,
        payment_method: form.paymentMethod as any,
        payment_proof_url: form.paymentProofUrl,
      });

      // Push to Google Sheets (Apps Script Web App)
      try {
        const sheetPayload = {
          set_type: form.setType,
          p1_name: form.p1_name,
          p1_email: form.p1_email,
          p1_whatsapp: form.p1_whatsapp,
          p1_institution: form.p1_institution,
          p2_name: form.setType === 'Couple Set' ? form.p2_name : '',
          p2_email: form.setType === 'Couple Set' ? form.p2_email : '',
          p2_whatsapp: form.setType === 'Couple Set' ? form.p2_whatsapp : '',
          p2_institution: form.setType === 'Couple Set' ? form.p2_institution : '',
          payment_method: form.paymentMethod,
          payment_proof_url: form.paymentProofUrl
        };

        await fetch("https://script.google.com/macros/s/AKfycbyDt7IRhfxMUZ33OPSKYrtXSMVHuHJVbhYQeY4h6Re790qZUyHkCHDfnnhBIkS-0ZVh/exec", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(sheetPayload)
        });
      } catch (e) {
        console.error("Gagal mengirim ke Google Sheets", e);
      }

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
      const el = document.getElementById('pe2-form-section');
      if (el) {
        const yOffset = -20;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const startRegistration = () => {
    if (!isRegistrationOpen) return;
    setStep('form-set');
    scrollToFormSection();
  };

  const price = form.setType === 'Single Set' ? 'Rp. 100.000' : 'Rp. 180.000';

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION A: LANDING PAGE */}
        {step === 'info' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 mb-16"
          >
            <div className="relative bg-white border-4 border-blue-sail p-8 sm:p-12 shadow-[12px_12px_0_0_#BD1B1F] max-w-5xl mx-auto overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-decor rounded-bl-full -mr-8 -mt-8 opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-inferno rounded-tr-full -ml-8 -mb-8 opacity-10 pointer-events-none"></div>
              
              <div className="relative text-center space-y-6">
                <motion.h2 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="font-display font-black text-4xl sm:text-6xl text-blue-sail uppercase tracking-tight leading-tight"
                >
                  Welcome to TDC Summit Fest 2026<br/>
                  Pre-Event II — <span className="text-decor bg-blue-sail px-4 py-1 mt-2 inline-block -rotate-2 transform border-4 border-decor shadow-[4px_4px_0_0_#BD1B1F]">Impacture</span>
                </motion.h2>

                <p className="font-mono text-xl sm:text-2xl text-blue-sail font-bold bg-blue-50 inline-block px-4 py-2 border-2 border-blue-sail/20 border-dashed">
                  "Turning Challenges Into Sustainable Opportunities"
                </p>

                <p className="font-sans text-base sm:text-lg text-blue-sail/90 leading-relaxed max-w-3xl mx-auto pt-4">
                  Permasalahan limbah nggak harus selalu jadi masalah. Impacture hadir sebagai ruang buat generasi muda ngolah limbah jadi produk yang bernilai guna, lewat pendekatan sustainability dan circular economy!
                  <br /><br />
                  <span className="font-bold text-red-inferno bg-red-50 px-2 py-1">Take your step. Create your impact. Be part of Impacture🌱✨</span>
                </p>

                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 py-6 font-mono text-sm text-blue-sail">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 border-4 border-blue-sail shadow-[4px_4px_0_0_#F6BB02]">
                    <Icon name="Calendar" size={24} className="text-red-inferno shrink-0" />
                    <span className="font-bold uppercase">Minggu, 4 Okt 2026</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 border-4 border-blue-sail shadow-[4px_4px_0_0_#F6BB02]">
                    <Icon name="Clock" size={24} className="text-red-inferno shrink-0" />
                    <span className="font-bold uppercase">10.00 WIB</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 border-4 border-blue-sail shadow-[4px_4px_0_0_#F6BB02]">
                    <Icon name="MapPin" size={24} className="text-red-inferno shrink-0" />
                    <span className="font-bold uppercase text-left leading-tight">Visma Coffee<br/><span className="text-[10px] text-blue-sail/70">Jl. Tegalsari No. 35, SBY</span></span>
                  </div>
                </div>

                <div className="pt-4">
                  {!isRegistrationOpen && (
                    <div className="inline-block bg-red-500/20 text-red-700 border-4 border-red-500 px-6 py-4 font-mono font-bold uppercase shadow-[4px_4px_0_0_#ef4444]">
                      Pendaftaran saat ini ditutup.
                    </div>
                  )}
                  {isRegistrationOpen && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startRegistration}
                      className="bg-decor hover:bg-yellow-400 text-blue-sail font-display font-black text-2xl px-12 py-5 border-4 border-blue-sail shadow-[8px_8px_0_0_#1E2A4F] transition-colors uppercase group relative overflow-hidden inline-flex items-center justify-center gap-3 cursor-pointer"
                    >
                      Secure Your Seat <Icon name="ArrowRight" className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-blue-sail text-ballroom border-4 border-blue-sail shadow-[8px_8px_0_0_#F6BB02] p-8 sm:p-12">
              <h3 className="font-display font-black text-3xl text-decor uppercase mb-6 flex items-center gap-3">
                <Icon name="Sprout" size={32} /> What is Impacture?
              </h3>
              <p className="font-sans text-lg mb-6 border-l-4 border-decor pl-4 italic">
                Impact + Culture is where small actions grow into a culture of change.
              </p>
              <p className="font-sans text-base leading-relaxed mb-8">
                Impacture dibangun dari keyakinan bahwa perubahan besar lahir dari langkah-langkah kecil yang konsisten. Limbah bukan akhir dari nilai suatu barang, tapi awal dari peluang baru.
              </p>

              <h4 className="font-display font-black text-xl text-decor uppercase mb-6">
                Apa yang akan kamu eksplor di Impacture:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Impactalk: Waste as Opportunity", desc: "Ngobrol bareng soal limbah sebagai peluang." },
                  { title: "Upcycling Workshop", desc: "Praktik langsung olah limbah jadi produk bernilai guna, kolaborasi bareng C-Pop Watch." },
                  { title: "Sustainability Business Talk", desc: "Insight gimana ide sustainability bisa jadi peluang bisnis." },
                  { title: "Future Impact Challenge", desc: "Kembangin & submit ide berdampak berkelanjutan, dinilai lewat impact voting." }
                ].map((item, idx) => (
                  <li key={idx} className="bg-ballroom/10 border border-ballroom/20 p-4 space-y-2">
                    <strong className="block text-decor font-mono text-sm uppercase">{item.title}</strong>
                    <span className="font-sans text-sm text-ballroom/80">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* SECTION B: REGISTRATION FORM */}
        <div id="pe2-form-section">
          {step !== 'info' && (
            <div className="max-w-3xl mx-auto bg-white border-4 border-blue-sail shadow-[8px_8px_0_0_#1E2A4F] p-6 sm:p-8 relative">
              <button
                onClick={() => setStep('info')}
                className="absolute -top-4 -right-4 bg-decor hover:bg-decor/90 text-blue-sail font-mono font-bold w-10 h-10 flex items-center justify-center border-2 border-blue-sail rounded-full shadow-[2px_2px_0_0_#1E2A4F] transition-transform hover:scale-110"
              >
                <Icon name="X" size={20} />
              </button>

              <div className="mb-8 border-b-4 border-blue-sail pb-4">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase">
                  Pendaftaran PE 2
                </h3>
              </div>

              <AnimatePresence mode="wait">
                {/* STEP: FORM SET */}
                {step === 'form-set' && (
                  <motion.div
                    key="form-set"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h4 className="font-mono font-bold text-lg text-blue-sail uppercase">Choose Your Set Page</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { 
                          id: 'Single Set', 
                          price: 'Rp. 100.000', 
                          desc: 'Ambil langkah pertamamu mengubah limbah jadi karya bernilai, lewat sesi upcycling workshop langsung bareng C-Pop Watch.',
                          include: '1 slot workshop upcycling + 1 pax snack'
                        },
                        { 
                          id: 'Couple Set', 
                          price: 'Rp. 180.000', 
                          desc: 'Ciptakan impact berdua, olah limbah jadi karya bareng teman atau pasanganmu, dalam sesi upcycling workshop bersama C-Pop Watch.',
                          include: '2 slot workshop upcycling + 2 pax snack'
                        }
                      ].map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => updateField('setType', pkg.id)}
                          className={`cursor-pointer border-2 transition-all p-5 relative overflow-hidden group ${
                            form.setType === pkg.id 
                              ? 'border-decor bg-blue-sail shadow-[4px_4px_0_0_#F6BB02]' 
                              : 'border-blue-sail/20 bg-gray-50 hover:border-decor hover:shadow-[4px_4px_0_0_#F6BB02]'
                          }`}
                        >
                          <div className={`font-display font-black text-xl mb-1 ${form.setType === pkg.id ? 'text-decor' : 'text-blue-sail'}`}>
                            {pkg.id}
                          </div>
                          <div className={`font-mono text-lg font-bold mb-3 ${form.setType === pkg.id ? 'text-white' : 'text-blue-sail'}`}>
                            {pkg.price}
                          </div>
                          <p className={`font-sans text-sm mb-4 leading-relaxed ${form.setType === pkg.id ? 'text-gray-300' : 'text-gray-600'}`}>
                            {pkg.desc}
                          </p>
                          <div className={`font-sans text-xs p-2 border-l-2 ${form.setType === pkg.id ? 'border-decor bg-white/10 text-white' : 'border-blue-sail bg-blue-sail/5 text-blue-sail'}`}>
                            <strong>Include:</strong> {pkg.include}
                          </div>
                          
                          {/* Check icon top right */}
                          {form.setType === pkg.id && (
                            <div className="absolute top-4 right-4 text-decor">
                              <Icon name="CheckCircle2" size={24} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.setType && <p className="text-red-500 font-mono text-sm mt-2 font-bold flex items-center gap-1"><Icon name="AlertCircle" size={14}/>{errors.setType}</p>}

                    <div className="pt-6 flex justify-end">
                      <button
                        onClick={() => {
                          if (validateSet()) {
                            setStep('form-data');
                            scrollToFormSection();
                          }
                        }}
                        className="bg-blue-sail hover:bg-blue-sail/90 text-white font-mono font-bold px-8 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#F6BB02] transition-all"
                      >
                        Lanjut Isi Data
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP: FORM DATA */}
                {step === 'form-data' && (
                  <motion.div
                    key="form-data"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Peserta 1 */}
                    <div className="space-y-4">
                      <h4 className="font-mono font-bold text-lg text-blue-sail uppercase border-b-2 border-blue-sail/20 pb-2">Data {form.setType === 'Couple Set' ? 'Peserta 1' : 'Peserta'}</h4>
                      
                      <div className="space-y-1">
                        <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Nama Lengkap</label>
                        <input
                          type="text"
                          value={form.p1_name}
                          onChange={e => updateField('p1_name', e.target.value)}
                          className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p1_name ? 'border-red-500' : 'border-blue-sail'}`}
                          placeholder="Masukkan nama lengkap"
                        />
                        {errors.p1_name && <p className="text-red-500 text-xs font-mono">{errors.p1_name}</p>}
                      </div>
                      
                      <div className="space-y-1">
                        <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Email</label>
                        <input
                          type="email"
                          value={form.p1_email}
                          onChange={e => updateField('p1_email', e.target.value)}
                          className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p1_email ? 'border-red-500' : 'border-blue-sail'}`}
                          placeholder="Masukkan email aktif"
                        />
                        {errors.p1_email && <p className="text-red-500 text-xs font-mono">{errors.p1_email}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Nomor WhatsApp</label>
                        <input
                          type="text"
                          value={form.p1_whatsapp}
                          onChange={e => updateField('p1_whatsapp', e.target.value)}
                          className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p1_whatsapp ? 'border-red-500' : 'border-blue-sail'}`}
                          placeholder="Contoh: 08123456789"
                        />
                        {errors.p1_whatsapp && <p className="text-red-500 text-xs font-mono">{errors.p1_whatsapp}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Institusi / Asal</label>
                        <input
                          type="text"
                          value={form.p1_institution}
                          onChange={e => updateField('p1_institution', e.target.value)}
                          className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p1_institution ? 'border-red-500' : 'border-blue-sail'}`}
                          placeholder="Nama sekolah / universitas / asal daerah"
                        />
                        {errors.p1_institution && <p className="text-red-500 text-xs font-mono">{errors.p1_institution}</p>}
                      </div>
                    </div>

                    {/* Peserta 2 */}
                    {form.setType === 'Couple Set' && (
                      <div className="space-y-4">
                        <h4 className="font-mono font-bold text-lg text-blue-sail uppercase border-b-2 border-blue-sail/20 pb-2">Data Peserta 2</h4>
                        
                        <div className="space-y-1">
                          <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Nama Lengkap</label>
                          <input
                            type="text"
                            value={form.p2_name}
                            onChange={e => updateField('p2_name', e.target.value)}
                            className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p2_name ? 'border-red-500' : 'border-blue-sail'}`}
                            placeholder="Masukkan nama lengkap"
                          />
                          {errors.p2_name && <p className="text-red-500 text-xs font-mono">{errors.p2_name}</p>}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Email</label>
                          <input
                            type="email"
                            value={form.p2_email}
                            onChange={e => updateField('p2_email', e.target.value)}
                            className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p2_email ? 'border-red-500' : 'border-blue-sail'}`}
                            placeholder="Masukkan email aktif"
                          />
                          {errors.p2_email && <p className="text-red-500 text-xs font-mono">{errors.p2_email}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Nomor WhatsApp</label>
                          <input
                            type="text"
                            value={form.p2_whatsapp}
                            onChange={e => updateField('p2_whatsapp', e.target.value)}
                            className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p2_whatsapp ? 'border-red-500' : 'border-blue-sail'}`}
                            placeholder="Contoh: 08123456789"
                          />
                          {errors.p2_whatsapp && <p className="text-red-500 text-xs font-mono">{errors.p2_whatsapp}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Institusi / Asal</label>
                          <input
                            type="text"
                            value={form.p2_institution}
                            onChange={e => updateField('p2_institution', e.target.value)}
                            className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.p2_institution ? 'border-red-500' : 'border-blue-sail'}`}
                            placeholder="Nama sekolah / universitas / asal daerah"
                          />
                          {errors.p2_institution && <p className="text-red-500 text-xs font-mono">{errors.p2_institution}</p>}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 flex justify-between">
                      <button
                        onClick={() => {
                          setStep('form-set');
                          scrollToFormSection();
                        }}
                        className="text-blue-sail font-mono font-bold hover:underline py-3 px-4"
                      >
                        ← Kembali
                      </button>
                      <button
                        onClick={() => {
                          if (validateDataDiri()) {
                            setStep('form-payment');
                            scrollToFormSection();
                          }
                        }}
                        className="bg-blue-sail hover:bg-blue-sail/90 text-white font-mono font-bold px-8 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#F6BB02] transition-all"
                      >
                        Konfirmasi Pembayaran
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP: FORM PAYMENT */}
                {step === 'form-payment' && (
                  <motion.div
                    key="form-payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h4 className="font-mono font-bold text-lg text-blue-sail uppercase">Payment Method Verification</h4>
                    
                    <div className="space-y-1">
                      <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Pilih Metode Pembayaran</label>
                      <select
                        value={form.paymentMethod}
                        onChange={e => updateField('paymentMethod', e.target.value)}
                        className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.paymentMethod ? 'border-red-500' : 'border-blue-sail'}`}
                      >
                        <option value="">-- Pilih --</option>
                        <option value="Transfer Bank">Transfer Bank</option>
                        <option value="QRIS">QRIS</option>
                      </select>
                      {errors.paymentMethod && <p className="text-red-500 text-xs font-mono">{errors.paymentMethod}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Nominal Transfer</label>
                      <input
                        type="text"
                        readOnly
                        value={price}
                        className="w-full bg-gray-200 border-2 border-blue-sail/30 text-blue-sail p-3 font-sans font-bold outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* Pembayaran Details */}
                    {form.paymentMethod === 'Transfer Bank' && (
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

                    {form.paymentMethod === 'QRIS' && (
                      <div className="bg-blue-sail text-ballroom p-5 border-3 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] text-center space-y-3">
                        <div className="border-b border-ballroom/20 pb-2">
                          <span className="font-display font-black text-sm text-decor uppercase tracking-wider">
                            SCAN QRIS PEMBAYARAN
                          </span>
                        </div>
                        <img 
                          src="/qristsf.jpeg" 
                          alt="QRIS Pembayaran" 
                          className="w-full max-w-[250px] mx-auto border-4 border-ballroom rounded-lg shadow-lg"
                        />
                      </div>
                    )}

                    <div className="space-y-1 pt-4">
                      <label className="font-mono text-sm font-bold text-blue-sail uppercase block">Link Google Drive Bukti Pembayaran</label>
                      <p className="text-xs text-blue-sail/70 mb-1">Pastikan link dapat diakses publik (Anyone with the link can view).</p>
                      <input
                        type="url"
                        value={form.paymentProofUrl}
                        onChange={e => updateField('paymentProofUrl', e.target.value)}
                        className={`w-full bg-gray-50 border-2 p-3 font-sans outline-none focus:border-decor transition-colors ${errors.paymentProofUrl ? 'border-red-500' : 'border-blue-sail'}`}
                        placeholder="https://drive.google.com/..."
                      />
                      {errors.paymentProofUrl && <p className="text-red-500 text-xs font-mono">{errors.paymentProofUrl}</p>}
                    </div>

                    <div className="pt-6 flex justify-between">
                      <button
                        onClick={() => {
                          setStep('form-data');
                          scrollToFormSection();
                        }}
                        className="text-blue-sail font-mono font-bold hover:underline py-3 px-4"
                        disabled={isSubmitting}
                      >
                        ← Kembali
                      </button>
                      <button
                        onClick={() => {
                          if (validatePayment()) {
                            handleSubmit();
                          }
                        }}
                        disabled={isSubmitting}
                        className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xl px-8 py-3 border-4 border-blue-sail shadow-[4px_4px_0_0_#1E2A4F] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#1E2A4F] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                      >
                        {isSubmitting ? 'Mengirim...' : 'Submit Final'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP: SUCCESS */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-6"
                  >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-decor rounded-full text-blue-sail border-4 border-blue-sail shadow-[4px_4px_0_0_#1E2A4F] mb-4">
                      <Icon name="CheckCircle" size={48} />
                    </div>
                    <h3 className="font-display font-black text-3xl text-blue-sail uppercase">
                      🎉 Yeay, pembayaran kamu berhasil dikirim!
                    </h3>
                    <div className="font-sans text-lg text-blue-sail/80 max-w-xl mx-auto space-y-4">
                      <p>
                        Tim kami akan mengecek bukti pembayaranmu. Jika sudah sesuai dan tim TSF verifikasi, e-ticket akan dikirim ke email yang kamu daftarkan. 
                      </p>
                      <p>
                        Mohon cek inbox dan folder spam secara berkala, yaaa!
                      </p>
                    </div>
                    
                    <div className="bg-amber-100 border-l-4 border-amber-500 p-4 max-w-xl mx-auto text-left mt-6 flex gap-3">
                      <Icon name="AlertTriangle" size={24} className="text-amber-500 shrink-0" />
                      <p className="text-sm text-amber-800">
                        <strong>⚠️ PENTING:</strong> Tiket adalah bukti masuk acara. Simpan/unduh tiket yang kamu terima lewat email.
                      </p>
                    </div>

                    <div className="pt-8">
                      <button
                        onClick={() => {
                          setStep('info');
                          setForm(INITIAL_FORM);
                          window.scrollTo(0, 0);
                        }}
                        className="bg-blue-sail hover:bg-blue-sail/90 text-white font-mono font-bold px-8 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#F6BB02] transition-all"
                      >
                        Kembali ke Halaman Utama
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
