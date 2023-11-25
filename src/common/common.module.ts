import { Module, forwardRef } from '@nestjs/common';

import { MethodModule } from '@/modules/method/method.module';

import { CONTRACT_SERVICE } from './application/repository/contract.interface.service';
import { StellarService } from './application/service/stellar.service';

@Module({
  imports: [forwardRef(() => MethodModule)],
  providers: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
  ],
  exports: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
  ],
})
export class CommonModule {}
