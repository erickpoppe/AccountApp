// @ts-nocheck
import { DashboardPageContent } from '@/components';
import { CashFlowAccountsProvider } from '@/containers/CashFlow/CashFlowAccounts/CashFlowAccountsProvider';
import CashflowAccountsGrid from '@/containers/CashFlow/CashFlowAccounts/CashflowAccountsGrid';
import { CashflowAccountsLoadingBar } from '@/containers/CashFlow/CashFlowAccounts/CashFlowAccountsLoadingBar';
import { CashflowAccountsPlaidLink } from '@/containers/CashFlow/CashFlowAccounts/CashflowAccountsPlaidLink';
import CreditCardAccountsActionsBar from './CreditCardAccountsActionsBar';

export default function CreditCardAccountsList() {
  return (
    <CashFlowAccountsProvider filterByType={'credit-card'}>
      <CreditCardAccountsActionsBar />
      <CashflowAccountsLoadingBar />
      <DashboardPageContent>
        <CashflowAccountsGrid />
      </DashboardPageContent>
      <CashflowAccountsPlaidLink />
    </CashFlowAccountsProvider>
  );
}
