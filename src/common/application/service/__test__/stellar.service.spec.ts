import { Test, TestingModule } from '@nestjs/testing';

import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';

import { NETWORK } from '../../types/soroban.enum';
import { StellarService } from '../stellar.service';

describe('StellarService', () => {
  let service: StellarService;
  let methodMapper: MethodMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarService, MethodMapper],
    }).compile();

    service = module.get<StellarService>(StellarService);
    methodMapper = module.get<MethodMapper>(MethodMapper);
  });

  describe('verifyNetwork', () => {
    it('Should not change the network if selectedNetwork is the same as the current network', () => {
      const changeNetworkSpy = jest.spyOn(service, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_FUTURENET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).not.toHaveBeenCalled();
    });

    it('Should change the network if selectedNetwork is different from the current network', () => {
      const changeNetworkSpy = jest.spyOn(service, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).toHaveBeenCalledWith(selectedNetwork);
      expect(changeNetworkSpy).toHaveBeenCalledTimes(1);
    });
  });
});
