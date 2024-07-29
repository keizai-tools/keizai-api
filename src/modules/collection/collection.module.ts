import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { EnviromentModule } from '../enviroment/enviroment.module';
import { FolderModule } from '../folder/folder.module';
import { TeamModule } from '../team/team.module';
import { COLLECTION_SERVICE } from './application/interface/collection.base.interface';
import { COLLECTION_MAPPER } from './application/interface/collection.mapper.interface';
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
    forwardRef(() => EnviromentModule),
    forwardRef(() => CommonModule),
    TeamModule,
  ],
  controllers: [CollectionController, CollectionTeamController],
  providers: [
    {
      provide: COLLECTION_SERVICE,
      useClass: CollectionService,
    },
    {
      provide: COLLECTION_MAPPER,
      useClass: CollectionMapper,
    },
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
  ],
  exports: [
    {
      provide: COLLECTION_SERVICE,
      useClass: CollectionService,
    },
    {
      provide: COLLECTION_MAPPER,
      useClass: CollectionMapper,
    },
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
  ],
})
export class CollectionModule {}
