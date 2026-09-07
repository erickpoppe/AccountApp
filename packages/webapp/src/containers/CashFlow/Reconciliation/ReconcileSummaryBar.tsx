// @ts-nocheck
import React from 'react';
import styled from 'styled-components';
import { Intent, Tag } from '@blueprintjs/core';

interface Props {
  openingBalance: number;
  clearedDepositsTotal: number;
  clearedPaymentsTotal: number;
  clearedBalance: number;
  statementClosingBalance: number;
  diff: number | null;
}

export function ReconcileSummaryBar({
  openingBalance,
  clearedDepositsTotal,
  clearedPaymentsTotal,
  clearedBalance,
  statementClosingBalance,
  diff,
}: Props) {
  const diffIntent =
    diff === 0 ? Intent.SUCCESS : diff === null ? Intent.NONE : Intent.WARNING;

  return (
    <SummaryWrap>
      <SummaryItem>
        <SummaryLabel>Opening Balance</SummaryLabel>
        <SummaryValue>{openingBalance.toFixed(2)}</SummaryValue>
      </SummaryItem>
      <Sep>+</Sep>
      <SummaryItem>
        <SummaryLabel>Cleared Deposits</SummaryLabel>
        <SummaryValue positive>{clearedDepositsTotal.toFixed(2)}</SummaryValue>
      </SummaryItem>
      <Sep>−</Sep>
      <SummaryItem>
        <SummaryLabel>Cleared Payments</SummaryLabel>
        <SummaryValue>{clearedPaymentsTotal.toFixed(2)}</SummaryValue>
      </SummaryItem>
      <Sep>=</Sep>
      <SummaryItem>
        <SummaryLabel>Cleared Balance</SummaryLabel>
        <SummaryValueBig>{clearedBalance.toFixed(2)}</SummaryValueBig>
      </SummaryItem>
      <Spacer />
      <SummaryItem>
        <SummaryLabel>Statement Balance</SummaryLabel>
        <SummaryValueBig>{statementClosingBalance.toFixed(2)}</SummaryValueBig>
      </SummaryItem>
      <Sep>=</Sep>
      <SummaryItem>
        <SummaryLabel>Difference</SummaryLabel>
        <Tag
          intent={diffIntent}
          large
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          {diff !== null
            ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)}`
            : '—'}
        </Tag>
      </SummaryItem>
    </SummaryWrap>
  );
}

const SummaryWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #f7f8fa;
  border-top: 1px solid var(--color-divider, #e1e8ed);
  flex-wrap: wrap;
`;
const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0 8px;
`;
const SummaryLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #8a9bad;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
`;
const SummaryValue = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ positive }) => (positive ? '#0d8050' : '#182026')};
`;
const SummaryValueBig = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #182026;
`;
const Sep = styled.div`
  font-size: 18px;
  color: #8a9bad;
  margin-top: 12px;
`;
const Spacer = styled.div`
  flex: 1;
`;
