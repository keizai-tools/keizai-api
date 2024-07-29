import { Invitation } from '../../domain/invitation.domain';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { ResponseInvitationDto } from '../dto/response-invitation.dto';
import { UpdateInvitationDto } from '../dto/update-invitation.dto';

export class InvitationMapper {
  fromDtoToEntity(invitationDto: CreateInvitationDto): Invitation {
    const { teamId, fromUserId, toUserId, status } = invitationDto;
    return new Invitation(teamId, fromUserId, toUserId, status);
  }

  fromUpdateDtoToEntity(invitationDto: UpdateInvitationDto): Invitation {
    const { teamId, fromUserId, toUserId, status, id } = invitationDto;
    return new Invitation(teamId, fromUserId, toUserId, status, id);
  }

  fromEntityToDto(invitation: Invitation): ResponseInvitationDto {
    const { id, teamId, fromUserId, toUserId, status } = invitation;
    return new ResponseInvitationDto(id, teamId, fromUserId, toUserId, status);
  }
}
