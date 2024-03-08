import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnviromentModule } from '../enviroment/enviroment.module';
import { FolderModule } from '../folder/folder.module';
import { TeamModule } from '../team/team.module';
import { CollectionMapper } from './application/mapper/collection.mapper';
import { COLLECTION_REPOSITORY } from './application/repository/collection.repository';
import { CollectionService } from './application/service/collection.service';
import { CollectionSchema } from './infrastructure/persistence/collection.schema';
import { CollectionRepository } from './infrastructure/persistence/collection.typeorm.repository';
import { CollectionTeamController } from './interface/collection-team.controller';
import { CollectionController } from './interface/collection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionSchema]),
    forwardRef(() => FolderModule),
    forwardRef(() => EnviromentModule),
    TeamModule,
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
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
    CollectionService,
    CollectionMapper,
  ],
})
export class CollectionModule {}
