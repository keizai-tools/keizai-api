import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { TeamModule } from '../team/team.module';
import { ENVIROMENT_MAPPER } from './application/interface/enviroment.mapper.interface';
import { ENVIROMENT_REPOSITORY } from './application/interface/enviroment.repository.interface';
import { ENVIROMENT_SERVICE } from './application/interface/enviroment.service.interface';
import { EnviromentMapper } from './application/mapper/enviroment.mapper';
import { EnviromentService } from './application/service/enviroment.service';
import { EnviromentRepository } from './infrastructure/persistence/enviroment.repository';
import { EnviromentSchema } from './infrastructure/persistence/enviroment.schema';
import { EnviromentUserController } from './interface/enviroment.controller';
import { EnviromentTeamController } from './interface/environment-team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnviromentSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => CommonModule),
    TeamModule,
  ],
  controllers: [EnviromentUserController, EnviromentTeamController],
  providers: [
    {
      provide: ENVIROMENT_MAPPER,
      useClass: EnviromentMapper,
    },
    {
      provide: ENVIROMENT_SERVICE,
      useClass: EnviromentService,
    },
    {
      provide: ENVIROMENT_REPOSITORY,
      useClass: EnviromentRepository,
    },
  ],
  exports: [
    {
      provide: ENVIROMENT_MAPPER,
      useClass: EnviromentMapper,
    },
    {
      provide: ENVIROMENT_SERVICE,
      useClass: EnviromentService,
    },
  ],
})
export class EnviromentModule {}
