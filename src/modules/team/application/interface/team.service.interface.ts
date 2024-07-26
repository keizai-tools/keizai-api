import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { ResponseInvitationDto } from '@/modules/invitation/application/dto/response-invitation.dto';
import { User } from '@/modules/user/domain/user.domain';

import { CreateTeamDto } from '../dto/create-team.dto';
import { TeamResponseDto } from '../dto/response-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';

export interface ITeamData {
  name: string;
  users?: User[];
}

export interface IUpdateTeamData extends ITeamData {
  id: string;
}

export const TEAM_SERVICE = 'TEAM_SERVICE';

export interface ITeamService {
  findAllByUser(userId: string): IPromiseResponse<TeamResponseDto[]>;
  findOne(id: string): IPromiseResponse<TeamResponseDto>;
  findOneByIds(teamId: string, adminId: string): Promise<TeamResponseDto>;
  findCollectionsByTeam(teamId: string): Promise<any>; // Replace 'any' with the actual return type
  create(
    createTeamDto: CreateTeamDto,
    user: User,
  ): IPromiseResponse<TeamResponseDto>;
  createAllInvitations(
    users: User[],
    teamId: string,
    fromUserId: string,
  ): Promise<ResponseInvitationDto[]>;
  createAllUserRole(
    users: User[],
    teamId: string,
    ownerId?: string,
  ): Promise<any>; // Replace 'any' with the actual return type
  update(
    updateTeamDto: UpdateTeamDto,
    adminId: string,
  ): IPromiseResponse<TeamResponseDto>;
  delete(teamId: string, adminId: string): IPromiseResponse<boolean>;
}
