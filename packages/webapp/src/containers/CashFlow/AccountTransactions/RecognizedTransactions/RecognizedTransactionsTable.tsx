// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { Intent, Text } from '@blueprintjs/core';
import { useCategorizeTransaction } from '@/hooks/query/cashflowAccounts';
import { ButtonLink, AppToaster } from '@/components';
import { useQueryClient } from 'react-query';
import t from '@/hooks/query/types';


import {
  DataTable,
  TableFastCell,
  TableSkeletonRows,
  TableSkeletonHeader,
  TableVirtualizedListRows,
  AppToaster,
  Stack,
} from '@/components';
import { TABLES } from '@/constants/tables';

import { useMemorizedColumnsWidths } from '@/hooks';
import { useUncategorizedTransactionsColumns } from './_utils';
import { useRecognizedTransactionsBoot } from './RecognizedTransactionsTableBoot';

import { ActionsMenu } from './_components';
import { compose } from '@/utils';
import { useAccountTransactionsContext } from '../AccountTransactionsProvider';
import { useExcludeUncategorizedTransaction } from '@/hooks/query/bank-rules';
import {
  WithBankingActionsProps,
  withBankingActions,
} from '../../withBankingActions';
import styles from './RecognizedTransactionsTable.module.scss';
import { BankAccountDataTable } from '../components/BankAccountDataTable';

interface RecognizedTransactionsTableProps extends WithBankingActionsProps {}

function RecognizedTransactionsTableRoot({ setTransactionsToCategorizeSelected }) {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const { mutateAsync: categorizeTransaction } = useCategorizeTransaction({});
  const { recognizedTransactions, isRecongizedTransactionsLoading } =
    useRecognizedTransactionsBoot();

  const columns = useUncategorizedTransactionsColumns();
  const [initialColumnsWidths, , handleColumnResizing] =
    useMemorizedColumnsWidths(TABLES.UNCATEGORIZED_ACCOUNT_TRANSACTIONS);
  const { scrollableRef } = useAccountTransactionsContext();

  const handleSelectedRowsChange = React.useCallback((rows) => {
    setSelectedRows(rows.map((r) => r.original));
  }, [setSelectedRows]);
  const queryClient = useQueryClient();

 // const handleBulkCategorize = () => {
 //   const ids = selectedRows.map((r) => r.uncategorized_transaction_id);
 //   categorizeTransaction({ uncategorizedTransactionIds: ids })
 //     .then(() => {
 //       AppToaster.show({
 //         intent: Intent.SUCCESS,
 //         message: 'Transactions have been categorized successfully.',
 //       });
 //       setSelectedRows([]);
 //     })
 //     .catch(() => {
 //       AppToaster.show({
 //         intent: Intent.DANGER,
 //         message: 'Something went wrong.',
 //       });
 //     });
 // };
  
//  const handleBulkCategorize = async () => {
//    try {
//      await Promise.all(
//        selectedRows.map((row) =>
//          categorizeTransaction({
//            uncategorizedTransactionIds: [row.uncategorized_transaction_id],
//            date: row.date,
//            creditAccountId: row.assigned_account_id,
//            transactionType: row.assigned_category,
//            description: row.description,
//          })
//        )
//      );
//      AppToaster.show({
//        intent: Intent.SUCCESS,
//        message: 'Transactions have been categorized successfully.',
//      });
//      setSelectedRows([]);
//    } catch {
//      AppToaster.show({
//        intent: Intent.DANGER,
//        message: 'Something went wrong.',
//      });
//    }
//  };

//  const handleBulkCategorize = async () => {
//    try {
//      await Promise.all(
//        selectedRows.map((row) =>
//          categorizeTransaction({
//            uncategorizedTransactionIds: [row.uncategorized_transaction_id],
//            date: row.date,
//            creditAccountId: row.assigned_account_id,
//            transactionType: row.assigned_category,
//            description: row.description,
//          })
//        )
//      );
//      queryClient.invalidateQueries(t.CASHFLOW_ACCOUNT_TRANSACTIONS_INFINITY);
//      queryClient.invalidateQueries('BANK_ACCOUNT_SUMMARY_META');
//      AppToaster.show({ intent: Intent.SUCCESS, message: 'Transactions categorized.' });
//      setSelectedRows([]);
//    } catch {
//      AppToaster.show({ intent: Intent.DANGER, message: 'Something went wrong.' });
//    }
//  };

  const handleBulkCategorize = async () => {
    try {
      for (const row of selectedRows) {
        await categorizeTransaction({
          uncategorizedTransactionIds: [row.uncategorized_transaction_id],
          date: row.date,
          creditAccountId: row.assigned_account_id,
          transactionType: row.assigned_category,
          description: row.description,
        });
      }
      queryClient.invalidateQueries(t.CASHFLOW_ACCOUNT_TRANSACTIONS_INFINITY);
      queryClient.invalidateQueries('BANK_ACCOUNT_SUMMARY_META');
      AppToaster.show({ intent: Intent.SUCCESS, message: 'Transactions categorized.' });
      setSelectedRows([]);
    } catch {
      AppToaster.show({ intent: Intent.DANGER, message: 'Something went wrong.' });
    }
  };

  const handleCellClick = (cell, event) => {
    setTransactionsToCategorizeSelected(
      cell.row.original.uncategorized_transaction_id,
    );
  };

  const handleExcludeClick = (transaction) => { /* existing code */ };
  const handleCategorizeClick = (transaction) => {
    setTransactionsToCategorizeSelected(transaction.uncategorized_transaction_id);
  };

  return (
    <>
      {selectedRows.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #e0e0e0' }}>
          <ButtonLink
            intent={Intent.PRIMARY}
            icon="tick"
            onClick={handleBulkCategorize}
          >
            Categorize Selected ({selectedRows.length})
          </ButtonLink>
        </div>
      )}
      <BankAccountDataTable
        noInitialFetch={true}
        columns={columns}
        data={recognizedTransactions}
        sticky={true}
        selectionColumn={true}
        selectionColumnWidth={45}
        loading={isRecongizedTransactionsLoading}
        headerLoading={isRecongizedTransactionsLoading}
        expandColumnSpace={1}
        expandToggleColumn={2}
        TableCellRenderer={TableFastCell}
        TableLoadingRenderer={TableSkeletonRows}
        TableRowsRenderer={TableVirtualizedListRows}
        TableHeaderSkeletonRenderer={TableSkeletonHeader}
        ContextMenu={ActionsMenu}
        onCellClick={handleCellClick}
        onSelectedRowsChange={handleSelectedRowsChange}
        vListrowHeight={40}
        vListOverscanRowCount={0}
        initialColumnsWidths={initialColumnsWidths}
        onColumnResizing={handleColumnResizing}
        windowScrollerProps={{ scrollElement: scrollableRef }}
        noResults={<RecognizedTransactionsTableNoResults />}
        payload={{
          onExclude: handleExcludeClick,
          onCategorize: handleCategorizeClick,
        }}
      />
    </>
  );
}

