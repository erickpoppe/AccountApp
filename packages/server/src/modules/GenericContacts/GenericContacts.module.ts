import { Module } from '@nestjs/common';
import { GenericContactApplication } from './GenericContactApplication.service';
import { PartnersController } from './Partners.controller';
import { OthersController } from './Others.controller';
import { TenancyDatabaseModule } from '@/modules/Tenancy/TenancyDB/TenancyDB.module';
import { TenancyModule } from '@/modules/Tenancy/Tenancy.module';

@Module({
  imports: [TenancyDatabaseModule, TenancyModule],
  providers: [GenericContactApplication],
  controllers: [PartnersController, OthersController],
})
export class GenericContactsModule {}
