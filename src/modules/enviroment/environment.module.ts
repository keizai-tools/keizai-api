import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionModule } from '../collection/collection.module';
import { EnvironmentMapper } from './application/mapper/environment.mapper';
import { ENVIRONMENT_REPOSITORY } from './application/repository/environment.repository';
import { EnvironmentService } from './application/service/environment.service';
import { EnvironmentSchema } from './infrastructure/persistence/environment.schema';
import { EnvironmentRepository } from './infrastructure/persistence/environment.typeorm.repository';
import { EnvironmentController } from './interface/environment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentSchema]),
    forwardRef(() => CollectionModule),
  ],
  controllers: [EnvironmentController],
  providers: [
    EnvironmentService,
    EnvironmentMapper,
    {
      provide: ENVIRONMENT_REPOSITORY,
      useClass: EnvironmentRepository,
    },
  ],
  exports: [EnvironmentMapper],
})
export class EnvironmentModule {}
