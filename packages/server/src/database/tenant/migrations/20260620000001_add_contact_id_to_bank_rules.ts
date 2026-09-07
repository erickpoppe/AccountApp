exports.up = function (knex) {
  return knex.schema
    .table('bank_rules', (table) => {
      table.integer('assign_contact_id').unsigned().nullable();
    })
    .table('recognized_bank_transactions', (table) => {
      table.integer('assigned_contact_id').unsigned().nullable();
    });
};

exports.down = function (knex) {
  return knex.schema
    .table('bank_rules', (table) => {
      table.dropColumn('assign_contact_id');
    })
    .table('recognized_bank_transactions', (table) => {
      table.dropColumn('assigned_contact_id');
    });
};
