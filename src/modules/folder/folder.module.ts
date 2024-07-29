import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { FOLDER_REPOSITORY } from './application/interface/folder.repository.interface';
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
    FolderService,
    FolderMapper,
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
  exports: [
    FolderService,
    FolderMapper,
    {
      provide: FOLDER_REPOSITORY,
      useClass: FolderRepository,
    },
  ],
})
export class FolderModule {}
