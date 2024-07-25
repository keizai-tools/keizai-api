import { IPromiseResponse } from '@/common/response_service/interface/response.interface';

import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { ResponseInvitationDto } from '../dto/response-invitation.dto';
import { UpdateInvitationDto } from '../dto/update-invitation.dto';

export const INVITATION_SERVICE = 'INVITATION_SERVICE';

export interface IInvitationService {
  findAllByUserId(userId: string): IPromiseResponse<ResponseInvitationDto[]>;
  findOne(id: string): IPromiseResponse<ResponseInvitationDto>;
  create(
    invitationDto: CreateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto>;
  createAll(
    invitationsDto: CreateInvitationDto[],
  ): Promise<ResponseInvitationDto[]>;
  update(
    invitationDto: UpdateInvitationDto,
  ): IPromiseResponse<ResponseInvitationDto>;
  delete(id: string): IPromiseResponse<boolean>;
}
