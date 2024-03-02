import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserRoleToTeamDto } from '../dto/create-user-role.dto';
import { UpdateUserRoleToTeamDto } from '../dto/update-user-role.dto';
import { ROLE_RESPONSE } from '../exceptions/role-response.enum';
import { UserRoleToTeamMapper } from '../mapper/role.mapper';
import {
  IUserRoleToTeamRepository,
  USER_ROLE_TO_TEAM_REPOSITORY,
} from '../repository/role.repository';

export interface UserRoleToTeamData {
  teamId: string;
  userId: string;
  role: string;
  id?: string;
}

export interface IUpdateUserRoleToTeamData extends UserRoleToTeamData {
  id: string;
}

@Injectable()
export class UserRoleOnTeamService {
  constructor(
    private readonly userRoleToTeamMapper: UserRoleToTeamMapper,
    @Inject(USER_ROLE_TO_TEAM_REPOSITORY)
    private readonly userRoleToTeamRepository: IUserRoleToTeamRepository,
  ) {}

  async findAllByTeamId(teamId: string) {
    const usersRole = await this.userRoleToTeamRepository.findAllByTeamId(
      teamId,
    );

    if (!usersRole) {
      throw new NotFoundException(ROLE_RESPONSE.USERS_NOT_FOUND_BY_TEAM_ID);
    }

    return usersRole.map((userRole) =>
      this.userRoleToTeamMapper.fromEntityToDto(userRole),
    );
  }

  async findAllByUser(userId: string) {
    const usersRole = await this.userRoleToTeamRepository.findAllByUserId(
      userId,
    );

    if (!usersRole) {
      throw new NotFoundException(ROLE_RESPONSE.USERS_NOT_FOUND_BY_USER_ID);
    }

    return usersRole.map((userRole) =>
      this.userRoleToTeamMapper.fromEntityToDto(userRole),
    );
  }

  async findOneByIds(id: string, userId: string) {
    const userRole = await this.userRoleToTeamRepository.findOneByIds(
      id,
      userId,
    );

    if (!userRole) {
      throw new NotFoundException(ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID);
    }

    return this.userRoleToTeamMapper.fromEntityToDto(userRole);
  }

  async create(createDto: CreateUserRoleToTeamDto, userId: string) {
    const userRoleToTeamData: UserRoleToTeamData = {
      teamId: createDto.teamId,
      userId,
      role: 'ADMIN',
    };

    const userRoleMapped =
      this.userRoleToTeamMapper.fromDtoToEntity(userRoleToTeamData);

    try {
      return await this.userRoleToTeamRepository.save(userRoleMapped);
    } catch (error) {
      throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_SAVED);
    }
  }

  async update(updateDto: UpdateUserRoleToTeamDto, userId: string) {
    const userRoleToTeamData: IUpdateUserRoleToTeamData = {
      teamId: updateDto.teamId,
      userId,
      role: updateDto.role,
      id: updateDto.id,
    };

    const userRole = await this.findOneByIds(updateDto.id, userId);

    if (!userRole) {
      throw new NotFoundException(ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID);
    }

    const userRoleMapped =
      this.userRoleToTeamMapper.fromUpdateDtoToEntity(userRoleToTeamData);

    const userRoleUpdated = await this.userRoleToTeamRepository.update(
      userRoleMapped,
    );

    if (!userRoleUpdated) {
      throw new NotFoundException(ROLE_RESPONSE.ROLE_FAILED_UPDATED);
    }

    const userRoleSaved = await this.userRoleToTeamRepository.save(
      userRoleUpdated,
    );

    if (!userRoleSaved) {
      throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_SAVED);
    }

    return userRoleSaved;
  }

  async delete(id: string, userId: string) {
    const userRole = await this.findOneByIds(id, userId);

    if (!userRole) {
      throw new NotFoundException(ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID);
    }

    const userRoleDeleted = await this.userRoleToTeamRepository.delete(id);

    if (!userRoleDeleted) {
      throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_DELETED);
    }
    return userRoleDeleted;
  }
}
