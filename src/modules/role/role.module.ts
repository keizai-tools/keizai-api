import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserRoleToTeamMapper } from './application/mapper/role.mapper';
import { USER_ROLE_TO_TEAM_REPOSITORY } from './application/repository/role.repository';
import { UserRoleOnTeamService } from './application/service/role.service';
import { UserRoleToTeamSchema } from './infrastructure/persistence/role.schema';
import { UserRoleToTeamRepository } from './infrastructure/persistence/role.typeorm.repository';
import { UserRoleToTeamController } from './interface/role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserRoleToTeamSchema])],
  controllers: [UserRoleToTeamController],
  providers: [
    UserRoleOnTeamService,
    UserRoleToTeamMapper,
    {
      provide: USER_ROLE_TO_TEAM_REPOSITORY,
      useClass: UserRoleToTeamRepository,
    },
  ],
})
export class UserRoleToTeamModule {}
