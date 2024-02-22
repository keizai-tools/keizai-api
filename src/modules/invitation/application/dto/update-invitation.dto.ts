import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateInvitationDto } from './create-invitation.dto';

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {
  @IsString()
  @IsNotEmpty()
  id: string;
}
