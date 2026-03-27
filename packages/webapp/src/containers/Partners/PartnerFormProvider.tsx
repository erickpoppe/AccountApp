// @ts-nocheck
import React, { useState } from 'react';
import { useCurrencies, useBranches } from '@/hooks/query';
import { Features } from '@/constants';
import { useFeatureCan } from '@/hooks/state';
import { useGenericContact, useCreateGenericContact, useEditGenericContact } from '@/hooks/query/genericContacts';
import { CustomerFormContext } from '@/containers/Customers/CustomerForm/CustomerFormProvider';

export function PartnerFormProvider({ partnerId, ...props }) {
  const { featureCan } = useFeatureCan();
  const isBranchFeatureCan = featureCan(Features.Branches);

  const { data: partner, isLoading: isPartnerLoading } = useGenericContact('partner', partnerId, { enabled: !!partnerId });
  const { data: currencies, isLoading: isCurrenciesLoading } = useCurrencies();
  const { data: branches, isLoading: isBranchesLoading, isSuccess: isBranchesSuccess } = useBranches({}, { enabled: isBranchFeatureCan });

  const [submitPayload, setSubmitPayload] = useState({});
  const { mutateAsync: createPartnerMutate } = useCreateGenericContact('partner');
  const { mutateAsync: editPartnerMutate } = useEditGenericContact('partner');

  const isNewMode = !partnerId;
  const isFormLoading = isPartnerLoading || isCurrenciesLoading || isBranchesLoading;

  const createCustomerMutate = (values) => createPartnerMutate(values);
  const editCustomerMutate = ([id, values]) => editPartnerMutate({ id, ...values });

  const provider = {
    customerId: partnerId,
    customer: partner ? { ...partner, displayName: partner.display_name } : undefined,
    currencies,
    branches,
    contactDuplicate: undefined,
    submitPayload,
    isNewMode,
    isCustomerLoading: isPartnerLoading,
    isCurrenciesLoading,
    isBranchesSuccess,
    isFormLoading,
    setSubmitPayload,
    editCustomerMutate,
    createCustomerMutate,
  };

  return <CustomerFormContext.Provider value={provider} {...props} />;
}
