import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || 'tsf_super_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image/file uploads

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = decoded as { username: string };
    next();
  });
};

// Database Initialization helper (Runs migration and seeds automatically)
async function initDatabase() {
  try {
    console.log('Running database migrations...');
    await db.migrate.latest();
    console.log('Migrations complete.');

    const hasAmbassadorTable = await db.schema.hasTable('ambassador_applications');
    if (!hasAmbassadorTable) {
      await db.schema.createTable('ambassador_applications', (table) => {
        table.string('id').primary();
        table.string('role_choice').notNullable();
        table.string('email').notNullable();
        table.string('full_name').notNullable();
        table.string('nrp').nullable();
        table.string('department').nullable();
        table.string('faculty').nullable();
        table.string('grade_class').nullable();
        table.string('school').nullable();
        table.string('instagram').nullable();
        table.string('tiktok').nullable();
        table.string('whatsapp').notNullable();
        table.text('q1_tsf_knowledge').nullable();
        table.text('q2_role_knowledge').nullable();
        table.text('q3_motivation').nullable();
        table.string('q4_commitment_scale').nullable();
        table.text('q5_commitment_reason').nullable();
        table.text('q6_promotion_strategy').nullable();
        table.text('q7_content_type_strategy').nullable();
        table.text('q8_additional_benefits').nullable();
        table.string('q9_info_source').nullable();
        table.string('q9_info_source_friend').nullable();
        table.string('drive_folder_url').nullable();
        table.string('reels_video_url').nullable();
        table.string('status').notNullable().defaultTo('pending');
        table.timestamp('submitted_at').notNullable().defaultTo(db.fn.now());
      });
      console.log('Created ambassador_applications table.');
    }

    // Auto update p-1 phase to ambassador_recruitment and active status
    if (await db.schema.hasTable('event_phases')) {
      await db('event_phases')
        .where({ id: 'p-1' })
        .orWhere({ name: 'staff_recruitment' })
        .update({
          name: 'ambassador_recruitment',
          label: 'Recruitment CI & SA',
          status: 'active',
          start_date: '2026-08-01',
          end_date: '2026-08-31',
          description: 'Open Recruitment Campus Influencer (ITS) & Student Ambassador (SMA/SMK Surabaya) TDC Summit Fest 2026!',
          cta_link: '/recruitment'
        });
    }

    console.log('Running database seeds...');
    // Seed run will automatically skip if database already has data
    await db.seed.run();
    console.log('Database seeds checked/run.');
  } catch (err) {
    console.error('Error during database initialization:', err);
  }
}

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Admin login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const admin = await db('admin_accounts').where({ username }).first();
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin register (Only used if creating new admin accounts)
app.post('/api/auth/register', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const existing = await db('admin_accounts').where({ username }).first();
    if (existing) {
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    await db('admin_accounts').insert({
      username,
      password_hash: hash
    });

    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List Admin Accounts
app.get('/api/auth/admins', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await db('admin_accounts').select('username');
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------------------------------------
// APPLICATION STATE ENDPOINT (LOADS EVERYTHING AT STARTUP)
// -------------------------------------------------------------
app.get('/api/state', async (req: Request, res: Response): Promise<void> => {
  try {
    const phases = await db('event_phases').orderBy('id', 'asc');
    const divisions = await db('divisions').orderBy('id', 'asc');
    const staffApplications = await db('staff_applications').orderBy('submitted_at', 'desc');
    const ambassadorApplications = (await db.schema.hasTable('ambassador_applications'))
      ? await db('ambassador_applications').orderBy('submitted_at', 'desc')
      : [];
    const subEvents = await db('sub_events').orderBy('id', 'asc');
    const competitions = await db('competitions').orderBy('id', 'asc');
    const competitionRegistrations = await db('competition_registrations').orderBy('submitted_at', 'desc');
    const thriftProducts = await db('thrift_products').orderBy('id', 'desc');
    const thriftVendors = await db('thrift_vendors').orderBy('id', 'asc');
    const vendorApplications = await db('vendor_applications').orderBy('submitted_at', 'desc');
    const qConfig = await db('form_questions_config').where({ id: 'main_config' }).first();

    // Map jsonb columns back to object/array types if returned as string (though pg parses JSONB)
    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    res.json({
      phases,
      divisions: divisions.map(d => ({
        ...d,
        sub_divisions: parseJson(d.sub_divisions || '[]'),
        jobdesk: parseJson(d.jobdesk || '[]'),
        skills: d.skills || ''
      })),
      staffApplications: staffApplications.map(a => ({ ...a, custom_form_answers: parseJson(a.custom_form_answers) })),
      ambassadorApplications,
      subEvents: subEvents.map(e => ({
        ...e,
        lineup: parseJson(e.lineup),
        schedule: parseJson(e.schedule),
        gallery: parseJson(e.gallery)
      })),
      competitions: competitions.map(c => ({
        ...c,
        terms: parseJson(c.terms),
        timeline: parseJson(c.timeline)
      })),
      competitionRegistrations: competitionRegistrations.map(r => ({ ...r, members: parseJson(r.members) })),
      thriftProducts: thriftProducts.map(p => ({ ...p, price: Number(p.price) })),
      thriftVendors,
      vendorApplications,
      formQuestions: qConfig ? parseJson(qConfig.config) : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve application state' });
  }
});

// -------------------------------------------------------------
// EVENT PHASES ENDPOINTS
// -------------------------------------------------------------

// Set Active Phase
app.post('/api/phases/active', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { phaseName } = req.body;
  if (!phaseName) {
    res.status(400).json({ message: 'phaseName is required' });
    return;
  }

  try {
    await db.transaction(async (trx) => {
      // 1. Update phases status
      const phases = await trx('event_phases');
      for (const p of phases) {
        let status = p.status;
        if (p.name === phaseName) {
          status = 'active';
        } else if (p.status === 'active') {
          status = 'closed';
        }
        await trx('event_phases').where({ id: p.id }).update({ status });
      }

      // 2. Auto synchronize competition statuses
      if (phaseName === 'competition') {
        await trx('competitions').update({ status: 'active' });
      } else if (phaseName === 'thrift') {
        await trx('competitions').update({ status: 'closed' });
      }
    });

    res.json({ message: 'Active phase updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update active phase' });
  }
});

// Update specific phase details
app.put('/api/phases/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { label, status, start_date, end_date, description, cta_link } = req.body;

  try {
    await db('event_phases').where({ id }).update({
      label,
      status,
      start_date,
      end_date,
      description,
      cta_link
    });
    res.json({ message: 'Phase updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update phase' });
  }
});

// -------------------------------------------------------------
// DIVISIONS ENDPOINTS
// -------------------------------------------------------------

app.post('/api/divisions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { name, description, quota, icon_name, sub_divisions, jobdesk, skills } = req.body;
  const id = `d-${Date.now()}`;

  try {
    await db('divisions').insert({
      id,
      name,
      description,
      quota,
      icon_name,
      sub_divisions: JSON.stringify(sub_divisions || []),
      jobdesk: JSON.stringify(jobdesk || []),
      skills: skills || ''
    });
    res.status(201).json({ id, message: 'Division added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add division' });
  }
});

app.put('/api/divisions/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, quota, icon_name, sub_divisions, jobdesk, skills } = req.body;

  try {
    await db('divisions').where({ id }).update({
      name,
      description,
      quota,
      icon_name,
      sub_divisions: JSON.stringify(sub_divisions || []),
      jobdesk: JSON.stringify(jobdesk || []),
      skills: skills || ''
    });
    res.json({ message: 'Division updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update division' });
  }
});

app.delete('/api/divisions/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await db('divisions').where({ id }).del();
    res.json({ message: 'Division deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete division' });
  }
});

