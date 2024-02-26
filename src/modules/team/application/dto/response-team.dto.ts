import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { User } from '@/modules/auth/domain/user.domain';
import { CollectionResponseDto } from '@/modules/collection/application/dto/collection-response.dto';
import { ResponseInvitationDto } from '@/modules/invitation/application/dto/response-invitation.dto';

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
  users: User[];

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
    users: User[],
    invitations: ResponseInvitationDto[],
    collections: CollectionResponseDto[],
  ) {
    this.name = name;
    this.adminId = adminId;
    this.id = id;
    this.users = users;
    this.invitations = invitations;
    this.collections = collections;
  }
}
