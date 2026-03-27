// @ts-nocheck
import { useState } from 'react';
import { Button, Intent, Callout } from '@blueprintjs/core';
import { AppToaster, Stack } from '@/components';
import { useQBOFileUpload } from '@/hooks/query/import';
import { transformToCamelCase } from '@/utils';
import { useImportFileContext } from '@/containers/Import/ImportFileProvider';

export function QBOUploadStep() {
  const [file, setFile] = useState(null);
  const { setImportId, setSheetColumns, setEntityColumns, setStep, params, onCancelClick } = useImportFileContext();
  const { mutateAsync: uploadQBO, isLoading: isUploading } = useQBOFileUpload();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('params', JSON.stringify(params));
    try {
      const { data } = await uploadQBO(formData);
      const _data = transformToCamelCase(data);
      setImportId(_data.import.importId);
      setSheetColumns(_data.sheetColumns);
      setEntityColumns(_data.resourceColumns);
      setStep(1);
    } catch (e) {
      AppToaster.show({
        intent: Intent.DANGER,
        message: 'Failed to upload QBO file.',
      });
    }
  };

  return (
    <Stack spacing={20} style={{ padding: '20px' }}>
      <Callout intent={Intent.PRIMARY} icon="info-sign">
        Upload a QBO or OFX file exported from your bank. You'll map the columns in the next step.
      </Callout>
      <div
        style={{ border: '2px dashed #ccc', borderRadius: 4, padding: '40px 20px', textAlign: 'center', cursor: 'pointer' }}
        onClick={() => document.getElementById('qbo-file-input').click()}
      >
        <input
          id="qbo-file-input"
          type="file"
          accept=".qbo,.ofx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {file ? <p>Selected: <strong>{file.name}</strong></p> : <p>Click to select a QBO or OFX file</p>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button intent={Intent.PRIMARY} onClick={handleUpload} disabled={!file || isUploading} loading={isUploading}>
          Upload
        </Button>
        <Button onClick={onCancelClick}>Cancel</Button>
      </div>
    </Stack>
  );
}