// -------------------------------------------------------------
// AMBASSADOR & INFLUENCER APPLICATIONS ENDPOINTS
// -------------------------------------------------------------

// Submit Ambassador Application (Public)
app.post('/api/ambassador-applications', async (req: Request, res: Response): Promise<void> => {
  const body = req.body || {};
  const role_choice = body.role_choice || body.roleChoice || 'Campus Influencer';
  const email = body.email;
  const full_name = body.full_name || body.fullName || body.name;
  const nrp = body.nrp;
  const department = body.department;
  const faculty = body.faculty;
  const grade_class = body.grade_class || body.gradeClass;
  const school = body.school;
  const instagram = body.instagram;
  const tiktok = body.tiktok;
  const whatsapp = body.whatsapp || body.phone;
  const q1_tsf_knowledge = body.q1_tsf_knowledge || body.q1_tsfKnowledge;
  const q2_role_knowledge = body.q2_role_knowledge || body.q2_roleKnowledge;
  const q3_motivation = body.q3_motivation;
  const q4_commitment_scale = body.q4_commitment_scale || body.q4_commitmentScale;
  const q5_commitment_reason = body.q5_commitment_reason || body.q5_commitmentReason;
  const q6_promotion_strategy = body.q6_promotion_strategy || body.q6_promotionStrategy;
  const q7_content_type_strategy = body.q7_content_type_strategy || body.q7_contentTypeStrategy;
  const q8_additional_benefits = body.q8_additional_benefits || body.q8_additionalBenefits;
  const q9_info_source = body.q9_info_source || body.q9_infoSource;
  const q9_info_source_friend = body.q9_info_source_friend || body.q9_infoSourceFriend;
  const drive_folder_url = body.drive_folder_url || body.driveFolderUrl || '-';
  const reels_video_url = body.reels_video_url || body.reelsVideoUrl || '-';

  if (!email || !full_name || !whatsapp) {
    res.status(400).json({ message: 'Lengkapi seluruh data wajib (email, nama lengkap, whatsapp)!' });
    return;
  }

  const id = `amb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const submitted_at = new Date().toISOString();

  try {
    await db('ambassador_applications').insert({
      id,
      role_choice,
      email,
      full_name,
      nrp: nrp || null,
      department: department || null,
      faculty: faculty || null,
      grade_class: grade_class || null,
      school: school || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      whatsapp,
      q1_tsf_knowledge: q1_tsf_knowledge || null,
      q2_role_knowledge: q2_role_knowledge || null,
      q3_motivation: q3_motivation || null,
      q4_commitment_scale: q4_commitment_scale || null,
      q5_commitment_reason: q5_commitment_reason || null,
      q6_promotion_strategy: q6_promotion_strategy || null,
      q7_content_type_strategy: q7_content_type_strategy || null,
      q8_additional_benefits: q8_additional_benefits || null,
      q9_info_source: q9_info_source || null,
      q9_info_source_friend: q9_info_source_friend || null,
      drive_folder_url,
      reels_video_url,
      status: 'pending',
      submitted_at
    });

    console.log(`Successfully stored ambassador application [${id}] for ${full_name}`);
    res.status(201).json({ id, message: 'Pendaftaran berhasil dikirim' });
  } catch (err) {
    console.error('Error inserting ambassador application:', err);
    res.status(500).json({ message: 'Gagal mengirim pendaftaran' });
  }
});

// Update Ambassador Application Status (Admin Authenticated)
app.put('/api/ambassador-applications/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Status tidak valid' });
    return;
  }

  try {
    await db('ambassador_applications').where({ id }).update({ status });
    res.json({ message: 'Status pendaftar berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui status pendaftar' });
  }
});

// -------------------------------------------------------------
// STAFF APPLICATIONS ENDPOINTS
// -------------------------------------------------------------

// Submit staff application (Public)
app.post('/api/staff-applications', async (req: Request, res: Response): Promise<void> => {
  res.status(403).json({ message: 'Pendaftaran staff panitia TSF 2026 telah ditutup.' });
  return;

  const data = req.body;

  try {
    const id = `app-s-${Date.now()}`;
    await db('staff_applications').insert({
      id,
      full_name: data.full_name,
      nim: data.nim,
      faculty: data.faculty || null,
      department: data.department || null,
      major: data.major,
      batch: data.batch,
      phone: data.phone,
      email: data.email,
      instagram: data.instagram || null,
      division_priority_1: data.division_priority_1,
      division_priority_2: data.division_priority_2,
      motivation: data.motivation,
      file_url: data.file_url || null,
      drive_folder_link: data.drive_folder_link || null,
      ktm_krs_link: data.ktm_krs_link || null,
      cv_link: data.cv_link || null,
      repost_link: data.repost_link || null,
      twibbon_link: data.twibbon_link || null,
      ig_follow_link: data.ig_follow_link || null,
      tiktok_follow_link: data.tiktok_follow_link || null,
      general_knowledge: data.general_knowledge || null,
      general_motivation: data.general_motivation || null,
      experience: data.experience || null,
      strengths_weaknesses: data.strengths_weaknesses || null,
      commitment_scale: data.commitment_scale ? parseInt(data.commitment_scale) : null,
      commitment_form: data.commitment_form || null,
      busy_schedule: data.busy_schedule || null,
      relations: data.relations || null,
      paid_ikoma: data.paid_ikoma || null,
      ikoma_proof_url: data.ikoma_proof_url || null,
      div_task_answer_1: data.div_task_answer_1 || null,
      div_task_answer_2: data.div_task_answer_2 || null,
      custom_form_answers: JSON.stringify(data.custom_form_answers || {}),
      status: 'pending',
      submitted_at: new Date()
    });

    res.status(201).json({ id, message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Update application status (Admin)
app.put('/api/staff-applications/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  try {
    await db('staff_applications').where({ id }).update({ status });
    res.json({ message: 'Application status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// Update application berkas selection status (Admin)
app.put('/api/staff-applications/:id/status-berkas', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status_berkas, interview_schedule, whatsapp_group_link } = req.body;

  if (!['pending', 'lolos', 'gagal'].includes(status_berkas)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  try {
    await db('staff_applications').where({ id }).update({
      status_berkas,
      interview_schedule: interview_schedule || null,
      whatsapp_group_link: whatsapp_group_link || null
    });
    res.json({ message: 'Application berkas status updated successfully' });
  } catch (err) {
    console.error('Error updating berkas status:', err);
    res.status(500).json({ message: 'Failed to update application berkas status' });
  }
});

// Helper to get passed division name dynamically from the final lists
const getPassedDivision = (nim: string): string | null => {
  const finalPassedData: Record<string, string[]> = {
    'Sub Divisi Event - Competition': [
      '5026251177', '5010251074', '5003251097', '5015251154', '5033251050',
      '5015251058', '5005251039', '5008251103', '5008251203', '5007251176',
      '5052251029', '5016251041'
    ],
    'Sub Divisi Event - Non Competition': [
      '5009251027', '5023251093', '5020251096', '2043251010', '5016251021',
      '5010251077', '5015251084', '2043251079', '5015251105', '5018251006',
      '5050251040', '2043251107', '5026251188', '5015251093', '5027251047'
    ],
    'Sub Divisi Operasional - Logistic, Technical, Equipment (LTE)': [
      '5015251045', '5015251077', '5015251155', '5006251072', '5033251063',
      '5048251003', '5048251047', '2036251086', '2035251055', '2036251060',
      '2041251031', '2041251109', '5010251170', '5019251112'
    ],
    'Sub Divisi Operasional - Secure & Licence': [
      '5020251115', '5028251072', '5045251029', '5016251070', '5007251187',
      '5003251111', '5046251014', '5015251142', '5033251127', '5051251023',
      '5016251055', '5023251107', '5003251106', '5031251146', '2036251069',
      '5003251010', '2035251061', '5057251008', '2036251088', '2041251058',
      '2035251086', '5022251055'
    ],
    'Sub Divisi Operasional - Health & Consumption': [
      '5008251043', '5015251018', '2039251078', '5050251033', '5007251163',
      '5046251045', '5015251069', '2036251036', '5048251065', '5018251008',
      '5033251134', '5056251030', '5018251091', '5057251029', '5049251053',
      '5022251178', '5019251018'
    ],
    'Divisi Data Management': [
      '5003251104', '5003251023', '5016251061', '5024251067', '5003251176',
      '5003251059', '5033251002', '5031251107', '5003251058', '5057251017',
      '5057251037', '5003251052'
    ],
    'Sub Divisi Finance - Sponsorship': [
      '5049251047', '5014251076', '2043251068', '5004251039', '5002251114',
      '5057251005', '5002251065', '5027251011', '5057251011', '5026251192',
      '5033251077', '2035251052'
    ],
    'Sub Divisi Finance - Fundraising': [
      '5029251103', '5003251169', '5061251009', '5021251006', '2039251031',
      '5031251018', '5027251056', '5027251032', '027251032', '27251032',
      '5020251058', '5031251011', '2043251008', '2036251079', '5012251171',
      '5012251162', '2036251063', '5019251082', '5033251035', '5033251104',
      '5031251027', '5023251021'
    ],
    'Sub Divisi BnM - Creative Design': [
      '5027251037', '5015251127', '5024251009', '2041251070', '5013251090',
      '5028251086', '5015251015', '5028251017', '028251017', '28251017', '05028251017',
      '5013251013', '5028251084', '028251084', '28251084', '05028251084'
    ],
    'Sub Divisi BnM - Talent Management': [
      '5002251037', '5029251056', '5015251075', '5049251048', '5001251049',
      '5015251108', '2043251011', '2036251054', '5056251010'
    ],
    'Sub Divisi BnM - Marketing Strategist': [
      '5014251082', '5007251153', '2043251083', '5008251154', '5029251099',
      '5029251016', '5026251028', '5033251132', '5025251273', '2042251120',
      '5028251058', '2035251077', '5029251101'
    ],
    'Sub Divisi BnM - Media Production': [
      '5029251094', '5025251081', '5021251017', '5014251100', '2043251019',
      '5028251083'
    ],
    'Divisi Decoration': [
      '2039251020', '5015251112', '5030251141', '5028251092', '2035251004',
      '5057251004', '5029251109', '5022251097', '5050251048', '5030251092'
    ],
    'Sub Divisi Public Relation': [
      '5007251088', '5021251071', '5031251053', '2041251026', '5021251070',
      '2036251045', '5013251132', '5015251051', '5007251106', '5015251136',
      '5050251045', '5026251027', '5026251068', '5016251114', '5021251053',
      '5019251138', '5053251027', '5028251048', '5003251108', '5033251017',
      '5016251013', '5031251076', '5023251038'
    ]
  };

  for (const [division, nimsList] of Object.entries(finalPassedData)) {
    if (nimsList.includes(nim)) {
      return division;
    }
  }
  return null;
};

// Get staff recruitment announcement by NRP/NIM (Public)
app.get('/api/announcement/:nim', async (req: Request, res: Response): Promise<void> => {
  const { nim } = req.params;
  if (!nim) {
    res.status(400).json({ message: 'NRP/NIM is required' });
    return;
  }

  // Fallback search options for specific candidate with NRP typo
  let searchNims = [nim];
  if (nim === '5027251032' || nim === '027251032' || nim === '27251032') {
    searchNims = ['5027251032', '027251032', '27251032'];
  } else if (nim === '5028251084' || nim === '028251084' || nim === '28251084' || nim === '05028251084') {
    searchNims = ['5028251084', '028251084', '28251084', '05028251084'];
  } else if (nim === '5028251017' || nim === '028251017' || nim === '28251017' || nim === '05028251017') {
    searchNims = ['5028251017', '028251017', '28251017', '05028251017'];
  }

  try {
    const applicant = await db('staff_applications').whereIn('nim', searchNims).first();
    if (!applicant) {
      res.status(404).json({ message: 'Data pendaftaran tidak ditemukan. Silakan cek kembali NRP Anda.' });
      return;
    }

    let correctedNim = (nim === '5027251032' || nim === '027251032' || nim === '27251032') ? '5027251032' : applicant.nim;
    if (['5028251084', '028251084', '28251084', '05028251084'].includes(correctedNim)) {
      correctedNim = '5028251084';
    } else if (['5028251017', '028251017', '28251017', '05028251017'].includes(correctedNim)) {
      correctedNim = '5028251017';
    }
    const passedDivision = getPassedDivision(correctedNim);

    res.json({
      full_name: applicant.full_name,
      nim: correctedNim,
      division_priority_1: passedDivision ? passedDivision : applicant.division_priority_1,
      division_priority_2: applicant.division_priority_2,
      status_berkas: passedDivision ? 'lolos' : 'gagal',
      interview_schedule: passedDivision ? 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0' : null,
      whatsapp_group_link: null
    });
  } catch (err) {
    console.error('Error fetching announcement:', err);
    res.status(500).json({ message: 'Gagal mengambil data pengumuman' });
  }
});

// Get staff recruitment final interview announcement by NRP/NIM (Public)
app.get('/api/interview-announcement/:nim', async (req: Request, res: Response): Promise<void> => {
  const { nim } = req.params;
  if (!nim) {
    res.status(400).json({ message: 'NRP/NIM is required' });
    return;
  }

  // Fallback search options for specific candidate with NRP typo
  let searchNims = [nim];
  if (nim === '5027251032' || nim === '027251032' || nim === '27251032') {
    searchNims = ['5027251032', '027251032', '27251032'];
  } else if (nim === '5028251084' || nim === '028251084' || nim === '28251084' || nim === '05028251084') {
    searchNims = ['5028251084', '028251084', '28251084', '05028251084'];
  } else if (nim === '5028251017' || nim === '028251017' || nim === '28251017' || nim === '05028251017') {
    searchNims = ['5028251017', '028251017', '28251017', '05028251017'];
  }

  // Set of NRPs that officially passed the interview
  const passedInterviewNims = new Set([
    '5010251074', '5003251097', '5015251154', '5015251093', '5008251103',
    '5008251203', '5016251041', '5026251177', '5015251058', '5010251077',
    '2043251079', '5015251105', '5018251006', '5026251188', '2043251107',
    '5027251047', '5016251021', '5033251063', '2041251031', '5019251112',
    '5010251170', '5015251077', '5048251003', '5015251155', '5015251045',
    '5045251029', '5007251187', '5003251106', '5003251111', '5016251070',
    '5016251055', '2036251088', '5020251115', '5008251043', '5046251045',
    '5048251065', '5056251030', '5049251053', '5022251178', '5003251023',
    '5003251104', '5003251176', '5033251002', '5003251052', '5057251037',
    '5049251047', '5014251076', '5027251011', '5057251011', '5033251077',
    '2043251068', '5004251039', '5002251114', '2039251031', '5031251011',
    '5061251009', '5023251021', '5031251018', '5021251006', '5012251171',
    '5027251056', '5029251103', '5033251035', '5029251094', '5025251081',
    '5021251017', '2043251019', '5028251083', '5027251037', '5015251127',
    '5013251090', '5028251086', '5015251015', '5028251017', '5013251013',
    '5028251084', '2036251054', '5056251010', '5002251037', '5029251056',
    '5049251048', '5015251108', '5014251082', '5007251153', '5008251154',
    '5029251099', '5026251028', '5025251273', '2042251120', '5028251058',
    '2036251045', '5019251138', '5053251027', '5028251048', '5031251076',
    '5026251027', '5026251068', '5016251114', '5031251053', '5030251092',
    '5057251004', '5015251112', '5029251109', '5050251048', '2039251020',
    '5030251141',
    // include dummy test NRPs as accepted
    '5053251003', '99999999'
  ]);

  try {
    let applicant = await db('staff_applications').whereIn('nim', searchNims).first();
    
    // Hardcoded fallback for Aeesha and Dava if their record is not found in database
    if (!applicant) {
      const cleanNim = (nim === '5027251032' || nim === '027251032' || nim === '27251032') ? '5027251032' : nim;
      if (['5028251084', '028251084', '28251084', '05028251084'].includes(cleanNim)) {
        applicant = {
          full_name: "Aeesha Na'ilah Syifa'",
          nim: '5028251084',
          division_priority_1: 'Sub Divisi BnM - Creative Design'
        };
      } else if (['5028251017', '028251017', '28251017', '05028251017'].includes(cleanNim)) {
        applicant = {
          full_name: 'Dava Febriansyah',
          nim: '5028251017',
          division_priority_1: 'Sub Divisi BnM - Creative Design'
        };
      }
    }

    if (!applicant) {
      res.status(404).json({ message: 'Data pendaftaran tidak ditemukan. Silakan cek kembali NRP Anda.' });
      return;
    }

    let correctedNim = (nim === '5027251032' || nim === '027251032' || nim === '27251032') ? '5027251032' : applicant.nim;
    if (['5028251084', '028251084', '28251084', '05028251084'].includes(correctedNim)) {
      correctedNim = '5028251084';
    } else if (['5028251017', '028251017', '28251017', '05028251017'].includes(correctedNim)) {
      correctedNim = '5028251017';
    }

    const passedDivision = getPassedDivision(correctedNim);
    const isAccepted = passedInterviewNims.has(correctedNim);

    res.json({
      full_name: applicant.full_name,
      nim: correctedNim,
      division: passedDivision ? passedDivision : applicant.division_priority_1,
      status: isAccepted ? 'accepted' : 'rejected',
      whatsapp_group_link: isAccepted ? 'https://chat.whatsapp.com/dummylink123' : null
    });
  } catch (err) {
    console.error('Error fetching interview announcement:', err);
    res.status(500).json({ message: 'Gagal mengambil data pengumuman wawancara' });
  }
});

// -------------------------------------------------------------
// SUB EVENTS PE1 & PE2 ENDPOINTS
// -------------------------------------------------------------

app.put('/api/sub-events/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, date, location, lineup, schedule, gallery, status } = req.body;

  try {
    await db('sub_events').where({ id }).update({
      title,
      description,
      date,
      location,
      lineup: JSON.stringify(lineup || []),
      schedule: JSON.stringify(schedule || []),
      gallery: JSON.stringify(gallery || []),
      status
    });
    res.json({ message: 'Sub event updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update sub event' });
  }
});

// -------------------------------------------------------------
// COMPETITIONS ENDPOINTS
// -------------------------------------------------------------

app.post('/api/competitions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { title, description, category, terms, prize, timeline, guidebook_url, status } = req.body;
  const id = `c-${Date.now()}`;

  try {
    await db('competitions').insert({
      id,
      title,
      description,
      category,
      terms: JSON.stringify(terms || []),
      prize,
      timeline: JSON.stringify(timeline || []),
      guidebook_url,
      status
    });
    res.status(201).json({ id, message: 'Competition added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add competition' });
  }
});

app.put('/api/competitions/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, category, terms, prize, timeline, guidebook_url, status } = req.body;

  try {
    await db('competitions').where({ id }).update({
      title,
      description,
      category,
      terms: JSON.stringify(terms || []),
      prize,
      timeline: JSON.stringify(timeline || []),
      guidebook_url,
      status
    });
    res.json({ message: 'Competition updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update competition' });
  }
});

app.delete('/api/competitions/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await db('competitions').where({ id }).del();
    res.json({ message: 'Competition deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete competition' });
  }
});

// Submit registration (Public)
app.post('/api/competition-registrations', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const id = `reg-c-${Date.now()}`;

  try {
    await db('competition_registrations').insert({
      id,
      team_name: data.team_name,
      leader_name: data.leader_name,
      members: JSON.stringify(data.members || []),
      institution: data.institution,
      contact: data.contact,
      email: data.email,
      category_id: data.category_id,
      payment_proof_url: data.payment_proof_url,
      file_url: data.file_url,
      submitted_at: new Date()
    });
    res.status(201).json({ id, message: 'Registration submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit registration' });
  }
});

// -------------------------------------------------------------
// THRIFT VENDORS ENDPOINTS
// -------------------------------------------------------------

app.post('/api/thrift-vendors', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { vendor_name, booth_location, contact, status } = req.body;
  const id = `v-${Date.now()}`;

  try {
    await db('thrift_vendors').insert({
      id,
      vendor_name,
      booth_location,
      contact,
      status
    });
    res.status(201).json({ id, message: 'Vendor added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add vendor' });
  }
});

app.put('/api/thrift-vendors/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { vendor_name, booth_location, contact, status } = req.body;

  try {
    await db('thrift_vendors').where({ id }).update({
      vendor_name,
      booth_location,
      contact,
      status
    });
    res.json({ message: 'Vendor updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update vendor' });
  }
});

app.delete('/api/thrift-vendors/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // cascades delete products through FK
    await db('thrift_vendors').where({ id }).del();
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete vendor' });
  }
});

// Apply as Thrift Vendor (Public)
app.post('/api/vendor-applications', async (req: Request, res: Response): Promise<void> => {
  const { vendor_name, contact, product_category, description } = req.body;
  const id = `app-v-${Date.now()}`;

  try {
    await db('vendor_applications').insert({
      id,
      vendor_name,
      contact,
      product_category,
      description,
      submitted_at: new Date()
    });
    res.status(201).json({ id, message: 'Vendor application submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// -------------------------------------------------------------
// THRIFT PRODUCTS ENDPOINTS
// -------------------------------------------------------------

app.post('/api/thrift-products', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { name, price, condition, category, image_url, vendor_id, status } = req.body;
  const id = `p-${Date.now()}`;

  try {
    await db('thrift_products').insert({
      id,
      name,
      price,
      condition,
      category,
      image_url,
      vendor_id,
      status
    });
    res.status(201).json({ id, message: 'Product added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

app.put('/api/thrift-products/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, price, condition, category, image_url, vendor_id, status } = req.body;

  try {
    await db('thrift_products').where({ id }).update({
      name,
      price,
      condition,
      category,
      image_url,
      vendor_id,
      status
    });
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/api/thrift-products/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await db('thrift_products').where({ id }).del();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// -------------------------------------------------------------
// FORM QUESTIONS CONFIG ENDPOINTS
// -------------------------------------------------------------

app.put('/api/form-questions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const config = req.body;

  try {
    await db('form_questions_config')
      .where({ id: 'main_config' })
      .update({ config: JSON.stringify(config) });
    res.json({ message: 'Questions configuration updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update questions config' });
  }
});

// -------------------------------------------------------------
// RESET DATABASE ENDPOINT (Admin)
// -------------------------------------------------------------
app.post('/api/reset', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Resetting database...');
    
    // Delete data from tables in correct dependency order
    await db('staff_applications').del();
    await db('vendor_applications').del();
    await db('competition_registrations').del();
    await db('thrift_products').del();
    await db('thrift_vendors').del();
    await db('competitions').del();
    await db('sub_events').del();
    await db('divisions').del();
    await db('event_phases').del();
    await db('admin_accounts').del();
    await db('form_questions_config').del();

    // Run seed forcing re-population since we deleted data
    await db.seed.run();
    
    res.json({ message: 'Database reset to default successful' });
  } catch (err) {
    console.error('Failed to reset database:', err);
    res.status(500).json({ message: 'Failed to reset database' });
  }
});

// Serve static frontend build files in production if dist exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDatabase();
});
