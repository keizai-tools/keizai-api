import { Controller, Get } from '@nestjs/common';

import { IPromiseResponse } from '@/common/response_service/interface/response.interface';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';

import { SystemStatusService } from '../application/service/systemStatus.service';

@Auth(AuthType.Bearer)
@Controller('system_status')
export class SystemStatusController {
  constructor(private readonly systemStatusService: SystemStatusService) {}

  @Get('/soroban_network')
  async sorobanNetworkStatus(): IPromiseResponse<{
    futureNetwork: boolean;
    testNetwork: boolean;
    mainNetwork: boolean;
  }> {
    return this.systemStatusService.getNetworkStatus();
  }
}
