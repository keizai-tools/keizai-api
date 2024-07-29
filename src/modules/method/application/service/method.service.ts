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
import { IUpdateInvocationValues } from '@/modules/invocation/application/interface/invocation.base.interface';

import {
  IInvocationRepository,
  INVOCATION_REPOSITORY,
} from '@/modules/invocation/application/interface/invocation.repository.interface';
import { InvocationMapper } from '@/modules/invocation/application/mapper/invocation.mapper';
import { InvocationService } from '@/modules/invocation/application/service/invocation.service';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

import { Method } from '../../domain/method.domain';
import { CreateMethodDto } from '../dto/create-method.dto';
import { MethodResponseDto } from '../dto/method-response.dto';
import { UpdateMethodDto } from '../dto/update-method.dto';
import { METHOD_RESPONSE } from '../exceptions/method-response.enum';
import {
  IMethodValues,
  IUpdateMethodValues,
} from '../interface/method.base.interface';
import {
  IMethodRepository,
  METHOD_REPOSITORY,
} from '../interface/method.repository.interface';
import { MethodMapper } from '../mapper/method.mapper';


@Injectable()
export class MethodService {
  constructor(
    private readonly methodMapper: MethodMapper,
    @Inject(forwardRef(() => InvocationMapper))
    private readonly invocationMapper: InvocationMapper,
    @Inject(METHOD_REPOSITORY)
    private readonly methodRepository: IMethodRepository,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(forwardRef(() => INVOCATION_REPOSITORY))
    private readonly invocationRepository: IInvocationRepository,
    @Inject(forwardRef(() => InvocationService))
    private readonly invocationService: InvocationService,
  ) {
    this.responseService.setContext(MethodService.name);
  }

  async createByUser(
    createParamDto: CreateMethodDto,
    userId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      const invocation =
        await this.invocationService.findOneByInvocationAndUserId(
          createParamDto.invocationId,
          userId,
        );
      return this.responseService.createResponse({
        payload: await this.create(createParamDto, invocation),
        message: METHOD_RESPONSE.METHOD_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createByTeam(
    createParamDto: CreateMethodDto,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      const invocation =
        await this.invocationService.findOneByInvocationAndTeamId(
          createParamDto.invocationId,
          teamId,
        );
      return this.responseService.createResponse({
        payload: await this.create(createParamDto, invocation),
        message: METHOD_RESPONSE.METHOD_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    createParamDto: CreateMethodDto,
    invocation: Invocation,
  ): Promise<MethodResponseDto> {
    try {
      const methodValues: IMethodValues = {
        name: createParamDto.name,
        inputs: createParamDto.inputs,
        outputs: createParamDto.outputs,
        params: createParamDto.params,
        docs: createParamDto.docs,
        invocationId: createParamDto.invocationId,
      };

      const method = this.methodMapper.fromDtoToEntity(methodValues);
      const methodSaved = await this.methodRepository.save(method);
      if (!methodSaved) {
        throw new BadRequestException(METHOD_RESPONSE.METHOD_NOT_SAVED);
      }

      const invocationValues: IUpdateInvocationValues = {
        id: invocation.id,
        selectedMethodId: methodSaved.id,
      };
      const invocationMapped =
        this.invocationMapper.fromUpdateDtoToEntity(invocationValues);
      const invocationUpdated = await this.invocationRepository.update(
        invocationMapped,
      );
      await this.invocationRepository.save(invocationUpdated);


      return this.methodMapper.fromEntityToDto(methodSaved);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(invocationId: string): Promise<MethodResponseDto[]> {
    try {
      const methods = await this.methodRepository.findAllByInvocationId(
        invocationId,
      );
      if (!methods) {
        throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER);
      }

      return methods.map((param) => this.methodMapper.fromEntityToDto(param));
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByMethodAndUserId(
    methodId: string,
    userId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      const method = await this.methodRepository.findOne(methodId);
      if (!method) {
        throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND);
      }

      const collectionUserId = method.invocation.folder.collection.userId;

      if (collectionUserId !== userId) {
        throw new BadRequestException(
          METHOD_RESPONSE.METHOD_NOT_FOUND_BY_USER_AND_ID,
        );
      }
      return this.responseService.createResponse({
        payload: this.methodMapper.fromEntityToDto(method),
        message: METHOD_RESPONSE.METHOD_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOneByMethodAndTeamId(
    methodId: string,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      const method = await this.methodRepository.findOne(methodId);
      if (!method) {
        throw new NotFoundException(METHOD_RESPONSE.METHOD_NOT_FOUND);
      }
      const collectionTeamId = method.invocation.folder.collection.teamId;

      if (collectionTeamId !== teamId) {
        throw new BadRequestException(
          METHOD_RESPONSE.METHOD_NOT_FOUND_BY_TEAM_AND_ID,
        );
      }
      return this.responseService.createResponse({
        payload: this.methodMapper.fromEntityToDto(method),
        message: METHOD_RESPONSE.METHOD_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByUser(
    updateMethodDto: UpdateMethodDto,
    userId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      await this.findOneByMethodAndUserId(updateMethodDto.id, userId);
      await this.invocationService.findOneByInvocationAndUserId(
        updateMethodDto.invocationId,
        userId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateMethodDto),
        message: METHOD_RESPONSE.METHOD_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateByTeam(
    updateMethodDto: UpdateMethodDto,
    teamId: string,
  ): IPromiseResponse<MethodResponseDto> {
    try {
      await this.findOneByMethodAndTeamId(updateMethodDto.id, teamId);
      await this.invocationService.findOneByInvocationAndTeamId(
        updateMethodDto.invocationId,
        teamId,
      );
      return this.responseService.createResponse({
        payload: await this.update(updateMethodDto),
        message: METHOD_RESPONSE.METHOD_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(updateMethodDto: UpdateMethodDto): Promise<MethodResponseDto> {
    try {
      const methodValues: IUpdateMethodValues = {
        name: updateMethodDto.name,
        invocationId: updateMethodDto.invocationId,
        params: updateMethodDto.params,
        id: updateMethodDto.id,
      };
      const methodMapped =
        this.methodMapper.fromUpdateDtoToEntity(methodValues);
      const methodUpdated = await this.methodRepository.update(methodMapped);
      if (!methodUpdated) {
        throw new BadRequestException(METHOD_RESPONSE.METHOD_NOT_UPDATED);
      }

      return this.methodMapper.fromEntityToDto(methodUpdated);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByUser(
    methodId: string,
    userId: string,
  ): IPromiseResponse<boolean> {
    try {
      await this.findOneByMethodAndUserId(methodId, userId);
      return this.responseService.createResponse({
        payload: await this.methodRepository.delete(methodId),
        message: METHOD_RESPONSE.METHOD_DELETED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteByTeam(
    methodId: string,
    teamId: string,
  ): IPromiseResponse<boolean> {
    try {
      await this.findOneByMethodAndTeamId(methodId, teamId);
      return this.responseService.createResponse({
        payload: await this.methodRepository.delete(methodId),
        message: METHOD_RESPONSE.METHOD_DELETED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAll(methods: Method[]): Promise<boolean> {
    try {
      if (!methods) {
        throw new NotFoundException(METHOD_RESPONSE.METHODS_NOT_DELETED);
      }
      await this.methodRepository.deleteAll(methods.map((method) => method.id));
      return true;
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
