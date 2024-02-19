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

  async findAllByEmails(emails: string[]): Promise<User[]> {
    const usersPromises = emails.map((email) =>
      this.userService.findOneByEmail(email),
    );
    const users = await Promise.all(usersPromises);
    return users;
  }

  async create(createTeamDto: CreateTeamDto, user: IUserResponse) {
    const users = await this.findAllByEmails(createTeamDto.users);

    const teamData: ITeamData = {
      name: createTeamDto.name,
      adminId: user.id,
      users,
    };

    const team = this.teamMapper.fromDtoToEntity(teamData);

    try {
      const teamSaved = await this.teamRepository.save(team);
      return this.teamMapper.fromEntityToDto(teamSaved);
    } catch (error) {
      throw new BadRequestException(TEAM_RESPONSE.TEAM_FAILED_SAVE);
    }
  }

  async update(updateTeamDto: UpdateTeamDto, adminId: string) {
    const team = await this.findOneByIds(updateTeamDto.id, adminId);

    if (!team) {
      throw new NotFoundException(TEAM_RESPONSE.TEAM_NOT_FOUND_BY_USER_AND_ID);
    }

    const users = await this.findAllByEmails(updateTeamDto.users);

    const teamData: IUpdateTeamData = {
      name: updateTeamDto.name,
      id: updateTeamDto.id,
      adminId,
      users,
    };

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
