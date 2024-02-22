import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { ResponseInvitationDto } from '../dto/response-invitation.dto';
import { UpdateInvitationDto } from '../dto/update-invitation.dto';
import { INVITATION_RESPONSE } from '../exceptions/invitation.enum';
import { InvitationMapper } from '../mapper/invitation.mapper';
import {
  IInvitationRepository,
  INVITATION_REPOSITORY,
} from '../repository/invitation.repository';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationMapper: InvitationMapper,
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async findAllByUserId(userId: string): Promise<ResponseInvitationDto[]> {
    const invitations = await this.invitationRepository.findAllByUserId(userId);

    if (!invitations) {
      throw new NotFoundException(INVITATION_RESPONSE.INVITATIONS_NOT_FOUND);
    }

    return invitations.map((invitation) =>
      this.invitationMapper.fromEntityToDto(invitation),
    );
  }

  async findOne(id: string): Promise<ResponseInvitationDto> {
    const invitation = await this.invitationRepository.findOne(id);

    if (!invitation) {
      throw new NotFoundException(INVITATION_RESPONSE.INVITATION_NOT_FOUND);
    }

    return this.invitationMapper.fromEntityToDto(invitation);
  }

  async create(
    invitationDto: CreateInvitationDto,
  ): Promise<ResponseInvitationDto> {
    const invitationMapped =
      this.invitationMapper.fromDtoToEntity(invitationDto);
    try {
      const invitationSaved = await this.invitationRepository.save(
        invitationMapped,
      );
      return this.invitationMapper.fromEntityToDto(invitationSaved);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(INVITATION_RESPONSE.INVITATION_FAILED_SAVE);
    }
  }

  async update(
    invitationDto: UpdateInvitationDto,
  ): Promise<ResponseInvitationDto> {
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

    const invitationSaved = await this.invitationRepository.save(
      invitationUpdated,
    );

    if (!invitationSaved) {
      throw new BadRequestException(INVITATION_RESPONSE.INVITATION_FAILED_SAVE);
    }

    return this.invitationMapper.fromEntityToDto(invitationSaved);
  }

  async delete(id: string): Promise<boolean> {
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
    return invitationDeleted;
  }
}
