// @ts-nocheck
import React from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
// 1
import { useHistory } from 'react-router-dom';
import { TableStyle } from '@/constants';
import { tableRowTypesToClassnames } from '@/utils';
import { ReportDataTable, FinancialSheet } from '@/components';
import { useTrialBalanceSheetContext } from './TrialBalanceProvider';
import { useTrialBalanceSheetTableColumns } from './hooks';

/**
 * Trial Balance sheet data table.
 */
export default function TrialBalanceSheetTable({ companyName }) {
  const history = useHistory();
  // Trial balance sheet context.
  const {
    trialBalanceSheet: { table, query, meta },
    isLoading,
  } = useTrialBalanceSheetContext();

  // Trial balance sheet table columns.
  const columns = useTrialBalanceSheetTableColumns();

  const handleCellClick = (cell) => {
    const { id } = cell.row.original;
    // Skip total row and any non-account rows
    if (!id || id === 'total' || typeof id !== 'number') return;

    const params = new URLSearchParams({
      accountsIds: id,
      fromDate: query?.fromDate || '',
      toDate: query?.toDate || '',
    });
    history.push(`/financial-reports/general-ledger?${params.toString()}`);
  };

  return (
    <FinancialSheet
      companyName={companyName}
      sheetType={intl.get('trial_balance_sheet')}
      dateText={meta?.formatted_date_range ?? meta?.formatted_as_date}
      name="trial-balance"
      loading={isLoading}
      basis={'cash'}
    >
      <TrialBalanceDataTable
        columns={columns}
        data={table.rows}
        expandable={true}
        expandToggleColumn={1}
        expandColumnSpace={1}
        sticky={true}
        rowClassNames={tableRowTypesToClassnames}
        styleName={TableStyle.Constrant}
        onCellClick={handleCellClick}
      />
    </FinancialSheet>
  );
}

const TrialBalanceDataTable = styled(ReportDataTable)`
  --color-table-text-color: #252a31;
  --color-table-total-text-color: #000;

  .bp4-dark & {
    --color-table-text-color: var(--color-light-gray1);
    --color-table-total-text-color: var(--color-light-gray4);
  }
  .table {
    .tbody {
      .tr .td {
        border-bottom-width: 0;
        padding-top: 0.36rem;
        padding-bottom: 0.36rem;
        color: var(--color-table-text-color);
      }
      .tr.row_type--TOTAL .td {
        font-weight: 500;
        color: var(--color-table-total-text-color);
        border-top-width: 1px;
        border-top-style: solid;
        border-bottom-width: 3px;
        border-bottom-style: double;
      }
    }
  }
`;
