import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import db from './db';

const getDirname = () => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) return __dirname;
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {}
  return process.cwd();
};
const appDir = getDirname();

// Load environment variables
dotenv.config({ path: path.join(appDir, '..', '.env') });
dotenv.config({ path: path.join(appDir, '.env') });

const app = express();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || 'tsf_super_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

    // Auto-create pe1_registrations table if missing
    const hasPe1Table = await db.schema.hasTable('pe1_registrations');
    if (!hasPe1Table) {
      await db.schema.createTable('pe1_registrations', (table) => {
        table.string('id').primary();
        table.string('full_name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.string('status_current').notNullable();
        table.string('institution').notNullable();
        table.string('major').nullable();
        table.string('city').notNullable();
        table.string('package_choice').notNullable();
        table.string('instagram_username').nullable();
        table.string('social_proof_drive_url').nullable();
        table.string('payment_method').nullable();
        table.string('payment_proof_url').nullable();
        table.string('status').notNullable().defaultTo('pending');
        table.timestamp('submitted_at').notNullable().defaultTo(db.fn.now());
      });
      console.log('Created pe1_registrations table.');
    }

    // Auto-create users table if missing
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      await db.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password_hash').nullable();
        table.string('auth_provider').notNullable().defaultTo('email');
        table.string('google_id').nullable();
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      });
      console.log('Created users table.');
    }

    // Auto update competition_registrations table if missing new columns
    await ensureCompetitionColumns();

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

// Helper to guarantee users table exists across PostgreSQL and SQLite environments
async function ensureUsersTable() {
  try {
    const hasUsersTable = await db.schema.hasTable('users');
    if (!hasUsersTable) {
      await db.schema.createTable('users', (table) => {
        table.string('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password_hash').nullable();
        table.string('auth_provider').notNullable().defaultTo('email');
        table.string('google_id').nullable();
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
      });
      console.log('Auto-created missing users table.');
    }
  } catch (e) {
    console.error('ensureUsersTable warning:', e);
  }
}

// Helper to guarantee all columns (including user_id) exist in competition_registrations
async function ensureCompetitionColumns() {
  try {
    const hasTable = await db.schema.hasTable('competition_registrations');
    if (!hasTable) return;

    const columns: { name: string; type: 'string' | 'text' | 'timestamp'; defaultVal?: string }[] = [
      { name: 'user_id', type: 'string' },
      { name: 'competition_type', type: 'string' },
      { name: 'education_category', type: 'string' },
      { name: 'team_size', type: 'string' },
      { name: 'leader_data', type: 'text' },
      { name: 'members_data', type: 'text' },
      { name: 'ig_story_file_url', type: 'text' },
      { name: 'twibbon_file_url', type: 'text' },
      { name: 'ig_follow_file_url', type: 'text' },
      { name: 'status_stage', type: 'string', defaultVal: 'preliminary' },
      { name: 'status_preliminary', type: 'string', defaultVal: 'pending' },
      { name: 'status_semifinal', type: 'string', defaultVal: 'pending' },
      { name: 'status_final', type: 'string', defaultVal: 'pending' },
      { name: 'preliminary_file_url', type: 'text' },
      { name: 'preliminary_file_name', type: 'string' },
      { name: 'preliminary_file_type', type: 'string' },
      { name: 'preliminary_submitted_at', type: 'timestamp' },
      { name: 'payment_semifinal_url', type: 'text' },
      { name: 'payment_semifinal_file_name', type: 'string' },
      { name: 'payment_semifinal_status', type: 'string', defaultVal: 'none' },
      { name: 'payment_semifinal_submitted_at', type: 'timestamp' },
      { name: 'semifinal_file_url', type: 'text' },
      { name: 'semifinal_file_name', type: 'string' },
      { name: 'semifinal_submitted_at', type: 'timestamp' }
    ];

    for (const col of columns) {
      const hasCol = await db.schema.hasColumn('competition_registrations', col.name);
      if (!hasCol) {
        await db.schema.alterTable('competition_registrations', (table) => {
          if (col.type === 'string') {
            const c = table.string(col.name).nullable();
            if (col.defaultVal) c.defaultTo(col.defaultVal);
          } else if (col.type === 'text') {
            table.text(col.name).nullable();
          } else if (col.type === 'timestamp') {
            table.timestamp(col.name).nullable();
          }
        });
        console.log(`Added missing column ${col.name} to competition_registrations.`);
      }
    }
  } catch (e) {
    console.error('ensureCompetitionColumns warning:', e);
  }
}

