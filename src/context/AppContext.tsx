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
  VendorApplication,
  FormQuestionsConfig
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

  // Form Questions Control
  updateFormQuestions: (config: FormQuestionsConfig) => void;

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

const SEED_FORM_QUESTIONS: FormQuestionsConfig = {
  dataDiri: [
    { id: 'fullName', label: 'Nama Lengkap', placeholder: 'Nama lengkap sesuai KTM/KTP', required: true },
    { id: 'nim', label: 'NRP', placeholder: 'Contoh: 5025211044', required: true },
    { id: 'faculty', label: 'Fakultas', placeholder: '-- Pilih Fakultas --', required: true },
    { id: 'department', label: 'Departemen', placeholder: 'Contoh: Teknik Informatika', required: true },
    { id: 'phone', label: 'No. WA (WhatsApp)', placeholder: 'Contoh: 08123456789', required: true },
    { id: 'email', label: 'Email', placeholder: 'Contoh: mazen@student.ac.id', required: true }
  ],
  generalTask: [
    { id: 'generalKnowledge', text: 'Apa yang kamu ketahui tentang TDC Summit Fest 2026?', type: 'text', placeholder: 'Jelaskan pemahaman singkat kamu tentang acara ini...', required: true },
    { id: 'generalMotivation', text: 'Apa motivasi kamu mendaftar Sebagai bagian dari TDC Summit Fest 2026?', type: 'text', placeholder: 'Jelaskan ketertarikan, motivasi, dan apa yang ingin kamu capai...', required: true },
    { id: 'experience', text: 'Apakah kamu memiliki pengalaman dalam kepanitiaan atau organisasi? jika iya, sebutkan & jelaskan secara singkat jobdesk kamu', type: 'text', placeholder: 'Sebutkan nama kepanitian/organisasi beserta tugas/jobdesk kamu. Jika belum ada, tuliskan \'Tidak ada\'...', required: true },
    { id: 'strengthsWeaknesses', text: 'Sebutkan kelebihan & kekurangan kamu', type: 'text', placeholder: 'Jelaskan secara realistis kelebihan dan kekurangan yang kamu miliki...', required: true },
    { id: 'commitmentScale', text: 'Komitment kamu untuk TDC Summit Fest 2026 (Skala 0-10)', type: 'text', required: true },
    { id: 'paidIkoma', text: 'Apakah Sudah Bayar Ikoma ITS?', type: 'text', required: true },
    { id: 'commitmentForm', text: 'Jelaskan apa bentuk komitmen kamu untuk TSF 2026', type: 'text', placeholder: 'Jelaskan kontribusi waktu, tenaga, dan kesiapan kamu berkontribusi...', required: true },
    { id: 'busySchedule', text: 'Apa saja kesibukan kamu saat ini dan 5 bulan kedepan', type: 'text', placeholder: 'Contoh: Kuliah, Praktikum, Organisasi lain, Magang, Tugas Akhir...', required: true },
    { id: 'relations', text: 'Apakah Kamu Memiliki Relasi Kenalan/Perusahaan', type: 'text', placeholder: 'Sebutkan relasi alumni, media partner, pembicara, sponsor, atau perusahaan. Jika tidak ada, tuliskan \'Tidak ada\'...', required: true }
  ],
  berkas: [
    { id: 'ktmKrsLink', label: 'KTM / KRSM (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true },
    { id: 'cvLink', label: 'CV / Curriculum Vitae (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true },
    { id: 'repostLink', label: 'Repost Oprec SG (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true },
    { id: 'twibbonLink', label: 'Twibbon (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true },
    { id: 'igFollowLink', label: 'Bukti Follow Instagram @tdcits & @tdcsummitfest (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true },
    { id: 'tiktokFollowLink', label: 'Bukti Follow Tiktok @tdcits & @tdcsummitfest (Link Drive)', placeholder: 'Contoh: drive.google.com/...', required: true }
  ],
  divisionTasks: {
    'Sub Divisi Event - Competition': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang Sub Divisi Competition TSF?', type: 'text' },
      { id: 'q2', text: 'Apakah kamu pernah mengikuti sebuah perlombaan ataupun kepanitiaan yang berhubungan dengan BCC ataupun BPC?', type: 'text' },
      { id: 'q3', text: 'Study Case: Mendatangkan juri profesional untuk sebuah kompetisi seringkali terkendala anggaran yang terbatas dan waktu persiapan yang sempit. Jika kamu menjadi Kasub Competition, bagaimana strategimu untuk mendapatkan juri yang kompeten secara tepat waktu tanpa bergantung pada anggaran besar? Dan jelaskan mengapa itu realistis untuk dijalankan.', type: 'text' },
      { id: 'q4', text: 'Study Case: Setelah seluruh tim melakukan pitching, panitia menemukan adanya perbedaan skor yang sangat jauh dari salah satu juri dibanding dua juri lainnya pada beberapa peserta. Akibatnya, muncul perubahan besar pada peringkat akhir. Salah satu juri juga telah meninggalkan venue sehingga tidak dapat langsung dimintai klarifikasi, sedangkan pengumuman pemenang dijadwalkan dalam waktu 30 menit. Di sisi lain, peserta mulai menanyakan kapan hasil akan diumumkan. Sebagai Staff Divisi Kompetisi BPC, bagaimana langkah yang akan kamu ambil untuk menangani situasi tersebut?', type: 'text' },
      { id: 'q5', text: 'Study Case: Sebagai bagian dari divisi Event Competition, kamu dihadapkan pada situasi dimana H-1 bulan acara, tim kamu masih belum mendapatkan case collaborator untuk lomba yang menjadi core event. Beberapa collaborator yang sebelumnya dijanjikan tiba-tiba membatalkan komitmennya secara sepihak, sementara panitia inti sudah mengumumkan jadwal ke seluruh peserta dan sponsor sudah mengaitkan nama brand mereka dengan case tersebut. Tanpa case ini, seluruh rangkaian kompetisi terancam tidak bisa berjalan sesuai jadwal, dan risiko reputasi acara di mata peserta maupun sponsor sangat tinggi. Apa langkah konkret pertama yang akan kamu ambil dalam 24 jam ke depan, dan bagaimana kamu menyusun contingency plan jika case collaborator benar-benar tidak bisa didapatkan tepat waktu? Pihak mana saja yang perlu dilibatkan di setiap tahap keputusan, dan bagaimana kamu membagi tanggung jawab agar tidak terjadi miskomunikasi antar divisi?', type: 'text' }
    ],
    'Sub Divisi Non Competition': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang sub-divisi event non competition ini?', type: 'text' },
      { id: 'q2', text: 'Ceritakan pengalaman kamu yang relevan dengan sub-divisi non competition ini, termasuk peran spesifikmu, tanggung jawab, dan lain sebagainya.', type: 'text' },
      { id: 'q3', text: 'Jika kamu bergabung sebagai staff divisi ini, ide atau inovasi apa yang ingin kamu implementasikan?', type: 'text' },
      { id: 'q4', text: 'Study Case: Saat Hari-H acara, 30 menit sebelum acara dimulai, kamu menghadapi beberapa masalah berikut secara bersamaan: 1) Snack untuk 200 peserta baru sampai setengahnya (kurang 100 porsi), 2) Pengisi acara (guest star) mengalami kendala di perjalanan yang diprediksi akan terlambat 45 menit dari jadwal seharusnya, 3) Terjadi miskomunikasi dengan divisi operasional sehingga hadiah yang seharusnya diberikan untuk kategori peserta tertentu ternyata belum disiapkan. Bagaimana kamu mengurutkan prioritas masalah tersebut dan cara kamu mengatasinya?', type: 'text' },
      { id: 'q5', text: 'Study Case: Sub-divisi Non Competition sedang mempersiapkan workshop yang akan dilaksanakan dalam waktu 7 hari. Namun, terdapat dua anggota yang belum menyelesaikan tugasnya sesuai timeline sehingga berpotensi menghambat persiapan acara. Sebagai bagian dari tim, langkah apa yang akan kamu lakukan untuk memastikan seluruh persiapan tetap berjalan sesuai rencana?', type: 'text' },
      { id: 'q6', text: 'Study Case: Pengisi acara utama sebagai pembicara webinar yang sudah dipromosikan sejak 2 minggu lalu (dengan namanya jadi daya tarik utama di poster dan campaign) tiba-tiba mengabarkan tidak bisa hadir H-1 karena sakit. Kamu sudah coba hubungi 2 kontak pengganti, tapi satu tidak merespons dan satu lagi available namun minta waktu persiapan yang tidak realistis. Sementara itu, kamu perlu mempersiapkan pembicara pengganti untuk acara tersebut kurang dari 24 jam. Materi promosi sudah terlanjur disebar dengan nama pembicara awal. Keputusan apa yang kamu ambil, dan bagaimana kamu mengomunikasikannya ke tim dan peserta yang sudah mendaftar?', type: 'text' }
    ],
    'Sub Divisi Operasional - Logistic, Technical, Equipment (LTE)': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang divisi logistik?', type: 'text' },
      { id: 'q2', text: 'Apa motivasimu mendaftar ke divisi logistik?', type: 'text' },
      { id: 'q3', text: 'Apakah kamu mempunyai pengalaman sebelumnya di divisi logistik dalam sebuah acara?', type: 'text' },
      { id: 'q4', text: 'Study Case: Bagaimana caramu mengatasi permasalahan ketika setelah berlangsungnya acara dan akan melakukan pengembalian barang yang kita pinjam atau sewa dari instansi luar mengalami kerusakan ataupun hilang?', type: 'text' },
      { id: 'q5', text: 'Study Case: Jika ada suatu kondisi dimana salah satu divisi ingin request barang tetapi tidak mematuhi SOP yang telah diberikan (tiba-tiba ganti barang melewati batas waktu yang ditentukan dan tidak ada konfirmasi ke CP yang tertera), bagaimana sikapmu sebagai divisi logistik dalam menanggapi masalah ini?', type: 'text' },
      { id: 'q6', text: 'Apakah anda mempunyai pickup (jadi nilai plus)?', type: 'select', options: ['Ya, punya', 'Tidak punya'] },
      { id: 'q7', text: 'Apakah bisa menyetir manual?', type: 'select', options: ['Ya, bisa menyetir manual', 'Tidak bisa'] },
      { id: 'q8', text: 'Kelebihan & Kekurangan diluar CV:', type: 'text' }
    ],
    'Sub Divisi Operasional - Secure & Licence': [
      { id: 'q1', text: 'Apa yang kamu ketahui dengan Security & License dan kenapa kamu memilih di divisi ini?', type: 'text' },
      { id: 'q2', text: 'Apakah kamu pernah melakukan peminjaman dan perizinan tempat kepada ditmawa ataupun kapada departemen? Jika pernah ceritakan.', type: 'text' },
      { id: 'q3', text: 'Apakah kamu memiliki pengalaman mengurus perizinan, keamanan, atau logistik acara?', type: 'text' },
      { id: 'q4', text: 'Study Case: Sempat terjadi kebakaran pada stop kontak yang dimana hampir saja membakar gedung. Dari kejadian tersebut apabila terjadi kejadian serupa dalam venue yang dimana mengakibatkan kepanikan yang terjadi pada peserta dan panitia, apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q5', text: 'Study Case: Saat acara berlangsung, ada oknum (baik dari luar maupun mahasiswa internal) yang memaksa masuk tanpa tiket/registrasi formal dan mulai memicu keributan dengan petugas di lapangan. Di sisi lain, kamu harus menjaga citra baik acara kampus. Bagaimana tindakan tegas namun taktis yang akan kamu ambil?', type: 'text' },
      { id: 'q6', text: 'Study Case: Pada saat hari h acara, kamu membutuhkan back up dari anggota lain namun terdapat kendala atau kerusakan pada alat komunikasi yang disediakan seperti HT. Apa yang anda lakukan sebagai mitigasi kendala tersebut?', type: 'text' }
    ],
    'Sub Divisi Operasional - Health & Consumption': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang subdivisi Health & Consumption?', type: 'text' },
      { id: 'q2', text: 'Apa Motivasi kamu memilih dan mendaftar di sub divisi Health & Consumption?', type: 'text' },
      { id: 'q3', text: 'Apakah kamu memiliki kenalan vendor konsumsi di sekitar surabaya dan ITS sebelumnya? Jika belum, bagaimana upayamu untuk mencari vendor?', type: 'text' },
      { id: 'q4', text: 'Apakah kamu punya pengalaman di bidang ini sebelumnya? Coba ceritakan pengalamanmu ketika mengelola konsumsi atau medis dalam suatu kegiatan. Apa tantangan terbesar yang kamu hadapi dan bagaimana cara kamu mengatasinya?', type: 'text' },
      { id: 'q5', text: 'Study Case: Bagaimana langkah kamu dalam menentukan dan mencari vendor yang tepat pada suatu acara? Sebutkan vendor yang pernah kamu ajak kerjasama.', type: 'text' },
      { id: 'q6', text: 'Study Case: Ketika pelaksanaan Pitching day terdapat perubahan rundown menjadi lebih cepat yang disebabkan oleh kelalaian divisi lain sehingga mempengaruhi jam makan siang, tindakan apa yang akan kamu lakukan agar peserta dapat mendapat konsumsi tepat waktu?', type: 'text' },
      { id: 'q7', text: 'Study Case: Saat jam makan siang, terdapat peserta yang mengalami gangguan alergi terhadap makanan yang disediakan. Tindakan apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q8', text: 'Study Case: Ketika saat acara ada peserta yang tiba-tiba pingsan, apa yang akan kamu lakukan sebagai staff Health?', type: 'text' },
      { id: 'q9', text: 'Study Case: Saat waktu pembagian konsumsi, jumlah konsumsi yang tersedia ternyata lebih sedikit dibandingkan jumlah peserta yang hadir. Sebagai staff Health & Consumption, apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q10', text: 'Study Case: Pada Hari-H vendor terlambat mengirim konsumsi sehingga jadwal makan peserta terancam mundur. Apa yang akan kamu lakukan sebagai staff Health & Consumption?', type: 'text' },
      { id: 'q11', text: 'Study Case: Saat pembagian konsumsi, beberapa peserta mengeluhkan bahwa mereka belum mendapatkan makanan, sementara ada peserta lain yang sudah mengambil lebih dari satu kali. Apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q12', text: 'Study Case: Saat sub divisi Health & Consumption sedang mulai bekerja atau ada tugas yang harus segera diselesaikan, tetapi di waktu yang sama kamu harus menghadiri rapat kepanitiaan lain. Apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q13', text: 'Apakah kamu mempunyai dan bisa mengendarai mobil/pickup?', type: 'select', options: ['Ya, punya & bisa menyetir mobil', 'Hanya punya', 'Hanya bisa menyetir', 'Tidak punya & tidak bisa'] },
      { id: 'q14', text: 'Bagaimana pola jam aktifmu sehari-hari? Di jam berapa biasanya kamu paling mudah dihubungi untuk berdiskusi atau merespons koordinasi? Mengingat koordinasi kepanitiaan terkadang dilakukan pada malam hari, apakah kamu bersedia menyesuaikan apabila diperlukan?', type: 'text' }
    ],
    'Divisi Data Management': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang divisi Data Management?', type: 'text' },
      { id: 'q2', text: 'Apa motivasi/alasan kamu mendaftar divisi Data Management?', type: 'text' },
      { id: 'q3', text: 'Study Case: Apakah kamu pernah memiliki pengalaman di divisi ini sebelumnya? Jika iya, ceritakan pengalaman dan jobdeskmu.', type: 'text' },
      { id: 'q4', text: 'Study Case: Pada saat rekapitulasi tiba-tiba kamu menemukan bahwa ada sebagian data yang tidak tercatat atau hilang, sebagai staff Data Management solusi apa yang akan kamu lakukan untuk mengatasi masalah tersebut? Dan apa langkah preventif yang akan kamu ambil untuk mencegah kejadian serupa di masa mendatang?', type: 'text' },
      { id: 'q5', text: 'Study Case: Kamu diberikan jobdesk yang mengharuskan kamu bekerja sama dengan rekan A. Tetapi rekan A sangat susah untuk dihubungi dan deadlinenya adalah malam ini. Pekerjaannya ngga bakal bisa kamu selesaiin sendiri karena datanya ada di dia. Apa yang akan kamu lakukan?', type: 'text' },
      { id: 'q6', text: 'Bagaimana cara kamu dalam mengelola data yang ada supaya terlihat rapi?', type: 'text' }
    ],
    'Sub Divisi Finance - Fundraising': [
      { id: 'q1', text: 'Menurutmu, apa peran utama dari subdivisi fundraise dalam mendukung acara TSF, dan bagaimana cara kerja tim yang baik?', type: 'text' },
      { id: 'q2', text: 'Menurut kamu, apa saja metode atau cara yang bisa digunakan subdivisi fundraise untuk menggalang dana dengan efisien?', type: 'text' },
      { id: 'q3', text: 'Study Case: Misalnya kamu diminta membuat strategi penjualan fundraise (seperti danusan, merchandise) untuk mencapai target dana 5 juta dalam waktu 3 minggu. Bagaimana langkah yang akan kamu ambil?', type: 'text' },
      { id: 'q4', text: 'Study Case: Dalam situasi penjualan yang menurun di minggu kedua (dari target 2 juta hanya tercapai 500 ribu), apa langkah yang kamu ambil untuk memperbaiki strategi penjualan?', type: 'text' }
    ],
    'Sub Divisi Finance - Sponsorship': [
      { id: 'q1', text: 'Menurutmu, siapa target market utama dari acara TSF, dan bagaimana karakteristik atau perilaku mereka?', type: 'text' },
      { id: 'q2', text: 'Menurut kamu, apa definisi dari sponsorship dalam konteks sebuah organisasi atau acara?', type: 'text' },
      { id: 'q3', text: 'Study Case: Bagaimana cara melakukan pendekatan awal kepada sebuah perusahaan yang menurut Anda berpotensi menjadi sponsor acara TSF? Dan poin penting apa saja yang akan kamu sampaikan di awal percakapan untuk menarik perhatian mereka?', type: 'text' }
    ],
    'Divisi Public Relation': [
      { id: 'q1', text: 'Apa yang kamu ketahui tentang Public Relation?', type: 'text' },
      { id: 'q2', text: 'Apa Motivasimu ingin bergabung dalam divisi Public Relation? Apakah kamu mempunyai pengalaman kepanitiaan/pekerjaan/organisasi dengan divisi Public Relation atau sejenisnya yang berhubungan dengan komunikasi dengan stakeholder? Jika ada ceritakan pengalamanmu.', type: 'text' },
      { id: 'q3', text: 'Study Case: Pada 30 menit sebelum acara dimulai, juri tiba tiba mengabarkan bahwa akan datang terlambat 2 jam, apa yang kamu lakukan sebagai staff public relation?', type: 'text' },
      { id: 'q4', text: 'Study Case: Sebagai tim PR, Anda baru saja diberitahu H-1 bahwa venue acara tiba-tiba membatalkan penyewaan dengan alasan internal. Apa yang Anda ambil untuk mengelola komunikasi dengan peserta, sponsor, dan media guna menjaga acara?', type: 'text' }
    ],
    'Sub Divisi BnM - Creative Design': [
      { id: 'q1', text: 'Sebutkan software desain grafis yang paling kamu kuasai dan seberapa mahir kamu menggunakannya?', type: 'text' },
      { id: 'q2', text: 'Bagaimana caramu menterjemahkan konsep \'Retro-Motorsport\' ke dalam desain feed Instagram?', type: 'text' },
      { id: 'q3', text: 'Study Case: Jika panitia inti meminta revisi desain poster utama H-1 jam sebelum publikasi massal, apa tindakan cepat yang kamu lakukan?', type: 'text' }
    ],
    'Sub Divisi BnM - Media Production': [
      { id: 'q1', text: 'Sebutkan portfolio video atau dokumentasi acara terbaik yang pernah kamu kerjakan sebelumnya.', type: 'text' },
      { id: 'q2', text: 'Bagaimana strategi penyusunan storyboard video teaser TSF 2026 agar terlihat megah dan estetik?', type: 'text' },
      { id: 'q3', text: 'Study Case: Saat hari-H sirkuit drift, kamera utamamu mengalami overheat di tengah cuaca panas. Bagaimana tindakan mitigasimu?', type: 'text' }
    ],
    'Sub Divisi BnM - Divisi Marketing Strategist': [
      { id: 'q1', text: 'Apa strategi pemasaran digital paling efektif untuk menggaet segmen penonton anak muda non-otomotif?', type: 'text' },
      { id: 'q2', text: 'Bagaimana cara mengoptimalkan engagement rate media sosial TSF selama masa pre-event?', type: 'text' },
      { id: 'q3', text: 'Study Case: Jika penjualan tiket festival melambat di pertengahan promosi, kampanye taktis apa yang akan kamu usulkan?', type: 'text' }
    ],
    'Sub Divisi BnM - Talent Management': [
      { id: 'q1', text: 'Bagaimana pengalamanmu dalam menghubungi atau bernegosiasi dengan manajer/pihak Guest Star?', type: 'text' },
      { id: 'q2', text: 'Apa saja poin penting dalam hospitality rider yang harus disiapkan untuk kenyamanan pengisi acara?', type: 'text' },
      { id: 'q3', text: 'Study Case: Guest Star utama tiba-tiba meminta fasilitas tambahan di luar kesepakatan kontrak sesaat sebelum tampil. Bagaimana sikapmu?', type: 'text' }
    ],
    'Divisi Decoration': [
      { id: 'q1', text: 'Bagaimana konsep visual dekorasi sirkuit balap retro yang ingin kamu terapkan pada area gate utama?', type: 'text' },
      { id: 'q2', text: 'Apakah kamu memiliki pengalaman dalam merakit instalasi dekorasi fisik berskala besar?', type: 'text' },
      { id: 'q3', text: 'Study Case: Bahan dekorasi utama mengalami keterlambatan pengiriman oleh kurir, sedangkan gladi resih akan dimulai 3 jam lagi. Bagaimana kamu menyiasatinya?', type: 'text' }
    ]
  }
};

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
          divisions: SEED_DIVISIONS,
          formQuestions: parsed.formQuestions || SEED_FORM_QUESTIONS
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
      vendorApplications: [],
      formQuestions: SEED_FORM_QUESTIONS
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
      vendorApplications: [],
      formQuestions: SEED_FORM_QUESTIONS
    });
  };

  const updateFormQuestions = (config: FormQuestionsConfig) => {
    setState(prev => ({
      ...prev,
      formQuestions: config
    }));
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
      updateFormQuestions,
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
