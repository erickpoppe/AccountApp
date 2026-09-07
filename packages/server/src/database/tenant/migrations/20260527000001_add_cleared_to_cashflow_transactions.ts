import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cashflow_transactions', (table) => {
    table.boolean('is_cleared').defaultTo(false).index();
    table.boolean('is_reconciled').defaultTo(false).index();
    table
      .integer('reconciliation_id')
      .unsigned()
      .nullable()
      .index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('cashflow_transactions', (table) => {
    table.dropColumn('is_cleared');
    table.dropColumn('is_reconciled');
    table.dropColumn('reconciliation_id');
  });
}