// Helper to guarantee valid categories exist in competitions table to satisfy Foreign Key constraints
async function ensureCompetitionCategories() {
  try {
    const hasTable = await db.schema.hasTable('competitions');
    if (!hasTable) return;

    const defaultCategories = [
      { id: 'c-1', title: 'Business Plan Competition (BPC)', category: 'Business', status: 'active' },
      { id: 'c-2', title: 'Business Case Competition (BCC)', category: 'Business', status: 'active' },
      { id: 'BPC', title: 'Business Plan Competition (BPC)', category: 'Business', status: 'active' },
      { id: 'BCC', title: 'Business Case Competition (BCC)', category: 'Business', status: 'active' },
      { id: 'BPC - Mahasiswa', title: 'BPC - Mahasiswa', category: 'Business', status: 'active' },
      { id: 'BPC - SMA/Sederajat', title: 'BPC - SMA/Sederajat', category: 'Business', status: 'active' },
      { id: 'BCC - Mahasiswa', title: 'BCC - Mahasiswa', category: 'Business', status: 'active' }
    ];

    for (const comp of defaultCategories) {
      const exists = await db('competitions').where({ id: comp.id }).first();
      if (!exists) {
        await db('competitions').insert({
          id: comp.id,
          title: comp.title,
          description: 'TDC Summit Fest 2026 Business Competition',
          category: comp.category,
          terms: JSON.stringify(['Syarat dan Ketentuan Kompetisi TSF 2026']),
          prize: 'Total Hadiah Rp 50.000.000',
          timeline: JSON.stringify([{ step: 'Preliminary', date: '5 Sep - 10 Okt 2026' }]),
          guidebook_url: '#',
          status: comp.status
        });
        console.log(`Auto-seeded competition category ${comp.id}.`);
      }
    }
  } catch (e) {
    console.error('ensureCompetitionCategories warning:', e);
  }
}

// User Register (Email & Password)
app.post('/api/user/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Nama, Email, dan Password wajib diisi' });
    return;
  }

  const cleanEmail = String(email || '').toLowerCase().trim();
  const cleanName = String(name || '').trim();

  try {
    await ensureUsersTable();
    const existing = await db('users').where({ email: cleanEmail }).first();
    if (existing) {
      res.status(400).json({ message: 'Email ini sudah terdaftar. Silakan gunakan menu Login.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = `usr-${Date.now()}`;

    const created_at = new Date().toISOString();
    const newUser = {
      id,
      name: cleanName,
      email: cleanEmail,
      password_hash,
      auth_provider: 'email',
      created_at
    };

    await db('users').insert(newUser);

    const token = jwt.sign({ id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id, name: newUser.name, email: newUser.email, auth_provider: 'email', created_at }
    });
  } catch (err: any) {
    console.error('Registration server error:', err);
    res.status(500).json({ message: err.message || 'Gagal membuat akun' });
  }
});

// User Login (Email & Password)
app.post('/api/user/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email dan Password wajib diisi' });
    return;
  }

  const cleanEmail = String(email || '').toLowerCase().trim();

  try {
    await ensureUsersTable();
    const user = await db('users').where({ email: cleanEmail }).first();
    if (!user || !user.password_hash) {
      res.status(401).json({ message: 'Email atau password yang Anda masukkan salah' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ message: 'Email atau password yang Anda masukkan salah' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, auth_provider: user.auth_provider, created_at: user.created_at }
    });
  } catch (err: any) {
    console.error('Login server error:', err);
    res.status(500).json({ message: err.message || 'Gagal melakukan login' });
  }
});

