import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { INVITATION_MAPPER } from './application/interface/invitation.mapper.interface';
import { INVITATION_REPOSITORY } from './application/interface/invitation.repository.interface';
import { INVITATION_SERVICE } from './application/interface/invitation.service.interface';
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
    {
      useClass: InvitationService,
      provide: INVITATION_SERVICE,
    },
    {
      useClass: InvitationMapper,
      provide: INVITATION_MAPPER,
    },
    {
      useClass: InvitationRepository,
      provide: INVITATION_REPOSITORY,
    },
  ],
  exports: [
    {
      useClass: InvitationService,
      provide: INVITATION_SERVICE,
    },
    {
      useClass: InvitationMapper,
      provide: INVITATION_MAPPER,
    },
  ],
})
export class InvitationModule {}
