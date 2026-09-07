import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bank_reconciliations', (table) => {
    table.increments('id').primary();
    table.integer('cashflow_account_id').unsigned().notNullable().index();
    table.date('statement_date').notNullable();
    table.decimal('statement_closing_balance', 13, 3).notNullable();
    table.decimal('opening_balance', 13, 3).notNullable().defaultTo(0);
    table.decimal('closing_balance', 13, 3).notNullable().defaultTo(0);
    table.string('status', 20).notNullable().defaultTo('completed');
    table.integer('created_by_user_id').unsigned().nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bank_reconciliations');
}
