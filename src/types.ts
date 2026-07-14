/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EventPhase {
  id: string;
  name: 'staff_recruitment' | 'pe1' | 'pe2' | 'competition' | 'thrift' | 'none';
  label: string;
  status: 'upcoming' | 'active' | 'closed';
  start_date: string;
  end_date: string;
  description: string;
  cta_link: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  quota: number;
  icon_name: string; // references lucide-react icon names
  sub_divisions?: string[];
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
  status: 'pending' | 'accepted' | 'rejected';
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

export interface AppState {
  phases: EventPhase[];
  divisions: Division[];
  staffApplications: StaffApplication[];
  subEvents: SubEvent[];
  competitions: Competition[];
  competitionRegistrations: CompetitionRegistration[];
  thriftProducts: ThriftProduct[];
  thriftVendors: ThriftVendor[];
  vendorApplications: VendorApplication[];
}
