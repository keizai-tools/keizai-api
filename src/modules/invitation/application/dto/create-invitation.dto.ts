import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsString()
  teamId: string;

  @IsNotEmpty()
  @IsString()
  fromUserId: string;

  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}
