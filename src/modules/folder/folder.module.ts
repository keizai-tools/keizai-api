import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { FOLDER_MAPPER } from './application/interface/folder.mapper.interface';
import { FOLDER_REPOSITORY } from './application/interface/folder.repository.interface';
import { FOLDER_SERVICE } from './application/interface/folder.service.interface';
import { FolderMapper } from './application/mapper/folder.mapper';
import { FolderService } from './application/service/folder.service';
import { FolderRepository } from './infrastructure/persistence/folder.repository';
import { FolderSchema } from './infrastructure/persistence/folder.schema';
import { FolderTeamController } from './interface/folder-team.controller';
import { FolderUserController } from './interface/folder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FolderSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => InvocationModule),
    forwardRef(() => CommonModule),
    forwardRef(() => TeamModule),
  ],
  controllers: [FolderUserController, FolderTeamController],
  providers: [
    {
      provide: FOLDER_SERVICE,
      useClass: FolderService,
    },
    {
      provide: FOLDER_MAPPER,
      useClass: FolderMapper,
    },
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
  exports: [
    {
      provide: FOLDER_SERVICE,
      useClass: FolderService,
    },
    {
      provide: FOLDER_MAPPER,
      useClass: FolderMapper,
    },
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
})
export class FolderModule {}
