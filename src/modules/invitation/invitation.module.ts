import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvitationMapper } from './application/mapper/invitation.mapper';
import { INVITATION_REPOSITORY } from './application/repository/invitation.repository';
import { InvitationService } from './application/service/invitation.service';
import { InvitationSchema } from './infrastructure/persistence/invitation.schema';
import { InvitationRepository } from './infrastructure/persistence/invitation.typeorm.repository';
import { InvitationController } from './interface/invitation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationSchema])],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    InvitationMapper,
    { provide: INVITATION_REPOSITORY, useClass: InvitationRepository },
  ],
})
export class InvitationModule {}
