// @ts-nocheck
import { Button, NavbarGroup, Classes, NavbarDivider } from '@blueprintjs/core';
import {
  DashboardActionsBar,
  Can,
  Icon,
} from '@/components';
import { useRefreshCashflowAccounts } from '@/hooks/query';
import { CashflowAction, AbilitySubject } from '@/constants/abilityOption';
import { withDialogActions } from '@/containers/Dialog/withDialogActions';
import { AccountDialogAction } from '@/containers/Dialogs/AccountDialog/utils';
import { ACCOUNT_TYPE } from '@/constants';
import { DialogsName } from '@/constants/dialogs';
import { compose } from '@/utils';

function CreditCardAccountsActionsBar({ openDialog }) {
  const { refresh } = useRefreshCashflowAccounts();

  const handleAddCreditCard = () => {
    openDialog(DialogsName.AccountForm, {
      action: AccountDialogAction.NewDefinedType,
      accountType: ACCOUNT_TYPE.CREDIT_CARD,
    });
  };

  return (
    <DashboardActionsBar>
      <NavbarGroup>
        <Can I={CashflowAction.Create} a={AbilitySubject.Cashflow}>
          <Button
            className={Classes.MINIMAL}
            icon={<Icon icon={'plus-24'} iconSize={20} />}
            text={'Add Credit Card'}
            onClick={handleAddCreditCard}
          />
          <NavbarDivider />
        </Can>
      </NavbarGroup>

      <NavbarGroup>
        <Button
          className={Classes.MINIMAL}
          icon={<Icon icon="refresh-16" iconSize={14} />}
          onClick={refresh}
        />
      </NavbarGroup>
    </DashboardActionsBar>
  );
}

export default compose(withDialogActions)(CreditCardAccountsActionsBar);
