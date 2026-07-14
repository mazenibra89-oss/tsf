import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppState, 
  EventPhase, 
  Division, 
  StaffApplication, 
  SubEvent, 
  Competition, 
  CompetitionRegistration, 
  ThriftProduct, 
  ThriftVendor, 
  VendorApplication 
} from '../types';

interface AppContextType extends AppState {
  setActivePhase: (phaseName: EventPhase['name']) => void;
  updatePhase: (phase: EventPhase) => void;
  
  // Staff
  addStaffApplication: (app: Omit<StaffApplication, 'id' | 'status' | 'submitted_at'>) => void;
  updateStaffApplicationStatus: (id: string, status: StaffApplication['status']) => void;
  addDivision: (div: Omit<Division, 'id'>) => void;
  updateDivision: (div: Division) => void;
  deleteDivision: (id: string) => void;
  
  // PE1 & PE2
  updateSubEvent: (event: SubEvent) => void;
  
  // Competitions
  addCompetition: (comp: Omit<Competition, 'id'>) => void;
  updateCompetition: (comp: Competition) => void;
  deleteCompetition: (id: string) => void;
  addCompetitionRegistration: (reg: Omit<CompetitionRegistration, 'id' | 'submitted_at'>) => void;
  
  // Thrift
  addThriftVendor: (vendor: Omit<ThriftVendor, 'id'>) => void;
  updateThriftVendor: (vendor: ThriftVendor) => void;
  deleteThriftVendor: (id: string) => void;
  addThriftProduct: (prod: Omit<ThriftProduct, 'id'>) => void;
  updateThriftProduct: (prod: ThriftProduct) => void;
  deleteThriftProduct: (id: string) => void;
  addVendorApplication: (app: Omit<VendorApplication, 'id' | 'submitted_at'>) => void;
  
