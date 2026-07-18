import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('staff_applications', 'drive_folder_link');
  if (!hasColumn) {
    await knex.schema.alterTable('staff_applications', (table) => {
      table.string('drive_folder_link').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('staff_applications', 'drive_folder_link');
  if (hasColumn) {
    await knex.schema.alterTable('staff_applications', (table) => {
      table.dropColumn('drive_folder_link');
    });
  }
}
