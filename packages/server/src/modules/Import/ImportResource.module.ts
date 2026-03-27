import { Module } from '@nestjs/common';
import { ImportResourceApplication } from './ImportResourceApplication';
import { ImportFileUploadService } from './ImportFileUpload';
import { ImportFileMapping } from './ImportFileMapping';
import { ImportFileProcess } from './ImportFileProcess';
import { ImportFilePreview } from './ImportFilePreview';
import { ImportFileProcessCommit } from './ImportFileProcessCommit';
import { ImportFileMeta } from './ImportFileMeta';
import { ImportSampleService } from './ImportSample';
import { QBOParserService } from './QBOParser.service';
import { QBOImportService } from './QBOImportService';

@Module({
  imports: [],
  providers: [
    ImportResourceApplication,
    ImportFileUploadService,
    ImportFileMapping,
    ImportFileProcess,
    ImportFilePreview,
    ImportSampleService,
    ImportFileMeta,
    ImportFileProcessCommit,
    QBOParserService,
    QBOImportService,
  ],
  exports: [ImportResourceApplication, QBOImportService],
})
export class ImportResourceModule {}
