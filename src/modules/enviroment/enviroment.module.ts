import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionModule } from '../collection/collection.module';
import { EnviromentMapper } from './application/mapper/enviroment.mapper';
import { ENVIROMENT_REPOSITORY } from './application/repository/enviroment.repository';
import { EnviromentService } from './application/service/enviroment.service';
import { EnviromentSchema } from './infrastructure/persistence/enviroment.schema';
import { EnviromentRepository } from './infrastructure/persistence/enviroment.typeorm.repository';
import { EnviromentController } from './interface/enviroment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnviromentSchema]),
    forwardRef(() => CollectionModule),
  ],
  controllers: [EnviromentController],
  providers: [
    EnviromentService,
    EnviromentMapper,
    {
      provide: ENVIROMENT_REPOSITORY,
      useClass: EnviromentRepository,
    },
  ],
  exports: [EnviromentMapper, EnviromentService],
})
export class EnviromentModule {}
