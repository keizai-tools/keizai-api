import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseInvitationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsString()
  @IsNotEmpty()
  fromUserId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  constructor(
    id: string,
    teamId: string,
    fromUserId: string,
    toUserId: string,
    status: string,
  ) {
    this.id = id;
    this.teamId = teamId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.status = status;
  }
}
