// @ts-nocheck
import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardCard, DashboardInsider } from '@/components';
import CustomerFormFormik from '@/containers/Customers/CustomerForm/CustomerFormFormik';
import { PartnerFormProvider } from './PartnerFormProvider';
import { useCustomerFormContext } from '@/containers/Customers/CustomerForm/CustomerFormProvider';

function PartnerFormPageLoading({ children }) {
  const { isFormLoading } = useCustomerFormContext();
  return <StyledDashboardInsider loading={isFormLoading}>{children}</StyledDashboardInsider>;
}

export default function PartnerFormPage() {
  const history = useHistory();
  const { id } = useParams();
  const partnerId = id ? parseInt(id, 10) : undefined;

  const handleSubmitSuccess = (values, formArgs, submitPayload) => {
    if (!submitPayload.noRedirect) history.push('/partners');
  };

  return (
    <PartnerFormProvider partnerId={partnerId}>
      <PartnerFormPageLoading>
        <DashboardCard page>
          <StyledFormik onSubmitSuccess={handleSubmitSuccess} onCancel={() => history.goBack()} />
        </DashboardCard>
      </PartnerFormPageLoading>
    </PartnerFormProvider>
  );
}

const StyledFormik = styled(CustomerFormFormik)``;
const StyledDashboardInsider = styled(DashboardInsider)`padding-bottom: 64px;`;
