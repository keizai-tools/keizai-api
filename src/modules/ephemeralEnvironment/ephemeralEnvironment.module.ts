import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';

import { UserModule } from '../user/user.module';
import { EPHEMERAL_ENVIRONMENT_SERVICE } from './application/interface/ephemeralEnvironment.interface';
import { EphemeralEnvironmentService } from './application/service/ephemeralEnvironment.service';
import { EphemeralEnvironmentController } from './controller/ephemeralEnvironment.controller';

@Module({
  imports: [
    forwardRef(() => CommonModule),
    forwardRef(() => UserModule),
    HttpModule,
  ],
  providers: [
    {
      provide: EPHEMERAL_ENVIRONMENT_SERVICE,
      useClass: EphemeralEnvironmentService,
    },
  ],
  controllers: [EphemeralEnvironmentController],
  exports: [EPHEMERAL_ENVIRONMENT_SERVICE],
})
export class EphemeralEnvironmentModule {}
