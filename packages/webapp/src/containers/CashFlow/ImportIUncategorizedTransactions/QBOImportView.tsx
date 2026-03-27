// @ts-nocheck
import { useState, useRef } from 'react';
import { Button, Intent, Callout } from '@blueprintjs/core';
import { AppToaster, Stack } from '@/components';
import { useQBOFileUpload, useImportFileProcess } from '@/hooks/query/import';
import { transformToCamelCase } from '@/utils';

interface QBOImportViewProps {
  accountId: string | number;
  onImportSuccess: () => void;
  onCancelClick: () => void;
}

export function QBOImportView({ accountId, onImportSuccess, onCancelClick }: QBOImportViewProps) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importId, setImportId] = useState(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [step, setStep] = useState('upload');

  const { mutateAsync: uploadQBO, isLoading: isUploading } = useQBOFileUpload();
  const { mutateAsync: processImport, isLoading: isProcessing } = useImportFileProcess();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify({ accountId }));
    try {
      const { data } = await uploadQBO(formData);
      const _data = transformToCamelCase(data);
      setImportId(_data.import.importId);
      setTotalTransactions(_data.totalTransactions);
      setStep('confirm');
    } catch (e) {
      AppToaster.show({
        intent: Intent.DANGER,
        message: 'Failed to upload QBO file. Please check the file format.',
      });
    }
  };

  const handleImport = async () => {
    if (!importId) return;
    try {
      await processImport(importId);
      AppToaster.show({
        intent: Intent.SUCCESS,
        message: `${totalTransactions} transactions imported successfully.`,
      });
      onImportSuccess();
    } catch (e) {
      AppToaster.show({
        intent: Intent.DANGER,
        message: 'Failed to import transactions.',
      });
    }
  };

  return (
    <Stack spacing={20} style={{ padding: '20px' }}>
      {step === 'upload' && (
        <>
          <Callout intent={Intent.PRIMARY} icon="info-sign">
            Upload a QBO or OFX file exported from your bank. Transactions will be imported as uncategorized.
          </Callout>
          <div
            style={{
              border: '2px dashed #ccc',
              borderRadius: 4,
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".qbo,.ofx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {file ? (
              <p>Selected: <strong>{file.name}</strong></p>
            ) : (
              <p>Click to select a QBO or OFX file</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              intent={Intent.PRIMARY}
              onClick={handleUpload}
              disabled={!file || isUploading}
              loading={isUploading}
            >
              Upload
            </Button>
            <Button onClick={onCancelClick}>Cancel</Button>
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <Callout intent={Intent.SUCCESS} icon="tick">
            <strong>{totalTransactions} transactions</strong> found in the QBO file. Click Import to add them to your account.
          </Callout>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              intent={Intent.PRIMARY}
              onClick={handleImport}
              loading={isProcessing}
            >
              Import {totalTransactions} Transactions
            </Button>
            <Button onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={onCancelClick}>Cancel</Button>
          </div>
        </>
      )}
    </Stack>
  );
}
