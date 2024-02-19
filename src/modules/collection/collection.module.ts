import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnviromentModule } from '../enviroment/enviroment.module';
import { FolderModule } from '../folder/folder.module';
import { CollectionMapper } from './application/mapper/collection.mapper';
import { COLLECTION_REPOSITORY } from './application/repository/collection.repository';
import { CollectionService } from './application/service/collection.service';
import { CollectionSchema } from './infrastructure/persistence/collection.schema';
import { CollectionRepository } from './infrastructure/persistence/collection.typeorm.repository';
import { CollectionController } from './interface/collection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionSchema]),
    forwardRef(() => FolderModule),
    forwardRef(() => EnviromentModule),
  ],
  controllers: [CollectionController],
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
