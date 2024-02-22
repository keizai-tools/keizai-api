import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CollectionModule } from '../collection/collection.module';
import { TeamMapper } from './application/mapper/team.mapper';
import { TEAM_REPOSITORY } from './application/repository/team.repository';
import { TeamService } from './application/service/team.service';
import { TeamSchema } from './infrastructure/persistence/team.schema';
import { TeamRepository } from './infrastructure/persistence/team.typeorm.repository';
import { TeamController } from './interface/team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [TeamController],
  providers: [
    TeamService,
    TeamMapper,
    {
      provide: TEAM_REPOSITORY,
      useClass: TeamRepository,
    },
  ],
})
export class TeamModule {}
