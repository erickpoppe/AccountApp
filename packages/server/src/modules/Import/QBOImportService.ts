import { Inject, Injectable } from '@nestjs/common';
import { QBOParserService } from './QBOParser.service';
import { ImportFileCommon } from './ImportFileCommon';
import { readImportFile, deleteImportFile } from './_utils';
import { ImportModel } from './models/Import';
import { TenancyContext } from '../Tenancy/TenancyContext.service';
import { ResourceService } from '../Resource/ResourceService';
import { getResourceColumns } from './_utils';

@Injectable()
export class QBOImportService {
  constructor(
    private readonly qboParser: QBOParserService,
    private readonly importFileCommon: ImportFileCommon,
    private readonly tenancyContext: TenancyContext,
    private readonly resourceService: ResourceService,
    @Inject(ImportModel.name)
    private readonly importModel: typeof ImportModel,
  ) {}

  public async import(filename: string, params: Record<string, any>) {
    try {
      return await this.importUnhandled(filename, params);
    } catch (err) {
      deleteImportFile(filename);
      throw err;
    }
  }

  private async importUnhandled(filename: string, params: Record<string, any>) {
    const resource = 'UncategorizedBankTransaction';

    await this.importFileCommon.validateParamsSchema(resource, params);
    await this.importFileCommon.validateParams(resource, params);
    const _params = await this.importFileCommon.transformParams(resource, params);

    const buffer = await readImportFile(filename);
    const [sheetData, sheetColumns] = this.qboParser.parse(buffer);

    const paramsStringified = JSON.stringify(_params);
    const columnsStringified = JSON.stringify(sheetColumns);

    const tenant = await this.tenancyContext.getTenant();

    const importFile = await this.importModel.query().insert({
      filename,
      resource,
      tenantId: tenant.id,
      importId: filename,
      columns: columnsStringified,
      params: paramsStringified,
    });

    const resourceColumnsMap = this.resourceService.getResourceFields2(resource);
    const resourceColumns = getResourceColumns(resourceColumnsMap);

    return {
      import: {
        importId: importFile.importId,
        resource: importFile.resource,
      },
      sheetColumns,
      resourceColumns,
      totalTransactions: sheetData.length,
    };
  }
}
