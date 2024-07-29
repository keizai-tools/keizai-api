import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { INVITATION_REPOSITORY } from './application/interface/invitation.repository.interface';
import { InvitationMapper } from './application/mapper/invitation.mapper';
import { InvitationService } from './application/service/invitation.service';
import { InvitationRepository } from './infrastructure/persistence/invitation.repository';
import { InvitationSchema } from './infrastructure/persistence/invitation.schema';
import { InvitationController } from './interface/invitation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationSchema]),
    forwardRef(() => CommonModule),
  ],
  controllers: [InvitationController],
  providers: [
    InvitationService,
    InvitationMapper,
    {
      useClass: InvitationRepository,
      provide: INVITATION_REPOSITORY,
    },
  ],
  exports: [InvitationService, InvitationMapper],
})
export class InvitationModule {}
