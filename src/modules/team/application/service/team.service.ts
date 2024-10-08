import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';
import { Role } from '@/modules/authorization/domain/role.enum';
import { CollectionService } from '@/modules/collection/application/service/collection.service';
import { ResponseInvitationDto } from '@/modules/invitation/application/dto/response-invitation.dto';
import { InvitationService } from '@/modules/invitation/application/service/invitation.service';
import { UserRoleOnTeamService } from '@/modules/role/application/service/role.service';
import {
  IUserService,
  USER_SERVICE,
} from '@/modules/user/application/interfaces/user.service.interfaces';
import { User } from '@/modules/user/domain/user.domain';

import { CreateTeamDto } from '../dto/create-team.dto';
import { TeamResponseDto } from '../dto/response-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TEAM_RESPONSE } from '../exceptions/team-response.enum';
import { ITeamData, IUpdateTeamData } from '../interface/team.base.interface';
import {
  ITeamRepository,
  TEAM_REPOSITORY,
} from '../interface/team.repository.interface';
import { TeamMapper } from '../mapper/team.mapper';

@Injectable()
export class TeamService {
  constructor(
    @Inject(forwardRef(() => UserRoleOnTeamService))
    private readonly userRoleOnTeamService: UserRoleOnTeamService,

    @Inject(forwardRef(() => CollectionService))
    private readonly collectionService: CollectionService,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    private readonly teamMapper: TeamMapper,
  ) {
    this.responseService.setContext(TeamService.name);
  }

  async findAllByUser(userId: string): IPromiseResponse<TeamResponseDto[]> {
    try {
      const teams = await this.teamRepository.findAllByUser(userId);

      if (!teams) {
        throw new NotFoundException(TEAM_RESPONSE.TEAMS_NOT_FOUND);
      }

      return this.responseService.createResponse({
        payload: teams.map((team) => this.teamMapper.fromEntityToDto(team)),
        message: TEAM_RESPONSE.TEAMS_FOUND_BY_USER,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string): IPromiseResponse<TeamResponseDto> {
    try {
      const team = await this.teamRepository.findOne(id);

      if (!team) {
        throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID);
      }

      return this.responseService.createResponse({
        payload: this.teamMapper.fromEntityToDto(team),
        message: TEAM_RESPONSE.TEAM_FOUND_BY_ID,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByIds(teamId: string, adminId: string) {
    try {
      const team = await this.teamRepository.findOneByIds(teamId, adminId);
      if (!team) {
        throw new NotFoundException(
          TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      return this.teamMapper.fromEntityToDto(team);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findCollectionsByTeam(teamId: string) {
    try {
      return await this.collectionService.findAllByTeam(teamId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createTeamDto: CreateTeamDto,
    user: User,
  ): IPromiseResponse<TeamResponseDto> {
    try {
      const { payload } = await this.userService.findAllByEmails(
        createTeamDto.usersEmails,
      );

      const teamData: ITeamData = {
        name: createTeamDto.name,
        users: payload,
      };

      const team = this.teamMapper.fromDtoToEntity(teamData);

      const teamSaved = await this.teamRepository.save(team);

      const invitations = await this.createAllInvitations(
        payload,
        teamSaved.id,
        user.id,
      );

      const roles = await this.createAllUserRole(
        payload,
        teamSaved.id,
        user.id,
      );

      if (!invitations || !roles) {
        throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_SAVE);
      }

      return this.responseService.createResponse({
        payload: this.teamMapper.fromEntityToDto(teamSaved),
        message: TEAM_RESPONSE.TEAM_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAllInvitations(
    users: User[],
    teamId: string,
    fromUserId: string,
  ): Promise<ResponseInvitationDto[]> {
    try {
      const invitationsToSave = users.map((user) => {
        return {
          teamId,
          fromUserId,
          toUserId: user.id,
          status: 'PENDING',
        };
      });
      return await this.invitationService.createAll(invitationsToSave);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAllUserRole(users: User[], teamId: string, ownerId?: string) {
    try {
      const userRoleToSave = users.map((user) => {
        return {
          teamId,
          userId: user.id,
          role: Role.ADMIN,
        };
      });

      if (ownerId) {
        userRoleToSave.push({
          teamId,
          userId: ownerId,
          role: Role.OWNER,
        });
      }

      return await this.userRoleOnTeamService.createAll(userRoleToSave);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    updateTeamDto: UpdateTeamDto,
    adminId: string,
  ): IPromiseResponse<TeamResponseDto> {
    try {
      const teamData: IUpdateTeamData = {
        name: updateTeamDto.name,
        id: updateTeamDto.id,
      };

      const team = await this.findOne(updateTeamDto.id);

      if (!team) {
        throw new NotFoundException(
          TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      const { payload } = await this.userService.findAllByEmails(
        updateTeamDto.usersEmails,
      );

      if (payload.length !== 0) {
        await this.createAllInvitations(payload, teamData.id, adminId);
        await this.createAllUserRole(payload, teamData.id);
      }

      const teamMapped = this.teamMapper.fromUpdateDtoToEntity(teamData);
      const teamUpdated = await this.teamRepository.update(teamMapped);

      if (!teamUpdated) {
        throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_UPDATE);
      }

      return this.responseService.createResponse({
        payload: this.teamMapper.fromEntityToDto(teamUpdated),
        message: TEAM_RESPONSE.TEAM_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(teamId: string, adminId: string): IPromiseResponse<boolean> {
    try {
      const team = await this.findOneByIds(teamId, adminId);

      if (!team) {
        throw new NotFoundException(
          TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      const teamDeleted = await this.teamRepository.delete(teamId);
      if (!teamDeleted) {
        throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_DELETED);
      }

      return this.responseService.createResponse({
        payload: teamDeleted,
        message: TEAM_RESPONSE.TEAM_DELETED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error): void {
    this.responseService.errorHandler({
      type: 'INTERNAL_SERVER_ERROR',
      error,
    });
  }
}
