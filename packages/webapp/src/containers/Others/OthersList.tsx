// @ts-nocheck
import React from 'react';
import { DashboardPageContent, DashboardInsider } from '@/components';
import { GenericContactsList } from '@/containers/GenericContacts/GenericContactsList';

export default function OthersList() {
  return (
    <DashboardInsider name="others-list">
      <DashboardPageContent>
        <GenericContactsList contactService="other" newContactPath="/others/new" title="Others" />
      </DashboardPageContent>
    </DashboardInsider>
  );
}
