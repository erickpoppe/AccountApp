// @ts-nocheck
import { Position } from '@blueprintjs/core';
import {
  AccountsSelect,
  FDateInput,
  FFormGroup,
  FInputGroup,
  FTextArea,
  Icon,
} from '@/components';
import { useCategorizeTransactionBoot } from '../CategorizeTransactionBoot';
import { CategorizeTransactionBranchField } from '../CategorizeTransactionBranchField';
import { VendorsSelect } from '@/components/Vendors/VendorsSelect';

export default function CategorizeTransactionVendorPayment() {
  const { accounts, vendors } = useCategorizeTransactionBoot();

  return (
    <>
      <FFormGroup name={'date'} label={'Date'} fastField inline>
        <FDateInput
          name={'date'}
          popoverProps={{ position: Position.BOTTOM, minimal: true }}
          formatDate={(date) => date.toLocaleDateString()}
          parseDate={(str) => new Date(str)}
          inputProps={{ fill: true, leftElement: <Icon icon={'date-range'} /> }}
        />
      </FFormGroup>
      <FFormGroup
        name={'debitAccountId'}
        label={'Payment Account'}
        fastField={true}
        inline
      >
        <AccountsSelect
          name={'debitAccountId'}
          items={accounts}
          fastField
          fill
          allowCreate
          disabled
        />
      </FFormGroup>
      <FFormGroup
        name={'creditAccountId'}
        label={'Expense Account'}
        fastField={true}
        inline
      >
        <AccountsSelect
          name={'creditAccountId'}
          items={accounts}
          fastField
          fill
          allowCreate
        />
      </FFormGroup>
      <FFormGroup name={'contactId'} label={'Vendor'} fastField inline>
        <VendorsSelect
          name={'contactId'}
          items={vendors || []}
          fastField
          fill
        />
      </FFormGroup>
      <FFormGroup name={'referenceNo'} label={'Reference No.'} fastField inline>
        <FInputGroup name={"referenceNo"} fill />
      </FFormGroup>
      <FFormGroup name={'description'} label={'Description'} fastField inline>
        <FTextArea
          name={'description'}
          growVertically={true}
          large={true}
          fill={true}
        />
      </FFormGroup>
      <CategorizeTransactionBranchField />
    </>
  );
}