  // Reset
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_PHASES: EventPhase[] = [
  {
    id: 'p-1',
    name: 'staff_recruitment',
    label: 'Perekrutan Staff',
    status: 'active',
    start_date: '2026-07-01',
    end_date: '2026-07-15',
    description: 'Buka peluang karir organisasi & kepanitiaan bersama tim TSF! Pilih divisi impianmu sekarang.',
    cta_link: '/staff'
  },
  {
    id: 'p-2',
    name: 'pe1',
    label: 'Pre-Event 1 (PE1)',
    status: 'upcoming',
    start_date: '2026-08-10',
    end_date: '2026-08-15',
    description: 'Coming Soon',
    cta_link: '/pe1'
  },
  {
    id: 'p-3',
    name: 'pe2',
    label: 'Pre-Event 2 (PE2)',
    status: 'upcoming',
    start_date: '2026-09-08',
    end_date: '2026-09-12',
    description: 'Coming Soon',
    cta_link: '/pe2'
  },
  {
    id: 'p-4',
    name: 'competition',
    label: 'Regist Competition',
    status: 'upcoming',
    start_date: '2026-09-20',
    end_date: '2026-10-10',
    description: 'Coming Soon',
    cta_link: '/competition'
  },
  {
    id: 'p-5',
    name: 'thrift',
    label: 'Thrift',
    status: 'upcoming',
    start_date: '2026-10-25',
    end_date: '2026-10-30',
    description: 'Coming Soon',
    cta_link: '/thrift'
  }
];

const SEED_DIVISIONS: Division[] = [
  {
    id: 'd-1',
    name: 'Divisi Event',
    description: 'Divisi paling sibuk tapi paling seru! Bertugas jadi juru rancang sekaligus nahkoda dari semua sub-event TSF 2026. Mulai dari bikin konsep kece, koordinasi antar tim, sampai memastikan semua acara berjalan tanpa drama',
    quota: 25,
    icon_name: 'CalendarRange',
    sub_divisions: [
      'Sub Divisi Event - Competition',
      'Sub Divisi Non Competition'
    ]
  },
  {
    id: 'd-2',
    name: 'Divisi Operational',
    description: 'Divisi Operational bertugas memastikan segala kebutuhan teknis acara berjalan dengan baik dan lancar. Mulai dari pengadaan barang, perizinan tempat, keamanan, hingga konsumsi dan kesehatan peserta maupun panitia. Divisi ini jadi garda terdepan dalam memastikan acara berlangsung tanpa hambatan.',
    quota: 35,
    icon_name: 'Wrench',
    sub_divisions: [
      'Sub Divisi Operasional - Logistic, Technical, Equipment (LTE)',
      'Sub Divisi Operasional - Secure & Licence',
      'Sub Divisi Operasional - Health & Consumption'
    ]
  },
  {
    id: 'd-3',
    name: 'Divisi Data Management',
    description: 'Divisi Data Management adalah divisi yang bertanggung jawab dalam mengelola, menghimpun, dan menyimpan seluruh data yang dibutuhkan untuk kelancaran TSF 2026.',
    quota: 10,
    icon_name: 'Database'
  },
  {
    id: 'd-4',
    name: 'Divisi Branding & Marketing',
    description: 'Divisi paling pecah yang bikin TSF tampil kece di semua sisi, mulai dari desain yang estetik, konten yang ngena, sampe campaign yang bikin semua mata tertuju.',
    quota: 20,
    icon_name: 'Megaphone',
    sub_divisions: [
      'Sub Divisi BnM - Creative Design',
      'Sub Divisi BnM - Media Production',
      'Sub Divisi BnM - Divisi Marketing Strategist',
      'Sub Divisi BnM - Talent Management'
    ]
  },
  {
    id: 'd-5',
    name: 'Divisi Decoration',
    description: 'Nguli is my life, moto hidup divisi dekorasi. Divisi ini merupakan bagian penting yang bertanggung jawab dalam menyediakan dekorasi penunjang acara melalui proses merancang, pengerjaan, serta pemasangan dekorasi untuk seluruh rangkaian acara di TDC Summit Fest 2026, elemen utama yang menjadi fokus pengerjaan divisi dekorasi yaitu gate, stage, dan photobooth. Selain itu divisi ini juga menerima request pembuatan dekorasi yang dapat disesuaikan untuk kebutuhan acara',
    quota: 15,
    icon_name: 'Palette'
  },
  {
    id: 'd-6',
    name: 'Divisi Finance',
    description: "Tim yang paling sering ngomong: 'Mana nota-nya?' Ngurus alur duit masuk dan keluar dengan rapi, teliti, dan penuh cinta. Jago nyusun anggaran, bayar-bayaran, dan ngatur laporan keuangan. Mereka bukan pelit, mereka hati-hati. Kalo kamu minta dana, pastikan kamu siap jawab: 'Buat apa ya?'",
    quota: 12,
    icon_name: 'BadgeDollarSign',
    sub_divisions: [
      'Sub Divisi Finance - Fundraising',
      'Sub Divisi Finance - Sponsorship'
    ]
  },
  {
    id: 'd-7',
    name: 'Divisi Public Relation',
    description: 'Si Social Butterfly nya TSF 🦋🫧 Jadi wajah naratamu dari juri, pihak sponsor, ataupun stakeholder dari ITS!!! Dijamin masuk Public Relation, relasi nya auto menggokill abieszz 😝‼️Profesional Extrovert yang siap jadi koordinator dan contact person yang siap menjawab seluruh pertanyaan pihak luar ke Panit TSF 26 pastinya 📞💥',
    quota: 10,
    icon_name: 'MessageSquareShare'
  }
];

const SEED_SUB_EVENTS: SubEvent[] = [
  {
    id: 's-1',
    slug: 'pe1',
    title: 'TSF Spark: Kickoff Concert & Talkshow',
    description: 'Pembukaan resmi rangkaian TSF yang menggabungkan keseruan konser musik akustik dengan diskusi otomotif inspiratif. TSF Spark bertujuan menyulut semangat anak muda dan pencinta otomotif tanah air.',
    date: 'Sabtu, 15 Agustus 2026',
    location: 'Auditorium Kampus Merdeka, Jakarta',
    status: 'upcoming',
    lineup: [
      {
        name: 'Fiersa Besari',
        role: 'Musician & Indie Icon',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Gita Savitri',
        role: 'Youth Influencer & Creator',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      }
    ],
    schedule: [
      { time: '13:00 - 13:45', activity: 'Gate Open & Registrasi Peserta' },
      { time: '13:45 - 14:00', activity: 'Opening Act: Local Indie Band' },
      { time: '14:00 - 15:30', activity: 'Youth & Automotive Talkshow: "Innovate the Future"' },
      { time: '15:30 - 16:30', activity: 'Intimate Concert by Fiersa Besari' },
      { time: '16:30 - 17:00', activity: 'Merchandise Giveaway & Foto Bersama' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 's-2',
    slug: 'pe2',
    title: 'TSF Rev-Up: Car Meet & Drift Workshop',
    description: 'Pre-event kedua yang didedikasikan sepenuhnya untuk pecinta kecepatan dan gaya hidup motorsport. Menampilkan pameran modifikasi mobil, pertunjukan drift langsung oleh pembalap profesional, serta workshop mendalam.',
    date: 'Sabtu, 12 September 2026',
    location: 'Area Parkir Timur Plaza Bangsa, Jakarta',
    status: 'upcoming',
    lineup: [
      {
        name: 'Fitra Eri',
        role: 'National Racer & Auto Reviewer',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Ridwan Hanif',
        role: 'Automotive Journalist & Petrolhead',
        imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      }
    ],
    schedule: [
      { time: '09:00 - 10:00', activity: 'Roll-in Car Exhibition (Classic & Motorsport)' },
      { time: '10:00 - 11:30', activity: 'Car Modding Workshop with Ridwan Hanif' },
      { time: '12:30 - 14:00', activity: 'National Drift Talk with Fitra Eri' },
      { time: '14:30 - 16:00', activity: 'Live Drift Demonstration & Drift Ride Along' },
      { time: '16:00 - 17:00', activity: 'Best Car Modification Awards & Closing' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1562591176-47f2e21b1990?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617469767053-d3b508a0d1e5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

const SEED_COMPETITIONS: Competition[] = [
  {
    id: 'c-1',
    title: 'Battle of the Bands',
    description: 'Panggung ekspresi grup musik indie, rock, pop, atau genre lainnya untuk menunjukkan performa terbaik mereka di hadapan juri profesional nasional.',
    category: 'Musik',
    terms: [
      'Terbuka untuk pelajar, mahasiswa, dan umum (usia maksimal 25 tahun).',
      'Satu tim terdiri dari minimal 3 orang dan maksimal 7 orang.',
      'Membawakan 1 lagu wajib bertema semangat/energetik dan 1 lagu bebas (orisinal atau cover).',
      'Durasi penampilan maksimal 15 menit (termasuk check sound).'
    ],
    prize: 'Rp 15.000.000 + Piala Tetap + Sertifikat Nasional',
    timeline: [
      { step: 'Pendaftaran & Upload Video', date: '20 Sept - 10 Okt 2026' },
      { step: 'Pengumuman Finalis Top 10', date: '15 Oktober 2026' },
      { step: 'Technical Meeting Finalis', date: '18 Oktober 2026' },
      { step: 'Grand Final (Live Stage TSF)', date: '28 Oktober 2026' }
    ],
    guidebook_url: '#',
    status: 'upcoming'
  },
  {
    id: 'c-2',
    title: 'Street Dance League',
    description: 'Kompetisi tarian jalanan (street dance) yang menuntut kreativitas koreografi, dinamika tim, sinkronisasi musik, dan aura motorsport yang tangguh.',
    category: 'Tari / Art',
    terms: [
      'Terbuka untuk umum (kategori grup).',
      'Anggota grup minimal 4 orang dan maksimal 10 orang.',
      'Gaya tarian bebas (Hip-hop, Breakdance, Popping, Locking, dll) dengan menyertakan unsur sporty.',
      'Karya koreografi berdurasi 3 - 5 menit.'
    ],
    prize: 'Rp 10.000.000 + Piala + Golden Ticket Workshop',
    timeline: [
      { step: 'Pendaftaran & Upload Karya', date: '20 Sept - 10 Okt 2026' },
      { step: 'Kurasi Babak Penyisihan', date: '14 Oktober 2026' },
      { step: 'Live Showcase Final TSF', date: '29 Oktober 2026' }
    ],
    guidebook_url: '#',
    status: 'upcoming'
  },
  {
    id: 'c-3',
    title: 'Sim Racing Grand Prix',
    description: 'Kompetisi balap virtual simulator menggunakan trek sirkuit legendaris dunia. Menguji reflek berkendara, teknik overtake, dan konsistensi kecepatan pembalap.',
    category: 'E-Sports',
    terms: [
      'Terbuka untuk perorangan umum.',
      'Wajib menggunakan perangkat simulator yang disediakan panitia saat Grand Final.',
      'Platform game: Assetto Corsa / Gran Turismo (sesuai TM).',
      'Wajib menjunjung tinggi nilai sportivitas balap (clean racing).'
    ],
    prize: 'Rp 12.000.000 + Simulator Gear Pack + Sertifikat',
    timeline: [
      { step: 'Pendaftaran & Kualifikasi Waktu', date: '20 Sept - 05 Okt 2026' },
      { step: 'Top 32 Quarter Finals', date: '12 Oktober 2026' },
      { step: 'Top 8 Grand Final (Venue TSF)', date: '30 Oktober 2026' }
    ],
    guidebook_url: '#',
    status: 'upcoming'
  }
];

const SEED_VENDORS: ThriftVendor[] = [
  {
    id: 'v-1',
    vendor_name: 'Veloce Vintage Apparel',
    booth_location: 'Booth Utama A-1',
    contact: '6281234567890',
    status: 'active'
  },
  {
    id: 'v-2',
    vendor_name: 'Retro Racing Store',
    booth_location: 'Booth Koridor B-3',
    contact: '6289876543210',
    status: 'active'
  },
  {
    id: 'v-3',
    vendor_name: 'Throttle & Pistons Club',
    booth_location: 'Booth Outdoor C-1',
    contact: '6287712345678',
    status: 'active'
  }
];

const SEED_PRODUCTS: ThriftProduct[] = [
  {
    id: 'p-101',
    name: 'Vintage Ferrari F1 Team Jacket (1998)',
    price: 450000,
    condition: '9.2/10 Excellent condition, no stains',
    category: 'clothing',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-1',
    status: 'available'
  },
  {
    id: 'p-102',
    name: 'Retro Goodyear Racing Crewneck',
    price: 280000,
    condition: '9/10 Flawless vintage look, size L',
    category: 'clothing',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-2',
    status: 'available'
  },
  {
    id: 'p-103',
    name: 'Official Sparco Racing Cap Black',
    price: 150000,
    condition: 'Like New, tag still attached',
    category: 'accessories',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-3',
    status: 'available'
  },
  {
    id: 'p-104',
    name: 'Adidas Motorsport Racing Boots',
    price: 750000,
    condition: '8.5/10 Some creases, rare edition',
    category: 'shoes',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-1',
    status: 'available'
  },
  {
    id: 'p-105',
    name: 'Yamaha Marlboro Retro Leather Jacket',
    price: 950000,
    condition: '9.5/10 Premium heavy leather, authentic',
    category: 'clothing',
    image_url: 'https://images.unsplash.com/photo-1521223869279-371899549888?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-3',
    status: 'available'
  },
  {
    id: 'p-106',
    name: 'Michelin Man Classic Logo Belt Bag',
    price: 180000,
    condition: '9/10 Unique merch item, sturdy canvas',
    category: 'accessories',
    image_url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600',
    vendor_id: 'v-2',
    status: 'available'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('tsf_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedPhases = (parsed.phases || []).map((p: any) => {
          const seed = SEED_PHASES.find(s => s.name === p.name);
          if (seed) {
            return {
              ...p,
              label: seed.label,
              description: seed.description
            };
          }
          return p;
        });
        return {
          ...parsed,
          phases: mergedPhases.length > 0 ? mergedPhases : SEED_PHASES,
          divisions: SEED_DIVISIONS
        };
      } catch (e) {
        console.error('Failed to parse local storage tsf_state:', e);
      }
    }
    return {
      phases: SEED_PHASES,
      divisions: SEED_DIVISIONS,
      staffApplications: [],
      subEvents: SEED_SUB_EVENTS,
      competitions: SEED_COMPETITIONS,
      competitionRegistrations: [],
      thriftProducts: SEED_PRODUCTS,
      thriftVendors: SEED_VENDORS,
      vendorApplications: []
    };
  });

  useEffect(() => {
    localStorage.setItem('tsf_state', JSON.stringify(state));
  }, [state]);

  const resetToDefault = () => {
    setState({
      phases: SEED_PHASES,
      divisions: SEED_DIVISIONS,
      staffApplications: [],
      subEvents: SEED_SUB_EVENTS,
      competitions: SEED_COMPETITIONS,
      competitionRegistrations: [],
      thriftProducts: SEED_PRODUCTS,
      thriftVendors: SEED_VENDORS,
      vendorApplications: []
    });
  };

  const setActivePhase = (phaseName: EventPhase['name']) => {
    setState(prev => {
      const updatedPhases = prev.phases.map(p => {
        if (p.name === phaseName) {
          return { ...p, status: 'active' as const };
        } else {
          return { ...p, status: p.status === 'active' ? 'closed' as const : p.status };
        }
      });
      
      // Auto synchronize other models based on active phase
      const updatedCompetitions = prev.competitions.map(c => {
        if (phaseName === 'competition') {
          return { ...c, status: 'active' as const };
        } else if (phaseName === 'thrift') {
          return { ...c, status: 'closed' as const };
        }
        return c;
      });

      return {
        ...prev,
        phases: updatedPhases,
        competitions: updatedCompetitions
      };
    });
  };

  const updatePhase = (updated: EventPhase) => {
    setState(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === updated.id ? updated : p)
    }));
  };

