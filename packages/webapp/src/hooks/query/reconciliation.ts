import { useMutation, useQuery, useQueryClient } from 'react-query';
import useApiRequest from '../useRequest';
import { transformToCamelCase } from '@/utils';

const RECONCILIATION_KEY = 'reconciliation';

export interface ReconciliationTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  isCleared: boolean;
  isReconciled: boolean;
  transactionType: string;
}

export interface ReconciliationSummary {
  clearedDepositsCount: number;
  clearedDepositsTotal: number;
  clearedPaymentsCount: number;
  clearedPaymentsTotal: number;
  clearedBalance: number;
  openingBalance: number;
}

export interface ReconciliationData {
  accountId: number;
  statementDate: string;
  openingBalance: number;
  deposits: ReconciliationTransaction[];
  payments: ReconciliationTransaction[];
  summary: ReconciliationSummary;
}

export function useGetReconciliationData(
  accountId: number,
  statementDate: string,
  options?: any,
) {
  const apiRequest = useApiRequest();

  return useQuery<ReconciliationData>(
    [RECONCILIATION_KEY, accountId, statementDate],
    () =>
      apiRequest
        .get(`/banking/accounts/${accountId}/reconciliation`, {
          params: { statementDate },
        })
        .then((res) => transformToCamelCase(res.data)),
    {
      enabled: !!accountId && !!statementDate,
      ...options,
    },
  );
}

export function useToggleClearedTransaction() {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, cleared }: { id: number; cleared: boolean }) =>
      apiRequest
        .patch(`/banking/transactions/${id}/cleared`, { cleared })
        .then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(RECONCILIATION_KEY);
      },
    },
  );
}

export function useFinishReconciliation(accountId: number) {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();

  return useMutation(
    (body: { statementDate: string; statementClosingBalance: number }) =>
      apiRequest
        .post(`/banking/accounts/${accountId}/reconciliation/finish`, body)
        .then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(RECONCILIATION_KEY);
        queryClient.invalidateQueries('bank-accounts');
      },
    },
  );
}
