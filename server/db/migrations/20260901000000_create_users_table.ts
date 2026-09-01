import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('users');
  if (!exists) {
    await knex.schema.createTable('users', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash').nullable();
      table.string('auth_provider').notNullable().defaultTo('email');
      table.string('google_id').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasCompTable = await knex.schema.hasTable('competition_registrations');
  if (hasCompTable) {
    const hasUserIdInComp = await knex.schema.hasColumn('competition_registrations', 'user_id');
    if (!hasUserIdInComp) {
      await knex.schema.alterTable('competition_registrations', (table) => {
        table.string('user_id').nullable();
        table.string('competition_type').nullable();
        table.string('education_category').nullable();
        table.string('team_size').nullable();
        table.text('leader_data').nullable();
        table.text('members_data').nullable();
        table.text('ig_story_file_url').nullable();
        table.text('twibbon_file_url').nullable();
        table.text('ig_follow_file_url').nullable();
        table.string('status_stage').notNullable().defaultTo('preliminary');
        table.string('status_preliminary').notNullable().defaultTo('pending');
        table.text('preliminary_file_url').nullable();
        table.string('preliminary_file_name').nullable();
        table.string('preliminary_file_type').nullable();
        table.timestamp('preliminary_submitted_at').nullable();
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
