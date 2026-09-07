// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Checkbox, Spinner } from '@blueprintjs/core';
import { ReconciliationTransaction } from '@/hooks/query/reconciliation';

const formatDate = (date: string) => moment(date).format('MMM D, YYYY');

interface Props {
  deposits: ReconciliationTransaction[];
  payments: ReconciliationTransaction[];
  onToggle: (id: number, cleared: boolean) => void;
  isFetching: boolean;
}

export function ReconcileTransactionsTable({
  deposits,
  payments,
  onToggle,
  isFetching,
}: Props) {
  return (
    <TableWrap>
      {isFetching && (
        <FetchingOverlay>
          <Spinner size={20} />
        </FetchingOverlay>
      )}
      <Half>
        <SectionTitle>Deposits ({deposits.length})</SectionTitle>
        <TxTable>
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((tx) => (
              <TxRow key={tx.id} cleared={tx.isCleared}>
                <td>
                  <Checkbox
                    checked={tx.isCleared}
                    onChange={(e) => onToggle(tx.id, e.target.checked)}
                  />
                </td>
                <td>{formatDate(tx.date)}</td>
                <td>{tx.description || '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {tx.amount.toFixed(2)}
                </td>
              </TxRow>
            ))}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#8a9bad', padding: '20px' }}>
                  No deposits
                </td>
              </tr>
            )}
          </tbody>
        </TxTable>
      </Half>

      <Divider />

      <Half>
        <SectionTitle>Payments ({payments.length})</SectionTitle>
        <TxTable>
          <thead>
            <tr>
              <th style={{ width: 36 }} />
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((tx) => (
              <TxRow key={tx.id} cleared={tx.isCleared}>
                <td>
                  <Checkbox
                    checked={tx.isCleared}
                    onChange={(e) => onToggle(tx.id, e.target.checked)}
                  />
                </td>
                <td>{formatDate(tx.date)}</td>
                <td>{tx.description || '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {tx.amount.toFixed(2)}
                </td>
              </TxRow>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#8a9bad', padding: '20px' }}>
                  No payments
                </td>
              </tr>
            )}
          </tbody>
        </TxTable>
      </Half>
    </TableWrap>
  );
}

const TableWrap = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;
const FetchingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  z-index: 10;
`;
const Half = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 4px;
`;
const Divider = styled.div`
  width: 1px;
  background: var(--color-divider, #e1e8ed);
  margin: 0 8px;
`;
const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #5f6d86;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px 8px;
  border-bottom: 1px solid #e8ecf0;
`;
const TxTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead th {
    padding: 6px 12px;
    text-align: left;
    font-weight: 600;
    color: #8a9bad;
    font-size: 11px;
    text-transform: uppercase;
    border-bottom: 1px solid #e8ecf0;
  }
  tbody td {
    padding: 7px 12px;
    border-bottom: 1px solid #f0f3f6;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
const TxRow = styled.tr<{ cleared: boolean }>`
  background: ${({ cleared }) => (cleared ? '#f0fff4' : 'transparent')};
  &:hover {
    background: ${({ cleared }) => (cleared ? '#e6fff0' : '#f5f8fa')};
  }
`;
