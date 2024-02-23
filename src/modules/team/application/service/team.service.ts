import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { AuthService } from '@/modules/auth/application/service/auth.service';
import { User } from '@/modules/auth/domain/user.domain';
import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { ResponseInvitationDto } from '@/modules/invitation/application/dto/response-invitation.dto';
import { InvitationService } from '@/modules/invitation/application/service/invitation.service';

import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { TEAM_RESPONSE } from '../exceptions/team-response.enum';
import { TeamMapper } from '../mapper/team.mapper';
import {
  ITeamRepository,
  TEAM_REPOSITORY,
} from '../repository/team.repository';

export interface ITeamData {
  name: string;
  adminId: string;
  users?: User[];
}

export interface IUpdateTeamData extends ITeamData {
  id: string;
}

@Injectable()
export class TeamService {
  constructor(
    private readonly teamMapper: TeamMapper,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: ITeamRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly userService: AuthService,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
  ) {}

  async findAllByUser(userId: string) {
    const teams = await this.teamRepository.findAllByUser(userId);

    if (!teams) {
      throw new NotFoundException(TEAM_RESPONSE.TEAMS_NOT_FOUND);
    }

    return teams.map((team) => this.teamMapper.fromEntityToDto(team));
  }

  async findOne(id: string) {
    const team = await this.teamRepository.findOne(id);

    if (!team) {
      throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_ID);
    }

    return this.teamMapper.fromEntityToDto(team);
  }

  async findOneByIds(teamId: string, adminId: string) {
    const team = await this.teamRepository.findOneByIds(teamId, adminId);
    if (!team) {
      throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID);
    }

    return this.teamMapper.fromEntityToDto(team);
  }

  async create(createTeamDto: CreateTeamDto, user: IUserResponse) {
    const users = await this.userService.findAllByEmails(
      createTeamDto.usersEmails,
    );

    const teamData: ITeamData = {
      name: createTeamDto.name,
      adminId: user.id,
      users,
    };

    const team = this.teamMapper.fromDtoToEntity(teamData);

    try {
      const teamSaved = await this.teamRepository.save(team);

      await this.createAllInvitations(
        teamSaved.users,
        teamSaved.id,
        teamSaved.adminId,
      );

      return this.teamMapper.fromEntityToDto(teamSaved);
    } catch (error) {
      throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_SAVE);
    }
  }

  async createAllInvitations(
    users: User[],
    teamId: string,
    fromUserId: string,
  ): Promise<ResponseInvitationDto[]> {
    const invitationsToSave = users.map((user) => {
      return {
        teamId,
        fromUserId,
        toUserId: user.id,
        status: 'PENDING',
      };
    });
    return await this.invitationService.createAll(invitationsToSave);
  }

  async update(updateTeamDto: UpdateTeamDto, adminId: string) {
    const teamData: IUpdateTeamData = {
      name: updateTeamDto.name,
      id: updateTeamDto.id,
      adminId,
    };

    const team = await this.findOneByIds(updateTeamDto.id, adminId);

    if (!team) {
      throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID);
    }

    const users = await this.userService.findAllByEmails(
      updateTeamDto.usersEmails,
    );

    if (users.length !== 0) {
      await this.createAllInvitations(users, teamData.id, adminId);
      teamData.users = users;
    }

    const teamMapped = this.teamMapper.fromUpdateDtoToEntity(teamData);
    const teamUpdated = await this.teamRepository.update(teamMapped);

    if (!teamUpdated) {
      throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_UPDATE);
    }

    const teamSaved = await this.teamRepository.save(teamUpdated);
    if (!teamSaved) {
      throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_SAVE);
    }

    return this.teamMapper.fromEntityToDto(teamSaved);
  }

  async delete(teamId: string, adminId: string) {
    const team = await this.findOneByIds(teamId, adminId);

    if (!team) {
      throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID);
    }

    const teamDeleted = await this.teamRepository.delete(teamId);
    if (!teamDeleted) {
      throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_DELETED);
    }

    return teamDeleted;
  }
}
