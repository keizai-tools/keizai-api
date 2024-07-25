import { UserRoleToTeam } from '../../domain/role.domain';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import { IUserRoleToTeamMapper } from '../interface/role.mapper.interface';
import {
  IUpdateUserRoleToTeamData,
  UserRoleToTeamData,
} from '../interface/role.service.interface';

export class UserRoleToTeamMapper implements IUserRoleToTeamMapper {
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
    return new ResponseUserRoletoTeamDto(id, teamId, userId, role);
  }
}
