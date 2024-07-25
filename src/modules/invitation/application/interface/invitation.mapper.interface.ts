import { Invitation } from '../../domain/invitation.domain';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { ResponseInvitationDto } from '../dto/response-invitation.dto';
import { UpdateInvitationDto } from '../dto/update-invitation.dto';

export const INVITATION_MAPPER = 'INVITATION_MAPPER';

export interface IInvitationMapper {
  fromDtoToEntity(invitationDto: CreateInvitationDto): Invitation;
  fromUpdateDtoToEntity(invitationDto: UpdateInvitationDto): Invitation;
  fromEntityToDto(invitation: Invitation): ResponseInvitationDto;
}