  // Staff application management
  const addStaffApplication = (app: Omit<StaffApplication, 'id' | 'status' | 'submitted_at'>) => {
    const newApp: StaffApplication = {
      ...app,
      id: `app-s-${Date.now()}`,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      staffApplications: [newApp, ...prev.staffApplications]
    }));
  };

  const updateStaffApplicationStatus = (id: string, status: StaffApplication['status']) => {
    setState(prev => ({
      ...prev,
      staffApplications: prev.staffApplications.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  const addDivision = (div: Omit<Division, 'id'>) => {
    const newDiv: Division = {
      ...div,
      id: `d-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      divisions: [...prev.divisions, newDiv]
    }));
  };

  const updateDivision = (div: Division) => {
    setState(prev => ({
      ...prev,
      divisions: prev.divisions.map(d => d.id === div.id ? div : d)
    }));
  };

  const deleteDivision = (id: string) => {
    setState(prev => ({
      ...prev,
      divisions: prev.divisions.filter(d => d.id !== id)
    }));
  };

  // Sub Events PE1 & PE2
  const updateSubEvent = (updated: SubEvent) => {
    setState(prev => ({
      ...prev,
      subEvents: prev.subEvents.map(e => e.id === updated.id ? updated : e)
    }));
  };

  // Competitions
  const addCompetition = (comp: Omit<Competition, 'id'>) => {
    const newComp: Competition = {
      ...comp,
      id: `c-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      competitions: [...prev.competitions, newComp]
    }));
  };

  const updateCompetition = (comp: Competition) => {
    setState(prev => ({
      ...prev,
      competitions: prev.competitions.map(c => c.id === comp.id ? comp : c)
    }));
  };

  const deleteCompetition = (id: string) => {
    setState(prev => ({
      ...prev,
      competitions: prev.competitions.filter(c => c.id !== id)
    }));
  };

  const addCompetitionRegistration = (reg: Omit<CompetitionRegistration, 'id' | 'submitted_at'>) => {
    const newReg: CompetitionRegistration = {
      ...reg,
      id: `reg-c-${Date.now()}`,
      submitted_at: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      competitionRegistrations: [newReg, ...prev.competitionRegistrations]
    }));
  };

  // Thrift Vendor & Catalog Product
  const addThriftVendor = (vendor: Omit<ThriftVendor, 'id'>) => {
    const newVendor: ThriftVendor = {
      ...vendor,
      id: `v-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      thriftVendors: [...prev.thriftVendors, newVendor]
    }));
  };

  const updateThriftVendor = (vendor: ThriftVendor) => {
    setState(prev => ({
      ...prev,
      thriftVendors: prev.thriftVendors.map(v => v.id === vendor.id ? vendor : v)
    }));
  };

  const deleteThriftVendor = (id: string) => {
    setState(prev => ({
      ...prev,
      thriftVendors: prev.thriftVendors.filter(v => v.id !== id),
      thriftProducts: prev.thriftProducts.filter(p => p.vendor_id !== id) // cascade delete products from vendor
    }));
  };

  const addThriftProduct = (prod: Omit<ThriftProduct, 'id'>) => {
    const newProd: ThriftProduct = {
      ...prod,
      id: `p-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      thriftProducts: [newProd, ...prev.thriftProducts]
    }));
  };

  const updateThriftProduct = (prod: ThriftProduct) => {
    setState(prev => ({
      ...prev,
      thriftProducts: prev.thriftProducts.map(p => p.id === prod.id ? prod : p)
    }));
  };

  const deleteThriftProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      thriftProducts: prev.thriftProducts.filter(p => p.id !== id)
    }));
  };

  const addVendorApplication = (app: Omit<VendorApplication, 'id' | 'submitted_at'>) => {
    const newApp: VendorApplication = {
      ...app,
      id: `app-v-${Date.now()}`,
      submitted_at: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      vendorApplications: [newApp, ...prev.vendorApplications]
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setActivePhase,
      updatePhase,
      addStaffApplication,
      updateStaffApplicationStatus,
      addDivision,
      updateDivision,
      deleteDivision,
      updateSubEvent,
      addCompetition,
      updateCompetition,
      deleteCompetition,
      addCompetitionRegistration,
      addThriftVendor,
      updateThriftVendor,
      deleteThriftVendor,
      addThriftProduct,
      updateThriftProduct,
      deleteThriftProduct,
      addVendorApplication,
      resetToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
