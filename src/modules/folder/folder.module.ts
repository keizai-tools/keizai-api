import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionModule } from '../collection/collection.module';
import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { FolderMapper } from './application/mapper/folder.mapper';
import { FOLDER_REPOSITORY } from './application/repository/folder.repository';
import { FolderService } from './application/service/folder.service';
import { FolderSchema } from './infrastructure/persistence/folder.schema';
import { FolderRepository } from './infrastructure/persistence/folder.typeorm.repository';
import { FolderTeamController } from './interface/folder-team.controller';
import { FolderUserController } from './interface/folder.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FolderSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => InvocationModule),
    TeamModule,
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
