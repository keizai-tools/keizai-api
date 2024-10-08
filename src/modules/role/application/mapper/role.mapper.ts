import { Role } from '@/modules/authorization/domain/role.enum';

import { UserRoleToTeam } from '../../domain/role.domain';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import {
  IUpdateUserRoleToTeamData,
  UserRoleToTeamData,
} from '../interface/role.base.interface';

export class UserRoleToTeamMapper {
  fromDtoToEntity(userRoleData: UserRoleToTeamData): UserRoleToTeam {
    const { teamId, userId, role } = userRoleData;
    return new UserRoleToTeam(teamId, userId, role);
  }

  fromUpdateDtoToEntity(
    userRoleData: IUpdateUserRoleToTeamData,
  ): UserRoleToTeam {
    const { teamId, userId, role, id } = userRoleData;
    return new UserRoleToTeam(teamId, userId, role, id);
  }

  fromEntityToDto(userRole: UserRoleToTeam): ResponseUserRoletoTeamDto {
    const { id, teamId, userId, role } = userRole;
    return new ResponseUserRoletoTeamDto(id, teamId, userId, Role[role]);
  }
}
