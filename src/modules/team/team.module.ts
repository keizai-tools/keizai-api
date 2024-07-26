import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { AuthModule } from '../auth/auth.module';
import { CollectionModule } from '../collection/collection.module';
import { InvitationModule } from '../invitation/invitation.module';
import { UserRoleToTeamModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { TEAM_MAPPER } from './application/interface/team.mapper.interface';
import { TEAM_REPOSITORY } from './application/interface/team.repository.interface';
import { TEAM_SERVICE } from './application/interface/team.service.interface';
import { TeamMapper } from './application/mapper/team.mapper';
import { TeamService } from './application/service/team.service';
import { TeamRepository } from './infrastructure/persistence/team.repository';
import { TeamSchema } from './infrastructure/persistence/team.schema';
import { TeamController } from './interface/team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamSchema]),
    forwardRef(() => CollectionModule),
    forwardRef(() => AuthModule),
    forwardRef(() => InvitationModule),
    forwardRef(() => UserRoleToTeamModule),
    forwardRef(() => UserModule),
    forwardRef(() => CommonModule),
  ],
  controllers: [TeamController],
  providers: [
    {
      provide: TEAM_MAPPER,
      useClass: TeamMapper,
    },
    {
      provide: TEAM_SERVICE,
      useClass: TeamService,
    },
    {
      provide: TEAM_REPOSITORY,
      useClass: TeamRepository,
    },
  ],
  exports: [
    {
      provide: TEAM_SERVICE,
      useClass: TeamService,
    },
  ],
})
export class TeamModule {}
