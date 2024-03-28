import { Module, forwardRef } from '@nestjs/common';

import { MethodModule } from '@/modules/method/method.module';

import { StellarMapper } from './application/mapper/contract.mapper';
import { CONTRACT_SERVICE } from './application/repository/contract.interface.service';
import { StellarService } from './application/service/stellar.service';

@Module({
  imports: [forwardRef(() => MethodModule)],
  providers: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
    StellarMapper,
  ],
  exports: [
    {
      provide: CONTRACT_SERVICE,
      useClass: StellarService,
    },
  ],
})
export class CommonModule {}
