import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { GetReconciliationDataService } from '../services/GetReconciliationData.service';
import { ToggleClearedTransactionService } from '../services/ToggleClearedTransaction.service';
import { FinishReconciliationService } from '../services/FinishReconciliation.service';
import {
  FinishReconciliationDto,
  GetReconciliationTransactionsDto,
  ToggleClearedDto,
} from '../dtos/ReconciliationDto';

@Controller('banking')
export class BankingReconciliationController {
  constructor(
    private readonly getReconciliationData: GetReconciliationDataService,
    private readonly toggleCleared: ToggleClearedTransactionService,
    private readonly finishReconciliation: FinishReconciliationService,
  ) {}

  @Get('accounts/:accountId/reconciliation')
  async getReconciliation(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query() query: GetReconciliationTransactionsDto,
  ) {
    return this.getReconciliationData.getData(accountId, query.statementDate);
  }

  @Patch('transactions/:id/cleared')
  async toggleClearedStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ToggleClearedDto,
  ) {
    return this.toggleCleared.toggle(id, body.cleared);
  }

  @Post('accounts/:accountId/reconciliation/finish')
  async finish(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Body() body: FinishReconciliationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.finishReconciliation.finish(
      accountId,
      body.statementDate,
      body.statementClosingBalance,
      userId,
    );
  }
}
