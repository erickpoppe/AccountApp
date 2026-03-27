// @ts-nocheck
import { useState } from 'react';
import { DashboardInsider, Box } from '@/components';
import { ImportView } from '@/containers/Import/ImportView';
import { ImportFileProvider } from '@/containers/Import/ImportFileProvider';
import { QBOImportStepper } from './QBOImportStepper';
import { useHistory, useParams } from 'react-router-dom';
import { Button, ButtonGroup } from '@blueprintjs/core';
import styles from '@/containers/Import/ImportView.module.scss';

export default function ImportUncategorizedTransactions() {
  const history = useHistory();
  const params = useParams();
  const [importType, setImportType] = useState('csv');

  const handleImportSuccess = () => {
    history.push(`/cashflow-accounts/${params.id}/transactions?filter=uncategorized`);
  };

  const handleCancelBtnClick = () => {
    history.push(`/cashflow-accounts/${params.id}/transactions?filter=uncategorized`);
  };

  return (
    <DashboardInsider name={'import-uncategorized-bank-transactions'}>
      <div style={{ padding: '16px 20px 0' }}>
        <ButtonGroup>
          <Button active={importType === 'csv'} onClick={() => setImportType('csv')}>CSV / XLSX</Button>
          <Button active={importType === 'qbo'} onClick={() => setImportType('qbo')}>QBO / OFX</Button>
        </ButtonGroup>
      </div>

      {importType === 'csv' ? (
        <ImportView
          resource={'uncategorized_bank_transaction'}
          params={{ accountId: params.id }}
          onImportSuccess={handleImportSuccess}
          onCancelClick={handleCancelBtnClick}
          sampleFileName={'sample_bank_transactions'}
        />
      ) : (
        <Box className={styles.root}>
          <ImportFileProvider
            resource={'uncategorized_bank_transaction'}
            params={{ accountId: params.id }}
            onImportSuccess={handleImportSuccess}
            onCancelClick={handleCancelBtnClick}
            exampleDownload={false}
          >
            <QBOImportStepper />
          </ImportFileProvider>
        </Box>
      )}
    </DashboardInsider>
  );
}
