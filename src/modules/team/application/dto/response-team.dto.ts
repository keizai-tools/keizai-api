import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { CollectionResponseDto } from '@/modules/collection/application/dto/collection-response.dto';
import { ResponseInvitationDto } from '@/modules/invitation/application/dto/response-invitation.dto';
import { ResponseUserRoletoTeamDto } from '@/modules/role/application/dto/response-user-role.dto';

export class TeamResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  adminId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsArray()
  userMembers: ResponseUserRoletoTeamDto[];

  @IsNotEmpty()
  @IsArray()
  invitations: ResponseInvitationDto[];

  @IsNotEmpty()
  @IsArray()
  collections: CollectionResponseDto[];

  constructor(
    name: string,
    adminId: string,
    id: string,
    userMembers: ResponseUserRoletoTeamDto[],
    invitations: ResponseInvitationDto[],
    collections: CollectionResponseDto[],
  ) {
    this.name = name;
    this.adminId = adminId;
    this.id = id;
    this.userMembers = userMembers;
    this.invitations = invitations;
    this.collections = collections;
  }
}
