/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EventPhase {
  id: string;
  name: 'staff_recruitment' | 'pe1' | 'pe2' | 'competition' | 'thrift' | 'ambassador_recruitment' | 'none';
  label: string;
  status: 'upcoming' | 'active' | 'closed';
  start_date: string;
  end_date: string;
  description: string;
  cta_link: string;
}

export interface SubDivisionConfig {
  name: string;
  description: string;
  jobdesk: string[];
  skills: string;
}

export interface Division {
  id: string;
  name: string;
  description: string; // Will store either raw text (fallback) or stringified JSON { tugasPokok, jobdesk, skills }
  quota: number;
  icon_name: string;
  sub_divisions?: SubDivisionConfig[];
  jobdesk?: string[];
  skills?: string;
}

export interface StaffApplication {
  id: string;
  full_name: string;
  nim: string;
  faculty?: string;
  department?: string;
  major: string;
  batch: string; // angkatan (e.g. "2023", "2024")
  phone: string;
  email: string;
  instagram?: string;
  division_priority_1: string;
  division_priority_2: string;
  motivation: string;
  file_url?: string;
  drive_folder_link?: string;
  ktm_krs_link?: string;
  cv_link?: string;
  repost_link?: string;
  twibbon_link?: string;
  ig_follow_link?: string;
  tiktok_follow_link?: string;
  // General Task Fields
  general_knowledge?: string;
  general_motivation?: string;
  experience?: string;
  strengths_weaknesses?: string;
  commitment_scale?: number;
  commitment_form?: string;
  busy_schedule?: string;
  relations?: string;
  paid_ikoma?: string; // 'yes' | 'no'
  ikoma_proof_url?: string;
  div_task_answer_1?: string;
  div_task_answer_2?: string;
  custom_form_answers?: Record<string, string>;
  status: 'pending' | 'accepted' | 'rejected';
  status_berkas?: 'pending' | 'lolos' | 'gagal';
  interview_schedule?: string | null;
  whatsapp_group_link?: string | null;
  submitted_at: string;
}

export interface LineupItem {
  name: string;
  role: string;
  imageUrl: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface SubEvent {
  id: string;
  slug: 'pe1' | 'pe2';
  title: string;
  description: string;
  date: string;
  location: string;
  lineup: LineupItem[];
  schedule: ScheduleItem[];
  gallery: string[];
  status: 'upcoming' | 'active' | 'completed';
}

export interface TimelineStep {
  step: string;
  date: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  category: string;
  terms: string[];
  prize: string;
  timeline: TimelineStep[];
  guidebook_url: string;
  status: 'upcoming' | 'active' | 'closed';
}

export interface CompetitionRegistration {
  id: string;
  team_name: string;
  leader_name: string;
  members: string[]; // member names
  institution: string;
  contact: string; // WhatsApp
  email: string;
  category_id: string; // references Competition.id
  payment_proof_url: string; // or base64 dataUrl
  file_url?: string; // registration files
  submitted_at: string;
}

export interface ThriftProduct {
  id: string;
  name: string;
  price: number;
  condition: string; // e.g. "9.5/10", "Like New"
  category: string; // "clothing" | "accessories" | "shoes" | "outerwear"
  image_url: string;
  vendor_id: string; // references ThriftVendor.id
  status: 'available' | 'sold';
}

export interface ThriftVendor {
  id: string;
  vendor_name: string;
  booth_location: string;
  contact: string;
  status: 'active' | 'inactive';
}

export interface VendorApplication {
  id: string;
  vendor_name: string;
  contact: string;
  product_category: string;
  description: string;
  submitted_at: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface QuestionConfig {
  id: string;
  text: string;
  type: 'text' | 'select';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface FormQuestionsConfig {
  dataDiri: FormFieldConfig[];
  generalTask: QuestionConfig[];
  berkas: FormFieldConfig[];
  divisionTasks: Record<string, QuestionConfig[]>;
}

export interface AmbassadorApplication {
  id: string;
  role_choice: 'Campus Influencer' | 'Student Ambassador';
  email: string;
  full_name: string;
  nrp?: string;
  department?: string;
  faculty?: string;
  grade_class?: string;
  school?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp: string;
  q1_tsf_knowledge?: string;
  q2_role_knowledge?: string;
  q3_motivation?: string;
  q4_commitment_scale?: string;
  q5_commitment_reason?: string;
  q6_promotion_strategy?: string;
  q7_content_type_strategy?: string;
  q8_additional_benefits?: string;
  q9_info_source?: string;
  q9_info_source_friend?: string;
  drive_folder_url: string;
  reels_video_url: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
}

export interface PE1Registration {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  status_current: 'Siswa SMA' | 'Mahasiswa' | 'Fresh Graduate' | 'Umum';
  institution: string;
  major?: string;
  city: string;
  package_choice: 'Aspiring CEO' | 'Rising CEO' | 'Executive CEO' | 'Absolute CEO';
  instagram_username?: string;
  social_proof_drive_url?: string;
  payment_method?: 'QRIS' | 'DANA' | 'Bank Transfer';
  payment_proof_url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  submitted_at: string;
}

export interface AppState {
  phases: EventPhase[];
  divisions: Division[];
  staffApplications: StaffApplication[];
  ambassadorApplications?: AmbassadorApplication[];
  pe1Registrations?: PE1Registration[];
  subEvents: SubEvent[];
  competitions: Competition[];
  competitionRegistrations: CompetitionRegistration[];
  thriftProducts: ThriftProduct[];
  thriftVendors: ThriftVendor[];
  vendorApplications: VendorApplication[];
  formQuestions?: FormQuestionsConfig;
}

