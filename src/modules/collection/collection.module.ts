import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { EnvironmentModule } from '../environment/environment.module';
import { FolderModule } from '../folder/folder.module';
import { InvocationModule } from '../invocation/invocation.module';
import { TeamModule } from '../team/team.module';
import { COLLECTION_REPOSITORY } from './application/interface/collection.repository.interface';
import { CollectionMapper } from './application/mapper/collection.mapper';
import { CollectionService } from './application/service/collection.service';
import { CollectionRepository } from './infrastructure/persistence/collection.repository';
import { CollectionSchema } from './infrastructure/persistence/collection.schema';
import { CollectionTeamController } from './interface/collection-team.controller';
import { CollectionController } from './interface/collection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionSchema]),
    forwardRef(() => FolderModule),
    forwardRef(() => EnvironmentModule),
    forwardRef(() => CommonModule),
    forwardRef(() => TeamModule),
    forwardRef(() => InvocationModule),
  ],
  controllers: [CollectionController, CollectionTeamController],
  providers: [
    CollectionService,
    CollectionMapper,
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
  ],
  exports: [
    CollectionService,
    CollectionMapper,
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
  ],
})
export class CollectionModule {}
