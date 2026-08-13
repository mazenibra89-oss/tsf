import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('ambassador_applications');
  if (!exists) {
    await knex.schema.createTable('ambassador_applications', (table) => {
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
      table.string('drive_folder_url').notNullable();
      table.string('reels_video_url').notNullable();
      table.string('status').notNullable().defaultTo('pending');
      table.timestamp('submitted_at').notNullable().defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ambassador_applications');
}
