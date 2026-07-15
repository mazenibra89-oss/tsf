import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
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
// STAFF APPLICATIONS ENDPOINTS
// -------------------------------------------------------------

// Submit staff application (Public)
app.post('/api/staff-applications', async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const id = `app-s-${Date.now()}`;

  try {
    await db('staff_applications').insert({
      id,
      full_name: data.full_name,
      nim: data.nim,
      faculty: data.faculty,
      department: data.department,
      major: data.major,
      batch: data.batch,
      phone: data.phone,
      email: data.email,
      instagram: data.instagram,
      division_priority_1: data.division_priority_1,
      division_priority_2: data.division_priority_2,
      motivation: data.motivation,
      file_url: data.file_url,
      ktm_krs_link: data.ktm_krs_link,
      cv_link: data.cv_link,
      repost_link: data.repost_link,
      twibbon_link: data.twibbon_link,
      ig_follow_link: data.ig_follow_link,
      tiktok_follow_link: data.tiktok_follow_link,
      general_knowledge: data.general_knowledge,
      general_motivation: data.general_motivation,
      experience: data.experience,
      strengths_weaknesses: data.strengths_weaknesses,
      commitment_scale: data.commitment_scale ? parseInt(data.commitment_scale) : null,
      commitment_form: data.commitment_form,
      busy_schedule: data.busy_schedule,
      relations: data.relations,
      paid_ikoma: data.paid_ikoma,
      ikoma_proof_url: data.ikoma_proof_url,
      div_task_answer_1: data.div_task_answer_1,
      div_task_answer_2: data.div_task_answer_2,
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
    // Run rollback, migrations, and seeds
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
    // Run seed forcing re-population since we deleted data
    const phasesCount = await db('event_phases').count('id as count').first();
    const count = parseInt(phasesCount?.count as string || '0');
    if (count === 0) {
      await db.seed.run();
    }
    
    res.json({ message: 'Database reset to default successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset database' });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initDatabase();
});
