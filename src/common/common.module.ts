import { Module, forwardRef } from '@nestjs/common';

import { InvocationModule } from '@/modules/invocation/invocation.module';

import { CONTRACT_SERVICE } from './application/repository/contract.service';
import { StellarService } from './application/service/stellar.service';

@Module({
  imports: [forwardRef(() => InvocationModule)],
  providers: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
    ,
  ],
  exports: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
  ],
})
export class CommonModule {}
