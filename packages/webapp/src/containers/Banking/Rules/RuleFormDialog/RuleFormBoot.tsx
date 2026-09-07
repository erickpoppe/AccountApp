import React, { createContext } from 'react';
import { DialogContent } from '@/components';
import { useBankRule } from '@/hooks/query/bank-rules';
import { useAccounts, useVendors, useCustomers } from '@/hooks/query';

interface RuleFormBootValues {
  bankRule?: null;
  bankRuleId?: null;
  isBankRuleLoading: boolean;
  isEditMode: boolean;
  isNewMode: boolean;
  vendors?: any[];
  customers?: any[];
}

const RuleFormBootContext = createContext<RuleFormBootValues>(
  {} as RuleFormBootValues,
);

interface RuleFormBootProps {
  bankRuleId?: number;
  children: React.ReactNode;
}

function RuleFormBoot({ bankRuleId, ...props }: RuleFormBootProps) {
  const { data: bankRule, isLoading: isBankRuleLoading } = useBankRule(
    bankRuleId as number,
    {
      enabled: !!bankRuleId,
    },
  );
  const { data: accounts, isLoading: isAccountsLoading } = useAccounts({}, {});
  const { data: vendorsData } = useVendors({ page_size: 10000 }, {});
  const { data: customersData } = useCustomers({ page_size: 10000 }, {});

  const isNewMode = !bankRuleId;
  const isEditMode = !isNewMode;

  const provider = {
    bankRuleId,
    bankRule,
    accounts,
    vendors: vendorsData?.vendors || [],
    customers: customersData?.customers || [],
    isBankRuleLoading,
    isAccountsLoading,
    isEditMode,
    isNewMode,
  } as RuleFormBootValues;

  const isLoading = isBankRuleLoading || isAccountsLoading;

  return (
    <DialogContent isLoading={isLoading}>
      <RuleFormBootContext.Provider value={provider} {...props} />
    </DialogContent>
  );
}

const useRuleFormDialogBoot = () =>
  React.useContext<RuleFormBootValues>(RuleFormBootContext);

export { RuleFormBoot, useRuleFormDialogBoot };
