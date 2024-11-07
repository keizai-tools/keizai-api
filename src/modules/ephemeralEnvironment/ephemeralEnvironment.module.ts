import { Module } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { EPHEMERAL_ENVIRONMENT_SERVICE } from './application/interface/ephemeralEnvironment.interface';
import { EphemeralEnvironmentService } from './application/service/ephemeralEnvironment.service';
import { EphemeralEnvironmentController } from './controller/ephemeralEnvironment.controller';

@Module({
  imports: [CommonModule],
  providers: [
    {
      provide: EPHEMERAL_ENVIRONMENT_SERVICE,
      useClass: EphemeralEnvironmentService,
    },
  ],
  controllers: [EphemeralEnvironmentController],
})
export class EphemeralEnvironmentModule {}
