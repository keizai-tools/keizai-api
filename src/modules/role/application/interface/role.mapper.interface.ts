import { UserRoleToTeam } from '../../domain/role.domain';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import {
  IUpdateUserRoleToTeamData,
  UserRoleToTeamData,
} from './role.service.interface';

export const USER_ROLE_TO_TEAM_MAPPER = 'USER_ROLE_TO_TEAM_MAPPER';

export interface IUserRoleToTeamMapper {
  fromDtoToEntity(userRoleData: UserRoleToTeamData): UserRoleToTeam;
  fromUpdateDtoToEntity(
    userRoleData: IUpdateUserRoleToTeamData,
  ): UserRoleToTeam;
  fromEntityToDto(userRole: UserRoleToTeam): ResponseUserRoletoTeamDto;
}
