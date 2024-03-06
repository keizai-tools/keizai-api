import { UserRoleToTeam } from '../../domain/role.domain';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import {
  IUpdateUserRoleToTeamData,
  UserRoleToTeamData,
} from '../service/role.service';

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
    const { id, teamId, userId, user, role } = userRole;
    return new ResponseUserRoletoTeamDto(id, teamId, userId, user.email, role);
  }
}
