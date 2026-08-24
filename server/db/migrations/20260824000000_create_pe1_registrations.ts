import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('pe1_registrations');
  if (!exists) {
    await knex.schema.createTable('pe1_registrations', (table) => {
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
      table.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pe1_registrations');
}
