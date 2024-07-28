import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { UserRoleToTeam } from '../../domain/role.domain';
import { CreateUserRoleToTeamDto } from '../dto/create-user-role.dto';
import { ResponseUserRoletoTeamDto } from '../dto/response-user-role.dto';
import { UpdateUserRoleToTeamDto } from '../dto/update-user-role.dto';
import { ROLE_RESPONSE } from '../exceptions/role-response.enum';
import {
   IUserRoleToTeamMapper,
  USER_ROLE_TO_TEAM_MAPPER,
} from '../interface/role.mapper.interface';
import {
  IUserRoleToTeamRepository,
  USER_ROLE_TO_TEAM_REPOSITORY,
} from '../interface/role.repository.interface';
import {
  IUpdateUserRoleToTeamData,
  IUserRoleOnTeamService,
  UserRoleToTeamData,
} from '../interface/role.service.interface';

@Injectable()
export class UserRoleOnTeamService implements IUserRoleOnTeamService {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(USER_ROLE_TO_TEAM_MAPPER)
    private readonly userRoleToTeamMapper: IUserRoleToTeamMapper,
    @Inject(USER_ROLE_TO_TEAM_REPOSITORY)
    private readonly userRoleToTeamRepository: IUserRoleToTeamRepository,
  ) {
    this.responseService.setContext(UserRoleOnTeamService.name);
  }

  async findAllByTeamId(teamId: string) {
    try {
      const usersRole = await this.userRoleToTeamRepository.findAllByTeamId(
        teamId,
      );

      if (!usersRole) {
        throw new NotFoundException(ROLE_RESPONSE.USERS_NOT_FOUND_BY_TEAM_ID);
      }

      return usersRole.map((userRole) =>
        this.userRoleToTeamMapper.fromEntityToDto(userRole),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllByUser(
    userId: string,
  ): IPromiseResponse<ResponseUserRoletoTeamDto[]> {
    try {
      const usersRole = await this.userRoleToTeamRepository.findAllByUserId(
        userId,
      );

      if (!usersRole) {
        throw new NotFoundException(ROLE_RESPONSE.USERS_NOT_FOUND_BY_USER_ID);
      }

      return this.responseService.createResponse({
        payload: usersRole.map((userRole) =>
          this.userRoleToTeamMapper.fromEntityToDto(userRole),
        ),
        message: ROLE_RESPONSE.USERS_FOUND_BY_USER_ID,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByIds(
    id: string,
    userId: string,
  ): IPromiseResponse<ResponseUserRoletoTeamDto> {
    try {
      const userRole = await this.userRoleToTeamRepository.findOneByIds(
        id,
        userId,
      );

      if (!userRole) {
        throw new NotFoundException(
          ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      return this.responseService.createResponse({
        payload: this.userRoleToTeamMapper.fromEntityToDto(userRole),
        message: ROLE_RESPONSE.USER_FOUND_BY_USER_AND_ID,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createDto: CreateUserRoleToTeamDto,
    userId: string,
  ): IPromiseResponse<UserRoleToTeam> {
    try {
      const userRoleToTeamData: UserRoleToTeamData = {
        teamId: createDto.teamId,
        userId,
        role: 'ADMIN',
      };

      const userRoleMapped =
        this.userRoleToTeamMapper.fromDtoToEntity(userRoleToTeamData);
      const response = await this.userRoleToTeamRepository.save(userRoleMapped);

      if (!response) {
        throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_SAVED);
      }

      return this.responseService.createResponse({
        payload: response,
        message: ROLE_RESPONSE.ROLE_SAVED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAll(
    userRoleToTeamData: UserRoleToTeamData[],
  ): Promise<ResponseUserRoletoTeamDto[]> {
    try {
      const usersRoleToSave = userRoleToTeamData.map((userRole) => {
        return this.userRoleToTeamMapper.fromDtoToEntity(userRole);
      });

      const usersRoleSaved = await this.userRoleToTeamRepository.saveAll(
        usersRoleToSave,
      );

      if (!usersRoleSaved) {
        throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_SAVED);
      }

      return usersRoleSaved.map((userRole) =>
        this.userRoleToTeamMapper.fromEntityToDto(userRole),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    updateDto: UpdateUserRoleToTeamDto,
    userId: string,
  ): IPromiseResponse<UserRoleToTeam> {
    try {
      const userRoleToTeamData: IUpdateUserRoleToTeamData = {
        teamId: updateDto.teamId,
        userId,
        role: updateDto.role,
        id: updateDto.id,
      };

      const userRole = await this.findOneByIds(updateDto.id, userId);

      if (!userRole) {
        throw new NotFoundException(
          ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      const userRoleMapped =
        this.userRoleToTeamMapper.fromUpdateDtoToEntity(userRoleToTeamData);

      const userRoleUpdated = await this.userRoleToTeamRepository.update(
        userRoleMapped,
      );

      if (!userRoleUpdated) {
        throw new NotFoundException(ROLE_RESPONSE.ROLE_FAILED_UPDATED);
      }

      return this.responseService.createResponse({
        payload: userRoleUpdated,
        message: ROLE_RESPONSE.ROLE_UPDATED,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string, userId: string): IPromiseResponse<boolean> {
    try {
      const userRole = await this.findOneByIds(id, userId);

      if (!userRole) {
        throw new NotFoundException(
          ROLE_RESPONSE.USER_NOT_FOUND_BY_USER_AND_ID,
        );
      }

      const userRoleDeleted = await this.userRoleToTeamRepository.delete(id);

      if (!userRoleDeleted) {
        throw new BadRequestException(ROLE_RESPONSE.ROLE_FAILED_DELETED);
      }
      return this.responseService.createResponse({
        payload: userRoleDeleted,
        message: ROLE_RESPONSE.ROLE_DELETED,
        type: 'OK',
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
