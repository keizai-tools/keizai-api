import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { CollectionModule } from '../collection/collection.module';
import { TeamModule } from '../team/team.module';
import { ENVIRONMENT_REPOSITORY } from './application/interface/environment.repository.interface';
import { EnvironmentMapper } from './application/mapper/environment.mapper';
import { EnvironmentService } from './application/service/environment.service';
import { EnvironmentRepository } from './infrastructure/persistence/environment.repository';
import { EnvironmentSchema } from './infrastructure/persistence/environment.schema';
import { EnvironmentTeamController } from './interface/environment-team.controller';
import { EnvironmentUserController } from './interface/environment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnvironmentSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => CommonModule),
    TeamModule,
  ],
  controllers: [EnvironmentUserController, EnvironmentTeamController],
  providers: [
    EnvironmentMapper,
    EnvironmentService,
    {
      provide: ENVIRONMENT_REPOSITORY,
      useClass: EnvironmentRepository,
    },
  ],
  exports: [EnvironmentMapper, EnvironmentService],
})
export class EnvironmentModule {}
