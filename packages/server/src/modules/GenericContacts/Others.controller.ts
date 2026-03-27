import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenericContactApplication } from './GenericContactApplication.service';
import { ApiCommonHeaders } from '@/common/decorators/ApiCommonHeaders';

@Controller('others')
@ApiTags('Others')
@ApiCommonHeaders()
export class OthersController {
  constructor(private readonly contactApp: GenericContactApplication) {}

  @Get()
  getOthers(@Query() query: any) {
    return this.contactApp.getContacts('other', query);
  }

  @Get(':id')
  getOther(@Param('id') id: number) {
    return this.contactApp.getContact(Number(id), 'other');
  }

  @Post()
  createOther(@Body() dto: any) {
    return this.contactApp.createContact(dto, 'other');
  }

  @Put(':id')
  editOther(@Param('id') id: number, @Body() dto: any) {
    return this.contactApp.editContact(Number(id), dto, 'other');
  }

  @Delete(':id')
  deleteOther(@Param('id') id: number) {
    return this.contactApp.deleteContact(Number(id), 'other');
  }
}
