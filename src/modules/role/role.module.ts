import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { USER_ROLE_TO_TEAM_MAPPER } from './application/interface/role.mapper.interface';
import { USER_ROLE_TO_TEAM_REPOSITORY } from './application/interface/role.repository.interface';
import { USER_ROLE_TO_TEAM_SERVICE } from './application/interface/role.service.interface';
import { UserRoleToTeamMapper } from './application/mapper/role.mapper';
import { UserRoleOnTeamService } from './application/service/role.service';
import { UserRoleToTeamRepository } from './infrastructure/persistence/role.repository';
import { UserRoleToTeamSchema } from './infrastructure/persistence/role.schema';
import { UserRoleToTeamController } from './interface/role.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRoleToTeamSchema]),
    forwardRef(() => CommonModule),
  ],
  controllers: [UserRoleToTeamController],
  providers: [
    {
      provide: USER_ROLE_TO_TEAM_SERVICE,
      useClass: UserRoleOnTeamService,
    },
    {
      provide: USER_ROLE_TO_TEAM_MAPPER,
      useClass: UserRoleToTeamMapper,
    },
    ,
    {
      provide: USER_ROLE_TO_TEAM_REPOSITORY,
      useClass: UserRoleToTeamRepository,
    },
  ],
  exports: [
    {
      provide: USER_ROLE_TO_TEAM_SERVICE,
      useClass: UserRoleOnTeamService,
    },
    {
      provide: USER_ROLE_TO_TEAM_MAPPER,
      useClass: UserRoleToTeamMapper,
    },
  ],
})
export class UserRoleToTeamModule {}
