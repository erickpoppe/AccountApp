// @ts-nocheck
import { Stepper } from '@/components/Stepper';
import { useImportFileContext } from '@/containers/Import/ImportFileProvider';
import { ImportFileMapping } from '@/containers/Import/ImportFileMapping';
import { ImportFilePreview } from '@/containers/Import/ImportFilePreview';
import { QBOUploadStep } from './QBOUploadStep';
import styles from '@/containers/Import/ImportStepper.module.scss';

export function QBOImportStepper() {
  const { step } = useImportFileContext();
  return (
    <Stepper
      active={step}
      classNames={{
        content: styles.content,
        items: styles.items,
      }}
    >
      <Stepper.Step label={'File Upload'}>
        <QBOUploadStep />
      </Stepper.Step>
      <Stepper.Step label={'Mapping'}>
        <ImportFileMapping />
      </Stepper.Step>
      <Stepper.Step label={'Results'}>
        <ImportFilePreview />
      </Stepper.Step>
    </Stepper>
  );
}
