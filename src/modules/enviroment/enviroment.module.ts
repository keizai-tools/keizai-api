import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { TeamModule } from '../team/team.module';
import { EnviromentMapper } from './application/mapper/enviroment.mapper';
import { ENVIROMENT_REPOSITORY } from './application/repository/enviroment.repository';
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
