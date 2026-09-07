// @ts-nocheck
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useHistory } from 'react-router-dom';
import {
  Button,
  Callout,
  Classes,
  Intent,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import {
  useGetReconciliationData,
  useToggleClearedTransaction,
  useFinishReconciliation,
} from '@/hooks/query/reconciliation';
import { ReconcileTransactionsTable } from './ReconcileTransactionsTable';
import { ReconcileSummaryBar } from './ReconcileSummaryBar';

export function ReconcileAccountPage() {
  const { id: accountId } = useParams<{ id: string }>();
  const history = useHistory();

  const [statementDate, setStatementDate] = useState<Date | null>(null);
  const [statementClosingBalance, setStatementClosingBalance] =
    useState<string>('');
  const [started, setStarted] = useState(false);

  const statementDateStr = statementDate
    ? statementDate.toISOString().split('T')[0]
    : '';

  const { data, isLoading, isFetching } = useGetReconciliationData(
    Number(accountId),
    statementDateStr,
    { enabled: started && !!statementDateStr },
  );

  const { mutateAsync: toggleCleared } = useToggleClearedTransaction();
  const { mutateAsync: finishReconciliation, isLoading: isFinishing } =
    useFinishReconciliation(Number(accountId));

  const closingBalanceNum = Number(statementClosingBalance) || 0;
  const diff =
    started && data
      ? Math.round(
          (data.summary.clearedBalance - closingBalanceNum) * 100,
        ) / 100
      : null;
  const canFinish = started && diff === 0 && (data?.deposits?.length || data?.payments?.length);

  const handleStart = () => {
    if (statementDate && statementClosingBalance !== '') setStarted(true);
  };

  const handleToggle = useCallback(
    (id: number, cleared: boolean) => toggleCleared({ id, cleared }),
    [toggleCleared],
  );

  const handleFinish = async () => {
    await finishReconciliation({
      statementDate: statementDateStr,
      statementClosingBalance: closingBalanceNum,
    });
    history.push(`/cashflow-accounts/${accountId}/transactions`);
  };

  return (
    <PageWrap>
      <PageHeader>
        <HeaderLeft>
          <Button
            minimal
            icon="arrow-left"
            onClick={() =>
              history.push(`/cashflow-accounts/${accountId}/transactions`)
            }
          />
          <PageTitle>Reconcile Account</PageTitle>
        </HeaderLeft>
      </PageHeader>

      <SetupBar>
        <SetupField>
          <SetupLabel>Statement Date</SetupLabel>
          <DateInput
            formatDate={(d) => d.toLocaleDateString()}
            parseDate={(s) => new Date(s)}
            value={statementDate}
            onChange={setStatementDate}
            placeholder="MM/DD/YYYY"
            popoverProps={{ minimal: true }}
          />
        </SetupField>
        <SetupField>
          <SetupLabel>Closing Balance</SetupLabel>
          <BalanceInput
            type="number"
            placeholder="0.00"
            value={statementClosingBalance}
            onChange={(e) => setStatementClosingBalance(e.target.value)}
          />
        </SetupField>
        {!started && (
          <Button
            intent={Intent.PRIMARY}
            onClick={handleStart}
            disabled={!statementDate || statementClosingBalance === ''}
          >
            Start Reconciling
          </Button>
        )}
      </SetupBar>

      {started && isLoading && (
        <LoadingWrap>
          <Spinner size={40} />
        </LoadingWrap>
      )}

      {started && !isLoading && data && (
        <>
          {data.deposits.length === 0 && data.payments.length === 0 ? (
            <NonIdealState
              icon="tick-circle"
              title="No transactions to reconcile"
              description="All transactions up to this date are already reconciled."
            />
          ) : (
            <ReconcileTransactionsTable
              deposits={data.deposits}
              payments={data.payments}
              onToggle={handleToggle}
              isFetching={isFetching}
            />
          )}

          <ReconcileSummaryBar
            openingBalance={data.summary.openingBalance}
            clearedDepositsTotal={data.summary.clearedDepositsTotal}
            clearedPaymentsTotal={data.summary.clearedPaymentsTotal}
            clearedBalance={data.summary.clearedBalance}
            statementClosingBalance={closingBalanceNum}
            diff={diff}
          />

          <FinishBar>
            {diff !== 0 && diff !== null && (
              <DiffCallout intent={Intent.WARNING}>
                Difference of{' '}
                <strong>
                  {diff > 0 ? '+' : ''}
                  {diff.toFixed(2)}
                </strong>{' '}
                — check off all transactions that appear on your bank statement.
              </DiffCallout>
            )}
            <Button
              intent={Intent.SUCCESS}
              large
              disabled={!canFinish}
              loading={isFinishing}
              onClick={handleFinish}
            >
              Finish Reconciliation
            </Button>
          </FinishBar>
        </>
      )}
    </PageWrap>
  );
}

const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;
const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-divider, #e1e8ed);
`;
const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const PageTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;
const SetupBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 16px 24px;
  background: #f7f8fa;
  border-bottom: 1px solid var(--color-divider, #e1e8ed);
`;
const SetupField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const SetupLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #5f6d86;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
const BalanceInput = styled.input`
  height: 30px;
  padding: 0 10px;
  border: 1px solid #ced9e0;
  border-radius: 3px;
  font-size: 14px;
  width: 160px;
  &:focus {
    outline: none;
    border-color: #106ba3;
    box-shadow: 0 0 0 1px #106ba3;
  }
`;
const LoadingWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px;
`;
const FinishBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 12px 24px;
  border-top: 1px solid var(--color-divider, #e1e8ed);
  background: #fff;
`;
const DiffCallout = styled(Callout)`
  padding: 6px 12px;
  margin: 0;
`;
