// @ts-nocheck
import React from 'react';
import { DashboardPageContent, DashboardInsider } from '@/components';
import { GenericContactsList } from '@/containers/GenericContacts/GenericContactsList';

export default function PartnersList() {
  return (
    <DashboardInsider name="partners-list">
      <DashboardPageContent>
        <GenericContactsList contactService="partner" newContactPath="/partners/new" title="Partners" />
      </DashboardPageContent>
    </DashboardInsider>
  );
}
