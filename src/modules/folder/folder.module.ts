import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { InvocationModule } from '../invocation/invocation.module';
import { FolderMapper } from './application/mapper/folder.mapper';
import { FOLDER_REPOSITORY } from './application/repository/folder.repository';
import { FolderService } from './application/service/folder.service';
import { FolderSchema } from './infrastructure/persistence/folder.schema';
import { FolderRepository } from './infrastructure/persistence/folder.typeorm.repository';
import { FolderController } from './interface/folder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FolderSchema]),
    CommonModule,
    forwardRef(() => CollectionModule),
    forwardRef(() => InvocationModule),
  ],
  controllers: [FolderController],
  providers: [
    FolderService,
    FolderMapper,
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
  exports: [
    FolderMapper,
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
})
export class FolderModule {}
