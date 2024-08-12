import { Module, forwardRef } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { MethodModule } from '@/modules/method/method.module';

import { COGNITO_AUTH } from './cognito/application/interface/cognito.service.interface';
import { CognitoService } from './cognito/service/cognito.service';
import { AllExceptionsFilter } from './response_service/filter/all_exceptions.filter';
import { RESPONSE_SERVICE } from './response_service/interface/response.interface';
import { ResponseService } from './response_service/service/response.service';
import { StellarAdapter } from './stellar_service/adapter/stellar.adapter';
import { CONTRACT_SERVICE } from './stellar_service/application/interface/contract.service.interface';
import { CONTRACT_ADAPTER } from './stellar_service/application/interface/stellar.adapter.interface';
import { CONTRACT_MAPPER } from './stellar_service/application/interface/stellar.mapper.interface';
import { StellarMapper } from './stellar_service/application/mapper/contract.mapper';
import { StellarService } from './stellar_service/service/stellar.service';

@Module({
  imports: [forwardRef(() => MethodModule)],
  providers: [
    {
      provide: RESPONSE_SERVICE,
      useClass: ResponseService,
    },
    {
      provide: COGNITO_AUTH,
      useClass: CognitoService,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
    {
      provide: CONTRACT_ADAPTER,
      useClass: StellarAdapter,
    },

    {
      provide: CONTRACT_MAPPER,
      useClass: StellarMapper,
    },
  ],
  exports: [
    {
      provide: RESPONSE_SERVICE,
      useClass: ResponseService,
    },
    {
      provide: COGNITO_AUTH,
      useClass: CognitoService,
    },
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
  ],
})
export class CommonModule {}
