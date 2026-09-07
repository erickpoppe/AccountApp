import { Module } from '@nestjs/common';
import { OllamaClientService } from './services/OllamaClient.service';
import { HistoryPriorService } from './services/HistoryPriorService.service';
import { AccountCandidatesService } from './services/AccountCandidatesService.service';
import { PromptBuilderService } from './services/PromptBuilder.service';
import { SuggestCategoryService } from './services/SuggestCategoryService.service';
import { CustomerMatchService } from './services/CustomerMatchService.service';
import { RegisterTenancyModel } from '../Tenancy/TenancyModels/Tenancy.module';
import { Contact } from '../Contacts/models/Contact';

@Module({
  imports: [RegisterTenancyModel(Contact)],
  providers: [
    OllamaClientService,
    HistoryPriorService,
    AccountCandidatesService,
    PromptBuilderService,
    SuggestCategoryService,
    CustomerMatchService,
  ],
  exports: [SuggestCategoryService],
})
export class BankingAiCategorizeModule {}
