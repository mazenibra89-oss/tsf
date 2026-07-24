import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasStatus = await knex.schema.hasColumn('staff_applications', 'status_berkas');
  const hasSchedule = await knex.schema.hasColumn('staff_applications', 'interview_schedule');
  const hasWaLink = await knex.schema.hasColumn('staff_applications', 'whatsapp_group_link');

  await knex.schema.alterTable('staff_applications', (table) => {
    if (!hasStatus) {
      table.string('status_berkas').defaultTo('pending');
    }
    if (!hasSchedule) {
      table.string('interview_schedule').nullable();
    }
    if (!hasWaLink) {
      table.string('whatsapp_group_link').nullable();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('staff_applications', (table) => {
    table.dropColumn('status_berkas');
    table.dropColumn('interview_schedule');
    table.dropColumn('whatsapp_group_link');
  });
}
