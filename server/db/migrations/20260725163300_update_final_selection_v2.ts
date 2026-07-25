import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const scheduleUrl = 'https://docs.google.com/spreadsheets/d/1oDJ8j3Fpl9AEcKmjGTkmp1sLSjaLcN5phgYhCJ1SidM/edit?gid=0#gid=0';

  // 1. Fix NRP typo in the database (027251032 or 27251032 -> 5027251032)
  await knex('staff_applications')
    .where('nim', '027251032')
    .orWhere('nim', '27251032')
    .update({ nim: '5027251032' });

  // 2. Set all applicants to failed ('gagal') by default
  await knex('staff_applications').update({
    status_berkas: 'gagal',
    interview_schedule: null
  });

  // 3. Map divisions and passed NRPs (Lolos)
  const finalPassedData = [
    {
      divisionName: 'Sub Divisi Event - Competition',
      nims: [
        '5026251177', '5010251074', '5003251097', '5015251154', '5033251050',
        '5015251058', '5005251039', '5008251103', '5008251203', '5007251176',
        '5052251029', '5016251041'
      ]
    },
    {
      divisionName: 'Sub Divisi Event - Non Competition',
      nims: [
        '5009251027', '5023251093', '5020251096', '2043251010', '5016251021',
        '5010251077', '5015251084', '2043251079', '5015251105', '5018251006',
        '5050251040', '2043251107', '5026251188', '5015251093', '5027251047'
      ]
    },
    {
      divisionName: 'Sub Divisi Operasional - Logistic, Technical, Equipment (LTE)',
      nims: [
        '5015251045', '5015251077', '5015251155', '5006251072', '5033251063',
        '5048251003', '5048251047', '2036251086', '2035251055', '2036251060',
        '2041251031', '2041251109', '5010251170', '5019251112'
      ]
    },
    {
      divisionName: 'Sub Divisi Operasional - Secure & Licence',
      nims: [
        '5020251115', '5028251072', '5045251029', '5016251070', '5007251187',
        '5003251111', '5046251014', '5015251142', '5033251127', '5051251023',
        '5016251055', '5023251107', '5003251106', '5031251146', '2036251069',
        '5003251010', '2035251061', '5057251008', '2036251088', '2041251058',
        '2035251086', '5022251055'
      ]
    },
    {
      divisionName: 'Sub Divisi Operasional - Health & Consumption',
      nims: [
        '5008251043', '5015251018', '2039251078', '5050251033', '5007251163',
        '5046251045', '5015251069', '2036251036', '5048251065', '5018251008',
        '5033251134', '5056251030', '5018251091', '5057251029', '5049251053',
        '5022251178', '5019251018'
      ]
    },
    {
      divisionName: 'Divisi Data Management',
      nims: [
        '5003251104', '5003251023', '5016251061', '5024251067', '5003251176',
        '5003251059', '5033251002', '5031251107', '5003251058', '5057251017',
        '5057251037', '5003251052'
      ]
    },
    {
      divisionName: 'Sub Divisi Finance - Sponsorship',
      nims: [
        '5049251047', '5014251076', '2043251068', '5004251039', '5002251114',
        '5057251005', '5002251065', '5027251011', '5057251011', '5026251192',
        '5033251077', '2035251052'
      ]
    },
    {
      divisionName: 'Sub Divisi Finance - Fundraising',
      nims: [
        '5029251103', '5003251169', '5061251009', '5021251006', '2039251031',
        '5031251018', '5027251056', '5027251032', '027251032', '27251032', 
        '5020251058', '5031251011', '2043251008', '2036251079', '5012251171', 
        '5012251162', '2036251063', '5019251082', '5033251035', '5033251104', 
        '5031251027', '5023251021'
      ]
    },
    {
      divisionName: 'Sub Divisi BnM - Creative Design',
      nims: [
        '5027251037', '5015251127', '5024251009', '2041251070', '5013251090',
        '5028251086', '5015251015', '5028251017', '5013251013', '5028251084'
      ]
    },
    {
      divisionName: 'Sub Divisi BnM - Talent Management',
      nims: [
        '5002251037', '5029251056', '5015251075', '5049251048', '5001251049',
        '5015251108', '2043251011', '2036251054', '5056251010'
      ]
    },
    {
      divisionName: 'Sub Divisi BnM - Marketing Strategist',
      nims: [
        '5014251082', '5007251153', '2043251083', '5008251154', '5029251099',
        '5029251016', '5026251028', '5033251132', '5025251273', '2042251120',
        '5028251058', '2035251077', '5029251101'
      ]
    },
    {
      divisionName: 'Sub Divisi BnM - Media Production',
      nims: [
        '5029251094', '5025251081', '5021251017', '5014251100', '2043251019',
        '5028251083'
      ]
    },
    {
      divisionName: 'Divisi Decoration',
      nims: [
        '2039251020', '5015251112', '5030251141', '5028251092', '2035251004',
        '5057251004', '5029251109', '5022251097', '5050251048', '5030251092'
      ]
    },
    {
      divisionName: 'Sub Divisi Public Relation',
      nims: [
        '5007251088', '5021251071', '5031251053', '2041251026', '5021251070',
        '2036251045', '5013251132', '5015251051', '5007251106', '5015251136',
        '5050251045', '5026251027', '5026251068', '5016251114', '5021251053',
        '5019251138', '5053251027', '5028251048', '5003251108', '5033251017',
        '5016251013', '5031251076', '5023251038'
      ]
    }
  ];

  for (const item of finalPassedData) {
    await knex('staff_applications')
      .whereIn('nim', item.nims)
      .update({
        status_berkas: 'lolos',
        division_priority_1: item.divisionName,
        interview_schedule: scheduleUrl
      });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('staff_applications').update({
    status_berkas: 'pending',
    interview_schedule: null
  });
}
