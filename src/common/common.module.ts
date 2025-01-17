import { HttpModule } from '@nestjs/axios';
import { Inject, Module, OnModuleInit, forwardRef } from '@nestjs/common';

import { EphemeralEnvironmentModule } from '@/modules/ephemeralEnvironment/ephemeralEnvironment.module';
import { MethodModule } from '@/modules/method/method.module';
import { UserModule } from '@/modules/user/user.module';

import { FILE_UPLOAD_SERVICE } from './S3/interface/file_upload.s3.interface';
import { FileUploadService } from './S3/service/file_upload.s3.service';
import { COGNITO_AUTH } from './cognito/application/interface/cognito.service.interface';
import { CognitoService } from './cognito/service/cognito.service';
import {
  IResponseService,
  RESPONSE_SERVICE,
} from './response_service/interface/response.interface';
import { ResponseService } from './response_service/service/response.service';
import { StellarAdapter } from './stellar_service/adapter/stellar.adapter';
import { CONTRACT_SERVICE } from './stellar_service/application/interface/contract.service.interface';
import { CONTRACT_ADAPTER } from './stellar_service/application/interface/stellar.adapter.interface';
import { CONTRACT_MAPPER } from './stellar_service/application/interface/stellar.mapper.interface';
import { StellarMapper } from './stellar_service/application/mapper/contract.mapper';
import { StellarService } from './stellar_service/service/stellar.service';

@Module({
  imports: [
    forwardRef(() => MethodModule),
    forwardRef(() => EphemeralEnvironmentModule),
    forwardRef(() => UserModule),
    HttpModule,
  ],
  providers: [
    {
      provide: FILE_UPLOAD_SERVICE,
      useClass: FileUploadService,
    },
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
    {
      provide: CONTRACT_ADAPTER,
      useClass: StellarAdapter,
    },
  ],
})
export class CommonModule implements OnModuleInit {
  constructor(
    @Inject(CONTRACT_ADAPTER) private readonly stellarAdapter: StellarAdapter,
    @Inject(RESPONSE_SERVICE)
    private readonly responseService: IResponseService,
  ) {
    this.responseService.setContext(CommonModule.name);
  }

  onModuleInit() {
    try {
      this.stellarAdapter.streamTransactionsByMemoId({
        publicKey: process.env.PUBLIC_KEY_MAINNET,
      });
    } catch (error) {
      this.responseService.error('Listener start failed with error:', error);
    }
  }
}
