import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cashflow_transactions', (table) => {
    table.integer('contact_id').unsigned().nullable().index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cashflow_transactions', (table) => {
    table.dropColumn('contact_id');
  });
}
