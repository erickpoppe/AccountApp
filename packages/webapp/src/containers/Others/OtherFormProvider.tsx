// @ts-nocheck
import React, { useState } from 'react';
import { useCurrencies, useBranches } from '@/hooks/query';
import { Features } from '@/constants';
import { useFeatureCan } from '@/hooks/state';
import { useGenericContact, useCreateGenericContact, useEditGenericContact } from '@/hooks/query/genericContacts';
import { CustomerFormContext } from '@/containers/Customers/CustomerForm/CustomerFormProvider';

export function OtherFormProvider({ otherId, ...props }) {
  const { featureCan } = useFeatureCan();
  const isBranchFeatureCan = featureCan(Features.Branches);

  const { data: other, isLoading: isOtherLoading } = useGenericContact('other', otherId, { enabled: !!otherId });
  const { data: currencies, isLoading: isCurrenciesLoading } = useCurrencies();
  const { data: branches, isLoading: isBranchesLoading, isSuccess: isBranchesSuccess } = useBranches({}, { enabled: isBranchFeatureCan });

  const [submitPayload, setSubmitPayload] = useState({});
  const { mutateAsync: createOtherMutate } = useCreateGenericContact('other');
  const { mutateAsync: editOtherMutate } = useEditGenericContact('other');

  const isNewMode = !otherId;
  const isFormLoading = isOtherLoading || isCurrenciesLoading || isBranchesLoading;

  const createCustomerMutate = (values) => createOtherMutate(values);
  const editCustomerMutate = ([id, values]) => editOtherMutate({ id, ...values });

  const provider = {
    customerId: otherId,
    customer: other ? { ...other, displayName: other.display_name } : undefined,
    currencies,
    branches,
    contactDuplicate: undefined,
    submitPayload,
    isNewMode,
    isCustomerLoading: isOtherLoading,
    isCurrenciesLoading,
    isBranchesSuccess,
    isFormLoading,
    setSubmitPayload,
    editCustomerMutate,
    createCustomerMutate,
  };

  return <CustomerFormContext.Provider value={provider} {...props} />;
}
