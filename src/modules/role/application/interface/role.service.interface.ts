import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { UserRoleToTeam } from '../../domain/role.domain';
import { CreateUserRoleToTeamDto } from '../dto/create-user-role.dto';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import { UpdateUserRoleToTeamDto } from '../dto/update-user-role.dto';

export interface UserRoleToTeamData {
  teamId: string;
  userId: string;
  role: string;
  id?: string;
}

export interface IUpdateUserRoleToTeamData extends UserRoleToTeamData {
  id: string;
}

export const USER_ROLE_TO_TEAM_SERVICE = 'USER_ROLE_TO_TEAM_SERVICE';

export interface IUserRoleOnTeamService {
  findAllByTeamId(teamId: string): Promise<ResponseUserRoletoTeamDto[]>;
  findAllByUser(userId: string): IPromiseResponse<ResponseUserRoletoTeamDto[]>;
  findOneByIds(
    id: string,
    userId: string,
  ): IPromiseResponse<ResponseUserRoletoTeamDto>;
  create(
    createDto: CreateUserRoleToTeamDto,
    userId: string,
  ): IPromiseResponse<UserRoleToTeam>;
  createAll(
    userRoleToTeamData: UserRoleToTeamData[],
  ): Promise<ResponseUserRoletoTeamDto[]>;
  update(
    updateDto: UpdateUserRoleToTeamDto,
    userId: string,
  ): IPromiseResponse<UserRoleToTeam>;
  delete(id: string, userId: string): IPromiseResponse<boolean>;
}
