import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { Division, FormFieldConfig, QuestionConfig } from '../types';

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'select';
  options?: string[];
}

export const DEFAULT_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Apa yang kamu ketahui tentang divisi ini dan mengapa kamu tertarik untuk mendaftar?', type: 'text' },
  { id: 'q2', text: 'Sebutkan pengalaman kepanitiaan atau organisasi terdekat yang relevan dengan tugas divisi ini.', type: 'text' },
  { id: 'q3', text: 'Study Case: Jika ada tugas penting dari divisi ini yang berbenturan dengan jadwal kuliah atau kegiatan mendadak lainnya, bagaimana cara kamu membagi waktu dan menyelesaikannya?', type: 'text' }
];

export const DIVISION_QUESTIONS: Record<string, Question[]> = {
  'Sub Divisi Event - Competition': [
    { id: 'q1', text: 'Apa yang kamu ketahui tentang Sub Divisi Competition TSF?', type: 'text' },
    { id: 'q2', text: 'Apakah kamu pernah mengikuti sebuah perlombaan ataupun kepanitiaan yang berhubungan dengan BCC ataupun BPC?', type: 'text' },
    { id: 'q3', text: 'Study Case: Mendatangkan juri profesional untuk sebuah kompetisi seringkali terkendala anggaran yang terbatas dan waktu persiapan yang sempit. Jika kamu menjadi Kasub Competition, bagaimana strategimu untuk mendapatkan juri yang kompeten secara tepat waktu tanpa bergantung pada anggaran besar? Dan jelaskan mengapa itu realistis untuk dijalankan.', type: 'text' },
    { id: 'q4', text: 'Study Case: Setelah seluruh tim melakukan pitching, panitia menemukan adanya perbedaan skor yang sangat jauh dari salah satu juri dibanding dua juri lainnya pada beberapa peserta. Akibatnya, muncul perubahan besar pada peringkat akhir. Salah satu juri juga telah meninggalkan venue sehingga tidak dapat langsung dimintai klarifikasi, sedangkan pengumuman pemenang dijadwalkan dalam waktu 30 menit. Di sisi lain, peserta mulai menanyakan kapan hasil akan diumumkan. Sebagai Staff Divisi Kompetisi BPC, bagaimana langkah yang akan kamu ambil untuk menangani situasi tersebut?', type: 'text' },
    { id: 'q5', text: 'Study Case: Sebagai bagian dari divisi Event Competition, kamu dihadapkan pada situasi dimana H-1 bulan acara, tim kamu masih belum mendapatkan case collaborator untuk lomba yang menjadi core event. Beberapa collaborator yang sebelumnya dijanjikan tiba-tiba membatalkan komitmennya secara sepihak, sementara panitia inti sudah mengumumkan jadwal ke seluruh peserta dan sponsor sudah mengaitkan nama brand mereka dengan case tersebut. Tanpa case ini, seluruh rangkaian kompetisi terancam tidak bisa berjalan sesuai jadwal, dan risiko reputasi acara di mata peserta maupun sponsor sangat tinggi. Apa langkah konkret pertama yang akan kamu ambil dalam 24 jam ke depan, dan bagaimana kamu menyusun contingency plan jika case collaborator benar-benar tidak bisa didapatkan tepat waktu? Pihak mana saja yang perlu dilibatkan di setiap tahap keputusan, dan bagaimana kamu membagi tanggung jawab agar tidak terjadi miskomunikasi antar divisi?', type: 'text' }
  ],
  'Sub Divisi Event - Non Competition': [
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
};

const DIVISION_TASK_KEY_ALIASES: Record<string, string> = {
  'Sub Divisi Non Competition': 'Sub Divisi Event - Non Competition'
};

const DIVISION_CONTENT_KEY_ALIASES: Record<string, string> = {
  'Sub Divisi Non Competition': 'Sub Divisi Event - Non Competition'
};

const DATA_DIRI_FIELD_IDS = new Set(['fullName', 'nim', 'faculty', 'department', 'phone', 'email']);
const GENERAL_TASK_FIELD_IDS = new Set([
  'generalKnowledge',
  'generalMotivation',
  'experience',
  'strengthsWeaknesses',
  'commitmentScale',
  'paidIkoma',
  'commitmentForm',
  'busySchedule',
  'relations'
]);
const BERKAS_FIELD_IDS = new Set(['ktmKrsLink', 'cvLink', 'repostLink', 'twibbonLink', 'igFollowLink', 'tiktokFollowLink']);

export const getDivisionQuestions = (priorityName: string): Question[] => {
  if (!priorityName) return [];
  const normalizedKey = DIVISION_TASK_KEY_ALIASES[priorityName] || priorityName;
  return DIVISION_QUESTIONS[normalizedKey] || DEFAULT_QUESTIONS;
};

export const parseQuestionText = (text: string) => {
  const isStudyCase = text.toLowerCase().startsWith('study case:');
  let cleanText = text;
  if (isStudyCase) {
    cleanText = text.replace(/^study case:\s*/i, '');
  }

  // Support explicit delimiters '|||'
  if (cleanText.includes('|||')) {
    const parts = cleanText.split('|||');
    const background = parts[0]?.trim() || '';
    const rawQuestions = parts[1]?.trim() || '';
    const questions = rawQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    return {
      isStudyCase,
      background,
      questions,
      listItems: [],
      hasContent: text.trim().length > 0
    };
  }

  // Fallback to old heuristic parsing for backwards compatibility
  const hasNumberedList = /\b[1-9]\)\s/.test(cleanText);
  let introText = cleanText;
  const listItems: string[] = [];

  if (hasNumberedList) {
    const parts = cleanText.split(/\b[1-9]\)\s/);
    introText = parts[0];
    for (let i = 1; i < parts.length; i++) {
      listItems.push(parts[i].trim());
    }
  }

  // Now, let's separate context from the actual questions.
  const sentenceParts = introText.split(/(\. |\? |\! )/);

  const sentences: { text: string; isQuestion: boolean }[] = [];

  for (let i = 0; i < sentenceParts.length; i += 2) {
    const part = sentenceParts[i]?.trim();
    if (!part) continue;
    const punct = sentenceParts[i + 1] || '';
    const fullSentence = part + punct;

    const isQuestion = fullSentence.trim().endsWith('?') ||
      /^(bagaimana|apa|sebutkan|rancang|jelaskan|tindakan|keputusan|pihak|menurut|ceritakan|apakah|berapa)/i.test(fullSentence.trim());

    sentences.push({ text: fullSentence.trim(), isQuestion });
  }

  const background: string[] = [];
  const questions: string[] = [];

  sentences.forEach((s) => {
    if (s.isQuestion) {
      questions.push(s.text);
    } else {
      if (questions.length === 0) {
        background.push(s.text);
      } else {
        questions.push(s.text);
      }
    }
  });

  return {
    isStudyCase,
    background: background.join(' '),
    questions,
    listItems,
    hasContent: text.trim().length > 0
  };
};

