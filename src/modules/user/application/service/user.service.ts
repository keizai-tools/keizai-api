import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  IPromiseResponse,
  IResponseService,
  RESPONSE_SERVICE,
} from '@/common/response_service/interface/response.interface';

import { User } from '../../domain/user.domain';
import { UpdateUserDto } from '../dto/update_user.dto';
import { IUpdateUserResponse } from '../interfaces/user.common.interfaces';
import { IUserMapper, USER_MAPPER } from '../interfaces/user.mapper.interfaces';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../interfaces/user.repository.interfaces';
import { IUserService } from '../interfaces/user.service.interfaces';
import { ServiceMessage } from '../message/user.message';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_MAPPER)
    private readonly userMapper: IUserMapper,
  ) {
    this.responseService.setContext(UserService.name);
  }

  private generateMemoId(userId: string): number {
    if (!userId) {
      throw new Error('userId is null or undefined, unable to generate memoId');
    }
    return parseInt(userId, 36);
  }

  async createUser(user: UpdateUserDto): IPromiseResponse<User> {
    try {
      const userEntity = this.userMapper.fromDtoToEntity(user);
      userEntity.balance = userEntity.balance || 0;
      const createdUser = await this.userRepository.create(userEntity);
      if (createdUser?.id) {
        createdUser.memoId = this.generateMemoId(createdUser.id);
        await this.userRepository.saveOne(createdUser);
      }
      const _user = await this.userRepository.findByEmail(createdUser.email);
      const userDto = this.userMapper.fromDtoToEntity(_user);
      return this.responseService.createResponse({
        type: 'CREATED',
        message: `${ServiceMessage.CREATE_SUCCESS}: ${ServiceMessage.WITH_ID} ${createdUser.id}`,
        payload: userDto,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserByEmail(email: string, error = false): IPromiseResponse<User> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user && error) {
        throw new NotFoundException(ServiceMessage.NOT_FOUND);
      }
      if (user && !user.memoId) {
        user.memoId = this.generateMemoId(user.id);
        await this.userRepository.update(user.id, user);
      }
      const _user = await this.userRepository.findByEmail(email);
      return this.responseService.createResponse({
        type: user ? 'OK' : 'NOT_FOUND',
        message: user ? ServiceMessage.FOUND : ServiceMessage.NOT_FOUND,
        payload: _user,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserByMemoId(memoId: string): Promise<User> {
    try {
      return await this.userRepository.findByMemoId(memoId);
    } catch (error) {
      console.error('Error finding user by memoId:', error);
      throw new Error('Could not find user with provided memoId.');
    }
  }

  async getUserByExternalId(
    externalId: string,
    error = false,
  ): IPromiseResponse<User> {
    try {
      const user = await this.userRepository.findByExternalId(externalId);
      if (!user && error) {
        throw new NotFoundException(ServiceMessage.NOT_FOUND);
      }
      return this.responseService.createResponse({
        type: 'OK',
        message: ServiceMessage.FOUND,
        payload: user,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    user: User,
  ): IPromiseResponse<IUpdateUserResponse> {
    try {
      const response = await this.userRepository.findByEmail(user.email);
      if (!response) {
        throw new NotFoundException(ServiceMessage.NOT_FOUND);
      }
      const updatedUser = await this.userRepository.update(
        response.id,
        updateUserDto,
      );
      return this.responseService.createResponse({
        type: 'ACCEPTED',
        message: ServiceMessage.UPDATE_SUCCESS,
        payload: updatedUser,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllByEmails(emails: string[]): IPromiseResponse<User[]> {
    try {
      const users = await this.userRepository.findAllByEmails(emails);
      return this.responseService.createResponse({
        type: 'OK',
        message: ServiceMessage.FOUND,
        payload: users,
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
