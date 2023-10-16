import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionMapper } from './application/mapper/collection.mapper';
import { COLLECTION_REPOSITORY } from './application/repository/collection.repository';
import { CollectionService } from './application/service/collection.service';
import { CollectionSchema } from './infrastructure/persistence/collection.schema';
import { CollectionRepository } from './infrastructure/persistence/collection.typeorm.repository';
import { CollectionController } from './interface/collection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionSchema]), CommonModule],
  controllers: [CollectionController],
  providers: [
    CollectionService,
    CollectionMapper,
    {
      provide: COLLECTION_REPOSITORY,
      useClass: CollectionRepository,
    },
  ],
})
export class CollectionModule {}
