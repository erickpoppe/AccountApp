import { ToNumber } from '@/common/decorators/Validators';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetReconciliationTransactionsDto {
  @IsDateString()
  @IsNotEmpty()
  statementDate: string;
}

export class ToggleClearedDto {
  @IsNotEmpty()
  cleared: boolean;
}

export class FinishReconciliationDto {
  @IsDateString()
  @IsNotEmpty()
  statementDate: string;

  @ToNumber()
  @IsNumber()
  @IsNotEmpty()
  statementClosingBalance: number;
}
