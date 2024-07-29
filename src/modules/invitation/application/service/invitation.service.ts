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

import { Invitation } from '../../domain/invitation.domain';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { ResponseInvitationDto } from '../dto/response-invitation.dto';
import { UpdateInvitationDto } from '../dto/update-invitation.dto';
import { INVITATION_RESPONSE } from '../exceptions/invitation.enum';
import {
  IInvitationRepository,
  INVITATION_REPOSITORY,
} from '../interface/invitation.repository.interface';
import type { InvitationMapper } from '../mapper/invitation.mapper';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationMapper: InvitationMapper,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: IInvitationRepository,
  ) {
    this.responseService.setContext(InvitationService.name);
  }

  async findAllByUserId(
    userId: string,
  ): IPromiseResponse<ResponseInvitationDto[]> {
    try {
      const invitations = await this.invitationRepository.findAllByUserId(
        userId,
      );

      if (!invitations) {
        throw new NotFoundException(INVITATION_RESPONSE.INVITATIONS_NOT_FOUND);
      }

      return this.responseService.createResponse({
        payload: invitations.map((invitation) =>
          this.invitationMapper.fromEntityToDto(invitation),
        ),
        message: INVITATION_RESPONSE.INVITATIONS_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string): IPromiseResponse<ResponseInvitationDto> {
    try {
      const invitation = await this.invitationRepository.findOne(id);

      if (!invitation) {
        throw new NotFoundException(INVITATION_RESPONSE.INVITATION_NOT_FOUND);
      }

      return this.responseService.createResponse({
        payload: this.invitationMapper.fromEntityToDto(invitation),
        message: INVITATION_RESPONSE.INVITATION_FOUND,
        type: 'OK',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(
    invitationDto: CreateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto> {
    try {
      const invitationMapped =
        this.invitationMapper.fromDtoToEntity(invitationDto);

      const invitationSaved = await this.invitationRepository.save(
        invitationMapped,
      );

      return this.responseService.createResponse({
        payload: this.invitationMapper.fromEntityToDto(invitationSaved),
        message: INVITATION_RESPONSE.INVITATION_CREATED,
        type: 'CREATED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async createAll(invitationsDto: CreateInvitationDto[]) {
    try {
      const invitationsToSave: Invitation[] = invitationsDto.map(
        (invitation) => {
          return this.invitationMapper.fromDtoToEntity(invitation);
        },
      );

      const invitationsSaved = await this.invitationRepository.saveAll(
        invitationsToSave,
      );

      if (!invitationsSaved) {
        throw new BadRequestException(
          INVITATION_RESPONSE.INVITATION_FAILED_SAVE,
        );
      }

      return invitationsSaved.map((invitation) =>
        this.invitationMapper.fromEntityToDto(invitation),
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    invitationDto: UpdateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto> {
    try {
      const invitationMapped =
        this.invitationMapper.fromUpdateDtoToEntity(invitationDto);

      const invitationUpdated = await this.invitationRepository.update(
        invitationMapped,
      );

      if (!invitationUpdated) {
        throw new BadRequestException(
          INVITATION_RESPONSE.INVITATION_FAILED_UPDATED,
        );
      }

      return this.responseService.createResponse({
        payload: this.invitationMapper.fromEntityToDto(invitationUpdated),
        message: INVITATION_RESPONSE.INVITATION_UPDATED,
        type: 'ACCEPTED',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): IPromiseResponse<boolean> {
    try {
      const invitation = await this.invitationRepository.findOne(id);

      if (!invitation) {
        throw new NotFoundException(INVITATION_RESPONSE.INVITATION_NOT_FOUND);
      }

      const invitationDeleted = await this.invitationRepository.delete(id);

      if (!invitationDeleted) {
        throw new BadRequestException(
          INVITATION_RESPONSE.INVITATION_FAILED_DELETED,
        );
      }

      return this.responseService.createResponse({
        payload: invitationDeleted,
        message: INVITATION_RESPONSE.INVITATION_DELETED,
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
