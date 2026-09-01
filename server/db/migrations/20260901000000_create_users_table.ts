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
      { name: 'preliminary_file_url', type: 'text' },
      { name: 'preliminary_file_name', type: 'string' },
      { name: 'preliminary_file_type', type: 'string' },
      { name: 'preliminary_submitted_at', type: 'timestamp' }
    ];

    for (const col of columns) {
      const hasCol = await knex.schema.hasColumn('competition_registrations', col.name);
      if (!hasCol) {
        await knex.schema.alterTable('competition_registrations', (table) => {
          if (col.type === 'string') {
            const c = table.string(col.name).nullable();
            if (col.defaultVal) c.defaultTo(col.defaultVal);
          } else if (col.type === 'text') {
            table.text(col.name).nullable();
          } else if (col.type === 'timestamp') {
            table.timestamp(col.name).nullable();
          }
        });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
