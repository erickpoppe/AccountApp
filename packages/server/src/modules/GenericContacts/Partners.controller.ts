import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenericContactApplication } from './GenericContactApplication.service';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';

@Controller('partners')
@ApiTags('Partners')
@ApiCommonHeaders()
export class PartnersController {
  constructor(private readonly contactApp: GenericContactApplication) {}

  @Get()
  getPartners(@Query() query: any) {
    return this.contactApp.getContacts('partner', query);
  }

  @Get(':id')
  getPartner(@Param('id') id: number) {
    return this.contactApp.getContact(Number(id), 'partner');
  }

  @Post()
  createPartner(@Body() dto: any) {
    return this.contactApp.createContact(dto, 'partner');
  }

  @Put(':id')
  editPartner(@Param('id') id: number, @Body() dto: any) {
    return this.contactApp.editContact(Number(id), dto, 'partner');
  }

  @Delete(':id')
  deletePartner(@Param('id') id: number) {
    return this.contactApp.deleteContact(Number(id), 'partner');
  }
}
