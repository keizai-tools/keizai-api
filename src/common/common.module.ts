import { Module } from '@nestjs/common';

import { CONTRACT_SERVICE } from './application/repository/contract.interface.service';
import { StellarService } from './application/service/stellar.service';

@Module({
  imports: [],
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