/**
 * Renders the recognized account transactions datatable.
 */
//function RecognizedTransactionsTableRoot({
  // #withBankingActions
//  setTransactionsToCategorizeSelected,
//}: RecognizedTransactionsTableProps) {
//  const { mutateAsync: excludeBankTransaction } =
//    useExcludeUncategorizedTransaction();

//  const { recognizedTransactions, isRecongizedTransactionsLoading } =
//    useRecognizedTransactionsBoot();

  // Retrieve table columns.
//  const columns = useUncategorizedTransactionsColumns();

  // Local storage memorizing columns widths.
//  const [initialColumnsWidths, , handleColumnResizing] =
//    useMemorizedColumnsWidths(TABLES.UNCATEGORIZED_ACCOUNT_TRANSACTIONS);

//  const { scrollableRef } = useAccountTransactionsContext();

  // Handle cell click.
//  const handleCellClick = (cell, event) => {
//    setTransactionsToCategorizeSelected(
//      cell.row.original.uncategorized_transaction_id,
//    );
//  };
  // Handle exclude button click.
//  const handleExcludeClick = (transaction) => {
//    excludeBankTransaction(transaction.uncategorized_transaction_id)
//      .then(() => {
//        AppToaster.show({
//          intent: Intent.SUCCESS,
//          message: 'The bank transaction has been excluded.',
//        });
//      })
//      .catch(() => {
//        AppToaster.show({
//          intent: Intent.DANGER,
//          message: 'Something went wrong.',
//        });
//      });
//  };

  // Handles categorize button click.
//  const handleCategorizeClick = (transaction) => {
//    setTransactionsToCategorizeSelected(
//      transaction.uncategorized_transaction_id,
//    );
//  };
  
//  const getTrProps = React.useCallback((row) => ({
//  className: row.original.is_categorized ? styles.categorizedRow : '',
//  }), []);


//  return (
//    <BankAccountDataTable
//      noInitialFetch={true}
//      columns={columns}
//     data={recognizedTransactions}
//      sticky={true}
//      loading={isRecongizedTransactionsLoading}
//      headerLoading={isRecongizedTransactionsLoading}
//      expandColumnSpace={1}
//      expandToggleColumn={2}
//      getTrProps={getTrProps}
//      selectionColumnWidth={45}
//      TableCellRenderer={TableFastCell}
//      TableLoadingRenderer={TableSkeletonRows}
//      TableRowsRenderer={TableVirtualizedListRows}
//      TableHeaderSkeletonRenderer={TableSkeletonHeader}
//      ContextMenu={ActionsMenu}
//      onCellClick={handleCellClick}
      // #TableVirtualizedListRows props.
//      vListrowHeight={40}
//      vListOverscanRowCount={0}
//      initialColumnsWidths={initialColumnsWidths}
//      onColumnResizing={handleColumnResizing}
 //     windowScrollerProps={{ scrollElement: scrollableRef }}
 //     noResults={<RecognizedTransactionsTableNoResults />}
//      payload={{
//        onExclude: handleExcludeClick,
//        onCategorize: handleCategorizeClick,
//      }}
//    />
//  );
//}

export const RecognizedTransactionsTable = compose(withBankingActions)(
  RecognizedTransactionsTableRoot,
);

function RecognizedTransactionsTableNoResults() {
  return (
    <Stack spacing={12} className={styles.emptyState}>
      <Text>
        There are no Recognized transactions due to one of the following
        reasons:
      </Text>

      <ul>
        <li>
          Transaction Rules have not yet been created. Transactions are
          recognized based on the rule criteria.
        </li>

        <li>
          The transactions in your bank do not satisfy the criteria in any of
          your transaction rule(s).
        </li>
      </ul>
    </Stack>
  );
}
