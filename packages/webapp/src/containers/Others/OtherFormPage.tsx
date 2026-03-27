// @ts-nocheck
import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardCard, DashboardInsider } from '@/components';
import CustomerFormFormik from '@/containers/Customers/CustomerForm/CustomerFormFormik';
import { OtherFormProvider } from './OtherFormProvider';
import { useCustomerFormContext } from '@/containers/Customers/CustomerForm/CustomerFormProvider';

function OtherFormPageLoading({ children }) {
  const { isFormLoading } = useCustomerFormContext();
  return <StyledDashboardInsider loading={isFormLoading}>{children}</StyledDashboardInsider>;
}

export default function OtherFormPage() {
  const history = useHistory();
  const { id } = useParams();
  const otherId = id ? parseInt(id, 10) : undefined;

  const handleSubmitSuccess = (values, formArgs, submitPayload) => {
    if (!submitPayload.noRedirect) history.push('/others');
  };

  return (
    <OtherFormProvider otherId={otherId}>
      <OtherFormPageLoading>
        <DashboardCard page>
          <StyledFormik onSubmitSuccess={handleSubmitSuccess} onCancel={() => history.goBack()} />
        </DashboardCard>
      </OtherFormPageLoading>
    </OtherFormProvider>
  );
}

const StyledFormik = styled(CustomerFormFormik)``;
const StyledDashboardInsider = styled(DashboardInsider)`padding-bottom: 64px;`;