// User Google Login / Register (1-Click / OAuth Simulation)
app.post('/api/user/google', async (req: Request, res: Response): Promise<void> => {
  const { name, email, google_id } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email Google wajib diisi' });
    return;
  }

  try {
    let user = await db('users').where({ email: email.toLowerCase() }).first();
    if (!user) {
      const id = `usr-g-${Date.now()}`;
      const newUser = {
        id,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        auth_provider: 'google',
        google_id: google_id || `g-${Date.now()}`,
        created_at: new Date()
      };
      await db('users').insert(newUser);
      user = newUser;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, auth_provider: user.auth_provider, created_at: user.created_at }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal login via Gmail' });
  }
});

// Get User Profile from Token
app.get('/api/user/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token tidak ditemukan' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      auth_provider: user.auth_provider,
      created_at: user.created_at
    });
  } catch (err) {
    res.status(403).json({ message: 'Token tidak valid' });
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
    const phases = (await db.schema.hasTable('event_phases')) ? await db('event_phases').orderBy('id', 'asc') : [];
    const divisions = (await db.schema.hasTable('divisions')) ? await db('divisions').orderBy('id', 'asc') : [];
    const staffApplications = (await db.schema.hasTable('staff_applications')) ? await db('staff_applications').orderBy('submitted_at', 'desc') : [];
    const ambassadorApplications = (await db.schema.hasTable('ambassador_applications'))
      ? await db('ambassador_applications').orderBy('submitted_at', 'desc')
      : [];
    const pe1Registrations = (await db.schema.hasTable('pe1_registrations'))
      ? await db('pe1_registrations').orderBy('submitted_at', 'desc')
      : [];
    const subEvents = (await db.schema.hasTable('sub_events')) ? await db('sub_events').orderBy('id', 'asc') : [];
    const competitions = (await db.schema.hasTable('competitions')) ? await db('competitions').orderBy('id', 'asc') : [];
    const competitionRegistrations = (await db.schema.hasTable('competition_registrations')) ? await db('competition_registrations').orderBy('submitted_at', 'desc') : [];
    const thriftProducts = (await db.schema.hasTable('thrift_products')) ? await db('thrift_products').orderBy('id', 'desc') : [];
    const thriftVendors = (await db.schema.hasTable('thrift_vendors')) ? await db('thrift_vendors').orderBy('id', 'asc') : [];
    const vendorApplications = (await db.schema.hasTable('vendor_applications')) ? await db('vendor_applications').orderBy('submitted_at', 'desc') : [];
    const qConfig = (await db.schema.hasTable('form_questions_config')) ? await db('form_questions_config').where({ id: 'main_config' }).first() : undefined;
    const users = (await db.schema.hasTable('users'))
      ? await db('users').select('id', 'name', 'email', 'auth_provider', 'created_at').orderBy('created_at', 'desc')
      : [];

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
      pe1Registrations,
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
      competitionRegistrations: competitionRegistrations.map(r => ({
        ...r,
        members: parseJson(r.members || '[]'),
        leader_data: parseJson(r.leader_data || null),
        members_data: parseJson(r.members_data || '[]')
      })),
      thriftProducts: thriftProducts.map(p => ({ ...p, price: Number(p.price) })),
      thriftVendors,
      vendorApplications,
      users,
      formQuestions: qConfig ? parseJson(qConfig.config) : undefined
    });
  } catch (err) {
    console.error('State retrieval error:', err);
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
    // Ensure the table exists before inserting (auto-create if missing)
    const hasTable = await db.schema.hasTable('ambassador_applications');
    if (!hasTable) {
      console.log('[ambassador-applications] Table not found, creating it now...');
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
      console.log('[ambassador-applications] Table created successfully.');
    }

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

    console.log(`[ambassador-applications] Successfully stored [${id}] for ${full_name}`);
    res.status(201).json({ id, message: 'Pendaftaran berhasil dikirim' });
  } catch (err: any) {
    console.error('[ambassador-applications] INSERT ERROR:', err);
    res.status(500).json({
      message: 'Gagal mengirim pendaftaran',
      error: err?.message || String(err),
      detail: err?.detail || err?.code || 'unknown'
    });
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
// PE1 REGISTRATION ENDPOINTS
// -------------------------------------------------------------

// Submit PE1 Registration (Public)
app.post('/api/pe1-registrations', async (req: Request, res: Response): Promise<void> => {
  const body = req.body || {};
  const { full_name, email, whatsapp, status_current, institution, major, city, package_choice,
    selected_ebook, instagram_username, social_proof_drive_url, payment_method, payment_proof_url } = body;

  if (!full_name || !email || !whatsapp || !status_current || !institution || !city || !package_choice) {
    res.status(400).json({ message: 'Lengkapi seluruh data wajib!' });
    return;
  }

  const id = `pe1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const submitted_at = new Date().toISOString();

  try {
    // Ensure table exists
    const hasTable = await db.schema.hasTable('pe1_registrations');
    if (!hasTable) {
      console.log('[pe1-registrations] Table not found, creating...');
      await db.schema.createTable('pe1_registrations', (table) => {
        table.string('id').primary();
        table.string('full_name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.string('status_current').notNullable();
        table.string('institution').notNullable();
        table.string('major').nullable();
        table.string('city').notNullable();
        table.string('package_choice').notNullable();
        table.string('selected_ebook').nullable();
        table.string('instagram_username').nullable();
        table.string('social_proof_drive_url').nullable();
        table.string('payment_method').nullable();
        table.string('payment_proof_url').nullable();
        table.string('status').notNullable().defaultTo('pending');
        table.timestamp('submitted_at').notNullable().defaultTo(db.fn.now());
      });
      console.log('[pe1-registrations] Table created.');
    } else {
      const hasEbookCol = await db.schema.hasColumn('pe1_registrations', 'selected_ebook');
      if (!hasEbookCol) {
        await db.schema.alterTable('pe1_registrations', (table) => {
          table.string('selected_ebook').nullable();
        });
      }
    }

    const isPaidPackage = package_choice && package_choice !== 'Aspiring CEO';
    const finalPaymentMethod = isPaidPackage ? (payment_method || 'Bank Transfer') : null;

    await db('pe1_registrations').insert({
      id, full_name, email, whatsapp, status_current, institution,
      major: major || null, city, package_choice,
      selected_ebook: selected_ebook || null,
      instagram_username: instagram_username || null,
      social_proof_drive_url: social_proof_drive_url || null,
      payment_method: finalPaymentMethod,
      payment_proof_url: payment_proof_url || null,
      status: 'pending', submitted_at
    });

    console.log(`[pe1-registrations] Successfully stored [${id}] for ${full_name}`);
    res.status(201).json({ id, message: 'Pendaftaran PE1 berhasil!' });
  } catch (err: any) {
    console.error('[pe1-registrations] INSERT ERROR:', err);
    res.status(500).json({
      message: 'Gagal mengirim pendaftaran PE1',
      error: err?.message || String(err),
      detail: err?.detail || err?.code || 'unknown'
    });
  }
});

// Update PE1 Registration Status (Admin Authenticated)
app.put('/api/pe1-registrations/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'Status tidak valid' });
    return;
  }

  try {
    await db('pe1_registrations').where({ id }).update({ status });
    res.json({ message: 'Status pendaftar PE1 berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui status pendaftar PE1' });
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

// Submit registration (with user_id support & stage tracking)
app.post('/api/competition-registrations', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const id = `reg-c-${Date.now()}`;

  const userId = data.user_id;
  const email = data.email ? String(data.email).toLowerCase().trim() : '';

  try {
    await ensureCompetitionColumns();
    await ensureCompetitionCategories();

    let categoryId = data.category_id || `${data.competition_type || 'BPC'} - ${data.education_category || 'Mahasiswa'}`;
    const compRow = await db('competitions').where({ id: categoryId }).first();
    if (!compRow) {
      const fallbackComp = await db('competitions').where({ id: data.competition_type }).first()
        || await db('competitions').first();
      if (fallbackComp) {
        categoryId = fallbackComp.id;
      }
    }

    if (userId) {
      const existingByUser = await db('competition_registrations').where({ user_id: userId }).first();
      if (existingByUser) {
        res.status(400).json({ message: `Akun ini sudah terdaftar dalam tim "${existingByUser.team_name}". Setiap akun hanya diperbolehkan mendaftarkan 1 tim.` });
        return;
      }
    }

    if (email) {
      const existingByEmail = await db('competition_registrations').where({ email }).first();
      if (existingByEmail) {
        res.status(400).json({ message: `Email "${email}" sudah terdaftar dalam tim "${existingByEmail.team_name}". 1 Akun hanya dapat mendaftarkan 1 tim.` });
        return;
      }
    }

    await db('competition_registrations').insert({
      id,
      user_id: data.user_id || null,
      competition_type: data.competition_type || (data.category_id?.includes('BCC') ? 'BCC' : 'BPC'),
      education_category: data.education_category || (data.category_id?.includes('SMA') ? 'SMA/Sederajat' : 'Mahasiswa'),
      team_name: data.team_name,
      team_size: data.team_size || '3',
      leader_name: data.leader_name,
      leader_data: typeof data.leader_data === 'object' ? JSON.stringify(data.leader_data) : data.leader_data || null,
      members: JSON.stringify(data.members || []),
      members_data: typeof data.members_data === 'object' ? JSON.stringify(data.members_data) : data.members_data || null,
      institution: data.institution,
      contact: data.contact,
      email: data.email,
      category_id: categoryId,
      payment_proof_url: data.payment_proof_url || 'Bukti_Identitas_Ketua',
      file_url: data.file_url || 'Bukti_Persyaratan',
      ig_story_file_url: data.ig_story_file_url || null,
      twibbon_file_url: data.twibbon_file_url || null,
      ig_follow_file_url: data.ig_follow_file_url || null,
      status_stage: 'preliminary',
      status_preliminary: 'pending',
      submitted_at: new Date()
    });
    res.status(201).json({ id, message: 'Registration submitted successfully' });
  } catch (err: any) {
    console.error('Competition registration submission error:', err);
    res.status(500).json({ message: err.message || 'Gagal menyimpan pendaftaran kompetisi' });
  }
});

// Get My Team (Participant Dashboard Endpoint)
app.get('/api/competitions/my-team', async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.user_id as string;
  const email = req.query.email as string;

  if (!userId && !email) {
    res.status(400).json({ message: 'User ID atau Email diperlukan' });
    return;
  }

  try {
    await ensureCompetitionColumns();
    let query = db('competition_registrations');
    if (userId) {
      query = query.where({ user_id: userId });
    } else if (email) {
      query = query.where({ email });
    }

    const team = await query.orderBy('submitted_at', 'desc').first();
    if (!team) {
      res.status(404).json({ message: 'Belum mendaftarkan tim kompetisi' });
      return;
    }

    const parseJson = (val: any) => typeof val === 'string' ? JSON.parse(val) : val;

    res.json({
      ...team,
      members: parseJson(team.members || '[]'),
      leader_data: parseJson(team.leader_data || null),
      members_data: parseJson(team.members_data || '[]')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data tim' });
  }
});

// Submit Preliminary File (BMC for BPC / Executive Summary for BCC)
app.post('/api/competitions/submit-preliminary', async (req: Request, res: Response): Promise<void> => {
  const { team_id, preliminary_file_url, preliminary_file_name, preliminary_file_type } = req.body;

  if (!team_id || !preliminary_file_url) {
    res.status(400).json({ message: 'ID Tim dan Berkas Preliminary wajib diisi' });
    return;
  }

  try {
    await db('competition_registrations').where({ id: team_id }).update({
      preliminary_file_url,
      preliminary_file_name: preliminary_file_name || 'Berkas_Preliminary.pdf',
      preliminary_file_type: preliminary_file_type || 'BMC',
      status_preliminary: 'submitted',
      preliminary_submitted_at: new Date()
    });

    res.json({ message: 'Berkas Preliminary berhasil dikumpulkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengumpulkan berkas preliminary' });
  }
});

// Admin: Get All Registered User Accounts
app.get('/api/admin/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await db('users').select('id', 'name', 'email', 'auth_provider', 'created_at').orderBy('created_at', 'desc');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil daftar pengguna' });
  }
});

// Participant: Submit Semi Final Payment Proof
app.post('/api/competitions/submit-semifinal-payment', async (req: Request, res: Response): Promise<void> => {
  const { team_id, payment_semifinal_url, payment_semifinal_file_name } = req.body;

  if (!team_id || !payment_semifinal_url) {
    res.status(400).json({ message: 'ID Tim dan berkas bukti pembayaran wajib diisi.' });
    return;
  }

  try {
    await ensureCompetitionColumns();
    await db('competition_registrations')
      .where({ id: team_id })
      .update({
        payment_semifinal_url,
        payment_semifinal_file_name: payment_semifinal_file_name || 'bukti_transfer_semifinal.pdf',
        payment_semifinal_status: 'pending',
        payment_semifinal_submitted_at: db.fn.now()
      });

    res.json({ message: 'Bukti pembayaran Semi Final berhasil diunggah' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Gagal mengunggah bukti pembayaran Semi Final' });
  }
});

// Participant: Submit Semi Final Task Submission File
app.post('/api/competitions/submit-semifinal', async (req: Request, res: Response): Promise<void> => {
  const { team_id, semifinal_file_url, semifinal_file_name } = req.body;

  if (!team_id || !semifinal_file_url) {
    res.status(400).json({ message: 'ID Tim dan berkas submission Semi Final wajib diisi.' });
    return;
  }

  try {
    await ensureCompetitionColumns();
    await db('competition_registrations')
      .where({ id: team_id })
      .update({
        semifinal_file_url,
        semifinal_file_name: semifinal_file_name || 'berkas_semifinal.pdf',
        semifinal_submitted_at: db.fn.now()
      });

    res.json({ message: 'Berkas submission Semi Final berhasil dikumpulkan' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Gagal mengunggah berkas Semi Final' });
  }
});

// Admin: Update Competition Registration Stage / Status / Semi Final Payment
app.patch('/api/admin/competitions/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status_stage, status_preliminary, status_semifinal, status_final, payment_semifinal_status } = req.body;

  try {
    await ensureCompetitionColumns();
    const updateData: any = {};
    if (status_stage !== undefined) updateData.status_stage = status_stage;
    if (status_preliminary !== undefined) updateData.status_preliminary = status_preliminary;
    if (status_semifinal !== undefined) updateData.status_semifinal = status_semifinal;
    if (status_final !== undefined) updateData.status_final = status_final;
    if (payment_semifinal_status !== undefined) updateData.payment_semifinal_status = payment_semifinal_status;

    await db('competition_registrations').where({ id }).update(updateData);
    res.json({ message: 'Status kelolosan & pembayaran kompetisi berhasil diperbarui' });
  } catch (err: any) {
    console.error('Update competition status error:', err);
    res.status(500).json({ message: err.message || 'Gagal memperbarui status kompetisi' });
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
