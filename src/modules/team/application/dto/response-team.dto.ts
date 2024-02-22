import { IsArray, IsNotEmpty, IsString } from 'class-validator';

import { User } from '@/modules/auth/domain/user.domain';
import { CollectionResponseDto } from '@/modules/collection/application/dto/collection-response.dto';

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
  collections: CollectionResponseDto[];

  constructor(
    name: string,
    adminId: string,
    id: string,
    users: User[],
    collections: CollectionResponseDto[],
  ) {
    this.name = name;
    this.adminId = adminId;
    this.id = id;
    this.users = users;
    this.collections = collections;
  }
}
