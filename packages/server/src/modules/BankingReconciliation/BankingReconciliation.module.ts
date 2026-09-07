import { Module } from '@nestjs/common';
import { RegisterTenancyModel } from '../Tenancy/TenancyModels/Tenancy.module';
import { BankTransaction } from '../BankingTransactions/models/BankTransaction';
import { BankReconciliation } from './models/BankReconciliation';
import { GetReconciliationDataService } from './services/GetReconciliationData.service';
import { ToggleClearedTransactionService } from './services/ToggleClearedTransaction.service';
import { FinishReconciliationService } from './services/FinishReconciliation.service';
import { BankingReconciliationController } from './controllers/BankingReconciliation.controller';

@Module({
  imports: [
    RegisterTenancyModel(BankTransaction),
    RegisterTenancyModel(BankReconciliation),
  ],
  providers: [
    GetReconciliationDataService,
    ToggleClearedTransactionService,
    FinishReconciliationService,
  ],
  controllers: [BankingReconciliationController],
})
export class BankingReconciliationModule {}