export const FormattedQuestionText: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const parsed = parseQuestionText(text);

  if (!parsed.hasContent) return null;

  return (
    <div className="space-y-3 font-sans">
      {/* Question Number & Type Badge */}
      <div className="flex items-center gap-2 border-b border-blue-sail/10 pb-1.5">
        <span className="bg-blue-sail text-white font-mono text-[11px] font-bold w-6 h-6 flex items-center justify-center shrink-0 border border-blue-sail shadow-[1px_1px_0_0_#BD1B1F]">
          {index}
        </span>
        {parsed.isStudyCase ? (
          <span className="bg-red-inferno text-white font-mono text-[9px] font-bold px-2 py-0.5 border border-red-inferno tracking-wider uppercase animate-pulse">
            🚨 STUDY CASE
          </span>
        ) : (
          <span className="bg-blue-sail/10 text-blue-sail font-mono text-[9px] font-bold px-2 py-0.5 border border-blue-sail/20 tracking-wider uppercase">
            PERTANYAAN KHUSUS
          </span>
        )}
      </div>

      {/* Background Context (Scenario) */}
      {parsed.background && (
        <div className="bg-blue-sail/5 border-l-4 border-red-inferno/60 p-3 text-xs leading-relaxed text-blue-sail/95 font-medium relative overflow-hidden">
          <div className="absolute top-1 right-2 font-mono text-[8px] text-blue-sail/20 font-bold uppercase tracking-wider select-none">
            SKENARIO / CONTEXT
          </div>
          <p className="whitespace-pre-line">{parsed.background}</p>
        </div>
      )}

      {/* Sub-problem points */}
      {parsed.listItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-blue-sail/60 uppercase tracking-wider font-mono">Daftar Kendala / Masalah:</p>
          <div className="grid grid-cols-1 gap-2">
            {parsed.listItems.map((item, idx) => (
              <div key={idx} className="flex gap-2.5 bg-white border border-blue-sail/10 p-2.5 shadow-[2px_2px_0_0_rgba(42,76,158,0.05)] transition-all hover:translate-x-0.5 duration-150">
                <span className="bg-red-inferno text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-blue-sail/90 leading-relaxed font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target Questions / Actions */}
      {parsed.questions.length > 0 && (
        <div className="bg-decor/40 border border-blue-sail/15 p-3 rounded-none space-y-1.5 shadow-[2px_2px_0_0_rgba(42,76,158,0.1)]">
          <p className="text-[10px] font-bold text-red-inferno uppercase tracking-wider font-mono flex items-center gap-1">
            <Icon name="HelpCircle" size={12} className="animate-bounce" />
            <span>TUGAS & INSTRUKSI PENYELESAIAN:</span>
          </p>
          <div className="space-y-2">
            {parsed.questions.map((q, idx) => (
              <p key={idx} className="text-xs font-extrabold text-blue-sail leading-relaxed pl-1.5 border-l-2 border-blue-sail/30">
                {parsed.questions.length > 1 ? `${idx + 1}. ` : ''}{q}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Fallback if somehow there's neither */}
      {!parsed.background && parsed.questions.length === 0 && parsed.listItems.length === 0 && (
        <p className="text-xs font-bold text-blue-sail leading-relaxed">{text.replace(/^study case:\s*/i, '')}</p>
      )}
    </div>
  );
};

export interface DivDetail {
  tugasPokok: string;
  jobdesk: string[];
  skills: string;
}

export const DIVISION_CONTENT: Record<string, DivDetail> = {
  'Divisi Event': {
    tugasPokok: 'Divisi paling sibuk tapi paling seru! Bertugas jadi juru rancang sekaligus nahkoda dari semua sub-event TSF 2026. Mulai dari bikin konsep kece, koordinasi antar tim, sampai memastikan semua acara berjalan tanpa drama',
    jobdesk: [
      'Menyusun kerangka konsep besar dan timeline pelaksanaan TDC Summit Fest 2026.',
      'Mengawasi serta menyinkronkan seluruh konsep acara di bawah Sub-Divisi Kompetisi dan Non-Kompetisi.',
      'Memastikan alur rundown terintegrasi dengan baik demi kenyamanan audiens.'
    ],
    skills: 'Kreativitas tinggi, berpikir kritis, manajemen waktu handal, komunikasi prima, & kepemimpinan yang adaptif.'
  },
  'Sub Divisi Event - Competition': {
    tugasPokok: 'Sub Divisi yang bertanggung jawab dalam pembuatan konsep dan teknis acara Event Competition selama kegiatan TSF 2026, mencakup 2 cabang lomba (BPC dan BCC)',
    jobdesk: [
      'Menyusun konsep, ketentuan, timeline kompetisi, dan sistem penilaian untuk 2 cabang lomba (BPC dan BCC)',
      'Memastikan dan mengoordinasikan pelaksanaan kompetisi agar sesuai dengan ketentuan dan timeline yang telah ditetapkan',
      'Berkoordinasi dengan judges, mentor, dan pihak eksternal terkait kompetisi'
    ],
    skills: 'Ketelitian, pemikiran terstruktur, mampu berkoordinasi dengan juri/mitra profesional secara taktis.'
  },
  'Sub Divisi Event - Non Competition': {
    tugasPokok: 'Sub Divisi yang bertanggung jawab dalam pembuatan konsep dan teknis acara Event Non Competition selama kegiatan TSF 2026',
    jobdesk: [
      'Menyusun konsep, juklak-juknis, alur, rundown, dan kebutuhan acara untuk seluruh rangkaian kegiatan non-competition (Pre Event dan Closing)',
      'Berkoordinasi dengan perangkat acara dan divisi terkait dalam mempersiapkan serta memastikan kelancaran pelaksanaan acara.',
      'Menyusun strategi pelaksanaan acara, mengantisipasi potensi kendala teknis, dan menyiapkan langkah mitigasi yang efektif.'
    ],
    skills: 'Keterampilan operasional & koordinatif, manajemen waktu yang ketat, dan sigap dalam mitigasi kendala lapangan.'
  },
  'Divisi Operational': {
    tugasPokok: 'Divisi Operational bertugas memastikan segala kebutuhan teknis acara berjalan dengan baik dan lancar. Mulai dari pengadaan barang, perizinan tempat, keamanan, hingga konsumsi dan kesehatan peserta maupun panitia. Divisi ini jadi garda terdepan dalam memastikan acara berlangsung tanpa hambatan.',
    jobdesk: [
      'Mengoordinasikan seluruh logistik barang, perizinan, keamanan, konsumsi, dan tim kesehatan medis.',
      'Bertanggung jawab atas kelancaran operasional teknis lapangan selama acara berlangsung.'
    ],
    skills: 'Ketahanan fisik yang kuat, tanggap memecahkan masalah darurat di lapangan, serta kerja sama tim yang solid.'
  },
  'Sub Divisi Operasional - Logistic, Technical, Equipment (LTE)': {
    tugasPokok: 'Subdivisi LTE bertugas untuk bertanggung jawab dalam menyiapkan, mengatur semua kebutuhan perlengkapan acara, lalu subdivi yang mengatur dan menjalankan teknis acara. Mulai dari barang, bahan perlengkapan, distribusi barang, hingga operasional selama acara berlangsung. Selain itu LTE juga bertugas untuk mengecek kondisi semua barang dari awal hingga akhir acara',
    jobdesk: [
      'Menyiapkan dan menyediakan seluruh kebutuhan barang acara.',
      'Memastikan kesiapan vanue dan perlengkapan teknis.',
      'Berkoordinasi dengan seluruh divisi terkait kebutuhan logistik ataupun equipment.',
      'Melakukan pengecekan kondisi barang sebelum dan sesudah acara'
    ],
    skills: 'Pemahaman logistik, ketahanan fisik prima, dan kemampuan teknis pengecekan inventaris barang.'
  },
  'Sub Divisi Operasional - Secure & Licence': {
    tugasPokok: 'Bertanggung jawab dalam mengoordinasikan seluruh aspek perizinan yang diperlukan untuk pelaksanaan TDC Summit Fest 2026, mulai dari tahap persiapan hingga hari-H acara. Selain itu, divisi ini juga berperan aktif dalam memastikan keamanan dan ketertiban selama rangkaian kegiatan berlangsung, guna menjaga kelancaran serta kondusivitas acara secara keseluruhan, juga bertanggung jawab dalam mengkoordinasi seluruh aspek perizinan yang diperlukan selama berlangsungnya acara TDC Summit Fest (pre-event hingga selesai)',
    jobdesk: [
      'Survey segala tempat yang akan dipinjam selama acara berlangsung',
      'Mengurus surat dan segala peminjaman tempat/ruangan untuk kebutuhan acara.',
      'Menjaga Ketertiban serta kondusivitas peserta serta panitia pada saat acara berlangsung'
    ],
    skills: 'Ketegasan, kepatuhan prosedur (SOP), tanggap darurat, dan koordinasi yang tenang dalam situasi panik.'
  },
  'Sub Divisi Operasional - Health & Consumption': {
    tugasPokok: 'Bertanggung jawab memastikan kebutuhan konsumsi dan kesehatan selama rangkaian acara terpenuhi dengan baik. Mulai dari perencanaan, distribusi konsumsi, penyediaan P3K, hingga penanganan kondisi darurat ringan agar seluruh peserta dan panitia dapat menjalankan acara dengan nyaman.',
    jobdesk: [
      'Menyusun kebutuhan konsumsi untuk panitia, peserta, tamu, maupun pengisi acara.',
      'Berkoordinasi dengan vendor atau pihak konsumsi terkait jumlah, jadwal, dan distribusi makanan/minuman.',
      'Mengatur distribusi konsumsi agar tepat waktu dan sesuai kebutuhan.',
      'Menyiapkan serta menjaga ketersediaan perlengkapan P3K dan kebutuhan kesehatan.'
    ],
    skills: 'Ketelitian gizi/porsi, relasi vendor, penanganan P3K dasar, dan kesediaan jam aktif dinamis.'
  },
  'Divisi Data Management': {
    tugasPokok: 'Divisi Data Management adalah divisi yang bertanggung jawab dalam mengelola, menghimpun, dan menyimpan seluruh data yang dibutuhkan untuk kelancaran TSF 2026.',
    jobdesk: [
      'Mengelola dan menyimpan seluruh data yang dibutuhkan selama pelaksanaan TSF 2026, baik peserta maupun panitia.',
      'Berkoordinasi dengan divisi lain dan khususnya divisi Event untuk menyusun sistem pendataan peserta yang terstruktur.',
      'Melakukan rekapitulasi terhadap seluruh data peserta TSF 2026.',
      'Mempersiapkan segala formulir kebutuhan TSF 2026, seperti registrasi, absensi, dan feedback.'
    ],
    skills: 'Ketelitian tinggi terhadap detail data, mahir menggunakan Google Sheets / Microsoft Excel, serta memiliki pola pikir yang terstruktur.'
  },
  'Divisi Branding & Marketing': {
    tugasPokok: 'Divisi paling pecah yang bikin TSF tampil kece di semua sisi, mulai dari desain yang estetik, konten yang ngena, sampe campaign yang bikin semua mata tertuju.',
    jobdesk: [
      'Mengatur dan memimpin koordinasi sub-divisi desain grafis, produksi media video/foto, strategi promosi digital, dan pengelolaan talent.'
    ],
    skills: 'Menguasai tools desain/editing, up-to-date dengan tren media sosial, berpikir kreatif strategis, serta ramah & cakap berkomunikasi.'
  },
  'Sub Divisi BnM - Creative Design': {
    tugasPokok: 'Sub Divisi Creative Desain bertugas sebagai garda terdepan dalam menghadirkan identitas visual TSF 2026. Divisi ini akan mengelola seluruh elemen desain grafis, mulai dari branding, thumbnails konten media sosial, backdrop, poster, merchandise, hingga elemen dekorasi fisik dan digital. Selain itu, tim ini juga bertanggung jawab untuk menjaga konsistensi gaya visual agar selaras dengan tema besar acara. Di sinilah seluruh ide estetik, warna, dan bentuk dikonversi menjadi karya visual yang tidak hanya indah tapi juga komunikatif dan berkesan.',
    jobdesk: [
      'Bikin GSM',
      'Menyusun guideline identitas visual (brand book)',
      'Melakukan quality control pada seluruh produk desain agar sesuai dengan GSM',
      'Bikin desain untuk seluruh keperluan media cetak; poster, merchandise kit panitia, dll',
      'Bikin desain untuk seluruh keperluan media sosial TSF; feeds, frame story, add yours, grid, dll',
      'Memenuhi request desain divisi lain'
    ],
    skills: 'Mahir menggunakan software desain grafis (Canva, Figma, Adobe, dll) dan pemahaman GSM visual.'
  },
  'Sub Divisi BnM - Media Production': {
    tugasPokok: 'Subdivisi ini bertanggung jawab atas seluruh proses pembuatan konten visual yang terkonsep, mulai dari pra-produksi seperti penulisan naskah, storyboard, dan pemahaman angle kamera, hingga produksi dan pasca-produksi video. Subdivisi ini juga menangani pengambilan gambar, penyuntingan video, serta dokumentasi acara dalam bentuk foto dan video, guna memastikan setiap momen dan pesan acara tersampaikan secara kreatif dan informatif.',
    jobdesk: [
      'Memproduksi vidio teaser, recap, after movie dan lainnya (Sesuai dengan Request).',
      'Melakukan proses shooting, pengambilan gambar, persiapan teknis hingga editing',
      'Mendokumentasi setiap kegiatan TSF 2025 baik foto maupun vidio',
      'Melakukan riset konten serta evaluasi estetika dari setiap pembuatan konten vidio',
      'Membuat konsep content dengan membuat story board, Callsheet, dan Script'
    ],
    skills: 'Menguasai pra-produksi (script/storyboard) hingga pasca-produksi video, serta editing foto/video.'
  },
  'Sub Divisi BnM - Divisi Marketing Strategist': {
    tugasPokok: 'SubDivisi ini bertugas ngatur semua aktivitas medsos, dari TikTok, sampai Instagram. Mulai dari bikin konten yang kreatif dan konsisten, interaksi sama followers (story, komen, DM, Q&A), sampai nyusun strategi campaign dan copywriting yang relate. Lalu bertanggung jawab buat ngatur ads, analisis insight konten, dan bikin strategi biar exposure, engagement, dan awareness TSF terus naik. Pokoknya, jadi tim yang bikin TSF makin dikenal dan disayang audiens!',
    jobdesk: [
      'Melakukan interaksi dengan audiens di media sosial; story Ig, X, QnA session, comment, dll',
      'Mengelola serta mengoptimalisasi seluruh aktivitas media sosial TSF (Ig, Tiktok, hingga LinkedIn), copywriting, campaign hingga content brief',
      'Bikin konten video tiktok atau reels yang menarik secara konsisten untuk branding maupun menjaga antusiasme',
      'Merancang strategi untuk penggunaan ads serta verified secara efektif & efisien',
      'Menganalisis performa konten (reach, impression, dsb.) untuk evaluasi',
      'Menyusun strategi untuk meningkatkan eksposur, engagement hingga awareness khalayak'
    ],
    skills: 'Kreatif menulis copywriting menarik, mengerti analitik media sosial (Ig, Tiktok), dan strategi periklanan/ads.'
  },
  'Sub Divisi BnM - Talent Management': {
    tugasPokok: 'Manager para Ambassador! Sub-Divisi ini mengonsep materi, tema, serta seluruh kebutuhan yang berhubungan langsung dengan para Campuss Influencer dan Student Ambassador guna meningkatkan awareness TSF kepada siswa/i SMA hingga masyarakat umum.',
    jobdesk: [
      'Managing aktivitas Campuss Influencer dan Student Ambassador selama rangkaian kegiatan TSF 2026.',
      'Scoring keaktifan, kontribusi, dan kualitas konten dari para Campuss Influencer dan Student Ambassador',
      'Pemantauan kinerja serta memandu Campuss Influencer dan Student Ambassador'
    ],
    skills: 'Public speaking, kemampuan negosiasi, tata krama hospitality, ramah, dan solutif.'
  },
  'Divisi Decoration': {
    tugasPokok: 'Nguli is my life, moto hidup divisi dekorasi. Divisi ini merupakan bagian penting yang bertanggung jawab dalam menyediakan dekorasi penunjang acara melalui proses merancang, pengerjaan, serta pemasangan dekorasi untuk seluruh rangkaian acara di TDC Summit Fest 2026, elemen utama yang menjadi fokus pengerjaan divisi dekorasi yaitu gate, stage, dan photobooth. Selain itu divisi ini juga menerima request pembuatan dekorasi yang dapat disesuaikan untuk kebutuhan acara',
    jobdesk: [
      'Mendesain serta merancang elemen gate, stage serta panggung.',
      'Mengerjakan teknis pembuatan gate, stage, panggung serta elemen hasil request.',
      'Menyusun serta membongkar dekorasi sebelum dan sesudah acara.'
    ],
    skills: 'Sensitivitas seni visual yang tinggi, keterampilan tangan dalam crafting/decor, serta koordinasi tim yang sigap di lokasi.'
  },
  'Divisi Finance': {
    tugasPokok: "Tim yang paling sering ngomong: 'Mana nota-nya?' Ngurus alur duit masuk dan keluar dengan rapi, teliti, dan penuh cinta. Jago nyusun anggaran, bayar-bayaran, dan ngatur laporan keuangan. Mereka bukan pelit, mereka hati-hati. Kalo kamu minta dana, pastikan kamu siap jawab: 'Buat apa ya?'",
    jobdesk: [
      'Mengawasi alokasi anggaran belanja kepanitiaan TSF 2026.',
      'Membimbing tim Fundraising dalam mencari dana mandiri dan Sponsorship dalam bernegosiasi dengan brand eksternal.'
    ],
    skills: 'Ketelitian anggaran, integritas kejujuran, dan pemahaman dasar laporan keuangan (LPJ/arus kas).'
  },
  'Sub Divisi Finance - Fundraising': {
    tugasPokok: "Tim pencari cuan sejati! Kerja mereka kayak sales + creative agency: mikir ide seru buat dapet pemasukan, lobi sponsor, jualan, dan tetap senyum meski dibilang 'masih dipertimbangkan ya, Kak 🙂'. Tanpa mereka? Acara jalan, tapi bisa tekor!",
    jobdesk: [
      'Menyusun strategi funding dana acara serta melakukan sistem penjualan efektif',
      'Melakukan survey vendor dan bernegosiasi terkait harga mulai dari kit panitia hingga merchandise',
      'Menginisiasi pembuatan kit panitia'
    ],
    skills: 'Jiwa wirausaha, kreativitas penjualan, negosiasi harga vendor, dan kemampuan sales persuasif.'
  },
  'Sub Divisi Finance - Sponsorship': {
    tugasPokok: "Bertanggung jawab untuk mendapatkan sponsor dan kemitraan untuk kebaikan bersama (both TSF dan mitra). Tugas utamanya adalah PDKT ke perusahaan atau brand keren dan nawarin kolaborasi yang win win solution, hrs tetep senyum yeah klo dibilang 'proposalnya kami pelajari dulu ya kak....'",
    jobdesk: [
      'Mengumpulkan dan mengolah data TSF,',
      'disusun menjadi offering menarik untuk perusahaan',
      'sambil berburu perusahaan potensial,',
      'PDKT dan melakukan partnership deals untuk mewujudkan win-win solution bagi TSF dan mitra.'
    ],
    skills: 'Kemampuan komunikasi presentasi (PDKT korporat), pembuatan offering proposal, dan lobi bisnis yang tangguh.'
  },
  'Divisi Public Relation': {
    tugasPokok: 'Si Social Butterfly nya TSF 🦋🫧 Jadi wajah naratamu dari juri, pihak sponsor, ataupun stakeholder dari ITS!!! Dijamin masuk Public Relation, relasi nya auto menggokill abieszz 😝‼️Profesional Extrovert yang siap jadi koordinator dan contact person yang siap menjawab seluruh pertanyaan pihak luar ke Panit TSF 26 pastinya 📞💥',
    jobdesk: [
      'Menjalin komunikasi dan menjadi PIC bagi seluruh pihak eksternal.',
      'Berkoordinasi dengan seluruh divisi serta memastikan informasi yang diberikan akurat.',
      'Melakukan follow-up, konfirmasi, dan reminder kepada pihak eksternal.',
      'Menyambut, mendampingi, dan mengarahkan pihak eksternal selama acara.',
      'Menjadi penghubung antara pihak eksternal dan divisi internal serta menangani kendala komunikasi.',
      'Menjaga hubungan baik, menyampaikan ucapan terima kasih, dan melakukan evaluasi pascaacara.'
    ],
    skills: 'Public speaking yang sangat percaya diri, tata bahasa formal tertulis yang rapi, pandai melobi, serta berjejaring luas.'
  }
};

export const getNormalizedContent = (name: string): DivDetail => {
  const aliasName = DIVISION_CONTENT_KEY_ALIASES[name] || name;
  const normalized = aliasName.toLowerCase().replace(/\s+/g, ' ').trim();
  const matchedKey = Object.keys(DIVISION_CONTENT).find(key => {
    return key.toLowerCase().replace(/\s+/g, ' ').trim() === normalized;
  });
  if (matchedKey) {
    return DIVISION_CONTENT[matchedKey];
  }
  return {
    tugasPokok: 'Deskripsi tugas divisi.',
    jobdesk: ['Tugas operasional divisi.'],
    skills: 'Berkomitmen tinggi, jujur, mampu bekerja sama dalam tim.'
  };
};

export const Staff: React.FC = () => {
  const { phases, divisions, addStaffApplication, formQuestions } = useApp();

  // Find recruitment phase info
  const recruitPhase = phases.find(p => p.name === 'staff_recruitment') || {
    status: 'active',
    end_date: '2026-07-15'
  };

  const isClosed = recruitPhase.status !== 'active';

  // State for selected division modal
  const [selectedDiv, setSelectedDiv] = useState<Division | null>(null);

  // State for active division info selection (inline viewer)
  const [activeDivInfoId, setActiveDivInfoId] = useState<string>('');
  const [activeSubDivTab, setActiveSubDivTab] = useState<string>('Overview');
  const [divSearchQuery, setDivSearchQuery] = useState('');

  // Reset sub-division selection when main division selection changes
  React.useEffect(() => {
    setActiveSubDivTab('Overview');
  }, [activeDivInfoId]);

  // Wizard current step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    nim: '',
    faculty: '',
    department: '',
    major: '',
    batch: '2024',
    phone: '',
    email: '',
    instagram: '',
    priority1: '',
    priority2: '',
    motivation: '',
    fileUrl: '',
    ktmKrsLink: '',
    cvLink: '',
    repostLink: '',
    twibbonLink: '',
    igFollowLink: '',
    tiktokFollowLink: '',
    divTaskAnswer1: '',
    divTaskAnswer2: '',
    // General Task Fields
    generalKnowledge: '',
    generalMotivation: '',
    experience: '',
    strengthsWeaknesses: '',
    commitmentScale: 10,
    commitmentForm: '',
    busySchedule: '',
    relations: '',
    paidIkoma: 'no',
    ikomaProofUrl: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customFormAnswers, setCustomFormAnswers] = useState<Record<string, string>>({});

  // Dynamic Division Tasks answers
  const [answersP1, setAnswersP1] = useState<Record<string, string>>({});
  const [answersP2, setAnswersP2] = useState<Record<string, string>>({});

  const getCustomAnswerKey = (section: 'dataDiri' | 'generalTask' | 'berkas', id: string) => `${section}:${id}`;

  const getCustomAnswerValue = (section: 'dataDiri' | 'generalTask' | 'berkas', id: string) => {
    return customFormAnswers[getCustomAnswerKey(section, id)] || '';
  };

  const setCustomAnswerValue = (section: 'dataDiri' | 'generalTask' | 'berkas', id: string, value: string) => {
    setCustomFormAnswers(prev => ({
      ...prev,
      [getCustomAnswerKey(section, id)]: value
    }));
  };

  const getDivisionQuestions = (priorityName: string): Question[] => {
    if (!priorityName) return [];
    const normalizedKey = DIVISION_TASK_KEY_ALIASES[priorityName] || priorityName;
    return formQuestions?.divisionTasks?.[normalizedKey] || DEFAULT_QUESTIONS;
  };

  const handleAnswersP1Change = (qId: string, value: string) => {
    setAnswersP1(prev => {
      const updated = { ...prev, [qId]: value };
      const questions = getDivisionQuestions(formData.priority1);
      const serialized = questions
        .map((q, idx) => `[PERTANYAAN ${idx + 1}] ${q.text}\n[JAWABAN] ${updated[q.id] || ''}`)
        .join('\n\n');
      setFormData(f => ({ ...f, divTaskAnswer1: serialized }));
      return updated;
    });
  };

  const handleAnswersP2Change = (qId: string, value: string) => {
    setAnswersP2(prev => {
      const updated = { ...prev, [qId]: value };
      const questions = getDivisionQuestions(formData.priority2);
      const serialized = questions
        .map((q, idx) => `[PERTANYAAN ${idx + 1}] ${q.text}\n[JAWABAN] ${updated[q.id] || ''}`)
        .join('\n\n');
      setFormData(f => ({ ...f, divTaskAnswer2: serialized }));
      return updated;
    });
  };

  // File Upload states (drag and drop) for CV
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload states for IKOMA proof
  const [ikomaUploadedFileName, setIkomaUploadedFileName] = useState('');
  const ikomaFileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      // Simulate file URL
      setFormData(prev => ({ ...prev, fileUrl: `https://storage.tsf.id/cv/${file.name}` }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setFormData(prev => ({ ...prev, fileUrl: `https://storage.tsf.id/cv/${file.name}` }));
    }
  };

  const handleIkomaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIkomaUploadedFileName(file.name);
      setFormData(prev => ({ ...prev, ikomaProofUrl: `https://storage.tsf.id/ikoma/${file.name}` }));
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.nim.trim()) errors.nim = 'NRP wajib diisi';
    if (!formData.faculty) errors.faculty = 'Fakultas wajib dipilih';
    if (!formData.department.trim()) errors.department = 'Departemen wajib diisi';
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor WhatsApp wajib diisi';
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Format nomor WhatsApp tidak valid (contoh: 08123456789)';
    }
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    const customDataDiriFields = (formQuestions?.dataDiri || []).filter(field => !DATA_DIRI_FIELD_IDS.has(field.id));
    customDataDiriFields.forEach(field => {
      if (!getCustomAnswerValue('dataDiri', field.id).trim()) {
        errors[`dataDiri_${field.id}`] = 'Jawaban wajib diisi';
      }
    });

    setFormErrors(prev => {
      const cleanErrors = { ...prev };
      // Remove step 1 keys from previous errors so we overwrite them correctly
      const step1Keys = ['fullName', 'nim', 'faculty', 'department', 'phone', 'email'];
      step1Keys.forEach(k => delete cleanErrors[k]);
      Object.keys(cleanErrors).forEach(k => {
        if (k.startsWith('dataDiri_')) {
          delete cleanErrors[k];
        }
      });
      return { ...cleanErrors, ...errors };
    });

    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.generalKnowledge.trim()) errors.generalKnowledge = 'Jawaban wajib diisi';
    if (!formData.generalMotivation.trim()) errors.generalMotivation = 'Jawaban wajib diisi';
    if (!formData.experience.trim()) errors.experience = 'Jawaban wajib diisi';
    if (!formData.strengthsWeaknesses.trim()) errors.strengthsWeaknesses = 'Jawaban wajib diisi';
    if (!formData.commitmentForm.trim()) errors.commitmentForm = 'Jawaban wajib diisi';
    if (!formData.busySchedule.trim()) errors.busySchedule = 'Jawaban wajib diisi';
    if (!formData.relations.trim()) errors.relations = 'Jawaban wajib diisi';
    if (formData.paidIkoma === 'yes' && !formData.ikomaProofUrl) {
      errors.ikomaProofUrl = 'Bukti pembayaran IKOMA wajib diunggah';
    }

    const customGeneralTaskFields = (formQuestions?.generalTask || []).filter(q => !GENERAL_TASK_FIELD_IDS.has(q.id));
    customGeneralTaskFields.forEach(q => {
      if (q.required !== false && !getCustomAnswerValue('generalTask', q.id).trim()) {
        errors[`generalTask_${q.id}`] = 'Jawaban wajib diisi';
      }
    });

    setFormErrors(prev => {
      const cleanErrors = { ...prev };
      const step2Keys = [
        'generalKnowledge', 'generalMotivation', 'experience', 'strengthsWeaknesses',
        'commitmentForm', 'busySchedule', 'relations', 'ikomaProofUrl'
      ];
      step2Keys.forEach(k => delete cleanErrors[k]);
      Object.keys(cleanErrors).forEach(k => {
        if (k.startsWith('generalTask_')) {
          delete cleanErrors[k];
        }
      });
      return { ...cleanErrors, ...errors };
    });

    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!formData.priority1) errors.priority1 = 'Pilih divisi Prioritas 1';
    if (!formData.priority2) errors.priority2 = 'Pilih divisi Prioritas 2';
    if (formData.priority1 && formData.priority2 && formData.priority1 === formData.priority2) {
      errors.priority2 = 'Divisi prioritas 1 dan 2 tidak boleh sama';
    }

    setFormErrors(prev => {
      const cleanErrors = { ...prev };
      const step3Keys = ['priority1', 'priority2'];
      step3Keys.forEach(k => delete cleanErrors[k]);
      return { ...cleanErrors, ...errors };
    });

    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    const questions1 = getDivisionQuestions(formData.priority1);
    questions1.forEach(q => {
      const val = answersP1[q.id]?.trim() || '';
      if (!val) {
        errors[`p1_q_${q.id}`] = 'Jawaban ini wajib diisi';
      } else if (q.type === 'text' && val.length < 15) {
        errors[`p1_q_${q.id}`] = 'Jawaban minimal 15 karakter';
      }
    });

    const questions2 = getDivisionQuestions(formData.priority2);
    questions2.forEach(q => {
      const val = answersP2[q.id]?.trim() || '';
      if (!val) {
        errors[`p2_q_${q.id}`] = 'Jawaban ini wajib diisi';
      } else if (q.type === 'text' && val.length < 15) {
        errors[`p2_q_${q.id}`] = 'Jawaban minimal 15 karakter';
      }
    });

    setFormErrors(prev => {
      const cleanErrors = { ...prev };
      // Clean previous step 4 errors
      Object.keys(cleanErrors).forEach(k => {
        if (k.startsWith('p1_q_') || k.startsWith('p2_q_') || k === 'divTaskAnswer1' || k === 'divTaskAnswer2') {
          delete cleanErrors[k];
        }
      });
      return { ...cleanErrors, ...errors };
    });

    if (Object.keys(errors).length === 0) {
      const serialized1 = questions1
        .map((q, idx) => `[PERTANYAAN ${idx + 1}] ${q.text}\n[JAWABAN] ${answersP1[q.id] || ''}`)
        .join('\n\n');
      const serialized2 = questions2
        .map((q, idx) => `[PERTANYAAN ${idx + 1}] ${q.text}\n[JAWABAN] ${answersP2[q.id] || ''}`)
        .join('\n\n');
      setFormData(prev => ({
        ...prev,
        divTaskAnswer1: serialized1,
        divTaskAnswer2: serialized2
      }));
    }

    return Object.keys(errors).length === 0;
  };

  const validateStep5 = () => {
    const errors: Record<string, string> = {};
    const linkFields = [
      { key: 'ktmKrsLink', label: 'Link KTM/KRSM' },
      { key: 'cvLink', label: 'Link CV/Curriculum Vitae' },
      { key: 'repostLink', label: 'Link Repost Oprec SG' },
      { key: 'twibbonLink', label: 'Link Twibbon' },
      { key: 'igFollowLink', label: 'Link Bukti Follow Instagram @tdcits dan @tdcsummitfest' },
      { key: 'tiktokFollowLink', label: 'Link Bukti Follow Tiktok @tdcits dan @tdcsummitfest' }
    ];

    linkFields.forEach(field => {
      const val = (formData as any)[field.key]?.trim() || '';
      if (!val) {
        errors[field.key] = `${field.label} wajib diisi`;
      } else if (!/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/.test(val)) {
        errors[field.key] = 'Format link/URL tidak valid (contoh: drive.google.com/...)';
      }
    });

    const customBerkasFields = (formQuestions?.berkas || []).filter(field => !BERKAS_FIELD_IDS.has(field.id));
    customBerkasFields.forEach(field => {
      if (field.required !== false && !getCustomAnswerValue('berkas', field.id).trim()) {
        errors[`berkas_${field.id}`] = 'Jawaban wajib diisi';
      }
    });

    setFormErrors(prev => {
      const cleanErrors = { ...prev };
      const step5Keys = ['fileUrl', 'ktmKrsLink', 'cvLink', 'repostLink', 'twibbonLink', 'igFollowLink', 'tiktokFollowLink'];
      step5Keys.forEach(k => delete cleanErrors[k]);
      Object.keys(cleanErrors).forEach(k => {
        if (k.startsWith('berkas_')) {
          delete cleanErrors[k];
        }
      });
      return { ...cleanErrors, ...errors };
    });

    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        scrollToFormTop();
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setFormData(prev => ({ ...prev, motivation: prev.generalMotivation }));
        setCurrentStep(3);
        scrollToFormTop();
      }
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
        scrollToFormTop();
      }
    } else if (currentStep === 4) {
      if (validateStep4()) {
        setCurrentStep(5);
        scrollToFormTop();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToFormTop();
    }
  };

  const scrollToFormTop = () => {
    setTimeout(() => {
      const el = document.getElementById('staff-form-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const validateForm = () => {
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    const isStep3Valid = validateStep3();
    const isStep4Valid = validateStep4();
    const isStep5Valid = validateStep5();
    return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && isStep5Valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      if (!validateStep1()) {
        setCurrentStep(1);
      } else if (!validateStep2()) {
        setCurrentStep(2);
      } else if (!validateStep3()) {
        setCurrentStep(3);
      } else if (!validateStep4()) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
      scrollToFormTop();
      return;
    }

    setIsSubmitting(true);

    // Simulate API request delay
    setTimeout(() => {
      addStaffApplication({
        full_name: formData.fullName,
        nim: formData.nim,
        faculty: formData.faculty,
        department: formData.department,
        major: formData.department, // set major to department for general compatibility
        batch: formData.batch,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram || undefined,
        division_priority_1: formData.priority1,
        division_priority_2: formData.priority2,
        motivation: formData.generalMotivation,
        file_url: formData.fileUrl,
        ktm_krs_link: formData.ktmKrsLink,
        cv_link: formData.cvLink,
        repost_link: formData.repostLink,
        twibbon_link: formData.twibbonLink,
        ig_follow_link: formData.igFollowLink,
        tiktok_follow_link: formData.tiktokFollowLink,
        div_task_answer_1: formData.divTaskAnswer1,
        div_task_answer_2: formData.divTaskAnswer2,
        custom_form_answers: customFormAnswers,
        // General Task fields
        general_knowledge: formData.generalKnowledge,
        general_motivation: formData.generalMotivation,
        experience: formData.experience,
        strengths_weaknesses: formData.strengthsWeaknesses,
        commitment_scale: formData.commitmentScale,
        commitment_form: formData.commitmentForm,
        busy_schedule: formData.busySchedule,
        relations: formData.relations,
        paid_ikoma: formData.paidIkoma,
        ikoma_proof_url: formData.paidIkoma === 'yes' ? formData.ikomaProofUrl : undefined
      });
      setIsSubmitting(false);
      setShowSuccessModal(true);
      // Reset form & wizard
      setFormData({
        fullName: '',
        nim: '',
        faculty: '',
        department: '',
        major: '',
        batch: '2024',
        phone: '',
        email: '',
        instagram: '',
        priority1: '',
        priority2: '',
        motivation: '',
        fileUrl: '',
        ktmKrsLink: '',
        cvLink: '',
        repostLink: '',
        twibbonLink: '',
        igFollowLink: '',
        tiktokFollowLink: '',
        divTaskAnswer1: '',
        divTaskAnswer2: '',
        generalKnowledge: '',
        generalMotivation: '',
        experience: '',
        strengthsWeaknesses: '',
        commitmentScale: 10,
        commitmentForm: '',
        busySchedule: '',
        relations: '',
        paidIkoma: 'no',
        ikomaProofUrl: ''
      });
      setUploadedFileName('');
      setIkomaUploadedFileName('');
      setCustomFormAnswers({});
      setCurrentStep(1);
      setFormErrors({});
    }, 1200);
  };

  // Division detailed expectations helper
  const getDivExpectations = (divName: string) => {
    const content = getNormalizedContent(divName);
    return {
      jobdesk: content.jobdesk,
      skills: content.skills
    };
  };

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO SECTION STAFF */}
        <section className="bg-blue-sail text-ballroom rounded-none border-4 border-decor p-8 sm:p-12 mb-12 relative overflow-hidden shadow-[6px_6px_0_0_#BD1B1F]">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <span className={`inline-block font-mono text-xs font-bold px-3 py-1 rounded-none border border-current uppercase tracking-wider ${isClosed ? 'bg-red-inferno text-ballroom' : 'bg-decor text-blue-sail animate-pulse'
                }`}>
                {isClosed ? 'Pendaftaran Ditutup' : 'Pendaftaran Dibuka'}
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight">
                STAFF <span className="text-decor">RECRUITMENT</span>
              </h1>
              <p className="text-sm sm:text-base text-ballroom/80 font-sans leading-relaxed">
                Salurkan kreativitas dan semangat organisasimu untuk menyukseskan event TSF 2026! Pilih divisi yang sesuai dengan keahlianmu, isi pendaftaran di bawah, dan berkontribusi langsung membuat festival otomotif-seni terbesar tahun ini.
              </p>
            </div>

            {!isClosed && (
              <button
                id="staff-hero-scroll-btn"
                onClick={() => {
                  const el = document.getElementById('staff-form-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-4 rounded-none tracking-widest shrink-0 border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                DAFTAR SEKARANG
              </button>
            )}
          </div>
        </section>

        {/* 2. KENALAN DENGAN DIVISI */}
        <section className="mb-14 scroll-mt-20" id="div-info-explorer">
          <div className="text-center space-y-2 mb-6">
            <span className="font-mono text-xs font-bold text-red-inferno tracking-widest uppercase">// MEET THE TEAM</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">CARI INFORMASI DIVISI</h2>
            <div className="w-12 h-1 bg-decor mx-auto rounded-none" />
            <p className="text-xs sm:text-sm text-blue-sail/70 max-w-lg mx-auto font-sans mt-1">
              Temukan tanggung jawab dan keahlian yang dicari setiap divisi secara interaktif tanpa memenuhi halaman.
            </p>
          </div>

          {/* Interactive Compact Finder Component */}
          <div className="bg-ballroom border-[3px] border-blue-sail rounded-none shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden flex flex-col md:flex-row min-h-[420px]">
            {/* Left Panel: Search & Selector */}
            <div className="w-full md:w-[320px] bg-blue-sail/5 border-b-2 md:border-b-0 md:border-r-2 border-blue-sail/20 p-4 flex flex-col gap-3 shrink-0">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-blue-sail/60 uppercase tracking-wide">Cari Divisi / Jobdesk</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-sail/40 pointer-events-none">
                    <Icon name="Search" size={14} />
                  </span>
                  <input
                    type="text"
                    value={divSearchQuery}
                    onChange={(e) => {
                      setDivSearchQuery(e.target.value);
                      // Clear selection if current selection is filtered out
                      const matches = divisions.filter(d =>
                        d.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        d.description.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      if (matches.length > 0 && !matches.find(m => m.id === activeDivInfoId)) {
                        setActiveDivInfoId(matches[0].id);
                      }
                    }}
                    placeholder="Ketik nama divisi atau tugas..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border-2 border-blue-sail/30 focus:border-blue-sail text-blue-sail outline-none transition-all placeholder:text-blue-sail/30 font-sans"
                  />
                </div>
              </div>

              {/* Match Counter */}
              <div className="flex justify-between items-center text-[9px] font-mono font-bold text-blue-sail/50 border-b border-blue-sail/10 pb-1.5 uppercase">
                <span>Daftar Divisi</span>
                <span>{divisions.filter(d => d.name.toLowerCase().includes(divSearchQuery.toLowerCase()) || d.description.toLowerCase().includes(divSearchQuery.toLowerCase())).length} Hasil</span>
              </div>

              {/* Division buttons vertical scroll box */}
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto gap-2 md:max-h-[300px] no-scrollbar pb-2 md:pb-0">
                {divisions
                  .filter(d =>
                    d.name.toLowerCase().includes(divSearchQuery.toLowerCase()) ||
                    d.description.toLowerCase().includes(divSearchQuery.toLowerCase())
                  )
                  .map((div) => {
                    const isActive = (activeDivInfoId || (divisions[0]?.id || '')) === div.id;
                    return (
                      <button
                        type="button"
                        key={div.id}
                        onClick={() => setActiveDivInfoId(div.id)}
                        className={`flex items-center space-x-2.5 px-3 py-2 border-2 text-left shrink-0 transition-all cursor-pointer font-sans text-xs font-extrabold ${isActive
                            ? 'bg-blue-sail text-white border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                            : 'bg-white text-blue-sail border-blue-sail/20 hover:border-blue-sail/40 hover:bg-blue-sail/5'
                          }`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center border shrink-0 transition-colors ${isActive ? 'bg-decor text-blue-sail border-blue-sail' : 'bg-blue-sail/5 text-blue-sail border-blue-sail/10'
                          }`}>
                          <Icon name={div.icon_name} size={13} />
                        </span>
                        <div className="truncate pr-1">
                          <p className="uppercase tracking-tight leading-none text-[11px] font-bold">{div.name}</p>
                        </div>
                      </button>
                    );
                  })}
                {divisions.filter(d => d.name.toLowerCase().includes(divSearchQuery.toLowerCase()) || d.description.toLowerCase().includes(divSearchQuery.toLowerCase())).length === 0 && (
                  <div className="p-4 text-center border-2 border-dashed border-blue-sail/15 bg-white/50 text-blue-sail/50 text-xs py-8">
                    Tidak ada divisi yang cocok dengan pencarian Anda.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Inline Details */}
            {(() => {
              const currentActiveId = activeDivInfoId || (divisions.length > 0 ? divisions[0].id : '');
              const activeDiv = divisions.find(d => d.id === currentActiveId);
              if (!activeDiv) {
                return (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
                    <Icon name="Users" size={32} className="text-blue-sail/30 stroke-[1.5px]" />
                    <p className="text-xs text-blue-sail/50 mt-2 font-mono">Pilih divisi di sebelah kiri untuk melihat detail.</p>
                  </div>
                );
              }

              const activeContentName = activeSubDivTab === 'Overview' ? activeDiv.name : activeSubDivTab;
              const contentData = getNormalizedContent(activeContentName);

              return (
                <div className="flex-1 p-5 sm:p-6 bg-white flex flex-col justify-between text-blue-sail relative">
                  <div className="space-y-4">
                    {/* Header Inline */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-blue-sail/10 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="bg-blue-sail text-decor w-9 h-9 border border-decor flex items-center justify-center">
                          <Icon name={activeDiv.icon_name} size={18} />
                        </span>
                        <div>
                          <span className="font-mono text-[9px] font-black uppercase text-red-inferno tracking-widest leading-none">DETAIL DIVISI</span>
                          <h3 className="font-display font-extrabold text-base sm:text-lg uppercase tracking-tight text-blue-sail leading-none mt-0.5">
                            {activeDiv.name} {activeSubDivTab !== 'Overview' && <span className="text-red-inferno text-xs sm:text-sm lowercase block sm:inline sm:ml-1 font-sans font-semibold">({activeSubDivTab.replace(/Sub Divisi (Event - |Operasional - |BnM - |Finance - )?/i, '')})</span>}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Sub-Division Selector Buttons */}
                    {activeDiv.sub_divisions && activeDiv.sub_divisions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 bg-blue-sail/5 p-1.5 border border-blue-sail/10">
                        <button
                          type="button"
                          onClick={() => setActiveSubDivTab('Overview')}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${activeSubDivTab === 'Overview'
                              ? 'bg-blue-sail text-white border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                              : 'bg-white text-blue-sail hover:bg-blue-sail/10 border-blue-sail/15'
                            }`}
                        >
                          Overview
                        </button>
                        {activeDiv.sub_divisions.map((sub, idx) => {
                          const displayLabel = sub.replace(/Sub Divisi (Event - |Operasional - |BnM - |Finance - )?/i, '');
                          const isSelected = activeSubDivTab === sub;
                          return (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setActiveSubDivTab(sub)}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${isSelected
                                  ? 'bg-blue-sail text-white border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                                  : 'bg-white text-blue-sail hover:bg-blue-sail/10 border-blue-sail/15'
                                }`}
                            >
                              {displayLabel}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Deskripsi & Sub-divisi */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-7 space-y-3.5">
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] font-bold uppercase text-blue-sail/40 tracking-wider">Tugas Pokok:</span>
                          <p className="text-xs text-blue-sail/90 leading-relaxed font-sans bg-ballroom/30 p-3 border border-blue-sail/10 whitespace-pre-line">
                            {contentData.tugasPokok}
                          </p>
                        </div>

                        {activeSubDivTab === 'Overview' && activeDiv.sub_divisions && activeDiv.sub_divisions.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="font-mono text-[9px] font-bold uppercase text-blue-sail/40 tracking-wider">Daftar Sub-Divisi (Klik Tombol Di Atas Untuk Detail):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {activeDiv.sub_divisions.map((sub, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  onClick={() => setActiveSubDivTab(sub)}
                                  className="bg-blue-sail/5 hover:bg-blue-sail/10 text-blue-sail border border-blue-sail/15 text-[10px] px-2.5 py-1 font-sans font-semibold transition-all cursor-pointer"
                                >
                                  {sub.replace(/Sub Divisi (Event - |Operasional - |BnM - |Finance - )?/i, '')} →
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Jobdesks & Skills */}
                      <div className="lg:col-span-5 space-y-3.5 border-t lg:border-t-0 lg:border-l border-blue-sail/10 pt-3 lg:pt-0 lg:pl-4">
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] font-bold uppercase text-blue-sail/40 tracking-wider">Tugas Utama (Jobdesk):</span>
                          <ul className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                            {contentData.jobdesk.map((task, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <Icon name="Check" size={12} className="text-red-inferno shrink-0 mt-0.5 stroke-[3px]" />
                                <span className="text-[11px] text-blue-sail/95 font-medium leading-normal">{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1 bg-decor/10 border border-blue-sail/10 p-2.5">
                          <span className="font-mono text-[9px] font-extrabold uppercase text-blue-sail tracking-wider block">Kualifikasi / Skills:</span>
                          <p className="text-[11px] text-blue-sail/90 leading-normal font-semibold">
                            {contentData.skills}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Application Hook */}
                  <div className="border-t border-blue-sail/10 pt-3 mt-3 flex justify-between items-center">
                    <p className="text-[10px] text-blue-sail/50 font-mono font-bold uppercase">TDC SUMMIT FESTIVAL 2026 STAFF RECRUITMENT</p>
                    <button
                      type="button"
                      onClick={() => {
                        // Automatically set Priority 1 to this division in the form
                        setFormData(prev => ({ ...prev, priority1: activeDiv.name }));
                        // Auto scroll to form
                        const el = document.getElementById('staff-form-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-blue-sail hover:bg-red-inferno text-white hover:text-white font-mono font-bold text-[10px] uppercase px-3 py-1.5 border border-blue-sail hover:border-red-inferno transition-all shadow-[2px_2px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center space-x-1"
                    >
                      <Icon name="PlusCircle" size={11} />
                      <span>Pilih Divisi Ini</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* 3. RECRUITMENT REGISTRATION FORM SECTION */}
        <section id="staff-form-section" className="max-w-4xl mx-auto scroll-mt-20">
          <div className="bg-ballroom rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden">

            {/* Header Form */}
            <div className="bg-blue-sail text-ballroom p-6 sm:p-8 border-b-4 border-decor relative">
              <div className="absolute inset-0 grid-pattern opacity-10" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="bg-decor text-blue-sail p-3 rounded-none border-2 border-blue-sail">
                  <Icon name="UserCheck" size={28} className="stroke-[2.5px]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-decor">
                    FORM PENDAFTARAN STAFF
                  </h3>
                  <p className="text-xs text-ballroom/85 font-sans mt-1">
                    Silakan isi seluruh formulir pendaftaran di bawah ini dengan jujur dan lengkap.
                  </p>
                </div>
              </div>
            </div>

            {isClosed ? (
              /* CLOSED STATE BANNER */
              <div className="p-8 sm:p-12 text-center space-y-6">
                <div className="text-red-inferno flex justify-center mb-2">
                  <Icon name="XCircle" size={64} className="animate-pulse" />
                </div>
                <h4 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
                  PENDAFTARAN BATCH INI TELAH DITUTUP
                </h4>
                <p className="text-sm text-blue-sail/80 max-w-md mx-auto font-sans leading-relaxed">
                  Terima kasih atas antusiasme yang luar biasa! Pendaftaran staff TSF Festival 2026 telah ditutup karena kuota pendaftar penuh. Subscribe di bawah untuk mendapatkan update langsung jika pendaftaran batch cadangan dibuka kembali.
                </p>

                {/* Simulated Subscribe box */}
                <div className="max-w-md mx-auto flex gap-2 border-2 border-blue-sail p-1 rounded-none bg-ballroom shadow-[3px_3px_0_0_#2A4C9E]">
                  <input
                    id="subscribe-email"
                    type="email"
                    placeholder="Masukkan alamat email kamu"
                    className="flex-1 px-4 py-2 text-xs font-sans text-blue-sail bg-transparent outline-none"
                  />
                  <button
                    id="subscribe-btn"
                    onClick={() => alert('Terima kasih! Email Anda telah terdaftar untuk notifikasi Batch selanjutnya.')}
                    className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-extrabold text-[10px] uppercase px-5 py-2.5 rounded-none border-l-2 border-blue-sail tracking-wider transition-colors shrink-0"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            ) : (
              /* FORM COMPONENT WITH WIZARD WORKFLOW */
              <div className="flex flex-col">

                {/* Wizard Step Progress Tracker */}
                <div className="bg-blue-sail/5 border-b-4 border-blue-sail/10 p-5 sm:p-6 font-mono text-xs text-blue-sail">
                  <div className="flex items-center justify-between max-w-2xl mx-auto relative">

                    {/* Connecting background line */}
                    <div className="absolute left-[6%] right-[6%] top-[14px] h-[3px] bg-blue-sail/20 -z-1" />
                    <div
                      className="absolute left-[6%] top-[14px] h-[3px] bg-decor transition-all duration-300 -z-1"
                      style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '25%' : currentStep === 3 ? '50%' : currentStep === 4 ? '75%' : '100%' }}
                    />

                    {/* Step 1 button */}
                    <button
                      type="button"
                      onClick={() => currentStep > 1 && setCurrentStep(1)}
                      disabled={currentStep === 1}
                      className="flex flex-col items-center space-y-2 focus:outline-none relative group"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${currentStep === 1
                          ? 'border-decor bg-decor text-blue-sail font-black shadow-[2px_2px_0_0_#2A4C9E]'
                          : currentStep > 1
                            ? 'border-blue-sail bg-blue-sail text-ballroom font-bold cursor-pointer hover:bg-decor hover:text-blue-sail'
                            : 'border-blue-sail/30 bg-ballroom text-blue-sail/40'
                        }`}>
                        1
                      </span>
                      <span className={`text-[10px] uppercase font-display font-semibold ${currentStep === 1 ? 'text-red-inferno font-black' : 'text-blue-sail/60'}`}>
                        Data Diri
                      </span>
                    </button>

                    {/* Step 2 button (General Task) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep > 2) {
                          setCurrentStep(2);
                        } else if (currentStep === 1 && validateStep1()) {
                          setCurrentStep(2);
                        }
                      }}
                      disabled={currentStep === 2}
                      className="flex flex-col items-center space-y-2 focus:outline-none relative group"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${currentStep === 2
                          ? 'border-decor bg-decor text-blue-sail font-black shadow-[2px_2px_0_0_#2A4C9E]'
                          : currentStep > 2
                            ? 'border-blue-sail bg-blue-sail text-ballroom font-bold cursor-pointer hover:bg-decor hover:text-blue-sail'
                            : 'border-blue-sail/30 bg-ballroom text-blue-sail/40'
                        }`}>
                        2
                      </span>
                      <span className={`text-[10px] uppercase font-display font-semibold ${currentStep === 2 ? 'text-red-inferno font-black' : 'text-blue-sail/60'}`}>
                        General Task
                      </span>
                    </button>

                    {/* Step 3 button (Pilih Divisi) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep > 3) {
                          setCurrentStep(3);
                        } else if (currentStep === 2 && validateStep2()) {
                          setCurrentStep(3);
                        } else if (currentStep === 1 && validateStep1() && validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      disabled={currentStep === 3}
                      className="flex flex-col items-center space-y-2 focus:outline-none relative group"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${currentStep === 3
                          ? 'border-decor bg-decor text-blue-sail font-black shadow-[2px_2px_0_0_#2A4C9E]'
                          : currentStep > 3
                            ? 'border-blue-sail bg-blue-sail text-ballroom font-bold cursor-pointer hover:bg-decor hover:text-blue-sail'
                            : 'border-blue-sail/30 bg-ballroom text-blue-sail/40'
                        }`}>
                        3
                      </span>
                      <span className={`text-[10px] uppercase font-display font-semibold ${currentStep === 3 ? 'text-red-inferno font-black' : 'text-blue-sail/60'}`}>
                        Pilih Divisi
                      </span>
                    </button>

                    {/* Step 4 button (Division Task) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep > 4) {
                          setCurrentStep(4);
                        } else if (currentStep === 3 && validateStep3()) {
                          setCurrentStep(4);
                        } else if (currentStep === 2 && validateStep2() && validateStep3()) {
                          setCurrentStep(4);
                        } else if (currentStep === 1 && validateStep1() && validateStep2() && validateStep3()) {
                          setCurrentStep(4);
                        }
                      }}
                      disabled={currentStep === 4}
                      className="flex flex-col items-center space-y-2 focus:outline-none relative group"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${currentStep === 4
                          ? 'border-decor bg-decor text-blue-sail font-black shadow-[2px_2px_0_0_#2A4C9E]'
                          : currentStep > 4
                            ? 'border-blue-sail bg-blue-sail text-ballroom font-bold cursor-pointer hover:bg-decor hover:text-blue-sail'
                            : 'border-blue-sail/30 bg-ballroom text-blue-sail/40'
                        }`}>
                        4
                      </span>
                      <span className={`text-[10px] uppercase font-display font-semibold ${currentStep === 4 ? 'text-red-inferno font-black' : 'text-blue-sail/60'}`}>
                        Division Task
                      </span>
                    </button>

                    {/* Step 5 button (Berkas & Kirim) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 4 && validateStep4()) {
                          setCurrentStep(5);
                        } else if (currentStep === 3 && validateStep3() && validateStep4()) {
                          setCurrentStep(5);
                        } else if (currentStep === 2 && validateStep2() && validateStep3() && validateStep4()) {
                          setCurrentStep(5);
                        } else if (currentStep === 1 && validateStep1() && validateStep2() && validateStep3() && validateStep4()) {
                          setCurrentStep(5);
                        }
                      }}
                      disabled={currentStep === 5}
                      className="flex flex-col items-center space-y-2 focus:outline-none relative group"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${currentStep === 5
                          ? 'border-decor bg-decor text-blue-sail font-black shadow-[2px_2px_0_0_#2A4C9E]'
                          : 'border-blue-sail/30 bg-ballroom text-blue-sail/40'
                        }`}>
                        5
                      </span>
                      <span className={`text-[10px] uppercase font-display font-semibold ${currentStep === 5 ? 'text-red-inferno font-black' : 'text-blue-sail/60'}`}>
                        Berkas & Kirim
                      </span>
                    </button>

                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 font-sans">

                  {/* STEP 1: DATA DIRI PELAMAR */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2 flex items-center space-x-1.5">
                        <Icon name="User" size={16} />
                        <span>A. Data Diri Pelamar</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'fullName')?.label || 'Nama Lengkap'} *</label>
                          <input
                            id="staff-fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder={formQuestions?.dataDiri.find(f => f.id === 'fullName')?.placeholder || 'Nama lengkap sesuai KTM/KTP'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.fullName ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.fullName && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.fullName}</p>}
                        </div>

                        {/* NRP */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'nim')?.label || 'NRP'} *</label>
                          <input
                            id="staff-nim"
                            name="nim"
                            type="text"
                            value={formData.nim}
                            onChange={e => setFormData(prev => ({ ...prev, nim: e.target.value }))}
                            placeholder={formQuestions?.dataDiri.find(f => f.id === 'nim')?.placeholder || 'Contoh: 5025211044'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.nim ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.nim && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.nim}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Fakultas */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'faculty')?.label || 'Fakultas'} *</label>
                          <select
                            id="staff-faculty"
                            value={formData.faculty}
                            onChange={e => setFormData(prev => ({ ...prev, faculty: e.target.value }))}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors.faculty ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          >
                            <option value="">{formQuestions?.dataDiri.find(f => f.id === 'faculty')?.placeholder || '-- Pilih Fakultas --'}</option>
                            <option value="FSAD">FSAD (Fakultas Sains dan Analitika Data)</option>
                            <option value="FTIRS">FTIRS (Fakultas Teknologi Industri dan Rekayasa Sistem)</option>
                            <option value="FTSPK">FTSPK (Fakultas Teknik Sipil, Perencanaan, dan Kebumian)</option>
                            <option value="FTK">FTK (Fakultas Teknologi Kelautan)</option>
                            <option value="FTEIC">FTEIC (Fakultas Teknologi Elektro dan Informatika Cerdas)</option>
                            <option value="FDKBD">FDKBD (Fakultas Desain Kreatif dan Bisnis Digital)</option>
                            <option value="FKK">FKK (Fakultas Kedokteran dan Kesehatan)</option>
                            <option value="FV">FV (Fakultas Vokasi)</option>
                          </select>
                          {formErrors.faculty && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.faculty}</p>}
                        </div>

                        {/* Departemen */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'department')?.label || 'Departemen'} *</label>
                          <input
                            id="staff-department"
                            name="department"
                            type="text"
                            value={formData.department}
                            onChange={e => setFormData(prev => ({ ...prev, department: e.target.value, major: e.target.value }))}
                            placeholder={formQuestions?.dataDiri.find(f => f.id === 'department')?.placeholder || 'Contoh: Teknik Informatika'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.department ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.department && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.department}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* No. WA */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'phone')?.label || 'No. WA (WhatsApp)'} *</label>
                          <input
                            id="staff-phone"
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder={formQuestions?.dataDiri.find(f => f.id === 'phone')?.placeholder || 'Contoh: 08123456789'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.phone ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.phone && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.phone}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.dataDiri.find(f => f.id === 'email')?.label || 'Email'} *</label>
                          <input
                            id="staff-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={formQuestions?.dataDiri.find(f => f.id === 'email')?.placeholder || 'Contoh: mazen@student.ac.id'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.email ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.email && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.email}</p>}
                        </div>
                      </div>

                      {(formQuestions?.dataDiri || []).some(field => !DATA_DIRI_FIELD_IDS.has(field.id)) && (
                        <div className="space-y-4 pt-2 border-t border-blue-sail/10">
                          <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-red-inferno">Field Tambahan Data Diri</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(formQuestions?.dataDiri || []).filter(field => !DATA_DIRI_FIELD_IDS.has(field.id)).map(field => (
                              <div key={field.id} className="space-y-1.5">
                                <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                  {field.label}{field.required !== false ? ' *' : ''}
                                </label>
                                <input
                                  type="text"
                                  value={getCustomAnswerValue('dataDiri', field.id)}
                                  onChange={e => setCustomAnswerValue('dataDiri', field.id, e.target.value)}
                                  placeholder={field.placeholder || 'Isi jawaban di sini...'}
                                  className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors[`dataDiri_${field.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                    }`}
                                />
                                {formErrors[`dataDiri_${field.id}`] && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors[`dataDiri_${field.id}`]}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 1 Control Button */}
                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <span>SELANJUTNYA</span>
                          <Icon name="ArrowRight" size={14} className="stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: GENERAL TASK */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2 flex items-center space-x-1.5">
                        <Icon name="FileQuestion" size={16} />
                        <span>B. General Task</span>
                      </h4>

                      {/* Q1: Apa yang kamu ketahui tentang TDC Summit Fest 2026? */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'generalKnowledge');
                        const qText = q?.text || 'Apa yang kamu ketahui tentang TDC Summit Fest 2026?';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={1} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                1. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-knowledge"
                              rows={3}
                              value={formData.generalKnowledge}
                              onChange={e => setFormData(prev => ({ ...prev, generalKnowledge: e.target.value }))}
                              placeholder={q?.placeholder || 'Jelaskan pemahaman singkat kamu tentang acara ini...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.generalKnowledge ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.generalKnowledge && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.generalKnowledge}</p>}
                          </div>
                        );
                      })()}

                      {/* Q2: Apa motivasi kamu mendaftar Sebagai bagian dari TDC Summit Fest 2026? */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'generalMotivation');
                        const qText = q?.text || 'Apa motivasi kamu mendaftar Sebagai bagian dari TDC Summit Fest 2026?';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={2} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                2. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-motivation"
                              rows={3}
                              value={formData.generalMotivation}
                              onChange={e => setFormData(prev => ({ ...prev, generalMotivation: e.target.value }))}
                              placeholder={q?.placeholder || 'Jelaskan ketertarikan, motivasi, dan apa yang ingin kamu capai...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.generalMotivation ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.generalMotivation && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.generalMotivation}</p>}
                          </div>
                        );
                      })()}

                      {/* Q3: Kepanitiaan / Organisasi Experience */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'experience');
                        const qText = q?.text || 'Apakah kamu memiliki pengalaman dalam kepanitiaan atau organisasi? jika iya, sebutkan & jelaskan secara singkat jobdesk kamu';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={3} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                3. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-experience"
                              rows={3}
                              value={formData.experience}
                              onChange={e => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                              placeholder={q?.placeholder || 'Sebutkan nama kepanitian/organisasi beserta tugas/jobdesk kamu. Jika belum ada, tuliskan \'Tidak ada\'...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.experience ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.experience && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.experience}</p>}
                          </div>
                        );
                      })()}

                      {/* Q4: Kelebihan & Kekurangan */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'strengthsWeaknesses');
                        const qText = q?.text || 'Sebutkan kelebihan & kekurangan kamu';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={4} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                4. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-strengths-weaknesses"
                              rows={3}
                              value={formData.strengthsWeaknesses}
                              onChange={e => setFormData(prev => ({ ...prev, strengthsWeaknesses: e.target.value }))}
                              placeholder={q?.placeholder || 'Jelaskan secara realistis kelebihan dan kekurangan yang kamu miliki...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.strengthsWeaknesses ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.strengthsWeaknesses && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.strengthsWeaknesses}</p>}
                          </div>
                        );
                      })()}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Q5: Commitment Scale (0-10) */}
                        {(() => {
                          const q = formQuestions?.generalTask.find(item => item.id === 'commitmentScale');
                          const qText = q?.text || 'Komitment kamu untuk TDC Summit Fest 2026 (Skala 0-10)';
                          const isStudyCase = qText.toLowerCase().startsWith('study case:');
                          return (
                            <div className={`space-y-1.5 border-2 border-blue-sail/10 p-4 ${isStudyCase ? "bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn col-span-2" : "bg-blue-sail/[0.02]"}`}>
                              {isStudyCase ? (
                                <FormattedQuestionText text={qText} index={5} />
                              ) : (
                                <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                  5. {qText} *
                                </label>
                              )}
                              <div className="pt-2 px-2">
                                <input
                                  id="general-commitment-scale"
                                  type="range"
                                  min="0"
                                  max="10"
                                  step="1"
                                  value={formData.commitmentScale}
                                  onChange={e => setFormData(prev => ({ ...prev, commitmentScale: parseInt(e.target.value) }))}
                                  className="w-full h-2 bg-blue-sail/20 rounded-none appearance-none cursor-pointer accent-red-inferno"
                                />
                                <div className="flex justify-between text-[11px] font-mono font-bold text-blue-sail mt-2">
                                  <span>0 (Tidak Komit)</span>
                                  <span className="text-sm bg-red-inferno text-white px-3 py-0.5 font-bold animate-pulse">
                                    Skala: {formData.commitmentScale} / 10
                                  </span>
                                  <span>10 (Sangat Komit)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Q9: Apakah Sudah Bayar Ikoma ITS? */}
                        {(() => {
                          const q = formQuestions?.generalTask.find(item => item.id === 'paidIkoma');
                          const qText = q?.text || 'Apakah Sudah Bayar Ikoma ITS?';
                          const isStudyCase = qText.toLowerCase().startsWith('study case:');
                          return (
                            <div className={`space-y-1.5 border-2 border-blue-sail/10 p-4 flex flex-col justify-between ${isStudyCase ? "bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn col-span-2" : "bg-blue-sail/[0.02]"}`}>
                              <div>
                                {isStudyCase ? (
                                  <FormattedQuestionText text={qText} index={9} />
                                ) : (
                                  <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                    9. {qText} *
                                  </label>
                                )}
                                <p className="text-[10px] text-blue-sail/60 leading-tight mb-2">Pilih 'Ya' untuk melampirkan link bukti pembayaran IKOMA.</p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 text-sm text-blue-sail font-semibold cursor-pointer">
                                  <input
                                    id="ikoma-yes"
                                    type="radio"
                                    name="paidIkoma"
                                    value="yes"
                                    checked={formData.paidIkoma === 'yes'}
                                    onChange={() => setFormData(prev => ({ ...prev, paidIkoma: 'yes' }))}
                                    className="h-4 w-4 text-blue-sail border-2 border-blue-sail focus:ring-0"
                                  />
                                  <span>Ya, Sudah Bayar</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-blue-sail font-semibold cursor-pointer">
                                  <input
                                    id="ikoma-no"
                                    type="radio"
                                    name="paidIkoma"
                                    value="no"
                                    checked={formData.paidIkoma === 'no'}
                                    onChange={() => setFormData(prev => ({ ...prev, paidIkoma: 'no' }))}
                                    className="h-4 w-4 text-blue-sail border-2 border-blue-sail focus:ring-0"
                                  />
                                  <span>Belum Bayar</span>
                                </label>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Q9 Conditional Bukti Pembayaran */}
                      {formData.paidIkoma === 'yes' && (
                        <div className="space-y-1.5 p-4 bg-red-inferno/[0.03] border-2 border-red-inferno/25 animate-fadeIn">
                          <label className="block text-xs font-bold text-red-inferno uppercase tracking-wide flex items-center space-x-1">
                            <Icon name="Link2" size={14} />
                            <span>Link Google Drive Bukti Pembayaran IKOMA ITS *</span>
                          </label>
                          <input
                            id="ikoma-proof-url"
                            type="text"
                            value={formData.ikomaProofUrl}
                            onChange={e => setFormData(prev => ({ ...prev, ikomaProofUrl: e.target.value }))}
                            placeholder="Contoh: drive.google.com/..."
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                              formErrors.ikomaProofUrl ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                            }`}
                          />
                          {formErrors.ikomaProofUrl && (
                            <p className="text-red-inferno text-[10px] font-bold uppercase mt-1">{formErrors.ikomaProofUrl}</p>
                          )}
                        </div>
                      )}

                      {/* Q6: Bentuk Komitmen */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'commitmentForm');
                        const qText = q?.text || 'Jelaskan apa bentuk komitmen kamu untuk TSF 2026';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={6} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                6. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-commitment-form"
                              rows={3}
                              value={formData.commitmentForm}
                              onChange={e => setFormData(prev => ({ ...prev, commitmentForm: e.target.value }))}
                              placeholder={q?.placeholder || 'Jelaskan kontribusi waktu, tenaga, dan kesiapan kamu berkontribusi...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.commitmentForm ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.commitmentForm && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.commitmentForm}</p>}
                          </div>
                        );
                      })()}

                      {/* Q7: Kesibukan saat ini dan 5 bulan kedepan */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'busySchedule');
                        const qText = q?.text || 'Apa saja kesibukan kamu saat ini dan 5 bulan kedepan';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={7} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                7. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-busy-schedule"
                              rows={3}
                              value={formData.busySchedule}
                              onChange={e => setFormData(prev => ({ ...prev, busySchedule: e.target.value }))}
                              placeholder={q?.placeholder || 'Contoh: Kuliah, Praktikum, Organisasi lain, Magang, Tugas Akhir...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.busySchedule ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.busySchedule && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.busySchedule}</p>}
                          </div>
                        );
                      })()}

                      {/* Q8: Relasi Kenalan / Perusahaan */}
                      {(() => {
                        const q = formQuestions?.generalTask.find(item => item.id === 'relations');
                        const qText = q?.text || 'Apakah Kamu Memiliki Relasi Kenalan/Perusahaan';
                        const isStudyCase = qText.toLowerCase().startsWith('study case:');
                        return (
                          <div className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                            {isStudyCase ? (
                              <FormattedQuestionText text={qText} index={8} />
                            ) : (
                              <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                8. {qText} *
                              </label>
                            )}
                            <textarea
                              id="general-relations"
                              rows={3}
                              value={formData.relations}
                              onChange={e => setFormData(prev => ({ ...prev, relations: e.target.value }))}
                              placeholder={q?.placeholder || 'Sebutkan relasi alumni, media partner, pembicara, sponsor, atau perusahaan. Jika tidak ada, tuliskan \'Tidak ada\'...'}
                              className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${
                                formErrors.relations ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                            />
                            {formErrors.relations && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.relations}</p>}
                          </div>
                        );
                      })()}

                      {(formQuestions?.generalTask || []).some(q => !GENERAL_TASK_FIELD_IDS.has(q.id)) && (
                        <div className="space-y-4 pt-2 border-t border-blue-sail/10">
                          <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-red-inferno">Pertanyaan Tambahan General Task</h5>
                          <div className="space-y-4">
                            {(formQuestions?.generalTask || []).filter(q => !GENERAL_TASK_FIELD_IDS.has(q.id)).map((q, qIdx) => {
                              const index = GENERAL_TASK_FIELD_IDS.size + qIdx + 1;
                              const isStudyCase = q.text.toLowerCase().startsWith('study case:');
                              return (
                                <div key={q.id} className={isStudyCase ? "space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)] animate-fadeIn" : "space-y-1.5"}>
                                  {isStudyCase ? (
                                    <FormattedQuestionText text={q.text} index={index} />
                                  ) : (
                                    <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                      {index}. {q.text}{q.required !== false ? ' *' : ''}
                                    </label>
                                  )}
                                  {q.type === 'select' ? (
                                    <select
                                      value={getCustomAnswerValue('generalTask', q.id)}
                                      onChange={e => setCustomAnswerValue('generalTask', q.id, e.target.value)}
                                      className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors[`generalTask_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                        }`}
                                    >
                                      <option value="">-- Pilih Jawaban --</option>
                                      {q.options?.map((opt, idx) => (
                                        <option key={idx} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <textarea
                                      rows={3}
                                      value={getCustomAnswerValue('generalTask', q.id)}
                                      onChange={e => setCustomAnswerValue('generalTask', q.id, e.target.value)}
                                      placeholder={q.placeholder || 'Tuliskan jawaban Anda di sini...'}
                                      className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors[`generalTask_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                        }`}
                                    />
                                  )}
                                  {formErrors[`generalTask_${q.id}`] && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors[`generalTask_${q.id}`]}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* Step 2 Control Buttons */}
                      <div className="pt-4 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="bg-blue-sail/5 hover:bg-blue-sail/10 text-blue-sail font-display font-black text-xs uppercase px-6 py-3.5 rounded-none border-2 border-blue-sail transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Icon name="ArrowLeft" size={14} className="stroke-[2.5px]" />
                          <span>KEMBALI</span>
                        </button>

                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <span>SELANJUTNYA</span>
                          <Icon name="ArrowRight" size={14} className="stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: MINAT DIVISI KEPANITIAAN */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="bg-decor/5 border-2 border-decor/20 p-4 rounded-none text-xs text-blue-sail flex items-start space-x-2.5 leading-relaxed">
                        <Icon name="Info" size={18} className="text-red-inferno shrink-0 mt-0.5" />
                        <span>
                          <strong>Tips Pilihan Divisi:</strong> Anda dapat melihat rincian kualifikasi dan tugas masing-masing divisi pada daftar di bagian atas halaman ini untuk mempermudah mencocokkan minat Anda.
                        </span>
                      </div>

                      <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2 flex items-center space-x-1.5">
                        <Icon name="Users" size={16} />
                        <span>C. Minat Divisi Kepanitian</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Priority 1 */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">Pilihan Divisi Prioritas 1 *</label>
                          <select
                            id="staff-priority1"
                            name="priority1"
                            value={formData.priority1}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, priority1: val, divTaskAnswer1: '' }));
                              setAnswersP1({});
                            }}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors.priority1 ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          >
                            <option value="">-- Pilih Divisi Pertama --</option>
                            {divisions.map(d => {
                              if (d.sub_divisions && d.sub_divisions.length > 0) {
                                return (
                                  <optgroup key={d.id} label={d.name} className="font-mono font-bold text-xs uppercase bg-ballroom text-blue-sail">
                                    {d.sub_divisions.map((sub, idx) => (
                                      <option key={`${d.id}-${idx}`} value={sub} className="font-sans normal-case text-sm bg-white text-blue-sail">
                                        {sub}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              } else {
                                return (
                                  <option key={d.id} value={d.name} className="font-sans font-semibold text-sm">
                                    {d.name}
                                  </option>
                                );
                              }
                            })}
                          </select>
                          {formErrors.priority1 && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.priority1}</p>}
                        </div>

                        {/* Priority 2 */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">Pilihan Divisi Prioritas 2 *</label>
                          <select
                            id="staff-priority2"
                            name="priority2"
                            value={formData.priority2}
                            onChange={e => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, priority2: val, divTaskAnswer2: '' }));
                              setAnswersP2({});
                            }}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors.priority2 ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          >
                            <option value="">-- Pilih Divisi Kedua --</option>
                            {divisions.map(d => {
                              if (d.sub_divisions && d.sub_divisions.length > 0) {
                                return (
                                  <optgroup key={d.id} label={d.name} className="font-mono font-bold text-xs uppercase bg-ballroom text-blue-sail">
                                    {d.sub_divisions.map((sub, idx) => (
                                      <option key={`${d.id}-${idx}`} value={sub} className="font-sans normal-case text-sm bg-white text-blue-sail">
                                        {sub}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              } else {
                                return (
                                  <option key={d.id} value={d.name} className="font-sans font-semibold text-sm">
                                    {d.name}
                                  </option>
                                );
                              }
                            })}
                          </select>
                          {formErrors.priority2 && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.priority2}</p>}
                        </div>
                      </div>

                      {/* Step 3 Control Buttons */}
                      <div className="pt-4 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="bg-blue-sail/5 hover:bg-blue-sail/10 text-blue-sail font-display font-black text-xs uppercase px-6 py-3.5 rounded-none border-2 border-blue-sail transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Icon name="ArrowLeft" size={14} className="stroke-[2.5px]" />
                          <span>KEMBALI</span>
                        </button>

                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <span>SELANJUTNYA</span>
                          <Icon name="ArrowRight" size={14} className="stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: DIVISION TASK (PERTANYAAN KHUSUS) */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-decor/5 border-2 border-decor/20 p-4 rounded-none text-xs text-blue-sail flex items-start space-x-2.5 leading-relaxed">
                        <Icon name="Info" size={18} className="text-red-inferno shrink-0 mt-0.5" />
                        <span>
                          <strong>Division Task:</strong> Pertanyaan di bawah ini disesuaikan secara otomatis berdasarkan pilihan divisi/subdivisi prioritas 1 dan 2 Anda. Jawablah dengan penjelasan terbaik Anda.
                        </span>
                      </div>

                      <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2 flex items-center space-x-1.5">
                        <Icon name="FileQuestion" size={16} />
                        <span>D. Division Task (Pertanyaan Khusus Divisi)</span>
                      </h4>

                      <div className="space-y-6">
                        {/* Task Priority 1 */}
                        <div className="space-y-4 bg-blue-sail/5 p-4 border border-blue-sail/10">
                          <div className="flex items-center space-x-2 border-b border-blue-sail/10 pb-2">
                            <span className="bg-decor text-blue-sail font-mono text-xs font-bold px-2 py-0.5 border border-blue-sail">
                              PRIORITAS 1
                            </span>
                            <span className="text-xs font-bold font-mono text-blue-sail uppercase tracking-wide">
                              {formData.priority1}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {getDivisionQuestions(formData.priority1).map((q, qIdx) => (
                              <div key={q.id} className="space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)]">
                                <FormattedQuestionText text={q.text} index={qIdx + 1} />
                                {q.type === 'select' ? (
                                  <select
                                    value={answersP1[q.id] || ''}
                                    onChange={e => handleAnswersP1Change(q.id, e.target.value)}
                                    className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors[`p1_q_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                      }`}
                                  >
                                    <option value="">-- Pilih Jawaban --</option>
                                    {q.options?.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <textarea
                                    rows={q.text.toLowerCase().includes('case') ? 5 : 3}
                                    value={answersP1[q.id] || ''}
                                    onChange={e => handleAnswersP1Change(q.id, e.target.value)}
                                    placeholder="Tuliskan jawaban lengkap Anda di sini (minimal 15 karakter)..."
                                    className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors[`p1_q_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                      }`}
                                  />
                                )}
                                <div className="flex justify-between items-center text-[10px]">
                                  {formErrors[`p1_q_${q.id}`] ? (
                                    <p className="text-red-inferno font-bold uppercase">{formErrors[`p1_q_${q.id}`]}</p>
                                  ) : (
                                    <p className="text-blue-sail/60">Tuliskan penjelasan yang detail dan solutif.</p>
                                  )}
                                  {q.type !== 'select' && (
                                    <p className="font-mono text-blue-sail/60">
                                      {(answersP1[q.id] || '').trim().length} karakter
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Task Priority 2 */}
                        <div className="space-y-4 bg-blue-sail/5 p-4 border border-blue-sail/10">
                          <div className="flex items-center space-x-2 border-b border-blue-sail/10 pb-2">
                            <span className="bg-decor text-blue-sail font-mono text-xs font-bold px-2 py-0.5 border border-blue-sail">
                              PRIORITAS 2
                            </span>
                            <span className="text-xs font-bold font-mono text-blue-sail uppercase tracking-wide">
                              {formData.priority2}
                            </span>
                          </div>

                          <div className="space-y-4">
                            {getDivisionQuestions(formData.priority2).map((q, qIdx) => (
                              <div key={q.id} className="space-y-3 bg-white/60 border border-blue-sail/10 p-4 shadow-[2px_2px_0_0_rgba(42,76,158,0.02)]">
                                <FormattedQuestionText text={q.text} index={qIdx + 1} />
                                {q.type === 'select' ? (
                                  <select
                                    value={answersP2[q.id] || ''}
                                    onChange={e => handleAnswersP2Change(q.id, e.target.value)}
                                    className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all cursor-pointer ${formErrors[`p2_q_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                      }`}
                                  >
                                    <option value="">-- Pilih Jawaban --</option>
                                    {q.options?.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <textarea
                                    rows={q.text.toLowerCase().includes('case') ? 5 : 3}
                                    value={answersP2[q.id] || ''}
                                    onChange={e => handleAnswersP2Change(q.id, e.target.value)}
                                    placeholder="Tuliskan jawaban lengkap Anda di sini (minimal 15 karakter)..."
                                    className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors[`p2_q_${q.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                      }`}
                                  />
                                )}
                                <div className="flex justify-between items-center text-[10px]">
                                  {formErrors[`p2_q_${q.id}`] ? (
                                    <p className="text-red-inferno font-bold uppercase">{formErrors[`p2_q_${q.id}`]}</p>
                                  ) : (
                                    <p className="text-blue-sail/60">Tuliskan penjelasan yang detail dan solutif.</p>
                                  )}
                                  {q.type !== 'select' && (
                                    <p className="font-mono text-blue-sail/60">
                                      {(answersP2[q.id] || '').trim().length} karakter
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Step 4 Control Buttons */}
                      <div className="pt-4 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="bg-blue-sail/5 hover:bg-blue-sail/10 text-blue-sail font-display font-black text-xs uppercase px-6 py-3.5 rounded-none border-2 border-blue-sail transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Icon name="ArrowLeft" size={14} className="stroke-[2.5px]" />
                          <span>KEMBALI</span>
                        </button>

                        <button
                          type="button"
                          onClick={nextStep}
                          className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <span>SELANJUTNYA</span>
                          <Icon name="ArrowRight" size={14} className="stroke-[2.5px]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: BERKAS DOKUMEN & KIRIM */}
                  {currentStep === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h4 className="font-display font-extrabold text-sm text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-2 flex items-center space-x-1.5">
                        <Icon name="FileText" size={16} />
                        <span>E. Berkas & Dokumen Pendukung</span>
                      </h4>
                      {/* Drive/Folder Link inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-sail/5 p-4 border border-blue-sail/10">
                        {/* 1. KTM / KRSM */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'ktmKrsLink')?.label || 'KTM / KRSM (Link Drive)'} *</label>
                          <input
                            id="staff-ktmKrsLink"
                            name="ktmKrsLink"
                            type="text"
                            value={formData.ktmKrsLink}
                            onChange={e => setFormData(prev => ({ ...prev, ktmKrsLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'ktmKrsLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.ktmKrsLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.ktmKrsLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.ktmKrsLink}</p>}
                        </div>

                        {/* 2. CV / Curriculum Vitae */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'cvLink')?.label || 'CV / Curriculum Vitae (Link Drive)'} *</label>
                          <input
                            id="staff-cvLink"
                            name="cvLink"
                            type="text"
                            value={formData.cvLink}
                            onChange={e => setFormData(prev => ({ ...prev, cvLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'cvLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.cvLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.cvLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.cvLink}</p>}
                        </div>

                        {/* 3. Repost Oprec SG */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'repostLink')?.label || 'Repost Oprec SG (Link Drive)'} *</label>
                          <input
                            id="staff-repostLink"
                            name="repostLink"
                            type="text"
                            value={formData.repostLink}
                            onChange={e => setFormData(prev => ({ ...prev, repostLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'repostLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.repostLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.repostLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.repostLink}</p>}
                        </div>

                        {/* 4. Twibbon */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'twibbonLink')?.label || 'Twibbon (Link Drive)'} *</label>
                          <input
                            id="staff-twibbonLink"
                            name="twibbonLink"
                            type="text"
                            value={formData.twibbonLink}
                            onChange={e => setFormData(prev => ({ ...prev, twibbonLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'twibbonLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.twibbonLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.twibbonLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.twibbonLink}</p>}
                        </div>

                        {/* 5. Bukti Follow Instagram @tdcits dan @tdcsummitfest */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'igFollowLink')?.label || 'Bukti Follow Instagram @tdcits & @tdcsummitfest (Link Drive)'} *</label>
                          <input
                            id="staff-igFollowLink"
                            name="igFollowLink"
                            type="text"
                            value={formData.igFollowLink}
                            onChange={e => setFormData(prev => ({ ...prev, igFollowLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'igFollowLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.igFollowLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.igFollowLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.igFollowLink}</p>}
                        </div>

                        {/* 6. Bukti Follow Tiktok @tdcits dan @tdcsummitfest */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">{formQuestions?.berkas.find(b => b.id === 'tiktokFollowLink')?.label || 'Bukti Follow Tiktok @tdcits & @tdcsummitfest (Link Drive)'} *</label>
                          <input
                            id="staff-tiktokFollowLink"
                            name="tiktokFollowLink"
                            type="text"
                            value={formData.tiktokFollowLink}
                            onChange={e => setFormData(prev => ({ ...prev, tiktokFollowLink: e.target.value }))}
                            placeholder={formQuestions?.berkas.find(b => b.id === 'tiktokFollowLink')?.placeholder || 'Contoh: drive.google.com/...'}
                            className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors.tiktokFollowLink ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                              }`}
                          />
                          {formErrors.tiktokFollowLink && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.tiktokFollowLink}</p>}
                        </div>
                      </div>

                      {(formQuestions?.berkas || []).some(field => !BERKAS_FIELD_IDS.has(field.id)) && (
                        <div className="space-y-4 pt-2 border-t border-blue-sail/10">
                          <h5 className="font-display font-extrabold text-xs uppercase tracking-wider text-red-inferno">Berkas Tambahan</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-sail/5 p-4 border border-blue-sail/10">
                            {(formQuestions?.berkas || []).filter(field => !BERKAS_FIELD_IDS.has(field.id)).map(field => (
                              <div key={field.id} className="space-y-1.5">
                                <label className="block text-xs font-bold text-blue-sail uppercase tracking-wide">
                                  {field.label}{field.required !== false ? ' *' : ''}
                                </label>
                                <input
                                  type="text"
                                  value={getCustomAnswerValue('berkas', field.id)}
                                  onChange={e => setCustomAnswerValue('berkas', field.id, e.target.value)}
                                  placeholder={field.placeholder || 'Contoh: drive.google.com/...'}
                                  className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none text-blue-sail transition-all ${formErrors[`berkas_${field.id}`] ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                                    }`}
                                />
                                {formErrors[`berkas_${field.id}`] && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors[`berkas_${field.id}`]}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section D: Agreement & Submit */}
                      <div className="pt-6 border-t border-blue-sail/10 space-y-4">
                        <div className="flex items-start space-x-2.5">
                          <input
                            id="staff-agreement"
                            type="checkbox"
                            required
                            className="mt-1 h-4 w-4 text-blue-sail border-2 border-blue-sail rounded-none focus:ring-0 cursor-pointer"
                          />
                          <label className="text-xs text-blue-sail/85 leading-relaxed select-none cursor-pointer">
                            Saya menyatakan bahwa seluruh data yang saya isikan dalam formulir rekrutmen staff TSF Festival 2026 ini adalah benar, lengkap, dan siap mengikuti seluruh alur seleksi wawancara hingga penugasan penuh jika lolos.
                          </label>
                        </div>

                        {/* Step 4 Control Buttons */}
                        <div className="pt-4 flex justify-between items-center gap-4">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="bg-blue-sail/5 hover:bg-blue-sail/10 text-blue-sail font-display font-black text-xs uppercase px-6 py-3.5 rounded-none border-2 border-blue-sail transition-all flex items-center space-x-2 cursor-pointer"
                          >
                            <Icon name="ArrowLeft" size={14} className="stroke-[2.5px]" />
                            <span>KEMBALI</span>
                          </button>

                          <button
                            id="staff-submit"
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-decor hover:bg-decor/95 disabled:bg-decor/50 text-blue-sail font-display font-black text-xs uppercase py-4 rounded-none tracking-wider border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-sail border-t-transparent" />
                                <span>MEMPROSES PENDAFTARAN...</span>
                              </>
                            ) : (
                              <>
                                <Icon name="CheckCircle2" size={16} className="stroke-[2.5px]" />
                                <span>KIRIM PENDAFTARAN</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              </div>
            )}

          </div>
        </section>

      </div>

      {/* MODAL 1: DIVISION DETAILS */}
      {selectedDiv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-ballroom w-full max-w-xl rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden font-sans flex flex-col max-h-[90vh] sm:max-h-[85vh]">

            {/* Header Modal */}
            <div className="bg-blue-sail text-ballroom p-5 flex items-center justify-between border-b-4 border-decor shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-decor text-blue-sail p-2 rounded-none border-2 border-blue-sail">
                  <Icon name={selectedDiv.icon_name} size={20} />
                </div>
                <h3 className="font-display font-bold text-lg uppercase tracking-tight text-decor">
                  {selectedDiv.name}
                </h3>
              </div>
              <button
                id="modal-div-close"
                onClick={() => setSelectedDiv(null)}
                className="text-ballroom hover:text-decor p-1 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-5 text-sm text-blue-sail overflow-y-auto flex-1">

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-black uppercase text-red-inferno tracking-widest">// DESKRIPSI UTAMA</span>
                <p className="leading-relaxed text-blue-sail/90 bg-white p-3.5 rounded-none border-2 border-blue-sail/35">
                  {selectedDiv.description}
                </p>
              </div>

              {/* Sub-divisions if present */}
              {selectedDiv.sub_divisions && selectedDiv.sub_divisions.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-black uppercase text-red-inferno tracking-widest">// SUB-DIVISI KEPANITIAAN</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDiv.sub_divisions.map((sub, i) => (
                      <span key={i} className="bg-blue-sail/5 text-blue-sail border border-blue-sail/25 text-xs font-semibold px-3 py-1.5 rounded-none font-sans flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 bg-decor rounded-full" />
                        <span>{sub}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobdesks */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] font-black uppercase text-red-inferno tracking-widest">// TUGAS & TANGGUNG JAWAB</span>
                <ul className="space-y-1.5">
                  {getDivExpectations(selectedDiv.name).jobdesk.map((task, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <Icon name="Check" size={14} className="text-decor shrink-0 mt-1 stroke-[3px]" />
                      <span className="text-blue-sail/90 leading-tight">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-black uppercase text-red-inferno tracking-widest">// KUALIFIKASI YANG DICARI</span>
                <p className="text-blue-sail/90 font-medium">
                  {getDivExpectations(selectedDiv.name).skills}
                </p>
              </div>

            </div>

            {/* Footer Modal */}
            <div className="bg-ballroom/50 border-t-2 border-blue-sail/20 p-4 flex justify-end shrink-0">
              <button
                id="modal-div-dismiss-btn"
                onClick={() => setSelectedDiv(null)}
                className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-extrabold text-xs uppercase px-5 py-2.5 rounded-none border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] tracking-wider transition-colors"
              >
                Tutup Deskripsi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: SUCCESS SUBMISSION */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-ballroom w-full max-w-md rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-6 text-center space-y-6 font-sans">

            <div className="text-decor flex justify-center">
              <div className="bg-blue-sail p-4 rounded-none border-2 border-blue-sail text-decor animate-bounce">
                <Icon name="CheckCircle2" size={48} className="stroke-[2.5px]" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] font-bold text-red-inferno tracking-widest uppercase">REGISTRATION SUCCESSFUL</span>
              <h3 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">
                PENDAFTARAN BERHASIL KIRIM!
              </h3>
              <p className="text-xs sm:text-sm text-blue-sail/80 leading-relaxed">
                Terima kasih! Formulir pendaftaran staff TSF Festival 2026 Anda telah kami rekam di basis data pusat. Tim HRD kami akan melakukan kurasi berkas dan segera mengirimkan jadwal wawancara langsung melalui email atau WhatsApp.
              </p>
            </div>

            <button
              id="modal-success-dismiss"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] tracking-widest transition-colors cursor-pointer"
            >
              KEMBALI KE HALAMAN STAFF
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
