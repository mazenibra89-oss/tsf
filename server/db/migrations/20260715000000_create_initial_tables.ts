import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Event Phases Table
  await knex.schema.createTable('event_phases', (table) => {
    table.string('id').primary();
    table.string('name').unique().notNullable();
    table.string('label').notNullable();
    table.string('status').notNullable();
    table.string('start_date').notNullable();
    table.string('end_date').notNullable();
    table.text('description').notNullable();
    table.string('cta_link').notNullable();
  });

  // Divisions Table
  await knex.schema.createTable('divisions', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.integer('quota').notNullable();
    table.string('icon_name').notNullable();
    table.jsonb('sub_divisions').nullable();
  });

  // Staff Applications Table
  await knex.schema.createTable('staff_applications', (table) => {
    table.string('id').primary();
    table.string('full_name').notNullable();
    table.string('nim').notNullable();
    table.string('faculty').nullable();
    table.string('department').nullable();
    table.string('major').notNullable();
    table.string('batch').notNullable();
    table.string('phone').notNullable();
    table.string('email').notNullable();
    table.string('instagram').nullable();
    table.string('division_priority_1').notNullable();
    table.string('division_priority_2').notNullable();
    table.text('motivation').notNullable();
    table.string('file_url').nullable();
    table.string('ktm_krs_link').nullable();
    table.string('cv_link').nullable();
    table.string('repost_link').nullable();
    table.string('twibbon_link').nullable();
    table.string('ig_follow_link').nullable();
    table.string('tiktok_follow_link').nullable();
    table.text('general_knowledge').nullable();
    table.text('general_motivation').nullable();
    table.text('experience').nullable();
    table.text('strengths_weaknesses').nullable();
    table.integer('commitment_scale').nullable();
    table.text('commitment_form').nullable();
    table.text('busy_schedule').nullable();
    table.text('relations').nullable();
    table.string('paid_ikoma').nullable();
    table.string('ikoma_proof_url').nullable();
    table.text('div_task_answer_1').nullable();
    table.text('div_task_answer_2').nullable();
    table.jsonb('custom_form_answers').nullable();
    table.string('status').notNullable().defaultTo('pending');
    table.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
  });

  // Sub Events Table
  await knex.schema.createTable('sub_events', (table) => {
    table.string('id').primary();
    table.string('slug').unique().notNullable();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('date').notNullable();
    table.string('location').notNullable();
    table.jsonb('lineup').notNullable();
    table.jsonb('schedule').notNullable();
    table.jsonb('gallery').notNullable();
    table.string('status').notNullable();
  });

  // Competitions Table
  await knex.schema.createTable('competitions', (table) => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('category').notNullable();
    table.jsonb('terms').notNullable();
    table.string('prize').notNullable();
    table.jsonb('timeline').notNullable();
    table.string('guidebook_url').notNullable();
    table.string('status').notNullable();
  });

  // Competition Registrations Table
  await knex.schema.createTable('competition_registrations', (table) => {
    table.string('id').primary();
    table.string('team_name').notNullable();
    table.string('leader_name').notNullable();
    table.jsonb('members').notNullable();
    table.string('institution').notNullable();
    table.string('contact').notNullable();
    table.string('email').notNullable();
    table.string('category_id').references('id').inTable('competitions').onDelete('CASCADE');
    table.text('payment_proof_url').notNullable();
    table.text('file_url').nullable();
    table.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
  });

  // Thrift Vendors Table
  await knex.schema.createTable('thrift_vendors', (table) => {
    table.string('id').primary();
    table.string('vendor_name').notNullable();
    table.string('booth_location').notNullable();
    table.string('contact').notNullable();
    table.string('status').notNullable();
  });

  // Thrift Products Table
  await knex.schema.createTable('thrift_products', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.decimal('price', 12, 2).notNullable();
    table.string('condition').notNullable();
    table.string('category').notNullable();
    table.text('image_url').notNullable();
    table.string('vendor_id').references('id').inTable('thrift_vendors').onDelete('CASCADE');
    table.string('status').notNullable();
  });

  // Vendor Applications Table
  await knex.schema.createTable('vendor_applications', (table) => {
    table.string('id').primary();
    table.string('vendor_name').notNullable();
    table.string('contact').notNullable();
    table.string('product_category').notNullable();
    table.text('description').notNullable();
    table.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
  });

  // Form Questions Config Table
  await knex.schema.createTable('form_questions_config', (table) => {
    table.string('id').primary();
    table.jsonb('config').notNullable();
  });

  // Admin Accounts Table
  await knex.schema.createTable('admin_accounts', (table) => {
    table.string('username').primary();
    table.string('password_hash').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('admin_accounts');
  await knex.schema.dropTableIfExists('form_questions_config');
  await knex.schema.dropTableIfExists('vendor_applications');
  await knex.schema.dropTableIfExists('thrift_products');
  await knex.schema.dropTableIfExists('thrift_vendors');
  await knex.schema.dropTableIfExists('competition_registrations');
  await knex.schema.dropTableIfExists('competitions');
  await knex.schema.dropTableIfExists('sub_events');
  await knex.schema.dropTableIfExists('staff_applications');
  await knex.schema.dropTableIfExists('divisions');
  await knex.schema.dropTableIfExists('event_phases');
}
