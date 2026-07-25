import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const nims = [
    '5007251088',
    '5021251071',
    '5031251053',
    '2041251026',
    '5021251070',
    '2036251045',
    '5013251132',
    '5015251051',
    '5007251106',
    '5015251136',
    '5050251045',
    '5026251027',
    '5026251068',
    '5016251114',
    '5021251053',
    '5019251138',
    '5053251027',
    '5028251048',
    '5003251108',
    '5033251017',
    '5016251013',
    '5031251076',
    '5023251038'
  ];

  await knex('staff_applications')
    .whereIn('nim', nims)
    .update({
      status_berkas: 'lolos',
      division_priority_1: 'Public Relation',
      interview_schedule: 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0'
    });
}

export async function down(knex: Knex): Promise<void> {
  const nims = [
    '5007251088',
    '5021251071',
    '5031251053',
    '2041251026',
    '5021251070',
    '2036251045',
    '5013251132',
    '5015251051',
    '5007251106',
    '5015251136',
    '5050251045',
    '5026251027',
    '5026251068',
    '5016251114',
    '5021251053',
    '5019251138',
    '5053251027',
    '5028251048',
    '5003251108',
    '5033251017',
    '5016251013',
    '5031251076',
    '5023251038'
  ];

  await knex('staff_applications')
    .whereIn('nim', nims)
    .update({
      status_berkas: 'pending',
      interview_schedule: null
    });
}
